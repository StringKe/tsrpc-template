import {
    AbstractStorageDrive,
    BasicResponse,
    ExistsResponse,
    FileListResponse,
} from '../abstract-storage'
import * as path from 'path'
import fs from 'fs-extra'
import { Stats } from 'fs'
import { Readable } from 'stream'

export interface LocalOptions {
    /** 请使用绝对路径 **/
    basePath: string
    /** 外部访问方式 **/
    url?: string
}

export class LocalDrive extends AbstractStorageDrive {
    name = 'local'
    options: LocalOptions

    constructor(options: LocalOptions) {
        super(options)
        this.options = options
    }

    init(_options: LocalOptions): void {
        // do nothing
    }

    destroy(): void {
        // do nothing
    }

    getPath(filePath: string) {
        return path.join(this.options.basePath, filePath)
    }

    copy(
        source: string,
        destination: string,
        options?: fs.CopyOptions,
    ): Promise<void> {
        return fs.copy(this.getPath(source), this.getPath(destination), options)
    }

    delete(filePath: string): Promise<void> {
        return fs.unlink(this.getPath(filePath))
    }

    exists(filePath: string): Promise<ExistsResponse> {
        return new Promise((resolve, reject) => {
            fs.access(this.getPath(filePath), (err) => {
                if (err) {
                    reject(err)
                } else {
                    resolve({ exists: true, raw: null })
                }
            })
        })
    }

    get(filePath: string): Promise<Buffer> {
        return fs.readFile(this.getPath(filePath))
    }

    getSignedUrl(filePath: string, _options?: any): Promise<string> {
        if (this.options.url) {
            return Promise.resolve(`${this.options.url}/${filePath}`)
        }
        throw new Error('未配置外部访问地址')
    }

    getStats(filePath: string): Promise<BasicResponse & Stats> {
        return new Promise((resolve, reject) => {
            fs.stat(this.getPath(filePath), (err, stats) => {
                if (err) {
                    reject(err)
                } else {
                    resolve({ raw: stats, ...stats })
                }
            })
        })
    }

    async getStream(filePath: string): Promise<NodeJS.ReadableStream> {
        return Readable.from(await this.get(filePath))
    }

    getUrl(filePath: string): Promise<string> {
        return this.getSignedUrl(filePath)
    }

    getVisibility(_filePath: string): Promise<BasicResponse> {
        return Promise.resolve({ raw: null })
    }

    list(filePath: string): AsyncIterable<FileListResponse> | undefined {
        const getPath = (filePath: string) => this.getPath(filePath)
        return (async function* () {
            for await (const file of fs.readdirSync(getPath(filePath))) {
                yield { path: file, raw: getPath(file) }
            }
        })()
    }

    move(
        source: string,
        destination: string,
        options?: fs.MoveOptions,
    ): Promise<void> {
        return fs.move(this.getPath(source), this.getPath(destination), options)
    }

    put(
        filePath: string,
        contents: Buffer | string,
        _options?: any,
    ): Promise<void> {
        return new Promise((resolve, reject) => {
            fs.writeFile(this.getPath(filePath), contents, (err) => {
                if (err) {
                    reject(err)
                } else {
                    resolve()
                }
            })
        })
    }

    async putStream(
        filePath: string,
        contents: NodeJS.ReadableStream,
        _options?: BufferEncoding,
    ): Promise<void> {
        return this.put(
            filePath,
            await AbstractStorageDrive.StreamToBuffer(contents),
            _options,
        )
    }

    setVisibility(_filePath: string, _visibility: any): Promise<void> {
        return Promise.resolve(undefined)
    }
}
