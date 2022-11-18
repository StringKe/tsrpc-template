export interface BaseRequest {
    _token?: string
}

export interface BaseResponse {
    _token?: string
    _timestamp?: number
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
    throttler?: {
        key?: string
        ttl?: number
        limit?: number
    }
}
