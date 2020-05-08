import { IBotDriver } from '../interface/IBotDriver';
import Http from 'http';
import WebSocket from 'ws';
import { IBotEvent } from '../interface/IBotEvent';

let id = 0;

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

    public async procEvent(data: any): Promise<IBotEvent>{
        console.log(data);
        return {
            type: 'group-message',
            data: {
                group_id: 'test',
                sender: {
                    user_id: 'test',
                    user_name: 'test',
                    role: 'normal'
                },
                message_id: (id++).toString(),
                message: [{
                    type: 'text',
                    text: data.toString()
                }],
                type: 'message'
            }
        };
    }
}