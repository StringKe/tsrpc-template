import { BaseRequest, BaseResponse, BaseConf } from '../base'

export interface ReqSocial extends BaseRequest {
    id: number
}

export interface ResSocial extends BaseResponse {}

export const conf: BaseConf = {}
