import { ApiCall, ApiReturn, HttpServer, WsServer } from 'tsrpc'
import { get } from 'lodash'
import * as Http from 'http'
import { ResultSession, SessionManager } from './session'
import redis from '../redis'
import { URLSearchParams } from 'url'
import { BaseRequest, BaseResponse } from '../../shared/protocols/base'

export function withSession(
    server: HttpServer | WsServer,
    getUserRoles: (userId: number) => Promise<string[]>,
) {
    const sessionManager = new SessionManager(redis, {
        namespace: 'session',
    })

    server.flows.preApiCallFlow.push(
        async (node: ApiCall<BaseRequest, BaseResponse, any>) => {
            let token: string | undefined | null = get(node.req, '_token')
            if (!token) {
                const nodeReq = get(node, 'conn.httpReq') as
                    | Http.IncomingMessage
                    | undefined
                if (nodeReq) {
                    const query = nodeReq.url?.split('?')[1]
                    const parsedQuery = query
                        ? new URLSearchParams(query)
                        : undefined
                    token = get(nodeReq, 'headers.authorization')
                    if (!token) {
                        token = get(nodeReq, 'headers.Authorization') as string
                    }
                    if (!token) {
                        token = get(nodeReq, 'headers.x-token') as string
                    }
                    if (!token) {
                        token = get(nodeReq, 'headers.X-Token') as string
                    }
                    if (!token) {
                        token = parsedQuery?.get('_token')
                    }
                }
            }

            let session: ResultSession | undefined

            if (token) {
                session = await sessionManager.get(token)
            }

            if (!session) {
                session = await sessionManager.create()
            }

            node.session = session
            node.userId =
                session.userId === 'anonymous'
                    ? undefined
                    : Number(session.userId)
            node.userRoles = node.userId ? await getUserRoles(node.userId) : []

            node.logger.prefixs.push(`S[${session.sessionId}]`)

            return node
        },
    )

    server.flows.preApiReturnFlow.push(
        async (node: {
            call: ApiCall<BaseRequest, BaseResponse, any>
            return: ApiReturn<BaseResponse>
        }) => {
            if (node.call.session) {
                await node.call.session.write()
            }
            const isSucc = get(node, 'return.isSucc')
            if (isSucc) {
                if (node.return.res) {
                    node.return.res._token = node.call.session.sessionId
                }
            }
            return node
        },
    )
}
