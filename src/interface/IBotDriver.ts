import { IncomingMessage } from 'http';
import WebSocket from 'ws';
import { IBotRawEvent } from '../class/IBotRawEvent';

export interface IBotDriver{
    //driver id，用于寻找driver
    readonly id: string;
    //检查是否适用于该连接， 同时处理连接参数
    canUse( req: IncomingMessage ): Boolean;
    //调用API
    callAPI( ws: WebSocket, args: any): Promise<any>;
    //检查某条消息是不是某次调用的返回值
    checkResponse(data: any): boolean;
    //处理调用返回值
    procResponse(data: any): any;
    //转化event
    procEvent(data: any, botId: number): Promise<IBotRawEvent>;
    //获取群列表，如果没有群或者无法获取，应返回一个空数组
    //返回一个群id数组
    getGroupList(ws: WebSocket): Promise<string[]>;
}