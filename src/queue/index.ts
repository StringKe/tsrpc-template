import { fileTaskQueue, fileTaskWorker } from './file-task-queue'
import { orderQueue, orderWorker } from './order-queue'
import { httpServer } from '../server'

export * from './order-queue'
export * from './file-task-queue'

export const WORKERS = [fileTaskWorker, orderWorker]

export const QUEUES = [fileTaskQueue, orderQueue]

let metricsInterval: NodeJS.Timeout

export async function metrics(stop = false) {
    if (stop) {
        clearInterval(metricsInterval)
        return
    }
    metricsInterval = setInterval(async () => {
        const metrics = await Promise.all(
            QUEUES.map(async (q) => {
                return {
                    name: q.name,
                    completed: await q.getMetrics('completed'),
                    failed: await q.getMetrics('failed'),
                }
            }),
        )

        metrics.forEach((m) => {
            httpServer.logger.log(
                `Queue [${m.name}] completed: ${m.completed.count} failed: ${m.failed.count}`,
            )
        })
    }, 1000 * 5)
}

export async function quiteQueue() {
    await Promise.all(QUEUES.map((queue) => queue.close()))
    await Promise.all(WORKERS.map((worker) => worker.close()))
    if (metricsInterval) {
        clearInterval(metricsInterval)
    }
}
