/**
 * 逻辑Bot类
 * 每一个实例相当于一个逻辑Bot
 */
import PhysicalBot from './PhysicalBot';

export default class LogicBot{
    private token: string;
    //phyId为每个物理bot分配的id
    static phyId = 1;
    //defaultBotMap记录每个群的默认bot
    private defaultBotMap: Map<string, PhysicalBot[]> = new Map();
    //分配id与bot的对应关系
    private idBotMap: Map<number, PhysicalBot> = new Map();

    constructor(token: string){
        this.token = token;
    }

    public async setBot(bot: PhysicalBot): Promise<void> {
        //to do 设置一个物理bot
        //设置物理botId，方便寻找bot
        let pId = LogicBot.phyId++;
        bot.setId(pId);
        this.idBotMap.set(pId, bot);
        console.log(`设置物理bot id: ${pId}`);
        //获取群列表，将bot添加到对应群调用bot列表尾部
        let groupList = await bot.getGroupList();
        for(let group of groupList){
            let botList = this.defaultBotMap.get(group);
            if(botList === undefined){
                this.defaultBotMap.set(group, []);
                botList = [];
            }
            botList.push(bot);
        }
        console.log(groupList.join('\n'));
    }
}