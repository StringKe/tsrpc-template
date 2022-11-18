import Redis from 'ioredis'

export class ThrottlerStorage implements ThrottlerStorage {
    redis: Redis
    private scanCount: number

    constructor(redis: Redis) {
        this.redis = redis
        this.scanCount = 1000
    }

    async canUserExecute(
        userId: number,
        key: string,
        limit: number,
        ttl: number,
    ) {
        return this.canExecute(`${userId}:${key}`, limit, ttl)
    }

    async canExecute(
        key: string,
        limit: number,
        ttl: number,
    ): Promise<boolean> {
        const records = await this.getRecord(key)
        const count = records.length
        if (count < limit) {
            await this.addRecord(key, ttl)
            return true
        }
        return false
    }

    async getRecord(key: string): Promise<number[]> {
        const ttls = (
            await this.redis.scan(
                0,
                'MATCH',
                `throttler:${key}:*`,
                'COUNT',
                this.scanCount,
            )
        ).pop()
        return (ttls as string[])
            .map((k) => {
                const value = k.split(':').pop()
                return value ? parseInt(value) : 0
            })
            .sort()
    }

    async addRecord(key: string, ttl: number): Promise<void> {
        await this.redis.set(
            `throttler:${key}:${Date.now() + ttl * 1000}`,
            ttl,
            'EX',
            ttl,
        )
    }
}
