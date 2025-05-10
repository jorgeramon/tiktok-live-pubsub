import { ConnectorInputEvent } from "@enums/event";
import { Injectable, Logger } from "@nestjs/common";
import { Worker } from 'node:worker_threads';

@Injectable()
export class Connector {

    private readonly pool: Map<string, Worker> = new Map();
    private readonly logger: Logger = new Logger(Connector.name);

    start(username: string): void {
        this.logger.debug(`Starting new connection: ${username}`);

        const worker = new Worker(`${__dirname}/connector-thread.js`);
        worker.postMessage({ type: ConnectorInputEvent.CONNECT, data: username });

        this.pool.set(username, worker);
    }
}