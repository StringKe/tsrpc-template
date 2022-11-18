import Redis, { RedisOptions } from 'ioredis'

class RedisHelper extends Redis {}

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
