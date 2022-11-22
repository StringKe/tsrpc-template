import Redis from 'ioredis'
import dayjs from 'dayjs'
import { getDataId } from '../../utils/nanoid'
import { SessionData } from '../../shared/protocols/base'
import { TsrpcError, TsrpcErrorType } from 'tsrpc'
import { get, uniq } from 'lodash'

function checkExpired(expires: number | null | undefined) {
    if (expires) {
        return dayjs().isBefore(dayjs(expires))
    }
    return false
}

async function getSessionKeyData(
    redis: Redis,
    key: string,
    dataId: string | number,
): Promise<[number | null | undefined, any]> {
    const storedData = await redis.get(`${key}:${dataId}`)
    if (storedData) {
        const ttl = await redis.ttl(`${key}:${dataId}`)
        return [ttl, storedData]
    }
    return [null, null]
}

async function loadSessionData(
    redis: Redis,
    prefix: string,
    dataId: String | number,
): Promise<SessionData> {
    const key = `${prefix}:${dataId}:_keys`
    const data = await redis.lrange(key, 0, -1)
    if (data) {
        const privateData = {} as unknown as SessionData
        for (const dataKey in data) {
            const [ttl, storedData] = await getSessionKeyData(
                redis,
                `${prefix}:${dataId}`,
                dataKey,
            )
            if (storedData) {
                if (ttl) {
                    const time = dayjs().add(Number(ttl), 'second').valueOf()
                    privateData[dataKey] = [time, storedData]
                } else {
                    privateData[key] = [null, storedData]
                }
            }
        }
        return privateData
    }
    return {}
}

export class Session<PublicData extends SessionData> {
    public token: string
    public userId: number | undefined
    public deviceId: string | undefined
    private redisInstance: Redis
    private publicData: PublicData
    private issueTime = dayjs()

    constructor(redis: Redis, publicData: PublicData, token?: string) {
        this.redisInstance = redis
        this.publicData = publicData

        if (!token) {
            const getToken = get(publicData, 'token')
            if (getToken) {
                if (Array.isArray(getToken)) {
                    this.token = getToken[1]
                }
            } else {
                this.token = getDataId(32)
            }
        } else {
            this.token = token
        }
    }

    getPublic(key: string) {
        const value = this.publicData[key]
        if (value) {
            if (checkExpired(value[0])) {
                return value[1]
            }
        }
        return null
    }

    hasPublic(key: string) {
        return !!this.getPublic(key)
    }

    setPublic(key: string, value: any, expires = 60 * 60 * 24 * 30) {
        if (expires) {
            const time = dayjs().add(expires, 'second').valueOf()
            // @ts-ignore
            this.publicData[key] = [time, value]
        } else {
            // @ts-ignore
            this.publicData[key] = [null, value]
        }
    }

    async getPrivate(key: string) {
        const value = await getSessionKeyData(
            this.redisInstance,
            `session:${this.token}`,
            key,
        )
        if (value[1]) {
            return JSON.parse(value[1])
        }
        return null
    }

    async hasPrivate(key: string) {
        return !!this.getPrivate(key)
    }

    async setPrivate(key: string, value: any) {
        await this.redisInstance.set(
            `session:${this.token}:${key}`,
            JSON.stringify(value),
            'EX',
            await this.getSurvivalTtl(),
        )
    }

    /**
     * 获取与用户关联的记录
     *
     * @throws {TsrpcError}
     * @param key
     */
    async getUser(key: string) {
        if (!this.userId) {
            this.userId = await this.getPrivate('userId')
        }

        if (!this.userId) {
            throw new TsrpcError({
                message: '正在尝试获取用户数据，但是用户未关联',
                code: 'USER_NOT_FOUND',
                type: TsrpcErrorType.ApiError,
            })
        }

        const value = await getSessionKeyData(
            this.redisInstance,
            `user:${this.userId}`,
            key,
        )
        if (value[1]) {
            return JSON.parse(value[1])
        }
        return null
    }

