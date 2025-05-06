// NestJS
import { Cache } from "@nestjs/cache-manager";
import { Injectable } from "@nestjs/common";

// Interfaces
import { IOnlineMessage } from "@interfaces/online-message";

@Injectable()
export class CacheService {

    constructor (private readonly cache_manager: Cache) {}

    getOnlineStatus(nickname: string): Promise<IOnlineMessage | null> {
        return this.cache_manager.get(nickname);
    }

    async setOnlineStatus(message: IOnlineMessage): Promise<void> {
        await this.cache_manager.set(message.owner_nickname, message);
    }

    async removeOnlineStatus(nickname: string): Promise<void> {
        await this.cache_manager.del(nickname);
    }
}