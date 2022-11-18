import crypto from 'crypto'
import Redis from 'ioredis'
import { RedisScript } from './RedisScript'
import { Session } from './Session'
import promisify from 'putil-promisify'

export interface SessionManagerOptions {
    namespace?: string
    ttl?: number
    wipeInterval?: number
    additionalFields?: string[]
}

export type ResultSession = Session & Record<string, any>

/**
 *
 * @class
 */
export class SessionManager {
    private readonly _client: Redis
    private readonly _ns?: string
    private readonly _ttl?: number
    private readonly _additionalFields?: string[]
    private readonly _killScript: RedisScript
    private readonly _writeScript: RedisScript
    private readonly _wipeScript: RedisScript
    private readonly _killAllScript: RedisScript
    private _wipeTimer?: NodeJS.Timeout
    private _wipeInterval?: number
    private _timeDiff: number

    constructor(client: Redis, props: SessionManagerOptions = {}) {
        if (!(client && typeof client.hmset === 'function')) {
            throw new TypeError('You must provide redis instance')
        }
        this._client = client
        this._additionalFields = props.additionalFields
            ? (Object.freeze(props.additionalFields) as string[])
            : undefined
        this._ns = props.namespace || 'sessions'
        this._ttl = Number(props.ttl) >= 0 ? Number(props.ttl) : 30 * 60
        this._timeDiff = 0
        this._wipeInterval = props.wipeInterval || 1000
        client.once('close', () => this.quit())

        this._killScript = new RedisScript(`
    local prefix = ARGV[1]
    local sessionId = ARGV[2]
    local userId = ARGV[3]
    
    if (userId == "") then
        userId = "anonymous"
    end
    
    redis.call("zrem", prefix..":ACTIVITY", sessionId)          
    redis.call("zrem", prefix..":EXPIRES", sessionId)
    redis.call("zrem", prefix..":user_"..userId, sessionId)
    redis.call("del", prefix..":sess_"..sessionId)        
    if (redis.call("zcount", prefix..":user_"..userId, "+inf", "-inf")>0) then
      redis.call("zrem", prefix..":USERS", userId)
    end          
    return 1        
    `)

        let s = ''
        if (props.additionalFields) {
            for (let i = 0; i < props.additionalFields.length; i++) {
                s += ', "f' + i + '", ARGV[' + (7 + i) + ']'
            }
        }

        this._writeScript = new RedisScript(
            `
    local prefix = ARGV[1]
    local lastAccess = tonumber(ARGV[2])
    local userId = ARGV[3]
    local sessionId = ARGV[4]
    local expires = tonumber(ARGV[5])
    local ttl = tonumber(ARGV[6])
    
    if (userId == "") then
        userId = "anonymous"
    end
    
    redis.call("zadd", prefix..":USERS", lastAccess, userId) 
    redis.call("zadd", prefix..":ACTIVITY", lastAccess, sessionId)          
    redis.call("zadd", prefix..":user_"..userId, lastAccess, sessionId)
    redis.call("hmset", prefix..":sess_"..sessionId, "us", userId, "la", lastAccess, "ex", expires, "ttl", ttl` +
                s +
                `)                       
    if (expires > 0) then
      redis.call("zadd", prefix..":EXPIRES", expires, sessionId)
    else
      redis.call("zrem", prefix..":EXPIRES", sessionId)
    end          
    return 1
    `,
        )

        this._wipeScript = new RedisScript(`
    -- find keys with wildcard
    local matches = redis.call("zrevrangebyscore", ARGV[1]..":EXPIRES", ARGV[2], "-inf")
    if unpack(matches) == nil then
      return 0 
    end
    -- Iterate keys
    for _,key in ipairs(matches) do
      local userId = redis.call("HGET", ARGV[1]..":sess_"..key, "us")
      if userId ~= nil then
        redis.call('zrem', ARGV[1]..":user_"..userId, key)            
      end
      redis.call("del", ARGV[1]..":sess_"..key)            
    end          
    redis.call("zrem", ARGV[1]..":ACTIVITY", unpack(matches))
    redis.call("zrem", ARGV[1]..":EXPIRES", unpack(matches))                    
    `)

        this._killAllScript = new RedisScript(`
    -- find keys with wildcard
    local matches = redis.call("keys", ARGV[1]) 
    --if there are any keys
    if unpack(matches) ~= nil then
      --delete all
      return redis.call("del", unpack(matches)) 
    else 
      return 0 --if no keys to delete
    end
    `)
    }

    get namespace(): string | undefined {
        return this._ns
    }

    get ttl(): number | undefined {
        return this._ttl
    }

    /**
     * Returns the number of sessions within the last n seconds.
     * @param {number} [secs] The elapsed time since the last activity of the session. Returns total count of sessions If not defined or zero
     * @return {Promise<Number>}
     */
    async count(secs = 0): Promise<number> {
        const client = await this._getClient()
        secs = Number(secs)
        const prefix = this._ns
        const resp = await promisify.fromCallback((cb) =>
            client.zcount(
                prefix + ':ACTIVITY',
                secs ? Math.floor(this._now() - secs) : '-inf',
                '+inf',
                cb,
            ),
        )
        return Number(resp)
    }

    async countForUser(userId: string, secs = 0): Promise<number> {
        if (!userId) {
            throw new TypeError('You must provide userId')
        }
        const client = await this._getClient()
        secs = Number(secs)
        return new Promise((resolve, reject) => {
            client.zcount(
                this._ns + ':user_' + userId,
                secs ? Math.floor(this._now() - secs) : '-inf',
                '+inf',
                (err, resp) => {
                    if (err) {
                        return reject(err)
                    }
                    resolve(Number(resp))
                },
            )
        })
    }

