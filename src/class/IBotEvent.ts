import { IGroupMsgRawEvent, IPrivateMsgRawEvent } from "./IBotRawEvent";

interface ILogicBotEvent{
    token: string;
}

export class GroupMsgEvent implements IGroupMsgRawEvent, ILogicBotEvent{
    public type: string;
    constructor(public token: string, e: IGroupMsgRawEvent){
        
    }
}
export interface IPrivateMsgEvent extends IPrivateMsgRawEvent{
    token: string;
}