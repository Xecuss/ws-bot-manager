import { EventEmitter } from 'events';
import { IBotManagerConfig } from './interface/IBotManagerConfig';
import { IBotDriver } from './interface/IBotDriver';
import Websocket from 'ws';
import http from 'http';
import LogicBot from './lib/LogicBot';

const driverList: Array<IBotDriver> = [];

export default class BotManager extends EventEmitter{
    private s: Websocket.Server;
    private httpServer: http.Server;
    private argVerify: (req: http.IncomingMessage) => boolean;
    private getGroup: (req: http.IncomingMessage) => string;
    private port: number;
    private tokenMap: Map<string, LogicBot> = new Map();

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
        this.getGroup = args.getGroup;
        this.port = args.port;
        this.bindOnConnection(this.s);
    }

    private verify(req: http.IncomingMessage): boolean{
        let res = this.argVerify(req);
        return res;
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
        });
    }

    private allocBot(req: http.IncomingMessage): LogicBot{
        let res = this.getGroup(req);

        if(res === ''){
            let token: string = this.generateToken(),
                logicbot = new LogicBot(token);
            this.tokenMap.set(token, logicbot);
            return logicbot;
        }

        let logicbot = this.tokenMap.get(res);

        if(!logicbot) throw new Error(`指定Token(${res})不存在！`);

        return logicbot;
    }

    private generateToken(): string{
        //to do 生成逻辑bot token 
        return '123';
    }

    public listen(){
        this.httpServer.listen(this.port);
    }
    
}