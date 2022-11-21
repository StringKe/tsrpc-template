import { ApiCall, ApiReturn, HttpServer, WsServer } from 'tsrpc'
import { get, omit } from 'lodash'
import * as Http from 'http'
import redis from '../redis'
import { URLSearchParams } from 'url'
import {
    BaseRequest,
    BaseResponse,
    SessionData,
} from '../../shared/protocols/base'
import { SessionManager } from './session-manager'
import { Session } from './session'

export function withSession(
    server: HttpServer | WsServer,
    secret: string,
    getUserRoles: (userId: number) => Promise<string[]>,
) {
    const sessionManager = new SessionManager(redis, secret)

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

            const inputPublicData = get(node.req, '_publicData')
            const publicData = omit(inputPublicData, ['_hash'])
            const publicDataHash = get(inputPublicData, '_hash')

            let session: Session<SessionData> | undefined

            // 如果存在公共数据，从里面读取可信的数据
            if (publicData && publicDataHash) {
                session = await sessionManager.loadSession(
                    publicData,
                    publicDataHash,
                )
            } else if (token) {
                session = await sessionManager.getSession(token)
            } else {
                session = sessionManager.createSession()
            }

            node.session = session
            const savedUserId = await session.getPrivate('userId')
            node.userId = savedUserId ? Number(savedUserId) : undefined
            node.userRoles = node.userId ? await getUserRoles(node.userId) : []

            node.logger.prefixs.push(`S[${session.token}]`)

            return node
        },
    )

    server.flows.preApiReturnFlow.push(
        async (node: {
            call: ApiCall<BaseRequest, BaseResponse, any>
            return: ApiReturn<BaseResponse>
        }) => {
            const isSucc = get(node, 'return.isSucc')
            if (isSucc && node.return.res && node.call.session) {
                const { publicDataHash, publicData } =
                    await sessionManager.getWriteData(
                        node.call.session as never,
                    )
                node.return.res._publicData = {
                    ...publicData,
                    _hash: publicDataHash,
                }
            }
            return node
        },
    )
}
