import BotManager from './BotManager';
import { IBotVerifyResult } from './interface/IBotManagerConfig';
import { IncomingMessage } from 'http';

function verify(req: IncomingMessage): IBotVerifyResult {
    console.log(req.headers);
    return {
        success: true,
        token: 'abc123f'
    };
}

let bot = new BotManager({
    port: 3388,
    logger: console,
    verify,
});

console.log(`now listen on 3388...`);
bot.listen();