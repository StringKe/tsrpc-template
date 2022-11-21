import { ApiHandle } from '../../kernel/withHttpServer/types'
import { get } from 'lodash'
import { ApiConfigKit } from '@tnwx/accesstoken'
import { WeChat } from '@tnwx/wxmp'
import { getWechatAdapter } from '../../kernel/wechat'

export const WechatCallback: ApiHandle = async (req, res) => {
    const appId = get(req, 'query.appId', get(req, 'query.appid'))
    if (appId) {
        ApiConfigKit.setCurrentAppId(appId)
    }

    if (req.method?.toLowerCase() === 'get') {
        const signature = req.query.signature, //微信加密签名
            timestamp = req.query.timestamp, //时间戳
            nonce = req.query.nonce, //随机数
            echostr = req.query.echostr //随机字符串

        const result = WeChat.checkSignature(
            signature,
            timestamp,
            nonce,
            echostr,
        )
        return res.send(result)
    } else {
        try {
            const adapter = getWechatAdapter(appId)
            const xmlData = req.body

            const msgSignature = req.query.msg_signature,
                timestamp = req.query.timestamp,
                nonce = req.query.nonce

            const result = await WeChat.handleMsg(
                adapter,
                xmlData,
                msgSignature,
                timestamp,
                nonce,
            )
            return res.send(result)
        } catch (e) {
            // return res.send('No WeChat adapter found', 404)
            return res.send('success', 200)
        }
    }
}
