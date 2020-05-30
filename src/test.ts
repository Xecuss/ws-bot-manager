import BotManager from './BotManager';
import { IncomingMessage } from 'http';

let mainToken = 'TestBot';

function verify(req: IncomingMessage): boolean {
    return true;
}

function getGroup(req: IncomingMessage): string {
    return mainToken;
}

let bot = new BotManager({
    port: 3388,
    logger: console,
    verify,
    getGroup
});

bot.innerEventEmitter.on(e => {
    if(e.type === 'bot-connect'){
        console.log(`新的逻辑bot(${e.token})创建`);
        mainToken = e.token;
    }
});

console.log(`now listen on 3388...`);
bot.listen();