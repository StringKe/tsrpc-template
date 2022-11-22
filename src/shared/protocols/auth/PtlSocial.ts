import { BaseConf, BaseRequest, BaseResponse } from '../base'

export interface ReqSocial extends BaseRequest {
    id?: string
    erp?: string
    srp?: string
}

export interface ResSocial extends BaseResponse {
    qq: string
}

export const conf: BaseConf = {}
