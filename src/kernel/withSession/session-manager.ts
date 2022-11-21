import { getDataId } from '../../utils/nanoid'
import { Session } from './session'
import Redis from 'ioredis'
import { createHMAC, createSHA256 } from 'hash-wasm'
import { SessionData } from '../../shared/protocols/base'
import { TsrpcError, TsrpcErrorType } from 'tsrpc'

const sha256Algo = createSHA256()

export class SessionManager {
    private redis: Redis
    private secret: string

    constructor(redis: Redis, secret: string) {
        this.redis = redis
        this.secret = secret
    }

    createSession() {
        const sessionId = getDataId(32)
        return new Session(
            this.redis,
            {
                token: [null, sessionId],
            },
            sessionId,
        )
    }

    async getSession(token: string) {
        const session = new Session(this.redis, {}, token)
        await session.init()
        return session
    }

    async getWriteData(session: Session<{ token: [null, string] }>) {
        const hash = await createHMAC(sha256Algo, this.secret)
        const publicData = session.getAllPublic()
        const stringData = JSON.stringify(publicData)
        await hash.update(stringData)
        const hashed = hash.digest().toLowerCase()
        return {
            publicData,
            publicDataHash: hashed,
        }
    }

    async loadSession(publicData: SessionData, publicDataHash: string) {
        if (!(await this.verifyPublicData(publicData, publicDataHash))) {
            throw new TsrpcError({
                code: 'INVALID_SESSION',
                message: 'Invalid session',
                type: TsrpcErrorType.ApiError,
            })
        }
        const token = publicData.token[1]
        const session = new Session(this.redis, publicData, token)
        await session.init()
        return session
    }

    async verifyPublicData(publicData: SessionData, publicDataHash: string) {
        const hash = await createHMAC(sha256Algo, this.secret)

        const stringData = JSON.stringify(publicData)
        await hash.update(stringData)
        const hashed = hash.digest().toLowerCase()
        return hashed === publicDataHash.toLowerCase()
    }

    async getUserSessions(userId: number) {
        const key = `session:user:${userId}`
        const sessions = await this.redis.smembers(key)
        return Promise.all(sessions.map((s) => this.getSession(s)))
    }

    async getUserDevices(userId: number) {
        const key = `session:device:${userId}`
        const sessions = await this.redis.smembers(key)
        return Promise.all(sessions.map((s) => this.getSession(s)))
    }

    async logoutAllDeviceByUserId(userId: number) {
        const sessions = await this.getUserSessions(userId)
        for (const session of sessions) {
            await session.logout()
        }
    }
}
