export interface IChatEvent {

    comment: string;
    userId: string;
    uniqueId: string;
    nickname: string;
    profilePictureUrl: string;
    isModerator: boolean;
    isNewGifter: boolean;
    isSubscriber: boolean;
    followRole: 0 | 1 | 2;
    msgId: string;
}