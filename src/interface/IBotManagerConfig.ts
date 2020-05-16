import { IncomingMessage } from 'http';

export interface IBotManagerConfig{
    port: number; //端口号
    logger: IBotManagerConsole; //使用日志，如果需要去掉日志可以实现空的log、error、warn方法
    verify(req: IncomingMessage): boolean; //校验，创建连接时进行校验
    getGroup(req: IncomingMessage): string; //获取分组，返回和之前不相同的token则说明创建新的逻辑bot
}

export interface IBotManagerConsole{
    log(str: any): void;
    warn(str: any): void;
    error(str: any): void;
}