import promisify from 'putil-promisify'
import { Redis } from 'ioredis'

export class RedisScript {
    private readonly _src: string
    private readonly _keys: string[]
    private _sha: string

    constructor(src: string, keys?: string[]) {
        this._src = src
        this._sha = ''
        this._keys = keys || []
    }

    async execute(client: Redis, ...args: any[]): Promise<boolean> {
        if (!this._sha) {
            await this._loadScript(client)
        }
        try {
            return await this._execute(client, ...args)
        } catch (err) {
            if (!String(err).includes('NOSCRIPT')) {
                throw err
            }
            // Retry
            this._sha = ''
            return await this._execute(client, ...args)
        }
    }

    private async _execute(client: Redis, ...args: any[]): Promise<boolean> {
        await this._loadScript(client)
        const prms = [...this._keys]
        const m = Math.max(this._keys.length, args.length)
        for (let i = 0; i < m; i++) {
            prms.push(
                this._keys[i] == null ? 'key' + (i + 1) : '' + this._keys[i],
            )
        }
        for (let i = 0; i < m; i++) {
            prms.push(args[i] == null ? '' : args[i])
        }
        return !!(await promisify.fromCallback((cb) =>
            client.evalsha(this._sha, m, ...prms, cb),
        ))
    }

    private async _loadScript(client: Redis): Promise<void> {
        const resp = await promisify.fromCallback((cb) =>
            client.script('LOAD', this._src, cb),
        )
        /* istanbul ignore next */
        if (!resp) {
            throw new Error('Unable to load redis script in to redis cache')
        }
        this._sha = resp
    }
}
