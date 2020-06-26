import { IBotDriver } from '../interface/IBotDriver';
import Http from 'http';
import WebSocket from 'ws';
import { IBotEvent } from '../interface/IBotEvent';
import { EventEmitter } from 'events';
import { IStructMessageItem, ISendMessageResponse } from '../interface/IBotMessage';

let id = 0;

class EchoCaller extends EventEmitter{
    private static echo: number = 1;

    call(ws: WebSocket, data: any): string{
        let echoId = EchoCaller.echo++,
            eName = `e${echoId}`;
        data.echo = echoId;
        ws.send(JSON.stringify(data));
        return eName;
    }

    check(data: any): void{
        if(data?.echo){
            let eName = `e${data.echo}`;
            this.emit(eName, data);
        }
    }
}

export default class TestDriver implements IBotDriver{
    public id: string = 'test';

    private caller = new EchoCaller();

    public canUse(req: Http.IncomingMessage): boolean{
        let ua = req.headers['user-agent'];

        if(ua === undefined) return false;

        if(ua.indexOf('Chrome') !== -1) return true;

        return false;
    }

    public callAPI(ws: WebSocket, args: any): Promise<any>{
        const eventId = this.caller.call(ws, args);
        return new Promise((res) => {
            this.caller.once(eventId, res);
        });
    }

    public checkResponse(data: any): boolean{
        if(data.echo !== undefined) return true;
        return false;
    }

    public procResponse(data: any){
        this.caller.check(data);
    }

    public async getGroupList(ws: WebSocket): Promise<string[]>{
        let args: any = {
            opt: 'get_group_list'
        };
        let data = await this.callAPI(ws, args);
        if(data?.list) return data.list;
        return [];
    }

    public async procEvent(data: any, botId: number): Promise<IBotEvent>{
        return {
            type: 'group-message',
            data,
            botId,
            token: ''
        };
    }

    sendGroupMsg(ws: WebSocket, target: string, msg: IStructMessageItem[]): Promise<ISendMessageResponse> {
        throw new Error("Method not implemented.");
    }
    sendPrivateMsg(ws: WebSocket, target: string, msg: IStructMessageItem[]): Promise<ISendMessageResponse> {
        throw new Error("Method not implemented.");
    }
}