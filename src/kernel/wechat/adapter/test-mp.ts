import { ApiConfig, ApiConfigKit } from '@tnwx/accesstoken'
import { AbstractAdapter } from '../abstract-adapter'
import { InQrCodeEvent, OutMsg } from '@tnwx/commons'
import { startsWith } from 'lodash'
import WechatService from '../../../service/wechat'

export const testMp = new ApiConfig(
    'wx229a02f28350f828',
    'f3a506f1c3e8118c3266796f0417f20e',
    'qKuPocLoJOvOpMrVTEJHhQpz',
)
ApiConfigKit.putApiConfig(testMp)

export class TestWechatMp extends AbstractAdapter {
    async processInQrCodeEvent(inQrCodeEvent: InQrCodeEvent): Promise<OutMsg> {
        let eventKeys = inQrCodeEvent.getEventKey
        if (startsWith(eventKeys, 'qrscene_')) {
            eventKeys = eventKeys.replace('qrscene_', '')
        }
        const result = await WechatService.processQrCode(
            eventKeys,
            inQrCodeEvent.getFromUserName,
            inQrCodeEvent,
        )
        if (result) {
            return super.renderOutTextMsg(inQrCodeEvent, result)
        }
        return super.renderOutTextMsg(inQrCodeEvent, '无效的二维码')
    }
}

export const testAdapter = new TestWechatMp()
