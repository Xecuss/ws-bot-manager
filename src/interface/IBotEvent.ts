import { IStructMessageItem, IBotGroupMessage, IBotPrivateMessage } from './IBotMessage';

export interface IGroupMsgEvent{
    type: 'group-message';
    data: IBotGroupMessage
}
export interface IPrivateMsgEvent{
    type: 'private-message';
    data: IBotPrivateMessage;
}

export type IBotEvent = IGroupMsgEvent | IPrivateMsgEvent;