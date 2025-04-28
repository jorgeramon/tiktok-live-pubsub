// NestJS
import { Controller } from "@nestjs/common";
import { MessagePattern, Payload } from "@nestjs/microservices";
import { ManagementService } from "@services/management";

@Controller()
export class ManagementController {

    constructor (private readonly management_service: ManagementService) {}

    @MessagePattern('tiktok.subscribe')
    async subscribe(@Payload() username: string) {
        await this.management_service.subscribe(username);
    }
}