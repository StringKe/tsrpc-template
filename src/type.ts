import { Enforcer } from 'casbin'
import { Session } from './kernel/withSession/session'
import { SessionData } from './shared/protocols/base'

declare module 'tsrpc' {
    export interface BaseConnection {
        userId?: string
        deviceType?: string
    }

    export interface ApiCall {
        /** Session **/
        session: Session<SessionData>
        /** Casbin 权限处理 **/
        casbin: Enforcer

        /** 用户 Id **/
        userId?: number
        /** 用户角色 **/
        userRoles?: string[]

        /** [穿透数据] 频率限制，可以读取不建议修改 **/
        throttler?: {
            limit?: number
            remaining?: number
            reset?: number
        }
    }
}

declare module 'http' {
    export interface IncomingMessage {
        query: any
        rawQuery: any
        body: any
        rawBody: any
        params: Record<string, any>
    }

    export interface ServerResponse {
        text: (text: string) => void
        html: (html: string) => void
        json: (data: any) => void
        xml: (data: any) => void
        file: (data: Buffer, filename: string) => void
        redirect: (url: string) => void
        redirectBack: () => void
        send: (data: any, code?: number) => void
    }
}

type Falsy = false | 0 | '' | null | undefined

declare global {
    interface Array<T> {
        filter<S extends T>(
            predicate: BooleanConstructor,
            thisArg?: any,
        ): Exclude<S, Falsy>[]
    }
}