    async hasUser(key: string) {
        return !!this.getUser(key)
    }

    async setUser(key: string, value: any) {
        if (!this.userId) {
            this.userId = await this.getPrivate('userId')
        }

        if (!this.userId) {
            throw new TsrpcError({
                message: '正在尝试设置用户数据，但是用户未关联',
                code: 'USER_NOT_FOUND',
                type: TsrpcErrorType.ApiError,
            })
        }

        await this.redisInstance.set(
            `user:${this.userId}:${key}`,
            JSON.stringify(value),
            'EX',
            await this.getSurvivalTtl(),
        )
    }

    async getAllPrivate() {
        return await loadSessionData(
            this.redisInstance,
            `session:${this.token}`,
            this.token,
        )
    }

    getAllPublic() {
        return this.publicData
    }

    async getAllUser() {
        if (!this.userId) {
            this.userId = await this.getPrivate('userId')
        }
        if (!this.userId) {
            throw new Error('正在尝试获取用户数据，但是用户未关联')
        }
        return await loadSessionData(
            this.redisInstance,
            `user:${this.userId}`,
            this.userId,
        )
    }

    async init() {
        if (!this.token) {
            this.token = getDataId(32)
        }
        this.userId = await this.getPrivate('userId')
        this.deviceId = await this.getPrivate('deviceId')

        // 数据已经过期
        const ttl = await this.getSurvivalTtl()
        if (ttl === 0) {
            await this.logout()

            this.token = getDataId(32)
            this.userId = undefined
            this.deviceId = undefined
        }
    }

    async bindUser(userId: number) {
        this.userId = userId
        const userKey = `session:user:${userId}`
        const allSessionToken = await this.redisInstance.smembers(userKey)
        allSessionToken.push(this.token)
        await this.redisInstance.sadd(userKey, ...uniq(allSessionToken))
        await this.setPrivate('userId', userId)
    }

    async bindDevice(deviceId: string, userId?: number) {
        if (userId) {
            await this.bindUser(userId)
        }

        if (!this.userId) {
            this.userId = await this.getPrivate('userId')
        }

        if (!this.userId) {
            throw new Error('正在尝试绑定 设备 ID，但是用户未关联')
        }

        const deviceKey = `session:device:${userId}`
        const allDeviceId = await this.redisInstance.smembers(deviceKey)
        allDeviceId.push(deviceId)
        await this.redisInstance.sadd(deviceKey, ...uniq(allDeviceId))
        await this.setPrivate('deviceId', deviceId)
        this.deviceId = deviceId
    }

    async getSurvivalTtl() {
        const timeNum = await this.getPrivate('issueTime')
        if (timeNum) {
            this.issueTime = dayjs(Number(timeNum))
        }

        if (!this.issueTime) {
            this.issueTime = dayjs()
        }
        const ttl = this.issueTime.add(30, 'day').diff(dayjs(), 'second')
        return ttl > 0 ? ttl : 0
    }

    async logout() {
        if (!this.userId) {
            this.userId = await this.getPrivate('userId')
        }

        if (this.userId) {
            const userKey = `session:user:${this.userId}`
            const allSessionToken = await this.redisInstance.smembers(userKey)
            const index = allSessionToken.indexOf(this.token)
            if (index >= 0) {
                allSessionToken.splice(index, 1)
            }
            await this.redisInstance.sadd(userKey, ...uniq(allSessionToken))
        }

        if (this.deviceId) {
            const deviceKey = `session:device:${this.userId}`
            const allDeviceId = await this.redisInstance.smembers(deviceKey)
            const index = allDeviceId.indexOf(this.deviceId)
            if (index >= 0) {
                allDeviceId.splice(index, 1)
            }
            await this.redisInstance.sadd(deviceKey, ...uniq(allDeviceId))
        }

        await this.redisInstance.del(`session:${this.token}:*`)
        this.userId = undefined
        this.deviceId = undefined
    }
}
