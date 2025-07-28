import { Microservice } from '@/enums/environment';
import {
  ConnectorInputEvent,
  ConnectorOutputEvent,
  MessageBrokerOutputEvent,
  WorkerEvent,
} from '@/enums/event';
import { IConnectorChatMessage } from '@/interfaces/connector-chat-message';
import { IConnectorDisconnectedMessage } from '@/interfaces/connector-disconnected-message';
import { IConnectorEndMessage } from '@/interfaces/connector-end-message';
import { IConnectorEvent } from '@/interfaces/connector-event';
import { IConnectorOnlineMessage } from '@/interfaces/connector-online-message';
import { IConnectorOnlineStatusMessage } from '@/interfaces/connector-online-status-message';
import { IWorkerExitEvent } from '@/interfaces/worker-exit-event';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { ClientProxy } from '@nestjs/microservices';
import { Worker } from 'node:worker_threads';

@Injectable()
export class Connector {
  private readonly pool: Map<string, Worker> = new Map();
  private readonly logger: Logger = new Logger(Connector.name);

  constructor(
    @Inject(Microservice.MESSAGE_BROKER)
    private readonly client: ClientProxy,
    private readonly event_emitter: EventEmitter2,
  ) {}

  start(username: string): void {
    if (this.pool.has(username)) {
      this.logger.error(`Tried to start an existing worker: ${username}`);
      return;
    }

    this.logger.debug(`Starting new connection: ${username}`);

    const worker = new Worker(`${__dirname}/worker/index.js`, {
      workerData: username,
    });

    worker.on('message', (message: IConnectorEvent) => {
      switch (message.type) {
        case ConnectorOutputEvent.CHAT:
          this.logger.verbose(
            `Chat (${username}): ${JSON.stringify(message.data, null, 2)}`,
          );
          this.client.emit(
            MessageBrokerOutputEvent.CHAT,
            message.data as IConnectorChatMessage,
          );
          break;

        case ConnectorOutputEvent.IS_ONLINE:
          this.logger.verbose(
            `Online Status (${username}): ${JSON.stringify(message.data, null, 2)}`,
          );
          this.client.emit(
            MessageBrokerOutputEvent.ONLINE_STATUS,
            message.data as IConnectorOnlineStatusMessage,
          );
          break;

        case ConnectorOutputEvent.END:
          this.logger.verbose(
            `End (${username}): ${JSON.stringify(message.data, null, 2)}`,
          );
          this.logger.debug(`${username} LIVE ended`);
          this.client.emit(
            MessageBrokerOutputEvent.END,
            message.data as IConnectorEndMessage,
          );
          break;

        case ConnectorOutputEvent.ONLINE:
          this.logger.verbose(
            `Online (${username}): ${JSON.stringify(message.data, null, 2)}`,
          );
          this.client.emit(
            MessageBrokerOutputEvent.ONLINE,
            message.data as IConnectorOnlineMessage,
          );
          break;

        case ConnectorOutputEvent.DISCONNECTED:
          this.logger.verbose(
            `Disconnected (${username}): ${JSON.stringify(message.data, null, 2)}`,
          );
          this.logger.debug(`Disconnected to ${username} LIVE`);
          this.client.emit(
            MessageBrokerOutputEvent.DISCONNECTED,
            message.data as IConnectorDisconnectedMessage,
          );
          worker.postMessage({
            type: ConnectorInputEvent.CONNECT,
          });
          break;

        case ConnectorOutputEvent.CONNECT_ERROR:
          this.logger.verbose(
            `Waiting 60 seconds to reconnect to ${username} LIVE...`,
          );
          setTimeout(() => {
            this.logger.debug(`Reconnecting to ${username} LIVE...`);
            worker.postMessage({
              type: ConnectorInputEvent.CONNECT,
            });
          }, 60000);
      }
    });

    worker.on('error', (err: Error) => {
      this.logger.error(
        `Error (${username}): Unexpected error ocurred: ${err.message}`,
      );
    });

    worker.on('exit', (exit_code: number) => {
      this.logger.debug(
        `Exit (${username}): Finished with exit code: ${exit_code}`,
      );
      this.pool.delete(username);
      this.event_emitter.emit(WorkerEvent.EXIT, {
        username,
      } as IWorkerExitEvent);
    });

    worker.postMessage({ type: ConnectorInputEvent.CONNECT });

    this.pool.set(username, worker);
  }

  checkOnlineStatus(username: string): void {
    const worker: Worker | undefined = this.pool.get(username);

    if (!worker) {
      this.logger.warn(
        `Tried to get ${username} online status but is not in the pool`,
      );
      return;
    }

    worker.postMessage({ type: ConnectorInputEvent.IS_ONLINE });
  }
}
