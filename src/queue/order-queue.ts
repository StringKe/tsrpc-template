import { Queue, Worker } from 'bullmq'
import { queueOptions, workerOptions } from './common'

export interface OrderQueueData {}

export interface OrderQueueResult {}

export declare type OrderQueueName =
    | 'PRE_ORDER'
    | 'VIP_ORDER'
    | 'RESOURCE_ORDER'

export const ORDER_QUEUE = 'order'

const orderQueue = new Queue<OrderQueueData, OrderQueueResult, OrderQueueName>(
    ORDER_QUEUE,
    queueOptions,
)

const orderWorker = new Worker<
    OrderQueueData,
    OrderQueueResult,
    OrderQueueName
>(
    ORDER_QUEUE,
    async (job) => {
        return ''
    },
    workerOptions,
)

export { orderQueue, orderWorker }
