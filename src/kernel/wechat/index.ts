import { ApiConfigKit } from '@tnwx/accesstoken'
import cache from '../cache'

ApiConfigKit.setCache = {
    get(key: string): Promise<any> {
        return cache.get(`wechat:${key}`)
    },
    remove(key: string): Promise<any> {
        return cache.remove(`wechat:${key}`)
    },
    set(key: string, jsonValue: string): Promise<any> {
        return cache.set(`wechat:${key}`, jsonValue)
    },
}

export const wechatInstances = {}
