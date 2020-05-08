import { IBotDriver } from '../interface/IBotDriver';
import Http from 'http';
import WebSocket from 'ws';

export default class TestDriver implements IBotDriver{
    public id: string = 'test';

    public canUse(req: Http.IncomingMessage): boolean{
        let ua = req.headers['user-agent'];

        if(ua === undefined) return false;

        if(ua.indexOf('Chrome') !== -1) return true;

        return false;
    }

    public async callAPI(ws: WebSocket, args: any): Promise<any>{
        ws.send(args);
    }

    public procEvent(data: any): any{
        console.log(data);
    }
}