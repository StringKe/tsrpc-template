import { QrcodeApi, UserApi } from '@tnwx/wxmp'
import { AccessTokenApi, ApiConfigKit } from '@tnwx/accesstoken'
import redis from '../kernel/redis'
import UserService from './user'

export interface WechatQr {
    ticket: string
    expire_seconds: number
    createdAt: number
    url: string
}

export interface WechatQrCache extends WechatQr {
    qrUrl: string
    id: string
}

export default class WechatService {
    static QR_AUTH_PREFIX = 'auth'
    static QR_AUTH_BIND_PREFIX = 'bind'

    static async getQrCode(appId: string, prefix: string, id: string) {
        ApiConfigKit.setCurrentAppId(appId)
        const accessToken = await AccessTokenApi.getAccessToken()
        const key = `${prefix}:${id}`

        const savedData = await redis.getCacheKey(key)
        if (savedData) {
            return JSON.parse(savedData) as WechatQrCache
        }

        const data = (await QrcodeApi.createTemporaryByStr(
            60 * 10,
            key,
            accessToken,
        )) as WechatQr
        const qrUrl = QrcodeApi.getShowQrcodeUrl(data.ticket)
        const cached = {
            ...data,
            qrUrl,
            id,
        }
        await redis.setCacheKey(key, JSON.stringify(cached), 60 * 10)
        return cached
    }

    static getQrCodeId(ticket: string) {
        return ticket.split(':')[1]
    }

    static async processQrCode(
        eventKeys: string,
        getFromUserName: string,
        inQrCodeEvent: Record<string, any>,
    ) {
        const eventId = this.getQrCodeId(eventKeys)
        if (eventKeys.startsWith(WechatService.QR_AUTH_PREFIX)) {
            const appId = ApiConfigKit.currentAppId
            // 扫码登陆

            const userInfo = await UserApi.getUserInfo(
                inQrCodeEvent.getFromUserName,
                'zh_CN',
            )

            const user = await UserService.getOrCreateUserByTrdInfo(
                'wechat-mp',
                appId,
                {
                    ...userInfo,
                    openId: inQrCodeEvent.getFromUserName,
                    unionId: userInfo.unionid,
                },
            )
        } else if (eventKeys.startsWith(WechatService.QR_AUTH_BIND_PREFIX)) {
            // 绑定
        }
        return ''
    }
}
