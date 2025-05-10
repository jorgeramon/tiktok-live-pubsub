import { Microservice } from "@enums/environment";
import { ConnectorInputEvent, ConnectorOutputEvent, MessageBrokerOutputEvent } from "@enums/event";
import { IConnectorChatMessage } from "@interfaces/connector-chat-message";
import { IConnectorDisconnectedMessage } from "@interfaces/connector-disconnected-message";
import { IConnectorEndMessage } from "@interfaces/connector-end-message";
import { IConnectorEvent } from "@interfaces/connector-event";
import { IConnectorOnlineMessage } from "@interfaces/connector-online-message";
import { Inject, Injectable, Logger } from "@nestjs/common";
import { ClientProxy } from "@nestjs/microservices";
import { Worker } from 'node:worker_threads';

@Injectable()
export class Connector {

    private readonly pool: Map<string, Worker> = new Map();
    private readonly logger: Logger = new Logger(Connector.name);

    constructor(
        @Inject(Microservice.MESSAGE_BROKER)
        private readonly client: ClientProxy
    ) { }

    start(username: string): void {
        this.logger.debug(`Starting new connection: ${username}`);

        const worker = new Worker(`${__dirname}/connector-thread.js`);

        worker.on('message', (message: IConnectorEvent) => {
            switch (message.type) {
                case ConnectorOutputEvent.CHAT:
                    this.client.emit(MessageBrokerOutputEvent.CHAT, message.data as IConnectorChatMessage);
                    break;

                case ConnectorOutputEvent.END:
                    this.logger.debug(`${username} LIVE ended`);
                    this.client.emit(MessageBrokerOutputEvent.END, message.data as IConnectorEndMessage);
                    break;

                case ConnectorOutputEvent.ONLINE:
                    this.client.emit(MessageBrokerOutputEvent.ONLINE, message.data as IConnectorOnlineMessage);
                    break;

                case ConnectorOutputEvent.DISCONNECTED:
                    this.logger.debug(`Disconnected to ${username} LIVE`);
                    this.client.emit(MessageBrokerOutputEvent.DISCONNECTED, message.data as IConnectorDisconnectedMessage);
                    this.pool.delete(username);
                    worker.terminate();
                    break;
            }
        });

        worker.postMessage({ type: ConnectorInputEvent.CONNECT, data: username });

        this.pool.set(username, worker);
    }
}