/**
 * 逻辑Bot类
 * 每一个实例相当于一个逻辑Bot
 */
import PhysicalBot from './PhysicalBot';
import { TypedEvent } from './TypedEvent';
import { IBotManagerConsole } from '../interface/IBotManagerConfig';
import { IBotEvent, IBotGroupChangeData } from '../interface/IBotEvent';
import { IGroupMsgEvent, IPrivateMsgEvent, IBotGroupListChangeEvent } from '../interface/IBotEvent';
import { IStructMessageItem, ISendMessageResponse } from '../interface/IBotMessage';

export default class LogicBot{
    private token: string;
    //phyId为每个物理bot分配的id
    static phyId = 1;
    //日志记录
    private _Logger!: IBotManagerConsole;
    //defaultBotMap记录每个群的默认bot
    private defaultBotMap: Map<string, PhysicalBot[]> = new Map();
    //分配id与bot的对应关系
    private idBotMap: Map<number, PhysicalBot> = new Map();
    //defaultPrivateMap记录每个私聊用户的默认botId
    //数据量较大，使用Object提升效率
    private defaultPrivateBotMap: { [K: string]: number } = Object.create({});

    //Event
    public groupMsgEmitter = new TypedEvent<IGroupMsgEvent>();
    public privateMsgEmitter = new TypedEvent<IPrivateMsgEvent>();
    public groupListChangeEmitter = new TypedEvent<IBotGroupListChangeEvent>();

    constructor(token: string){
        this.token = token;
    }

    private get Logger(): IBotManagerConsole{
        if(this._Logger) return this._Logger;
        else return console;
    }

    public setLogger(Logger: IBotManagerConsole){
        this._Logger = Logger;
    }

    public getToken(): string{
        return this.token;
    } 

    //这个方法测试该event是否需要被emit
    private shouldEventEmit(e: IBotEvent): boolean{
        switch(e.type){
            //通过群号判断的部分
            case 'group-message': {
                let id = e.botId,
                    groupId = e.data.group_id,
                    botGroup = this.defaultBotMap.get(groupId);
                
                if(botGroup === undefined || botGroup.length === 0){
                    this.Logger.warn(`<LogicBot> 来源群(${groupId})没有可用Bot`);
                    return false;
                }

                let mainBot = botGroup[0];

                if(mainBot.getId() === id){
                    this.Logger.log(`<LogicBot> botID= ${id} 在群 ${groupId} 的Event通过`);
                    return true;
                }
                break;
            }
            //不判断直接放行的部分
            default: {
                this.Logger.log(`<LogicBot> ${e.type}类型的Event默认通过`);
                return true;
            }
        }
        this.Logger.log(`<LogicBot> ${e.type}类型的Event被阻止`);
        return false;
    }

    private addToken<E extends IBotEvent>(e: E): E{
        e.token = this.token;
        return e;
    }

    //具体的处理event的方法
    private procEvent(e: IBotEvent): void{

        this.createDefaultPrivateMap(e);

        let shouldEmit = this.shouldEventEmit(e);
        if(shouldEmit){
            //添加token 分离具体类型的Event
            let event = this.addToken(e);
            switch(event.type){
                case 'group-message': {
                    this.groupMsgEmitter.emit(event);
                    break;
                }
                case 'private-message': {
                    this.privateMsgEmitter.emit(event);
                    break;
                }
                case 'bot-group-list-change': {
                    this.groupListChangeEmitter.emit(event);
                    break;
                }
                default: { let checkUp: never; }
            }
        }
    }

    //被动生成默认的用户-bot对应表
    //先创建的会被后创建的覆盖
    private createDefaultPrivateMap(e: IBotEvent): void{
        if(e.type === 'group-message' || e.type === 'private-message'){
            this.defaultPrivateBotMap[e.data.sender.user_id] = e.botId;
        }
    }

    //当物理bot失去连接时，需要unset
    private async unsetBot(bot: PhysicalBot): Promise<void>{
        let pId = bot.getId();
        this.Logger.log(`物理bot ${pId} 连接断开，将会被移除`);
        let groupChangeList: IBotGroupChangeData = {
            add: [],
            remove: [],
            switch: []
        };

        for(let [group, item] of this.defaultBotMap){
            let botIdx = item.indexOf(bot);
            if(botIdx === 0){
                item.shift();
                if(item.length > 0) groupChangeList.switch.push(group);
                else groupChangeList.remove.push(group);
            }
            else if(botIdx > 0){
                item.splice(botIdx, 1);
            }
        }

        let e: IBotGroupListChangeEvent = {
            token: '',
            botId: pId,
            type: 'bot-group-list-change',
            data: groupChangeList
        };

        this.groupListChangeEmitter.emit(this.addToken(e));
    }

    public async setBot(bot: PhysicalBot): Promise<void> {
        //设置物理botId，方便寻找bot
        let pId = LogicBot.phyId++;
        bot.setId(pId);

        let groupChangeList: IBotGroupChangeData = {
            add: [],
            remove: [],
            switch: []
        };

        this.idBotMap.set(pId, bot); 
        this.Logger.log(`设置物理bot id: ${pId}`);
        //获取群列表，将bot添加到对应群调用bot列表尾部
        let groupList = await bot.getGroupList();
        for(let group of groupList){
            let botList = this.defaultBotMap.get(group);
            if(botList === undefined){
                botList = [];
                this.defaultBotMap.set(group, botList);
            }
            botList.push(bot);
            //新接入bot时新增的可用群
            if(botList.length === 1) groupChangeList.add.push(group);
        }
        let e: IBotGroupListChangeEvent = {
            token: '',
            botId: pId,
            type: 'bot-group-list-change',
            data: groupChangeList
        };
        this.groupListChangeEmitter.emit(this.addToken(e));
        //绑定botEvent
        bot.on('event', this.procEvent.bind(this));
        bot.on('close', (bot: PhysicalBot) => {
            this.unsetBot(bot);
        });
    }

    public async sendGroupMsg(target: string, msg: IStructMessageItem[]): Promise<ISendMessageResponse>{
        let bots = this.defaultBotMap.get(target);
        if(bots && bots.length > 0){
            let bot = bots[0];
            return await bot.sendGroupMsg(target, msg);
        }
        else{
            this.Logger.error(`发送群消息失败：群 ${target} 没有可用的Bot.`);
            return { success: false };
        }
    }

    public async sendPrivateMsg(target: string, msg: IStructMessageItem[], botId?: number): Promise<ISendMessageResponse>{
        let bId = botId || this.defaultPrivateBotMap[target];
        if(!bId) {
            this.Logger.error(`发送消息失败：${target} 没有可用的Bot.`);
            return { success: false };
        }

        let bot = this.idBotMap.get(bId);
        if(!bot){
            this.Logger.error(`发送消息失败：${bId} 不存在.`);
            return { success: false };
        }

        return await bot.sendGroupMsg(target, msg);
    }
}