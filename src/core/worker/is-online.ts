import { ConnectorOutputEvent } from '@/enums/event';
import { UnableToConnectException } from '@/exceptions/unexpected-live-connection';
import { IConnectorEvent } from '@/interfaces/connector-event';
import { TiktokRoomInfo } from '@/interfaces/tiktok-room-info';
import { Logger } from '@nestjs/common';
import { workerData } from 'node:worker_threads';
import { Subject } from 'rxjs';
import { RoomInfoResponse, TikTokLiveConnection } from 'tiktok-live-connector';

export function isOnline(
  connection: TikTokLiveConnection,
  logger: Logger,
  $listener: Subject<IConnectorEvent>,
) {
  return async () => {
    const is_online = await connection.fetchIsLive();

    if (is_online) {
      const room_info_response: RoomInfoResponse =
        await connection.fetchRoomInfo();

      const room_info: TiktokRoomInfo = room_info_response.data;

      if (!room_info.owner) {
        await connection.disconnect();
        logger.error('User has no room info');
        throw new UnableToConnectException();
      }

      $listener.next({
        type: ConnectorOutputEvent.IS_ONLINE,
        data: {
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
      $listener.next({
        type: ConnectorOutputEvent.IS_ONLINE,
        data: { owner_username: workerData, is_online },
      });
    }
  };
}
