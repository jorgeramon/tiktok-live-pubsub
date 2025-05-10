import { IConnectorOnlineMessage } from "./connector-online-message";

export interface IConnectorOnlineStatusMessage {
    is_online: boolean;
    room_info: IConnectorOnlineMessage;
}