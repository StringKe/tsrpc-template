import { ApiConfig, ApiConfigKit } from '@tnwx/accesstoken'
import { AbstractAdapter } from '../abstract-adapter'

export const testMp = new ApiConfig(
    'wx229a02f28350f828',
    'f3a506f1c3e8118c3266796f0417f20e',
    'qKuPocLoJOvOpMrVTEJHhQpz',
)
ApiConfigKit.putApiConfig(testMp)

export class TestWechatMp extends AbstractAdapter {}

export const testAdapter = new TestWechatMp()
