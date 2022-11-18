import { Watcher } from 'casbin'
import Redis, {
    Cluster,
    ClusterNode,
    ClusterOptions,
    RedisOptions,
} from 'ioredis'

export interface WatcherOptions extends RedisOptions {
    channel?: string
}

export interface WatcherClusterOptions extends ClusterOptions {
    channel?: string
}

export type RedisClient = Cluster | Redis

export interface Connection {
    close(): void

    getRedisClient(): Promise<RedisClient>
}

export class RedisConnection implements Connection {
    private redisClient: Redis

    constructor(client: Redis) {
        this.redisClient = client
    }

    public close() {
        this.redisClient.disconnect()
    }

    public async getRedisClient(): Promise<Redis> {
        return this.redisClient
    }
}

export class RedisClusterConnection implements Connection {
    public redisClient: Cluster
    public nodes: ClusterNode[]
    private readonly options?: ClusterOptions

    constructor(nodes: ClusterNode[] = [], options: ClusterOptions = {}) {
        this.nodes = nodes
        this.options = options
        this.redisClient = new Cluster(this.nodes, this.options)
    }

    public close() {
        this.redisClient.disconnect()
    }

    public async getRedisClient(): Promise<Cluster> {
        return this.redisClient
    }
}

export class NodeRedisWatcher implements Watcher {
    pubConnection: RedisConnection | RedisClusterConnection
    subConnection: RedisConnection | RedisClusterConnection
    callback: (() => void) | undefined
    channel = 'casbin'

    public static async newWatcher(
        client: Redis,
        channel = 'casbin',
    ): Promise<NodeRedisWatcher> {
        const pubConnection = new RedisConnection(await client.duplicate())
        const subConnection = new RedisConnection(await client.duplicate())
        return this.init(pubConnection, subConnection, channel)
    }

    private static async init(
        pubConnection: RedisConnection | RedisClusterConnection,
        subConnection: RedisConnection | RedisClusterConnection,
        channel?: string,
    ): Promise<NodeRedisWatcher> {
        const watcher = new NodeRedisWatcher()

        watcher.pubConnection = pubConnection
        watcher.subConnection = subConnection

        if (channel) {
            watcher.channel = channel
        }

        const client = await watcher.subConnection.getRedisClient()

        await client.subscribe(watcher.channel)
        client.on('message', (chan: string) => {
            if (chan !== watcher.channel) {
                return
            }
            if (watcher.callback) {
                watcher.callback()
            }
        })

        return watcher
    }

    public async update(): Promise<boolean> {
        const client = await this.pubConnection.getRedisClient()
        await client.publish(this.channel, 'casbin rules updated')
        return true
    }

    public setUpdateCallback(callback: () => void) {
        this.callback = callback
    }

    public async close(): Promise<void> {
        this.pubConnection.close()
        this.subConnection.close()
    }
}
