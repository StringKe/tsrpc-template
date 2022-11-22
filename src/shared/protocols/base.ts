import { UserRecordSource } from '../db'

export interface SessionData {
    [key: string]: [number | null | undefined, any] | any
}

export interface PublicData extends SessionData {
    /** [穿透数据] Session 相关数据存储 数据校验，丢失将无法验证，publicData 会被设为空 **/
    _hash?: string
}

export interface BaseRequest {
    /** [穿透数据] Session 相关数据存储，可以读取 修改无效 **/
    _publicData?: PublicData
}

export interface BaseResponse {
    /** [穿透数据] Session 相关数据存储，可以读取 修改无效 **/
    _publicData?: PublicData
    _timestamp?: number
    /** [穿透数据] 频率限制，可以读取不建议修改 **/
    _throttler?: {
        limit?: number
        remaining?: number
        reset?: number
    }
}

export interface BaseConf {
    auths?: {
        type?: 'SOME' | 'EVERY'
        roles: string[]
    }

    /**
     * 频率限制
     *
     * 例如：`{ limit: 10, ttl: 60 }` 表示每 60 秒最多 10 次
     * 例如：`{ limit: 30, ttl: 60, key: 'abc' }` 表示 abc 这个 key 每 60 秒最多 30 次请求
     * **/
    throttler?: {
        /** 关键 Key 如果未设置，采用 service.name **/
        key?: string
        /** 限制时间 **/
        ttl?: number
        /** 限制次数 **/
        limit?: number
    }
}
