// Local
import { IUserMessage } from "./user-message";

export interface IOnlineMessage extends IUserMessage {
    title: string;
    share_url: string;
    picture_large: string;
    picture_medium: string;
    picture_thumb: string;
}