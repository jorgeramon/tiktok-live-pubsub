import { IConnectorMessage } from "@interfaces/connector-message";

export interface IOnlineMessage extends IConnectorMessage {
    title?: string;
    share_url?: string;
    picture_large?: string;
    picture_medium?: string;
    picture_thumb?: string;
}