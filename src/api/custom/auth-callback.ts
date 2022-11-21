import { ApiHandle } from '../../kernel/withHttpServer/types'
import { z } from 'zod'
import authManager from '../../kernel/auth'

const schema = z.object({
    erp: z.string().nullable().optional(),
    srp: z.string().nullable().optional(),
    sn: z.string(),
    state: z.string(),
})

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
                addParams(inputData.erp, { error: 'provider not found' }),
            )
        }
        return res.send('No provider found', 404)
    }

    const result = await provider.verifyCallback(inputData)
    if (result) {
        const accessToken = await provider.getUserAccessToken(inputData)
        const user = await provider.getUserInfo(accessToken)

        console.log(user)

        if (inputData.srp) {
            return res.redirect(addParams(inputData.srp, { success: 'true' }))
        }
        return res.json({})
    }

    if (inputData.erp) {
        return res.redirect(
            addParams(inputData.erp, { error: 'verify input data error' }),
        )
    }
    return res.send('fail', 404)
}
