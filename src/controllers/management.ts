// NestJS
import { Controller, Logger } from "@nestjs/common";
import { MessagePattern, Payload } from "@nestjs/microservices";

// Enums
import { InputEvent } from "@enums/event";

// Interfaces
import { IOnlineMessage } from "@interfaces/online-message";

// Services
import { CacheService } from "@services/cache";
import { ManagementService } from "@services/management";

// NPM
import { from, Observable } from "rxjs";

@Controller()
export class ManagementController {

    private readonly logger: Logger = new Logger(ManagementController.name);

    constructor (
        private readonly management_service: ManagementService,
        private readonly cache_service: CacheService
    ) {}

    @MessagePattern(InputEvent.IS_ONLINE)
    isOnline(@Payload() nickname: string): Observable<IOnlineMessage | null> {
        return from(this.cache_service.getOnlineStatus(nickname));
    }
}