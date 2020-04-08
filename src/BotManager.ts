import { EventEmitter } from 'events';
import { IBotManagerConfig, IBotVerifyResult } from './interface/IBotManagerConfig';
import Websocket from 'ws';
import http from 'http';

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
    }

    private verify(req: http.IncomingMessage): boolean{
        //todo, 验证是否为已知的bot种类

        let res = this.argVerify(req);
        if(res.success){
            let groupToken = res.token;
            //to do, 在这里处理归类事件
            return true;
        }
        return false;
    }

    public listen(){
        this.httpServer.listen(this.port);
    }

    
}