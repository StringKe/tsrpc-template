import { BaseConf, BaseRequest, BaseResponse } from '../base'

export interface ReqSession extends BaseRequest {
    type: 'public' | 'private' | 'user' | null
    userId?: number
}

export interface ResSession extends BaseResponse {
    count: number
    before: number
    userId?: number
}

export const conf: BaseConf = {}
