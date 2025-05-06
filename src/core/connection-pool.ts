// NestJS
import { Inject, Injectable, Logger } from "@nestjs/common";
import { Cron } from "@nestjs/schedule";
import { ClientProxy } from "@nestjs/microservices";

// Local
import { LiveConnection } from "./live-connection";

// NPM
import { takeUntil } from "rxjs";
import { IChatMessage } from "@interfaces/chat-message";
import { IEndMessage } from "@interfaces/end-message";
import { IOnlineMessage } from "@interfaces/online-message";

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

            this.client.emit('tiktok.online', {
                title: connection.state!.roomInfo.title,
                share_url: connection.state!.roomInfo.share_url,
                stream_id: connection.state!.roomInfo.stream_id,
                owner_id: connection.state!.roomInfo.owner_user_id,
                owner_nickname: connection.state!.roomInfo.owner.nickname.toLowerCase(),
                picture_large: connection.state!.roomInfo.owner.avatar_large.url_list[0],
                picture_medium: connection.state!.roomInfo.owner.avatar_medium.url_list[0],
                picture_thumb: connection.state!.roomInfo.owner.avatar_thumb.url_list[0]
            } as IOnlineMessage);

            const $disconnected = connection.onDisconnected();

            connection
                .onChat()
                .pipe(
                    takeUntil($disconnected)
                )
                .subscribe((message: IChatMessage) => this.client.emit('tiktok.chat', message));

            connection
                .onEnd()
                .pipe(
                    takeUntil($disconnected)
                )
                .subscribe((message: IEndMessage) => this.client.emit('tiktok.end', message));

            const $disconnected_sub = $disconnected
                .subscribe(() => {
                    $disconnected_sub.unsubscribe();
                });
        } catch (err) { }
    }
}