import { ApiConfig, ApiConfigKit } from '@tnwx/accesstoken'
import { AbstractAdapter } from '../common/abstract-adapter'

export const testMp = new ApiConfig('', '', '')
ApiConfigKit.putApiConfig(testMp)

export class TestWechatMp extends AbstractAdapter {}

export const testAdapter = new TestWechatMp()
