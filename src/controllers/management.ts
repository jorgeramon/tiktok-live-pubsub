// NestJS
import { Controller } from "@nestjs/common";
import { MessagePattern, Payload } from "@nestjs/microservices";

// Enums
import { InputEvent } from "@enums/event";

// Interfaces
import { IOnlineMessage } from "@interfaces/online-message";

// Services
import { CacheService } from "@services/cache";
import { ManagementService } from "@services/management";

@Controller()
export class ManagementController {

    constructor (
        private readonly management_service: ManagementService,
        private readonly cache_service: CacheService
    ) {}

    @MessagePattern(InputEvent.IS_ONLINE)
    isOnline(@Payload() nickname: string): Promise<IOnlineMessage | null> {
        return this.cache_service.getOnlineStatus(nickname);
    }
}