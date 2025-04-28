// NestJS
import { Inject, Injectable, Logger } from "@nestjs/common";
import { Cron } from "@nestjs/schedule";
import { ClientProxy } from "@nestjs/microservices";

// Local
import { LiveConnection } from "./live-connection";

// NPM
import { takeUntil } from "rxjs";
import { IEndEvent } from "@interfaces/end-event";
import { IChatEvent } from "@interfaces/chat-event";

@Injectable()
export class ConnectionPool {

    private readonly logger: Logger = new Logger(ConnectionPool.name);
    private pool: LiveConnection[] = [];

    constructor(
        @Inject('MESSAGE_BROKER') private readonly client: ClientProxy
    ) { }

    add(username: string): void {
        const connection = new LiveConnection(username);
        this.pool.push(connection);
    }

    @Cron('* * * * *')
    async connect(): Promise<void> {
        this.logger.debug('Connection Pool Task');

        const pending = this.pool.filter(connection => !connection.is_online);

        this.logger.debug(`Pending connections: ${pending.length}`);

        for (const connection of pending) {
            this._connect(connection);
        }
    }

    private async _connect(connection: LiveConnection): Promise<void> {
        try {
            await connection.connect();

            const $disconnected = connection.onDisconnected();

            connection
                .onChat()
                .pipe(
                    takeUntil($disconnected)
                )
                .subscribe((event: IChatEvent) => this.client.emit('tiktok.chat', event));

            connection
                .onEnd()
                .pipe(
                    takeUntil($disconnected)
                )
                .subscribe((event: IEndEvent) => this.client.emit('tiktok.end', event));

            const $disconnected_sub = $disconnected
                .subscribe(() => {
                    $disconnected_sub.unsubscribe();
                });
        } catch (err) { }
    }
}