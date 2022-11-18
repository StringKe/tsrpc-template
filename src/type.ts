import { ResultSession } from './kernel/withSession/session'
import { Enforcer } from 'casbin'

declare module 'tsrpc' {
    export interface BaseConnection {
        userId?: string
        deviceType?: string
    }

    export interface ApiCall {
        session: ResultSession
        casbin: Enforcer
        userId?: number
        userRoles?: string[]
        throttler?: {
            limit?: number
            remaining?: number
            reset?: number
        }
    }
}