    async create(
        userId = 'anonymous',
        props?: { ttl?: number; [index: string]: any },
    ): Promise<ResultSession> {
        if (!userId) {
            throw new TypeError('You must provide userId')
        }

        props = props || {}
        const ttl = Number(props.ttl) >= 0 ? Number(props.ttl) : this._ttl
        const sessionId = this._createSessionId()
        const session = new Session(this, {
            sessionId,
            userId,
            ttl,
        })
        /* istanbul ignore else */
        if (this._additionalFields) {
            for (const f of this._additionalFields) {
                // @ts-ignore
                session[f] = props[f]
            }
        }
        await session.write()
        return session
    }

    async get(
        sessionId: string,
        noUpdate = false,
    ): Promise<ResultSession | undefined> {
        if (!sessionId) {
            throw new TypeError('You must provide sessionId')
        }
        const session = new Session(this, { sessionId })
        await session.read()
        if (!session.valid) {
            return undefined
        }
        if (noUpdate) {
            return session
        }
        await session.write()
        return session
    }

    async getAllSessions(secs: number): Promise<string[]> {
        const client = await this._getClient()
        secs = Number(secs)
        return await promisify.fromCallback((cb) =>
            client.zrevrangebyscore(
                this._ns + ':ACTIVITY',
                '+inf',
                secs ? Math.floor(this._now() - secs) : '-inf',
                cb,
            ),
        )
    }

    async getAllUsers(secs = 0): Promise<string[]> {
        const client = await this._getClient()
        secs = Number(secs)
        return await promisify.fromCallback((cb) =>
            client.zrevrangebyscore(
                this._ns + ':USERS',
                '+inf',
                secs ? Math.floor(this._now() - secs) : '-inf',
                cb,
            ),
        )
    }

    async getUserSessions(userId = 'anonymous', n = 0): Promise<string[]> {
        if (!userId) {
            throw new TypeError('You must provide userId')
        }
        const client = await this._getClient()
        n = Number(n)
        return await promisify.fromCallback((cb) =>
            client.zrevrangebyscore(
                this._ns + ':user_' + userId,
                '+inf',
                n ? Math.floor(this._now() - n) : '-inf',
                cb,
            ),
        )
    }

    async getOldestUserSession(
        userId = 'anonymous',
        noUpdate = false,
    ): Promise<ResultSession | undefined> {
        if (!userId) {
            throw new TypeError('You must provide userId')
        }
        const client = await this._getClient()
        const sessionId = await promisify.fromCallback((cb) =>
            client.zrevrange(this._ns + ':user_' + userId, -1, -1, cb),
        )
        if (sessionId && sessionId.length) {
            return await this.get(sessionId[0], noUpdate)
        }
    }

    async exists(sessionId: string): Promise<boolean> {
        if (!sessionId) {
            throw new TypeError('You must provide sessionId')
        }
        const client = await this._getClient()
        const resp = await promisify.fromCallback((cb) =>
            client.exists(this._ns + ':sess_' + sessionId, cb),
        )
        return !!Number(resp)
    }

    async kill(sessionId: string): Promise<void> {
        if (!sessionId) {
            throw new TypeError('You must provide sessionId')
        }
        const session = await this.get(sessionId, true)
        if (session) {
            return await session.kill()
        }
    }

    async killUser(userId = 'anonymous'): Promise<void> {
        if (!userId) {
            throw new TypeError('You must provide userId')
        }
        const sessions = await this.getUserSessions(userId)
        for (const sid of sessions) {
            await this.kill(sid)
        }
    }

    async killAll(): Promise<void> {
        const client = await this._getClient()
        await this._killAllScript.execute(client, this._ns + ':*')
    }

    async now(): Promise<number> {
        const client = await this._getClient()
        await this._syncTime(client)
        return this._now()
    }

    quit(): void {
        if (this._wipeTimer) {
            clearTimeout(this._wipeTimer)
            this._wipeTimer = undefined
        }
    }

    async wipe(): Promise<void> {
        if (this._wipeTimer) {
            clearTimeout(this._wipeTimer)
            this._wipeTimer = undefined
        }
        const client = await this._getClient()
        await this._wipeScript.execute(client, this._ns, this._now())
    }

    private _createSessionId(): string {
        return crypto.randomBytes(16).toString('hex').toUpperCase()
    }

    private async _syncTime(client: Redis): Promise<number> {
        const resp = await promisify.fromCallback((cb) => client.time(cb))
        // Synchronize redis server time with local time
        this._timeDiff =
            Date.now() / 1000 -
            Math.floor(Number(resp[0]) + Number(resp[1]) / 1000000)
        return this._now()
    }

    private _now(): number {
        return Math.floor(Date.now() / 1000 + this._timeDiff)
    }

    private async _getClient(): Promise<Redis> {
        if (!this._wipeTimer) {
            this._wipeTimer = setTimeout(() => {
                this.wipe().catch(() => 1)
            }, this._wipeInterval)
            this._wipeTimer.unref()
        }
        if (this._client.status !== 'ready') {
            await new Promise((resolve) => {
                this._client.once('ready', resolve)
            })
        }
        if (this._timeDiff == null) {
            await this._syncTime(this._client)
        }
        return this._client
    }
}
