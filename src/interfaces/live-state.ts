interface IOwnerAvatar {
    url_list: string[]
}

interface IOwner {
    id: bigint;
    avatar_large: IOwnerAvatar,
    avatar_medium: IOwnerAvatar,
    avatar_thumb: IOwnerAvatar,
    bio_description: string,
    nickname: string;
}

interface IRoomInfo {
    owner: IOwner;
}

export interface ILiveState {
    title: string;
    owner_user_id: bigint;
    share_url: string;
    stream_id: bigint;
    roomInfo: IRoomInfo;
}