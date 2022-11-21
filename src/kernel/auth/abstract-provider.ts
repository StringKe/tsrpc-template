import env from '../../env'
import redis from '../redis'
import { getDataId } from '../../utils/nanoid'

export interface OAuthProviderBaseOptions {
    name: string
    callbackPath?: string
}

export interface BaseAuthorizationUrl {
    erp?: string
    srp?: string
}

function resolve(from: string, to: string) {
    const resolvedUrl = new URL(to, new URL(from, 'resolve://'))
    if (resolvedUrl.protocol === 'resolve:') {
        const { pathname, search, hash } = resolvedUrl
        return pathname + search + hash
    }
    return resolvedUrl.toString()
}

export abstract class OAuthProvider {
    abstract providerName: string

    options: OAuthProviderBaseOptions

    constructor(options: OAuthProviderBaseOptions) {
        this.options = options
    }

    static async getState(value?: string) {
        const id = getDataId(12)
        await redis.set(`oauth:state:${id}`, value || 1, 'EX', 60 * 10)
        return id
    }

    static async getStateValue(state: string): Promise<string | null> {
        const value = await redis.get(`oauth:state:${state}`)
        if (value) {
            await redis.del(`oauth:state:${state}`)
        }
        return value
    }

    static async verifyState(state: string) {
        const result = await redis.get(`oauth:state:${state}`)
        if (result) {
            await redis.del(`oauth:state:${state}`)
            return true
        }
        return false
    }

    getCallbackUrl(
        errorRedirectPath?: string,
        successRedirectPath?: string,
    ): Promise<string> {
        const appUrl = env.APP_URL
        const callbackPath = this.options.callbackPath || '/custom/auth/social'
        const callbackUrl = resolve(callbackPath, appUrl)

        const url = new URL(callbackUrl)
        // 如果失败了，就跳转到 errorRedirectPath
        if (errorRedirectPath) {
            url.searchParams.set('erp', errorRedirectPath)
        }
        // 如果成功了，就跳转到 successRedirectPath
        if (successRedirectPath) {
            url.searchParams.set('srp', successRedirectPath)
        }

        return Promise.resolve(url.toString())
    }

    abstract getAuthorizationUrl(params: BaseAuthorizationUrl): Promise<string>

    abstract verifyCallback(params: Record<string, any>): Promise<boolean>

    abstract getUserAccessToken(params: Record<string, any>): Promise<any>

    abstract getUserInfo(params: Record<string, any>): Promise<any>
}
