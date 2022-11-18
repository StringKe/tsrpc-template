import { Queue, Worker } from 'bullmq'
import { queueOptions, workerOptions } from './common'

export interface FileTaskQueueData {}

export interface FileTaskQueueResult {}

export declare type FileTaskQueueName = 'REMOVE-BG' | 'ID-PHOTO'

export const FILE_TASK_QUEUE = 'file-task'

const fileTaskQueue = new Queue<
    FileTaskQueueData,
    FileTaskQueueResult,
    FileTaskQueueName
>(FILE_TASK_QUEUE, queueOptions)

const fileTaskWorker = new Worker<
    FileTaskQueueData,
    FileTaskQueueResult,
    FileTaskQueueName
>(
    FILE_TASK_QUEUE,
    async (job) => {
        return ''
    },
    {
        ...workerOptions,
    },
)

export { fileTaskQueue, fileTaskWorker }
