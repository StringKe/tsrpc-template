import { MetricsTime, QueueOptions, WorkerOptions } from 'bullmq'
import { redisOptions } from '../kernel/redis'
import { cpus } from 'os'

const CPU_COUNT = cpus().length

export const queueOptions: QueueOptions = {
    defaultJobOptions: {
        lifo: true,
        removeOnComplete: {
            age: 60 * 60 * 24,
            count: 10000,
        },
        removeOnFail: {
            age: 60 * 60 * 24,
            count: 10000,
        },
        attempts: 3,
    },
    sharedConnection: true,
    connection: {
        ...redisOptions,
        db: 1,
    },
    prefix: 'queue',
}

export const workerOptions: WorkerOptions = {
    prefix: 'worker',
    autorun: true,
    concurrency: Math.max(1, CPU_COUNT / 2),
    connection: {
        ...redisOptions,
        db: 1,
    },
    metrics: {
        maxDataPoints: MetricsTime.ONE_WEEK * 2,
    },
}
