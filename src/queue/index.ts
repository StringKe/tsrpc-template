import { fileTaskQueue, fileTaskWorker } from './file-task-queue'
import { orderQueue, orderWorker } from './order-queue'

export * from './order-queue'
export * from './file-task-queue'

export const WORKERS = [fileTaskWorker, orderWorker]

export const QUEUES = [fileTaskQueue, orderQueue]
