import {  IBotGroupMessage, IBotPrivateMessage } from './IBotMessage';

export interface IBaseEvent{
    type: string;
    data: any;
    readonly botId: number;
    token: string;
}

export interface IGroupMsgEvent extends IBaseEvent{
    type: 'group-message';
    data: IBotGroupMessage;
}
export interface IPrivateMsgEvent extends IBaseEvent{
    type: 'private-message';
    data: IBotPrivateMessage;
}

export interface IBotConnectEvent{
}

export type IBotEvent = IGroupMsgEvent | IPrivateMsgEvent;