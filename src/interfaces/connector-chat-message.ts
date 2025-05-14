import { IConnectorMessage } from '@/interfaces/connector-message';

export interface IConnectorChatMessage extends IConnectorMessage {
  comment: string;
  user_id?: string;
  user_username?: string;
  user_nickname?: string;
  user_picture?: string;
}
