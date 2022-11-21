import { ApiHandleMap } from '../../kernel/withHttpServer/types'
import { WechatCallback } from './wechat-callback'
import { AuthCallback } from './auth-callback'

export const TrdApis: ApiHandleMap = {
    '/trd/wechat': WechatCallback,
    '/custom/auth/social': AuthCallback,
}

export const TrdApiKeys = Object.keys(TrdApis)
    .map((item) => {
        return [item.replaceAll('//', '/').toLowerCase(), item] as [
            string,
            keyof typeof TrdApis,
        ]
    })
    .filter((item) => item[0].length)
