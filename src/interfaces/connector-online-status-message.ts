import { IConnectorOnlineMessage } from '@/interfaces/connector-online-message';

export interface IConnectorOnlineStatusMessage {
  owner_username: string;
  is_online: boolean;
  room_info: IConnectorOnlineMessage;
}
