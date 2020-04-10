import { EventEmitter } from 'events';
import { IBotManagerConfig, IBotVerifyResult } from './interface/IBotManagerConfig';
import { IBotDriver } from './interface/IBotDriver';
import Websocket from 'ws';
import http from 'http';

const driverList: Array<IBotDriver> = [];

export default class BotManager extends EventEmitter{
    private s: Websocket.Server;
    private httpServer: http.Server;
    private argVerify: (req: http.IncomingMessage) => IBotVerifyResult;
    private port: number;

    constructor(args: IBotManagerConfig){
        super();
        //创建一个自定义的http Server以实现延后的监听
        this.httpServer = new http.Server();

        this.s = new Websocket.Server({
            server: this.httpServer
        });
        //覆写默认的upgrade处理
        this.s.shouldHandle = this.verify.bind(this);
        this.argVerify = args.verify;
        this.port = args.port;
        this.bindOnConnection(this.s);
    }

    private verify(req: http.IncomingMessage): boolean{
        let res = this.argVerify(req);
        if(res.success){
            let groupToken = res.token;
            //to do, 在这里处理归类事件
            return true;
        }
        return false;
    }

    private bindOnMessage(ws: Websocket){
        ws.on('message', (msg) => {
            console.log(msg);
        })
    }

    private bindOnConnection(wss: Websocket.Server){
        wss.on('connection', (ws, req) => {
            for(let item of driverList){
                if(item.canUse(req)){
                    //为token分配driver
                }
            }
            this.bindOnMessage(ws);
        });
    }

    public listen(){
        this.httpServer.listen(this.port);
    }
    
}