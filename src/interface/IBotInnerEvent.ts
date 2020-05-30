export interface IBotConnectChangeEvent{
    type: 'bot-connect' | 'bot-disconnect';
    token: string;
}

export type IBotInnerEvent = IBotConnectChangeEvent;