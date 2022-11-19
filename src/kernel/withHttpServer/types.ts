import { IncomingMessage, ServerResponse } from 'http'

export declare type ApiHandle = (
    req: IncomingMessage,
    res: ServerResponse,
) => void | Promise<void>

export declare type ApiHandleMap = Record<string, ApiHandle>
