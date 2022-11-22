import Redis, { RedisOptions } from 'ioredis'

class RedisHelper extends Redis {
    async setCacheKey(key: string, value: string, ttl = 60 * 10) {
        await this.set(key, value, 'EX', ttl)
    }

    async getCacheKey(key: string): Promise<string | null> {
        return this.get(key)
    }
}

export const redisOptions: RedisOptions = {
    host: '127.0.0.1',
    port: 6379,
    db: 1,
}

export const redis = new RedisHelper({
    ...redisOptions,
    db: 0,
    enableOfflineQueue: true,
    offlineQueue: true,
})

export default redis
