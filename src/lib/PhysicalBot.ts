/**
 * 物理Bot
 * 每一个实例相当于一个真实Bot
 */
import Websocket from 'ws';
import { IBotDriver } from '../interface/IBotDriver';

export default class PhysicalBot{
    private connection: Websocket;
    private driver: IBotDriver;

    constructor(ws: Websocket, driver: IBotDriver){
        this.connection = ws;
        this.driver = driver;
    }

    async call(args: any): Promise<any>{
        return await this.driver.callAPI(this.connection, args);
    }
}