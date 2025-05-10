import { ConnectorInputEvent } from "@enums/event";

export interface IConnectorEvent {
    type: ConnectorInputEvent;
    data: unknown;
}