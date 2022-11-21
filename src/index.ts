import * as path from 'path'
import { httpServer, wsServer } from './server'
import { HttpServer, WsServer } from 'tsrpc'
import { withSession } from './kernel/withSession'
import { withCasbin } from './kernel/withCasbin'
import { withThrottler } from './kernel/withThrottler'
import { metrics, quiteQueue } from './queue'
import { withHttpServer } from './kernel/withHttpServer'
import './type'
import './env'
// import storageify from './kernel/storageify'
// import { LocalDrive } from './kernel/storageify/drive/local'
// import env from './env'

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

    // 存储初始化
    // storageify.createInstance<LocalDrive>('default', 'local', {
    //     basePath: path.join(__dirname, env.STORAGE_LOCAL_TEST2_PATH || '/'),
    //     url: env.STORAGE_LOCAL_TEST2_URL || 'http://localhost:3000/storage',
    // })
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
    await quiteQueue()

    httpServer.logger.log(`Ws 服务器开始关闭...`)
    await wsServer.stop()

    httpServer.logger.log(`服务器已关闭`)
    process.exit(0)
})

void main()
