interface IOwnerAvatar {
    url_list: string[]
}

interface IOwner {
    id: bigint;
    avatar_large: IOwnerAvatar,
    avatar_medium: IOwnerAvatar,
    avatar_thumb: IOwnerAvatar,
    bio_description: string,
    display_id: string;
}

interface IRoomInfo {
    owner: IOwner;
    title: string;
    owner_user_id: bigint;
    share_url: string;
    stream_id: bigint;
}

export interface ILiveState {
    roomInfo: IRoomInfo;
}