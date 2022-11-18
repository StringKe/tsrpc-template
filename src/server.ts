import { BaseServerOptions, HttpServer, WsServer } from 'tsrpc'
import { serviceProto } from './shared/protocols/serviceProto'
import './utils/dayjs-extends'
import { Logger } from 'tsrpc-proto'
import { loggers } from '@midwayjs/logger'

const options: Partial<BaseServerOptions<any>> = {
    json: true,
    strictNullChecks: true,
    logMsg: true,
    logReqBody: true,
    logResBody: true,
    logLevel: 'debug',
}

export const logger = loggers.createLogger('APP', {
    level: 'all',
    dir: './logs',
    auditFileDir: '.audit',
    errorLogName: 'error.log',
    fileLogName: 'app.log',
    jsonLogName: 'app-log.json',
    consoleLevel: 'info',
    enableJSON: true,
    enableFile: true,
    enableError: true,
    enableConsole: true,
    zippedArchive: true,
    disableError: true,
    disableFile: true,
    disableSymlink: true,
    maxSize: '3m',
    maxFiles: '31d',
})

const serverLogger: Logger = {
    debug(...args: any[]): void {
        const message = args[0]
        logger.debug(message, ...args.slice(1))
    },
    error(...args: any[]): void {
        console.log('error', ...args)
        const message = args[0]
        logger.error(message, ...args.slice(1))
    },
    log(...args: any[]): void {
        const message = args[0]
        logger.info(message, ...args.slice(1))
    },
    warn(...args: any[]): void {
        const message = args[0]
        logger.warn(message, ...args.slice(1))
    },
}

export const httpServer = new HttpServer(serviceProto, {
    ...options,
    port: 3000,
    logger: serverLogger,
})

export const wsServer = new WsServer(serviceProto, {
    ...options,
    port: 3001,
    heartbeatWaitTime: 10000,
    logConnect: true,
    logger: serverLogger,
})
