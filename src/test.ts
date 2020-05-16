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

bot.on('logic-bot-connect', (token) => {
    console.log(`新的逻辑bot(${token})创建`);
    mainToken = token;
})

console.log(`now listen on 3388...`);
bot.listen();