export enum OutputEvent {
    ONLINE = 'tiktok.online',
    CHAT = 'tiktok.chat',
    END = 'tiktok.end'
}

export enum InputEvent {
    IS_ONLINE = 'tiktok.is_online'
}

export enum ConnectorInputEvent {
    CONNECT = 'connector.connect',
    IS_ONLINE = 'connector.is_online'
}

export enum ConnectorOutputEvent {
    ONLINE = 'output.connector.online',
    ONLINE_NO_ROOM_INFO = 'output.connector.online-no-room-info',
    IS_ONLINE = 'output.connector.is_online',
    CHAT = 'output.connector.chat',
    END = 'output.connector.end',
    DISCONNECTED = 'output.connector.disconnected'
}