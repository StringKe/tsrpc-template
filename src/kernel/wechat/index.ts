import { ApiConfigKit } from '@tnwx/accesstoken'
import cache from '../cache'
import { MsgAdapter } from '@tnwx/commons'
import { AbstractAdapter } from './common/abstract-adapter'
import { testAdapter, testMp } from './adapter/test-mp'

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
ApiConfigKit.devMode = true

export const wechatAdapter: Record<string, AbstractAdapter> = {
    [testMp.getAppId]: testAdapter,
}

export function getWechatAdapter(appId: string): MsgAdapter {
    const adapter = wechatAdapter[appId]
    if (!adapter) {
        throw new Error('No wechat adapter found')
    }
    return adapter
}
