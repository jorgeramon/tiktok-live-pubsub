// NestJS
import { Cache } from "@nestjs/cache-manager";
import { Injectable, Logger } from "@nestjs/common";

// Interfaces
import { IOnlineMessage } from "@interfaces/connector-online-message";

@Injectable()
export class CacheService {

    private readonly logger: Logger = new Logger(CacheService.name);

    constructor(private readonly cache_manager: Cache) { }

    getOnlineStatus(nickname: string): Promise<IOnlineMessage | null> {
        return this.cache_manager.get(nickname);
    }

    async setOnlineStatus(message: IOnlineMessage): Promise<void> {
        this.logger.debug(`Caching ${message.owner_username} online status`);
        await this.cache_manager.set(message.owner_username, message);
    }

    async removeOnlineStatus(nickname: string): Promise<void> {
        await this.cache_manager.del(nickname);
    }
}