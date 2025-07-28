export enum MessageBrokerOutputEvent {
  ONLINE = 'tiktok.online',
  CHAT = 'tiktok.chat',
  END = 'tiktok.end',
  DISCONNECTED = 'tiktok.disconnected',
  ONLINE_STATUS = 'tiktok.online_status',
}

export enum MessageBrokerInputEvent {
  IS_ONLINE = 'tiktok.is_online',
  SEND_MESSAGE = 'tiktok.send_message',
}

export enum ConnectorInputEvent {
  CONNECT = 'connector.connect',
  IS_ONLINE = 'connector.is_online',
  SEND_MESSAGE = 'connector.send_message',
}

export enum ConnectorOutputEvent {
  ONLINE = 'output.connector.online',
  ONLINE_NO_ROOM_INFO = 'output.connector.online-no-room-info',
  IS_ONLINE = 'output.connector.is_online',
  CHAT = 'output.connector.chat',
  END = 'output.connector.end',
  DISCONNECTED = 'output.connector.disconnected',
  CONNECT_ERROR = 'output.connector.connect-error',
}

export enum WorkerEvent {
  EXIT = 'worker.exit',
}
