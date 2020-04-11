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
}