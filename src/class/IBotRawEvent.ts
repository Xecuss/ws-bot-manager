import {  IBotGroupMessage, IBotPrivateMessage } from '../interface/IBotMessage';

class BotEventBase{
    constructor(public type: string, public readonly botId: number) { }
}

export class GroupMsgRawEvent extends BotEventBase{
    constructor(botId: number, public data: IBotGroupMessage){
        super('group-message', botId);
    }
}

export class PrivateMsgRawEvent extends BotEventBase{
    constructor(botId: number, public data: IBotPrivateMessage){
        super('private-message', botId);
    }
}

export interface IGroupMsgRawEvent{
    type: 'group-message';
    data: IBotGroupMessage;
    botId: number;
}
export interface IPrivateMsgRawEvent{
    type: 'private-message';
    data: IBotPrivateMessage;
    botId: number;
}

export type IBotRawEvent = IGroupMsgRawEvent | IPrivateMsgRawEvent;