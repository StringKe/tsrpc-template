import Redis from 'ioredis'
import redis from './redis'

export class Cache {
    private static cache: Cache
    private redis: Redis

    private constructor(redis: Redis) {
        this.redis = redis
    }

    static getInstance(redis?: Redis) {
        if (!Cache.cache && redis) {
            Cache.cache = new Cache(redis)
        }
        return Cache.cache
    }

    getRedis() {
        return this.redis
    }

    async get(key: string): Promise<any> {
        const data = await this.redis.get(key)
        return data ? JSON.parse(data) : undefined
    }

    async remove(key: string): Promise<any> {
        return this.redis.del(key)
    }

    async set(key: string, data: string): Promise<any>
    async set(key: string, data: string, expire?: number): Promise<any> {
        return expire
            ? this.redis.set(key, JSON.stringify(data), 'EX', expire)
            : this.redis.set(key, JSON.stringify(data))
    }
}

export const cache = Cache.getInstance(redis)
export default cache
