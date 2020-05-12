/**
 * 逻辑Bot类
 * 每一个实例相当于一个逻辑Bot
 */
import PhysicalBot from './PhysicalBot';

export default class LogicBot{
    private token: string;

    constructor(token: string){
        this.token = token;
    }

    public async setBot(bot: PhysicalBot): Promise<void> {
        //to do 设置一个物理bot
        let groupList = await bot.getGroupList();
        console.log(groupList.join('\n'));
    }
}