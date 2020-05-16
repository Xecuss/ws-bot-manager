/**
 * 逻辑Bot类
 * 每一个实例相当于一个逻辑Bot
 */
import PhysicalBot from './PhysicalBot';
import { EventEmitter } from 'events';
import { IBotEvent } from '../interface/IBotEvent';
import { IBotManagerConsole } from '../interface/IBotManagerConfig';

export default class LogicBot extends EventEmitter{
    private token: string;
    //phyId为每个物理bot分配的id
    static phyId = 1;
    //日志记录
    static _Logger: IBotManagerConsole;
    //defaultBotMap记录每个群的默认bot
    private defaultBotMap: Map<string, PhysicalBot[]> = new Map();
    //分配id与bot的对应关系
    private idBotMap: Map<number, PhysicalBot> = new Map();

    constructor(token: string){
        super();
        this.token = token;
    }

    private get Logger(): IBotManagerConsole{
        if(LogicBot._Logger) return LogicBot._Logger;
        else return console;
    }

    public setLogger(Logger: IBotManagerConsole){
        LogicBot._Logger = Logger;
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

    //具体的处理event的方法
    private procEvent(e: IBotEvent): void{
        let shouldEmit = this.shouldEventEmit(e);
    }

    //当物理bot失去连接时，需要unset
    private async unsetBot(bot: PhysicalBot): Promise<void>{}

    public async setBot(bot: PhysicalBot): Promise<void> {
        //设置物理botId，方便寻找bot
        let pId = LogicBot.phyId++;
        bot.setId(pId);
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
        }
        //绑定botEvent
        bot.on('event', this.procEvent.bind(this));
    }
}