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
    private id: number = 0;

    constructor(ws: Websocket, driver: IBotDriver){
        super();
        this.connection = ws;
        this.driver = driver;
        
        this.connection.onmessage = this.onMessageHandle.bind(this);
        this.connection.onclose = this.onCloseHandle.bind(this);
    }

    public setId(id: number){
        this.id = id;
    }

    public getId(): number{
        return this.id;
    }

    async call(args: any): Promise<any>{
        return await this.driver.callAPI(this.connection, args);
    }

    public async getGroupList(): Promise<string[]>{
        return await this.driver.getGroupList(this.connection);
    }

    private async onMessageHandle(e: Websocket.MessageEvent): Promise<void>{
        let data: any;
        try{
            data = JSON.parse(e.data.toString());
        }
        catch(err){
            console.log(err);
            data = e.data;
        }
        if(this.driver.checkResponse(data)) {
            this.driver.procResponse(data);
        }
        else{
            let event = await this.driver.procEvent(data, this.id);
            this.emit('event', event);
        }
    }

    private async onCloseHandle(e: Websocket.CloseEvent): Promise<void>{
        console.log('connection close!');
        this.emit('close');
    }
}