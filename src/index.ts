import * as path from 'path'
import { httpServer, wsServer } from './server'
import { HttpServer, WsServer } from 'tsrpc'
import { withSession } from './kernel/withSession'
import { withCasbin } from './kernel/withCasbin'
import { withThrottler } from './kernel/withThrottler'
import { QUEUES, WORKERS } from './queue'
import { withHttpServer } from './kernel/withHttpServer'
import './type'
import './env'

let metricsInterval: NodeJS.Timeout

async function metrics(stop = false) {
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

async function preWith(server: HttpServer | WsServer) {
    await withSession(
        server,
        // openssl rand -base64 32
        'zfqrHApAWKJ7f/IGemAuco/kIKvGSG8MQ1yp61E/GwM=',
        async (_userId): Promise<string[]> => {
            return []
        },
    )
    await withThrottler(server)
    await withCasbin(server, path.join(__dirname, 'model.conf'))
    await withHttpServer(server)

    await metrics(true)
}

async function init() {
    await httpServer.autoImplementApi(path.resolve(__dirname, 'api'))
    await wsServer.autoImplementApi(path.resolve(__dirname, 'api'))

    await preWith(httpServer)
    await preWith(wsServer)
}

async function main() {
    await init()
    await httpServer.start()
    await wsServer.start()
}

process.on('SIGINT', async () => {
    httpServer.logger.log(`Http 服务器开始关闭...`)
    await httpServer.stop()

    httpServer.logger.log(`等待队列关闭...`)
    await Promise.all(QUEUES.map((queue) => queue.close()))
    await Promise.all(WORKERS.map((worker) => worker.close()))

    httpServer.logger.log(`Ws 服务器开始关闭...`)
    await wsServer.stop()

    if (metricsInterval) {
        clearInterval(metricsInterval)
    }

    httpServer.logger.log(`服务器已关闭`)
    process.exit(0)
})

void main()
