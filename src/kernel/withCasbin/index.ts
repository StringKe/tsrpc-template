import {
    ApiCall,
    HttpServer,
    TsrpcError,
    TsrpcErrorType,
    WsServer,
} from 'tsrpc'
import { Enforcer, newEnforcer } from 'casbin'
import { NodeRedisAdapter } from './redis-adapter'
import redis from '../redis'
import { NodeRedisWatcher } from './redis-watcher'
import * as path from 'path'
import * as fs from 'fs'
import {
    BaseConf,
    BaseRequest,
    BaseResponse,
} from '../../shared/protocols/base'

let enforcer: Enforcer

export async function withCasbin(
    server: HttpServer | WsServer,
    modelPath: string,
) {
    modelPath = modelPath.startsWith('/')
        ? modelPath
        : path.join(__dirname, modelPath)

    if (!fs.existsSync(modelPath)) {
        throw new Error(`Casbin model file not found: ${modelPath}`)
    }

    const adapter = await NodeRedisAdapter.newAdapter(redis)
    const watcher = await NodeRedisWatcher.newWatcher(redis)
    enforcer = await newEnforcer(modelPath, adapter)
    enforcer.setWatcher(watcher)

    server.flows.preApiCallFlow.push(
        async (node: ApiCall<BaseRequest, BaseResponse, any>) => {
            node.casbin = enforcer
            const conf = node.service.conf as BaseConf
            if (conf.auths) {
                const userId = node.userId
                if (!userId) {
                    await node.error(
                        new TsrpcError({
                            message: '您必须登陆才可以下一步操作。',
                            code: 'NOT_LOGIN',
                            type: TsrpcErrorType.ApiError,
                        }),
                    )
                }

                const type = conf.auths.type || 'SOME'
                const roles = conf.auths.roles
                const userRoles = node.userRoles
                if (userRoles?.length) {
                    if (type === 'SOME') {
                        const hasRole = roles.some((role) =>
                            userRoles.includes(role),
                        )
                        if (!hasRole) {
                            await node.error(
                                new TsrpcError({
                                    message: '您没有权限操作。',
                                    code: 'NOT_PERMISSION',
                                    type: TsrpcErrorType.ApiError,
                                }),
                            )
                        }
                    } else if (type === 'EVERY') {
                        const mustRole = roles.every((role) =>
                            userRoles.includes(role),
                        )
                        if (!mustRole) {
                            await node.error(
                                new TsrpcError({
                                    message: '您没有权限执行此操作。',
                                    code: 'NOT_PERMISSION',
                                    type: TsrpcErrorType.ApiError,
                                }),
                            )
                        }
                    }
                }
            }
            return node
        },
    )
}
