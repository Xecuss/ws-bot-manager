import { TypedEvent } from './lib/TypedEvent';
import { IBotManagerConfig, IBotManagerConsole } from './interface/IBotManagerConfig';
import { IBotDriver } from './interface/IBotDriver';
import Websocket from 'ws';
import http from 'http';
import LogicBot from './lib/LogicBot';
import PhysicalBot from './lib/PhysicalBot';

import { IBotInnerEvent } from './interface/IBotInnerEvent';
import { ISendMessageResponse, IStructMessageItem } from './interface/IBotMessage';

const driverList: Array<IBotDriver> = [];
const loadedDriver: Set<string> = new Set();

async function loadDriver(list: string[]){
    for(let path of list){
        if(!loadedDriver.has(path)){
            let Driver = await import(path);
            driverList.push(new Driver.default());
            loadedDriver.add(path);
        }
    }
}

export default class BotManager extends TypedEvent<IBotInnerEvent>{
    private s: Websocket.Server;
    private httpServer: http.Server;
    private argVerify: (req: http.IncomingMessage) => boolean;
    private getGroup: (req: http.IncomingMessage) => string;
    private port: number;
    private tokenMap: Map<string, LogicBot> = new Map();
    private Logger: IBotManagerConsole;

    constructor(args: IBotManagerConfig){
        super();
        //加载驱动
        loadDriver(args.drivers);
        //创建一个自定义的http Server以实现延后的监听
        this.httpServer = new http.Server();

        this.s = new Websocket.Server({
            server: this.httpServer
        });
        //覆写默认的upgrade处理
        this.s.shouldHandle = this.verify.bind(this);

        this.argVerify = args.verify;
        this.getGroup = args.getGroup;
        this.Logger = args.logger;
        this.port = args.port;
        this.bindOnConnection(this.s);
    }

    private verify(req: http.IncomingMessage): boolean{
        let res = this.argVerify(req);
        return res;
    }

    private bindOnConnection(wss: Websocket.Server){
        wss.on('connection', (ws, req) => {
            let physicalBot = null;
            //寻找可用驱动创建物理bot
            for(let item of driverList){
                if(item.canUse(req)){
                    physicalBot = new PhysicalBot(ws, item);
                    break;
                }
            }

            if(physicalBot === null) {
                this.Logger.error('无法处理的连接请求：无对应驱动');
                ws.close();
                return;
            }

            try{
                let logicbot = this.allocBot(req);
                logicbot.setBot(physicalBot);
            }
            catch(e){
                this.Logger.error(e);
                ws.close();
            }
        });
    }


    private allocBot(req: http.IncomingMessage): LogicBot{
        let res = this.getGroup(req);

        let logicbot = this.tokenMap.get(res);

        if(!logicbot){
            let token: string = res,
                logicbot = new LogicBot(token);
            this.tokenMap.set(token, logicbot);

            //分配新bot时产生bot-connect事件
            this.emit({
                type: 'bot-connect',
                token: logicbot.getToken()
            });

            logicbot.setLogger(this.Logger);

            return logicbot;
        };

        return logicbot;
    }

    public listen(){
        this.httpServer.listen(this.port);
    }

    public getBot(token: string){
        return this.tokenMap.get(token);
    }

    public async sendGroupMsg(token: string, target: string, msg: IStructMessageItem[]): Promise<ISendMessageResponse>{
        let bot = this.getBot(token);
        if(!bot){
            this.Logger.error(`发送群消息失败：逻辑bot ${token} 不存在`);
            return { success: false };
        }
        return await bot.sendGroupMsg(target, msg);
    }

    public async sendPrivateMsg(token: string, target: string, msg: IStructMessageItem[], botId?: number): Promise<ISendMessageResponse>{
        let bot = this.getBot(token);
        if(!bot){
            this.Logger.error(`发送群消息失败：逻辑bot ${token} 不存在`);
            return { success: false };
        }
        return await bot.sendPrivateMsg(target, msg, botId);
    }
}