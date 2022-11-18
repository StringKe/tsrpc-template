import { BaseConf, BaseRequest, BaseResponse } from '../base'

export interface ReqThrottler extends BaseRequest {}

export interface ResThrottler extends BaseResponse {}

export const conf: BaseConf = {
    throttler: {
        ttl: 120,
        limit: 10,
    },
}
