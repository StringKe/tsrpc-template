import { WechatCallback } from './wechat-callback'
import { AuthCallback } from './auth-callback'
import RouteRecognizer from 'route-recognizer'

export const customRouter = new RouteRecognizer()

customRouter.add([{ path: '/custom/auth/social', handler: AuthCallback }])
customRouter.add([{ path: '/trd/wechat', handler: WechatCallback }])
