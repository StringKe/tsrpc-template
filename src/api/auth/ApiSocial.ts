import { ApiCall, TsrpcError, TsrpcErrorType } from 'tsrpc'
import { ReqSocial, ResSocial } from '../../shared/protocols/auth/PtlSocial'
import authManager, { QQProvider } from '../../kernel/auth'
import redis from '../../kernel/redis'

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

    let qqUrl = await redis.getCacheKey(`auth:${call.req.id}`)
    if (!qqUrl) {
        qqUrl = await qqProvider.getAuthorizationUrl({
            srp: call.req.srp,
            erp: call.req.erp,
        })
        await redis.setCacheKey(`auth:${call.req.id}`, qqUrl, 60)
    }

    return call.succ({
        qq: qqUrl,
    })
}
