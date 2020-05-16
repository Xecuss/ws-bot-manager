import { IStructMessageItem, IBotGroupMessage, IBotPrivateMessage } from './IBotMessage';

export interface IGroupMsgEvent{
    type: 'group-message';
    data: IBotGroupMessage;
    botId: number;
}
export interface IPrivateMsgEvent{
    type: 'private-message';
    data: IBotPrivateMessage;
    botId: number;
}

export type IBotEvent = IGroupMsgEvent | IPrivateMsgEvent;