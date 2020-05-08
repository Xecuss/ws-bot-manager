/**
 * 物理Bot
 * 每一个实例相当于一个真实Bot
 */
import Websocket from 'ws';
import { IBotDriver } from '../interface/IBotDriver';
import { EventEmitter } from 'events';

export default class PhysicalBot extends EventEmitter{
    private connection: Websocket;
    private driver: IBotDriver;

    constructor(ws: Websocket, driver: IBotDriver){
        super();
        this.connection = ws;
        this.driver = driver;
        
        this.connection.onmessage = this.onMessageHandle.bind(this);
    }

    async call(args: any): Promise<any>{
        return await this.driver.callAPI(this.connection, args);
    }

    private onMessageHandle(e: Websocket.MessageEvent): void{
        this.driver.procEvent(e.data);
    }
}