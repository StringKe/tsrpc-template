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
    id: string
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
    static providerName: string

    options: OAuthProviderBaseOptions

    constructor(options: OAuthProviderBaseOptions) {
        this.options = options
    }

    static async getState(value?: string) {
        const id = getDataId(12)
        await redis.set(`oauth:state:${id}`, value || 1, 'EX', 60 * 10)
        return id
    }

    static getStateValue(state: string): Promise<string | null> {
        return redis.get(`oauth:state:${state}`)
    }

    static async verifyState(state: string) {
        const result = await redis.get(`oauth:state:${state}`)
        return !!result
    }

    static async clearState(state: string): Promise<number> {
        return redis.del(`oauth:state:${state}`)
    }

    getCallbackUrl(
        id: string,
        errorRedirectPath?: string,
        successRedirectPath?: string,
    ): Promise<string> {
        const appUrl = env.APP_URL
        const callbackPath = this.options.callbackPath || '/custom/auth/social'
        const callbackUrl = resolve(appUrl, callbackPath)

        const url = new URL(callbackUrl)
        // 如果失败了，就跳转到 errorRedirectPath
        if (errorRedirectPath) {
            url.searchParams.set('erp', errorRedirectPath)
        }
        // 如果成功了，就跳转到 successRedirectPath
        if (successRedirectPath) {
            url.searchParams.set('srp', successRedirectPath)
        }

        url.searchParams.set('sn', this.options.name)
        url.searchParams.set('id', id)

        return Promise.resolve(url.toString())
    }

    abstract getAuthorizationUrl(params: BaseAuthorizationUrl): Promise<string>

    abstract verifyCallback(params: Record<string, any>): Promise<boolean>

    abstract getUserAccessToken(params: Record<string, any>): Promise<any>

    abstract getUserInfo(params: Record<string, any>): Promise<any>
}
