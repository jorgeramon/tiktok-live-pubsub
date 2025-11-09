import { connect } from '@/core/worker/connect';
import { isOnline } from '@/core/worker/is-online';
import { ConnectorInputEvent, ConnectorOutputEvent } from '@/enums/event';
import { UnableToConnectException } from '@/exceptions/unexpected-live-connection';
import { IConnectorEvent } from '@/interfaces/connector-event';
import { Logger } from '@nestjs/common';
import { parentPort, workerData } from 'node:worker_threads';
import { Subject } from 'rxjs';
import { TikTokLiveConnection } from 'tiktok-live-connector';

async function main() {
  const logger: Logger = new Logger(`Worker Thread - ${workerData}`);
  const connection: TikTokLiveConnection = new TikTokLiveConnection(workerData);
  const $listener = new Subject<IConnectorEvent>();

  $listener.subscribe((event: IConnectorEvent) =>
    parentPort?.postMessage({ ...event, owner_username: workerData }),
  );

  parentPort?.on('message', async (event: IConnectorEvent) => {
    try {
      switch (event.type) {
        case ConnectorInputEvent.CONNECT:
          await connect(connection, logger, $listener)();
          break;

        case ConnectorInputEvent.IS_ONLINE:
          await isOnline(connection, logger, $listener)();
          break;
      }
    } catch (err) {
      if (err instanceof UnableToConnectException) {
        logger.error(`Unable to connect to ${workerData} LIVE...`);
        $listener.next({
          type: ConnectorOutputEvent.CONNECT_ERROR,
        });
      } else {
        logger.error(`Unexpecter error ocurred: ${err.message}`);
        logger.error(err.stack);
        $listener.next({
          type: ConnectorOutputEvent.CONNECT_ERROR,
        });
      }
    }
  });
}

main();
