import { Connector } from "@core/connector";
import { MessageBrokerInputEvent } from "@enums/event";
import { Injectable } from "@nestjs/common";
import { EventPattern, Payload } from "@nestjs/microservices";

@Injectable()
export class LiveController {

    constructor(
        private readonly connector: Connector
    ) { }

    @EventPattern(MessageBrokerInputEvent.IS_ONLINE)
    isOnline(@Payload() username: string): void {
        this.connector.checkOnlineStatus(username);
    }
}