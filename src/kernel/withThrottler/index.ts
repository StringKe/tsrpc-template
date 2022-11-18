import {
    ApiCall,
    ApiReturn,
    HttpServer,
    TsrpcError,
    TsrpcErrorType,
    WsServer,
} from 'tsrpc'
import { ThrottlerStorage } from './throttler-storage'
import redis from '../redis'
import {
    BaseConf,
    BaseRequest,
    BaseResponse,
} from '../../shared/protocols/base'
import { md5 } from 'hash-wasm'
import { get } from 'lodash'
import { ServerResponse } from 'http'

export function withThrottler(server: HttpServer | WsServer) {
    const storage = new ThrottlerStorage(redis)

    function getTrackKey(node: ApiCall<BaseRequest, BaseResponse, any>) {
        const userId = node.userId
        const ip = node.conn.ip
        if (userId) {
            return `default:user:${userId}`
        }
        return `default:ip:${ip}`
    }

    function genHashTrackKey(key: string, trackKey: string) {
        return md5(`${key}:${trackKey}`)
    }

    server.flows.preApiCallFlow.push(
        async (node: ApiCall<BaseRequest, BaseResponse, any>) => {
            const conf = node.service.conf as BaseConf
            const throttlerOptions = conf.throttler
            if (throttlerOptions) {
                let { key, limit, ttl } = throttlerOptions
                if (!key) {
                    key = node.service.name
                }
                if (!limit) {
                    limit = 60
                }
                if (!ttl) {
                    ttl = 60
                }

                const trackKey = getTrackKey(node)
                const recordKey = await genHashTrackKey(key, trackKey)

                const ttls = await storage.getRecord(recordKey)
                const nearestExpiryTime =
                    ttls.length > 0
                        ? Math.ceil((ttls[0] - Date.now()) / 1000)
                        : 0

                const httpRes = get(node, 'conn.httpRes') as
                    | ServerResponse
                    | undefined

                if (ttls.length >= limit) {
                    if (httpRes) {
                        httpRes.setHeader('Retry-After', nearestExpiryTime)
                    }
                    node.throttler = {
                        reset: nearestExpiryTime,
                    }
                    await node.error(
                        new TsrpcError({
                            message: `Too Many Requests, retry after ${nearestExpiryTime} seconds`,
                            code: 'TOO_MANY_REQUESTS',
                            type: TsrpcErrorType.ApiError,
                        }),
                    )
                    return undefined
                }

                const remaining = Math.max(0, limit - (ttls.length + 1))

                if (httpRes) {
                    httpRes.setHeader('X-RateLimit-Limit', limit)
                    httpRes.setHeader('X-RateLimit-Remaining', remaining)
                    httpRes.setHeader('X-RateLimit-Reset', nearestExpiryTime)
                }

                node.throttler = {
                    limit,
                    remaining,
                    reset: nearestExpiryTime,
                }

                await storage.addRecord(recordKey, ttl)
            }
            return node
        },
    )

    server.flows.preApiReturnFlow.push(
        (node: {
            call: ApiCall<BaseRequest, BaseResponse, any>
            return: ApiReturn<BaseResponse>
        }) => {
            const isSucc = get(node, 'return.isSucc')
            if (isSucc) {
                if (node.call.throttler) {
                    if (node.return.res) {
                        node.return.res._throttler = node.call.throttler
                    }
                }
            }
            return node
        },
    )
}
