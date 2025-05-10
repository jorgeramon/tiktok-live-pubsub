interface TiktokOwnerAvatar {
    url_list: string[]
}

interface TiktokOwner {
    id_str?: string;
    avatar_large?: TiktokOwnerAvatar,
    avatar_medium?: TiktokOwnerAvatar,
    avatar_thumb?: TiktokOwnerAvatar,
    bio_description?: string,
    display_id?: string;
}

export interface TiktokRoomInfo {
    owner?: TiktokOwner;
    title?: string;
    share_url?: string;
    stream_id_str?: string;
}