import { ApiHandle } from '../../kernel/withHttpServer/types'
import { z } from 'zod'
import authManager from '../../kernel/auth'
import redis from '../../kernel/redis'

const schema = z
    .object({
        erp: z.string().nullable().optional(),
        srp: z.string().nullable().optional(),
        sn: z.string(),
        state: z.string(),
        id: z.string().optional().nullable(),
    })
    .passthrough()

function addParams(url: string, params: Record<string, string>) {
    const u = new URL(url)
    for (const key in params) {
        u.searchParams.set(key, params[key])
    }
    return u.toString()
}

export const AuthCallback: ApiHandle = async (req, res) => {
    const inputData = schema.parse(req.query)

    const provider = authManager.getInstance(inputData.sn)
    if (!provider) {
        if (inputData.erp) {
            return res.redirect(
                addParams(inputData.erp, {
                    error: '登陆服务错误，请联系管理员',
                }),
            )
        }
        return res.send('登陆服务错误，请联系管理员', 404)
    }

    const result = await provider.verifyCallback(inputData)

    console.info('verifyCallback result', result)

    if (result) {
        const accessToken = await provider.getUserAccessToken(inputData)
        const user = await provider.getUserInfo(accessToken)

        // TODO 处理用户信息

        if (inputData.srp) {
            return res.redirect(addParams(inputData.srp, { success: 'true' }))
        }
        return res.json(user)
    }

    if (inputData.id) {
        await redis.delCacheKey(`auth:${inputData.id}`)
    }

    if (inputData.erp) {
        return res.redirect(
            addParams(inputData.erp, { error: '参数错误无法登陆' }),
        )
    }

    return res.send('登陆失败，即将回到主站', 404)
}
