export interface IBotManagerConfig{
    port: number;
    logger: IBotManagerConsole;
    verify(req: any): IBotVerifyResult;
}

export interface IBotManagerConsole{
    log(str: any): void;
    warn(str: any): void;
    error(str: any): void;
}

interface IBotVerifySuccessResult{
    success: true;
    token: string;
}

interface IBotVerifyFailResult{
    success: false;
}

export type IBotVerifyResult = IBotVerifyFailResult | IBotVerifySuccessResult;