// NestJS
import { Logger } from '@nestjs/common';

// Interfaces
import { ILiveState } from '@interfaces/live-state';
import { IChatEvent } from '@interfaces/chat-event';
import { IEndEvent } from '@interfaces/end-event';

// Exceptions
import { UnexpectedLiveConnectionException } from '@exceptions/unexpected-live-connection';
import { UserOfflineException } from '@exceptions/user-offline';
import { UserNotFoundException } from '@exceptions/user-not-found';
import { AlreadyConnectedException } from '@exceptions/already-connected';

// NPM
import { WebcastPushConnection } from 'tiktok-live-connector';
import { Observable, Subscriber } from 'rxjs';

export class LiveConnection {

    public state: ILiveState | null = null;

    private readonly logger: Logger = new Logger(LiveConnection.name);
    private connection: WebcastPushConnection;

    // Events
    private $chat: Observable<IChatEvent> | null = null;
    private $end: Observable<IEndEvent> | null = null;
    private $disconnected: Observable<void> | null = null;

    constructor(public readonly username: string) {
        this.connection = new WebcastPushConnection(this.username);
    }

    get is_online(): boolean {
        return this.state !== null;
    }

    async connect(): Promise<void> {
        try {
            this.logger.debug(`Connecting to ${this.username} live...`);
            this.state = { ...await this.connection.connect(), from_live: this.username };
            this.logger.debug(`${this.username} is online`);
        } catch (err) {
            if (err.message.includes('user_not_found')) {
                this.logger.warn(`User ${this.username} not found`);
                throw new UserNotFoundException();
            } else if (err.message.includes('LIVE has ended')) {
                this.logger.warn(`User ${this.username} is offline`);
                throw new UserOfflineException();
            } else if (err.message.includes('Already connected')) {
                this.logger.error(`Already connected to ${this.username}`);
                throw new AlreadyConnectedException();
            } else {
                this.logger.error(`Unable to connect to ${this.username}: ${err.message}`);
                throw new UnexpectedLiveConnectionException();
            }
        }
    }

    disconnect(): void {
        if (this.state !== null) {
            this.logger.debug(`Disconnecting from ${this.username} live...`);
            this.halt();
            this.connection.disconnect();
        } else {
            this.logger.warn(`There's no connection to ${this.username} live`);
        }
    }

    onChat(): Observable<IChatEvent> {
        if (!this.$chat) {
            this.$chat = new Observable((subscriber: Subscriber<IChatEvent>) => {
                this.connection.on('chat', data => subscriber.next({ ...data, from_live: this.username }));
            });
        }

        return this.$chat;
    }

    onEnd(): Observable<IEndEvent> {
        if (!this.$end) {
            this.$end = new Observable((subscriber: Subscriber<IEndEvent>) => {
                this.connection.on('streamEnd', data => subscriber.next({ ...data, from_live: this.username }));
            });
        }

        return this.$end;
    }

    onDisconnected(): Observable<void> {
        if (!this.$disconnected) {
            this.$disconnected = new Observable((subscriber: Subscriber<void>) => {
                this.connection.on('disconnected', () => {
                    subscriber.next();
                    this.halt();
                });
            });
        }

        return this.$disconnected;
    }

    private halt(): void {
        if (this.state !== null) {
            this.connection.removeAllListeners('chat');
        }

        this.state = null;
        this.$chat = null;
        this.$end = null;
        this.$disconnected = null;
    }
}