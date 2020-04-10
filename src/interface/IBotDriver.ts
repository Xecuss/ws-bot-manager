import { IncomingMessage } from 'http';
export interface IBotDriver{
    //driver id，用于寻找driver
    id: string;
    //检查是否适用于该连接， 同时处理连接参数
    canUse( req: IncomingMessage ): Boolean;
}