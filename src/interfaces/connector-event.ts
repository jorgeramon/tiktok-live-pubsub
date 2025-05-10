import { ConnectorInputEvent, ConnectorOutputEvent } from "@enums/event";

export interface IConnectorEvent {
    type: ConnectorInputEvent | ConnectorOutputEvent;
    data: unknown;
}