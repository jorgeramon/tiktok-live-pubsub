import { ConnectorInputEvent, ConnectorOutputEvent } from '@/enums/event';
import { IConnectorEvent } from '@/interfaces/connector-event';
import { TiktokRoomInfo } from '@/interfaces/tiktok-room-info';
import { Logger } from '@nestjs/common';
import { parentPort, threadId } from 'node:worker_threads';
import {
  ControlEvent,
  RoomInfoResponse,
  TikTokLiveConnection,
  WebcastChatMessage,
  WebcastEvent,
} from 'tiktok-live-connector';

const logger: Logger = new Logger(`Worker Thread ${threadId}`);

let connection: TikTokLiveConnection;

parentPort?.on('message', (event: IConnectorEvent) => {
  try {
    switch (event.type) {
      case ConnectorInputEvent.CONNECT:
        connect(event.data as string);
        break;

      case ConnectorInputEvent.IS_ONLINE:
        isOnline(event.data as string);
        break;
    }
  } catch (err) {
    logger.error(`Unexpected error ocurred: ${err.message}`);
  }
});

async function isOnline(username: string): Promise<void> {
  if (!connection) {
    parentPort?.postMessage({
      type: ConnectorOutputEvent.IS_ONLINE,
      data: { owner_username: username, is_online: false },
    });
    return;
  }

  const is_online = await connection.fetchIsLive();

  if (is_online) {
    const room_info_response: RoomInfoResponse =
      await connection.fetchRoomInfo();

    const room_info: TiktokRoomInfo = room_info_response.data;

    if (!room_info.owner) {
      logger.warn(`${username} has no room info...`);
    }

    parentPort?.postMessage({
      type: ConnectorOutputEvent.IS_ONLINE,
      data: {
        owner_username: username,
        is_online,
        room_info: {
          stream_id: room_info.stream_id_str,
          owner_id: room_info.owner?.id_str,
          owner_username: room_info.owner?.display_id?.toLowerCase(),
          title: room_info.title,
          share_url: room_info.share_url,
          picture_large: room_info.owner?.avatar_large?.url_list[0],
          picture_medium: room_info.owner?.avatar_medium?.url_list[0],
          picture_thumb: room_info.owner?.avatar_thumb?.url_list[0],
        },
      },
    });
  } else {
    parentPort?.postMessage({
      type: ConnectorOutputEvent.IS_ONLINE,
      data: { owner_username: username, is_online },
    });
  }
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

  parentPort?.postMessage({
    type: ConnectorOutputEvent.ONLINE,
    data: {
      stream_id: room_info.stream_id_str,
      owner_id: room_info.owner?.id_str,
      owner_username: room_info.owner?.display_id?.toLowerCase(),
      title: room_info.title,
      share_url: room_info.share_url,
      picture_large: room_info.owner?.avatar_large?.url_list[0],
      picture_medium: room_info.owner?.avatar_medium?.url_list[0],
      picture_thumb: room_info.owner?.avatar_thumb?.url_list[0],
    },
  });

  connection.on(WebcastEvent.CHAT, onChat(room_info));
  connection.on(WebcastEvent.STREAM_END, onEnd(room_info));
  connection.on(ControlEvent.DISCONNECTED, onDisconnected(room_info));
}

function onChat(room_info: TiktokRoomInfo) {
  return function (event: WebcastChatMessage) {
    parentPort?.postMessage({
      type: ConnectorOutputEvent.CHAT,
      data: {
        stream_id: room_info.stream_id_str,
        owner_id: room_info.owner?.id_str,
        owner_username: room_info.owner?.display_id?.toLowerCase(),
        comment: event.comment,
        user_id: event.user?.userId,
        user_username: event.user?.uniqueId,
        user_nickname: event.user?.nickname,
        user_picture: event.user?.profilePicture?.urls[0],
      },
    });
  };
}

function onEnd(room_info: TiktokRoomInfo) {
  return function () {
    parentPort?.postMessage({
      type: ConnectorOutputEvent.END,
      data: {
        stream_id: room_info.stream_id_str,
        owner_id: room_info.owner?.id_str,
        owner_username: room_info.owner?.display_id?.toLowerCase(),
      },
    });
  };
}

function onDisconnected(room_info: TiktokRoomInfo) {
  return function () {
    parentPort?.postMessage({
      type: ConnectorOutputEvent.DISCONNECTED,
      data: {
        stream_id: room_info.stream_id_str,
        owner_id: room_info.owner?.id_str,
        owner_username: room_info.owner?.display_id?.toLowerCase(),
      },
    });
  };
}
