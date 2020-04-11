
interface IStructTextMessage{
    type: 'text';
    text: string;
}
interface IStructImageMessage{
    type: 'image';
    url: string;
}
interface IStructLinkMessage{
    type: 'link';
    url: string;
    icon?: string;
}
interface IStructVoiceMessage{
    type: 'voice';
    url: string;
}
interface IStructEmojiMessage{
    type: 'emoji';
    id: string;
}
interface IStructMentionMessage{
    type: 'mention';
    id: string;
    message_id?: string;
}
//对于一些专用的消息类型，可以使用ExtraMessage，然后将data直接放入rawData中
interface IStructExtraMessage{
    type: 'extra';
    rawData: any;
}

export type IStructMessageItem = IStructTextMessage | IStructImageMessage | IStructLinkMessage | IStructVoiceMessage | IStructEmojiMessage | IStructMentionMessage | IStructExtraMessage;

export interface IGroupMessageSender{
    user_id: string;
    user_name: string;
    role: 'normal' | 'admin' | 'owner'; //暂列三级权限，如果需要更多的权限等级之后再添加
    nick?: string;
    avator?: string;
    extra: any; //其他额外的信息添加到这里
}

export interface IBotGroupMessage{
    group_id: string;
    message_id: string;
    message: Array<IStructMessageItem>;
    type: 'message' | 'notice';
    extra: any;
    sender: IGroupMessageSender;
}

export interface IPrivateMessageSender{
    user_id: string;
    user_name: string;
    nick?: string;
    avator?: string;
    extra: any; //其他额外的信息添加到这里
}

export interface IBotPrivateMessage{
    message_id: string;
    message: Array<IStructMessageItem>;
    type: 'message' | 'notice';
    extra: any;
    sender: IPrivateMessageSender;
}