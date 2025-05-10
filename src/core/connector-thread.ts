import { ConnectorInputEvent, ConnectorOutputEvent } from '@enums/event';
import { IConnectorEvent } from '@interfaces/connector-event';
import { TiktokRoomInfo } from '@interfaces/tiktok-room-info';
import { Logger } from '@nestjs/common';
import { parentPort, threadId } from 'node:worker_threads';
import { ControlEvent, RoomInfoResponse, TikTokLiveConnection, WebcastChatMessage, WebcastControlMessage, WebcastEvent } from 'tiktok-live-connector';

const logger: Logger = new Logger(`Worker Thread ${threadId}`);

let connection: TikTokLiveConnection;

parentPort?.on('message', (event: IConnectorEvent) => {
    try {
        switch (event.type) {
            case ConnectorInputEvent.CONNECT:
                connect(event.data as string);
                break;

            case ConnectorInputEvent.IS_ONLINE:
                isOnline();
                break;
        }
    } catch (err) {
        logger.error(`Unexpected error ocurred: ${err.message}`);
    }
});

async function isOnline(): Promise<void> {
    if (!connection) {
        parentPort?.emit('message', {
            type: ConnectorOutputEvent.IS_ONLINE,
            data: false
        });
        return;
    }

    const is_online = connection.fetchIsLive();

    parentPort?.emit('message', {
        type: ConnectorOutputEvent.IS_ONLINE,
        data: is_online
    });
}

async function connect(username: string): Promise<void> {
    connection = new TikTokLiveConnection(username);

    logger.debug(`Connecting to ${username} LIVE...`);

    await connection.waitUntilLive();

    logger.debug(`${username} is online`);

    await connection.connect();

    const room_info_response: RoomInfoResponse = await connection.fetchRoomInfo();
    const room_info: TiktokRoomInfo = room_info_response.data;

    if (!room_info.owner) {
        logger.warn(`${username} has no room info...`);
    }

    parentPort?.emit('message', {
        type: ConnectorOutputEvent.ONLINE,
        data: {
            stream_id: room_info.stream_id_str,
            owner_id: room_info.owner?.id_str,
            owner_username: room_info.owner?.display_id?.toLowerCase(),
            title: room_info.title,
            share_url: room_info.share_url,
            picture_large: room_info.owner?.avatar_large?.url_list[0],
            picture_medium: room_info.owner?.avatar_medium?.url_list[0],
            picture_thumb: room_info.owner?.avatar_thumb?.url_list[0]
        }
    });

    connection.on(WebcastEvent.CHAT, onChat(room_info));
    connection.on(WebcastEvent.STREAM_END, onEnd(room_info));
    connection.on(ControlEvent.DISCONNECTED, onDisconnected(room_info));
}

function onChat(_room_info: TiktokRoomInfo) {
    return function (_event: WebcastChatMessage) {
        parentPort?.emit('message', {
            type: ConnectorOutputEvent.CHAT,
            data: {
                stream_id: _room_info.stream_id_str,
                owner_id: _room_info.owner?.id_str,
                owner_username: _room_info.owner?.display_id?.toLowerCase(),
                comment: _event.comment,
                user_id: _event.user?.userId,
                user_username: _event.user?.uniqueId,
                user_nickname: _event.user?.nickname,
                user_picture: _event.user?.profilePicture?.urls[0]
            }
        });
    }
}

function onEnd(_room_info: TiktokRoomInfo) {
    return function (_event: WebcastControlMessage) {
        parentPort?.emit('message', {
            type: ConnectorOutputEvent.END,
            data: {
                stream_id: _room_info.stream_id_str,
                owner_id: _room_info.owner?.id_str,
                owner_username: _room_info.owner?.display_id?.toLowerCase(),
            }
        });
    }
}

function onDisconnected(_room_info: TiktokRoomInfo) {
    return function () {
        parentPort?.emit('message', {
            type: ConnectorOutputEvent.DISCONNECTED,
            data: {
                stream_id: _room_info.stream_id_str,
                owner_id: _room_info.owner?.id_str,
                owner_username: _room_info.owner?.display_id?.toLowerCase(),
            }
        });
    }
}

