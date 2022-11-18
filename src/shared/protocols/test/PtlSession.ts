import { BaseConf, BaseRequest, BaseResponse } from '../base'

export interface ReqSession extends BaseRequest {}

export interface ResSession extends BaseResponse {
    count: number
    before: number
}

export const conf: BaseConf = {}
