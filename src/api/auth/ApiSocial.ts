import { ApiCall, TsrpcError, TsrpcErrorType } from 'tsrpc'
import { ReqSocial, ResSocial } from '../../shared/protocols/auth/PtlSocial'
import authManager, { QQProvider } from '../../kernel/auth'
import redis from '../../kernel/redis'
import { getDataId } from '../../utils/nanoid'

// 登陆数据，二维码、链接等只有10分钟有效期，过了需要重新生成
const EXPIRE_TIME = 60 * 10

export default async function (call: ApiCall<ReqSocial, ResSocial>) {
    const qqProvider = authManager.getInstance<QQProvider>('test-qq')
    if (!qqProvider) {
        return call.error(
            new TsrpcError({
                message: 'No provider found',
                code: 'NO_PROVIDER',
                type: TsrpcErrorType.ApiError,
            }),
        )
    }

    call.req.id =
        call.req.id || call.session.getPublic('authId') || getDataId(32)
    if (!call.session.hasPublic('authId')) {
        call.session.setPublic('authId', call.req.id, EXPIRE_TIME)
    }

    let qqUrl = await redis.getCacheKey(`auth:${call.req.id}`)
    if (!qqUrl) {
        qqUrl = await qqProvider.getAuthorizationUrl({
            id: call.req.id as never,
            srp: call.req.srp,
            erp: call.req.erp,
        })
        await redis.setCacheKey(`auth:${call.req.id}`, qqUrl, EXPIRE_TIME)
    }

    return call.succ({
        qq: qqUrl,
    })
}
