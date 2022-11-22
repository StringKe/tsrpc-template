import {
    BaseAuthorizationUrl,
    OAuthProvider,
    OAuthProviderBaseOptions,
} from '../abstract-provider'
import axios from 'axios'

export declare type QQProviderOptions = OAuthProviderBaseOptions & {
    clientId: string
    clientSecret: string
    canGetUnionId?: boolean
}

export interface QQOpenInfo {
    client_id: string
    openid: string
    unionid?: string
}

export interface QQAccessTokenInfo {
    access_token: string
    expires_in: number
    refresh_token: string
}

export interface QQProfileBase {
    ret: number
    msg: string
    nickname: string
    figureurl: string
    figureurl_1: string
    figureurl_2: string
    figureurl_qq_1: string
    figureurl_qq_2: string
    gender: string
}

export interface QQApiError {
    error: string
    error_description: string
}

export interface QQProfile extends QQProfileBase {
    unionId?: string
    openId: string
    raw: any
}

function isQQApiError(data: any): data is QQApiError {
    return data && data.error
}

export class QQProvider extends OAuthProvider {
    providerName = 'qq'
    options: QQProviderOptions

    constructor(options: QQProviderOptions) {
        super(options)
        this.options = options
    }

    async getAuthorizationUrl(params: BaseAuthorizationUrl): Promise<string> {
        const scope = ['get_user_info']
        const redirectUrl = await this.getCallbackUrl(params.erp, params.srp)
        const url = new URL('https://graph.qq.com/oauth2.0/authorize')
        url.searchParams.set('response_type', 'code')
        url.searchParams.set('client_id', this.options.clientId)
        url.searchParams.set('redirect_uri', redirectUrl)
        url.searchParams.set('state', await OAuthProvider.getState(redirectUrl))
        url.searchParams.set('scope', scope.join(','))
        return Promise.resolve(url.toString())
    }

    verifyCallback(params: Record<string, any>): Promise<boolean> {
        const inputState = params.state
        if (!inputState) {
            return Promise.reject(new Error('state is required'))
        }
        const code = params.code
        if (!code) {
            return Promise.reject(new Error('code is required'))
        }
        return OAuthProvider.verifyState(inputState)
    }

    async getUserAccessToken(
        params: Record<string, any>,
    ): Promise<QQAccessTokenInfo> {
        const { code, state } = params
        const callbackUrl = await OAuthProvider.getStateValue(state)
        if (!callbackUrl) {
            throw new Error('state is invalid')
        }

        const url = new URL('https://graph.qq.com/oauth2.0/token')
        url.searchParams.set('grant_type', 'authorization_code')
        url.searchParams.set('client_id', this.options.clientId)
        url.searchParams.set('client_secret', this.options.clientSecret)
        url.searchParams.set('code', code)
        url.searchParams.set('redirect_uri', callbackUrl)
        url.searchParams.set('fmt', 'json')

        return new Promise<QQAccessTokenInfo>((resolve, reject) => {
            axios
                .get<
                    | QQAccessTokenInfo
                    | {
                          error: string
                          error_description: string
                      }
                >(url.toString(), {
                    headers: {
                        'Content-Type': 'application/json',
                    },
                })
                .then((response) => {
                    const data = response.data
                    if (isQQApiError(data)) {
                        return reject(new Error(data.error_description))
                    }
                    return resolve(data)
                })
                .catch((error) => {
                    reject(error)
                })
        })
    }

    getUserOpenId(accessToken: string): Promise<QQOpenInfo> {
        const url = new URL('https://graph.qq.com/oauth2.0/me')
        url.searchParams.set('access_token', accessToken)
        url.searchParams.set('fmt', 'json')
        if (this.options.canGetUnionId) {
            url.searchParams.set('unionid', '1')
        }

        return new Promise<QQOpenInfo>((resolve, reject) => {
            axios
                .get<QQOpenInfo>(url.toString(), {
                    responseType: 'json',
                })
                .then((response) => {
                    const data = response.data
                    if (isQQApiError(data)) {
                        return reject(new Error(data.error_description))
                    }
                    resolve(data)
                })
                .catch((error) => {
                    reject(error)
                })
        })
    }

    async getUserInfo(params: QQAccessTokenInfo): Promise<QQProfile> {
        const openInfo = await this.getUserOpenId(params.access_token)

        const url = new URL('https://graph.qq.com/user/get_user_info')
        url.searchParams.set('access_token', params.access_token)
        url.searchParams.set('oauth_consumer_key', openInfo.client_id)
        url.searchParams.set('openid', openInfo.openid)

        return new Promise<QQProfile>((resolve, reject) => {
            axios
                .get<QQProfileBase>(url.toString(), {
                    responseType: 'json',
                })
                .then((response) => {
                    const data = response.data
                    if (data.ret !== 0) {
                        return reject(new Error(data.msg))
                    }
                    resolve({
                        ...data,
                        openId: openInfo.openid,
                        unionId: openInfo.unionid,
                        raw: {
                            ...data,
                            ...openInfo,
                            params,
                        },
                    })
                })
                .catch((error) => {
                    reject(error)
                })
        })
    }
}
