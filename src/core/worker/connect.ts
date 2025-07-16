import { ConnectorOutputEvent } from '@/enums/event';
import { UnableToConnectException } from '@/exceptions/unexpected-live-connection';
import { IConnectorEvent } from '@/interfaces/connector-event';
import { TiktokRoomInfo } from '@/interfaces/tiktok-room-info';
import { Logger } from '@nestjs/common';
import { Subject } from 'rxjs';
import {
  ControlEvent,
  RoomInfoResponse,
  TikTokLiveConnection,
  WebcastChatMessage,
  WebcastEvent,
} from 'tiktok-live-connector';

export function connect(
  connection: TikTokLiveConnection,
  logger: Logger,
  $subject: Subject<IConnectorEvent>,
) {
  return async () => {
    logger.debug('Waiting until user is LIVE...');

    await connection.waitUntilLive();

    logger.debug('Connecting to user LIVE...');

    await connection.connect();

    logger.debug('User is LIVE!');

    const room_info_response: RoomInfoResponse =
      await connection.fetchRoomInfo();

    const room_info: TiktokRoomInfo = room_info_response.data;

    if (!room_info.owner) {
      await connection.disconnect();
      logger.error('User has no room info');
      throw new UnableToConnectException();
    }

    $subject.next({
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

    connection.on(WebcastEvent.CHAT, onChat($subject, room_info));
    connection.on(WebcastEvent.STREAM_END, onEnd($subject, room_info));
    connection.on(
      ControlEvent.DISCONNECTED,
      onDisconnected($subject, room_info),
    );
  };
}

function onChat($subject: Subject<IConnectorEvent>, room_info: TiktokRoomInfo) {
  return (event: WebcastChatMessage) => {
    console.log('Event', event);
    $subject.next({
      type: ConnectorOutputEvent.CHAT,
      data: {
        stream_id: room_info.stream_id_str,
        owner_id: room_info.owner?.id_str,
        owner_username: room_info.owner?.display_id?.toLowerCase(),
        comment: event.comment,
        user_id: event.user?.userId,
        user_username: event.user?.uniqueId,
        user_nickname: event.user?.nickname,
        user_picture: event.user?.profilePicture?.url,
      },
    });
  };
}

function onEnd($subject: Subject<IConnectorEvent>, room_info: TiktokRoomInfo) {
  return () =>
    $subject.next({
      type: ConnectorOutputEvent.END,
      data: {
        stream_id: room_info.stream_id_str,
        owner_id: room_info.owner?.id_str,
        owner_username: room_info.owner?.display_id?.toLowerCase(),
      },
    });
}

function onDisconnected(
  $subject: Subject<IConnectorEvent>,
  room_info: TiktokRoomInfo,
) {
  return () =>
    $subject.next({
      type: ConnectorOutputEvent.DISCONNECTED,
      data: {
        stream_id: room_info.stream_id_str,
        owner_id: room_info.owner?.id_str,
        owner_username: room_info.owner?.display_id?.toLowerCase(),
      },
    });
}
