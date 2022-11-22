import {
    AbstractStorageDrive,
    BasicResponse,
    ExistsResponse,
    FileListResponse,
} from '../abstract-storage'
import OSS from 'ali-oss'
import { Readable } from 'stream'
import { PartialDeep } from 'type-fest'

export class OssDrive extends AbstractStorageDrive {
    static driveName = 'oss'
    options: OSS.Options
    client: OSS
    stsClient: OSS.STS

    constructor(options: OSS.Options) {
        super(options)
        this.options = options

        this.client = new OSS(options)
        this.stsClient = new OSS.STS(options)
    }

    copy(
        source: string,
        destination: string,
        options?: OSS.CopyObjectOptions,
    ): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            this.client
                .copy(source, destination, options)
                .then(() => {
                    resolve()
                })
                .catch((err) => {
                    reject(err)
                })
        })
    }

    delete(filePath: string): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            this.client
                .delete(filePath)
                .then(() => {
                    resolve()
                })
                .catch((err) => {
                    reject(err)
                })
        })
    }

    destroy(): void {
        // do nothing
    }

    exists(filePath: string): Promise<ExistsResponse> {
        return new Promise((resolve, reject) => {
            this.client
                .head(filePath)
                .then((data) => {
                    resolve({ exists: true, raw: data })
                })
                .catch((err) => {
                    if (err.code === 'NoSuchKey') {
                        resolve({ exists: false, raw: err })
                    } else {
                        reject(err)
                    }
                })
        })
    }

    get(filePath: string): Promise<Buffer> {
        return new Promise<Buffer>((resolve, reject) => {
            this.client
                .get(filePath)
                .then((data) => {
                    resolve(data.content)
                })
                .catch((err) => {
                    reject(err)
                })
        })
    }

    getSignedUrl(
        filePath: string,
        options?: OSS.SignatureUrlOptions,
    ): Promise<string> {
        return Promise.resolve(this.client.signatureUrl(filePath, options))
    }

    getStats(filePath: string): Promise<BasicResponse & OSS.GetObjectResult> {
        return new Promise<BasicResponse & OSS.GetObjectResult>(
            (resolve, reject) => {
                this.client
                    .get(filePath)
                    .then((data) => {
                        resolve({ raw: data, ...data })
                    })
                    .catch((err) => {
                        reject(err)
                    })
            },
        )
    }

    getStream(filePath: string): Promise<NodeJS.ReadableStream> {
        return new Promise((resolve, reject) => {
            this.get(filePath)
                .then((data) => {
                    resolve(Readable.from(data))
                })
                .catch(reject)
        })
    }

    getUrl(filePath: string): Promise<string> {
        return Promise.resolve(this.client.getObjectUrl(filePath))
    }

    getVisibility(filePath: string): Promise<BasicResponse & OSS.GetACLResult> {
        return new Promise((resolve, reject) => {
            this.client
                .getACL(filePath)
                .then((data) => {
                    resolve({ raw: data, ...data })
                })
                .catch((err) => {
                    reject(err)
                })
        })
    }

    init(_options: any): void {
        // do nothing
    }

    list(
        filePath: string,
    ):
        | AsyncIterable<
              FileListResponse &
                  PartialDeep<OSS.ObjectMeta> & { isDir: boolean }
          >
        | undefined {
        const client = this.client
        const prefix = filePath
        return (async function* () {
            let nextMarker = ''
            let isTruncated = true
            while (isTruncated) {
                const result = await client.list(
                    {
                        prefix,
                        marker: nextMarker,
                        'max-keys': 1000,
                    },
                    {},
                )
                nextMarker = result.nextMarker
                isTruncated = result.isTruncated
                for (const file of result.objects) {
                    yield {
                        path: file.name,
                        raw: file,
                        ...file,
                        isDir: false,
                    }
                }
                for (const dir of result.prefixes) {
                    yield {
                        path: dir,
                        raw: dir,
                        isDir: true,
                    }
                }
            }
        })()
    }

    move(source: string, destination: string, options?: any): Promise<void> {
        return this.copy(source, destination, options).then(() =>
            this.delete(source),
        )
    }

    put(
        filePath: string,
        contents: Buffer | string,
        options?: any,
    ): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            this.client
                .put(filePath, contents, options)
                .then(() => {
                    resolve()
                })
                .catch((err) => {
                    reject(err)
                })
        })
    }

    async putStream(
        filePath: string,
        contents: NodeJS.ReadableStream,
        options?: any,
    ): Promise<void> {
        return this.put(
            filePath,
            await AbstractStorageDrive.StreamToBuffer(contents),
            options,
        )
    }

    setVisibility(filePath: string, visibility: OSS.ACLType): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            this.client
                .putACL(filePath, visibility)
                .then(() => {
                    resolve()
                })
                .catch((err) => {
                    reject(err)
                })
        })
    }

    sts(
        roleArn: string,
        policy?: object | string,
        expirationSeconds?: number,
        session?: string,
        options?: {
            timeout: number
            ctx: any
        },
    ) {
        return new Promise<OSS.Credentials>((resolve, reject) => {
            this.stsClient
                .assumeRole(
                    roleArn,
                    policy,
                    expirationSeconds,
                    session,
                    options,
                )
                .then((data) => {
                    resolve(data.credentials)
                })
                .catch(reject)
        })
    }
}
