import BotManager from './BotManager';
import { IncomingMessage } from 'http';

function verify(req: IncomingMessage): boolean {
    console.log(req.headers);
    return true;
}

function getGroup(req: IncomingMessage): string {
    return '';
}

let bot = new BotManager({
    port: 3388,
    logger: console,
    verify,
    getGroup
});

console.log(`now listen on 3388...`);
bot.listen();