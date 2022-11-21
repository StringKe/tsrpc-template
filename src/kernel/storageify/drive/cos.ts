import {
    AbstractStorageDrive,
    BasicResponse,
    ExistsResponse,
    FileListResponse,
} from '../abstract-storage'
import COS from 'cos-nodejs-sdk-v5'
import { Readable } from 'stream'

export declare type OmitObjectOptions<T extends COS.ObjectParams> = Omit<
    T,
    'Bucket' | 'Region' | 'Key'
>
type WithRequired<T, K extends keyof T> = T & { [P in K]-?: T[P] }

export interface CosOptions
    extends WithRequired<COS.COSOptions, 'SecretKey' | 'SecretId'> {
    Bucket: string
    Region: string
}

export class CosDrive extends AbstractStorageDrive {
    name = 'cos'
    options: CosOptions
    client: COS

    constructor(options: CosOptions) {
        super(options)
        this.options = options

        this.client = new COS(options)
    }

    copy(
        source: string,
        destination: string,
        options?: Omit<
            OmitObjectOptions<COS.PutObjectCopyParams>,
            'CopySource'
        >,
    ): Promise<void> {
        return new Promise((resolve, reject) => {
            this.client.putObjectCopy(
                {
                    Bucket: this.options.Bucket,
                    Region: this.options.Region,
                    Key: destination,
                    CopySource: `/${this.options.Bucket}/${source}`,
                    ...options,
                },
                (err, _data) => {
                    if (err) {
                        reject(err)
                    } else {
                        resolve()
                    }
                },
            )
        })
    }

    delete(filePath: string): Promise<void> {
        return new Promise((resolve, reject) => {
            this.client.deleteObject(
                {
                    Bucket: this.options.Bucket,
                    Region: this.options.Region,
                    Key: filePath,
                },
                (err, _data) => {
                    if (err) {
                        reject(err)
                    } else {
                        resolve()
                    }
                },
            )
        })
    }

    destroy(): void {
        // do nothing
    }

    exists(filePath: string): Promise<ExistsResponse> {
        return new Promise((resolve, reject) => {
            this.client.headObject(
                {
                    Bucket: this.options.Bucket,
                    Region: this.options.Region,
                    Key: filePath,
                },
                (err, data) => {
                    if (err) {
                        if (err.statusCode === 404) {
                            resolve({
                                exists: false,
                                raw: data,
                            })
                        } else {
                            reject(err)
                        }
                    } else {
                        resolve({
                            exists: true,
                            raw: data,
                        })
                    }
                },
            )
        })
    }

    get(filePath: string): Promise<Buffer> {
        return new Promise<Buffer>((resolve, reject) => {
            this.client.getObject(
                {
                    Bucket: this.options.Bucket,
                    Region: this.options.Region,
                    Key: filePath,
                },
                (err, data) => {
                    if (err) {
                        reject(err)
                    } else {
                        resolve(data.Body)
                    }
                },
            )
        })
    }

    getSignedUrl(
        filePath: string,
        options?: Omit<OmitObjectOptions<COS.GetObjectUrlParams>, 'Sign'>,
    ): Promise<string> {
        return new Promise<string>((resolve, reject) => {
            this.client.getObjectUrl(
                {
                    Bucket: this.options.Bucket,
                    Region: this.options.Region,
                    Key: filePath,
                    Sign: true,
                    Method: 'GET',
                    ...options,
                },
                (err, data) => {
                    if (err) {
                        reject(err)
                    } else {
                        resolve(data.Url)
                    }
                },
            )
        })
    }

    getStats(filePath: string): Promise<BasicResponse & COS.HeadObjectResult> {
        return new Promise<BasicResponse & COS.HeadObjectResult>(
            (resolve, reject) => {
                this.client.headObject(
                    {
                        Bucket: this.options.Bucket,
                        Region: this.options.Region,
                        Key: filePath,
                    },
                    (err, data) => {
                        if (err) {
                            reject(err)
                        } else {
                            resolve({
                                raw: data,
                                ...data,
                            })
                        }
                    },
                )
            },
        )
    }

    getStream(filePath: string): Promise<NodeJS.ReadableStream> {
        return new Promise<NodeJS.ReadableStream>((resolve, reject) => {
            this.client.getObject(
                {
                    Bucket: this.options.Bucket,
                    Region: this.options.Region,
                    Key: filePath,
                },
                (err, data) => {
                    if (err) {
                        reject(err)
                    } else {
                        resolve(Readable.from(data.Body))
                    }
                },
            )
        })
    }

    getUrl(filePath: string): Promise<string> {
        return this.getSignedUrl(filePath, { Method: 'GET' })
    }

    getVisibility(
        filePath: string,
    ): Promise<BasicResponse & COS.GetObjectAclResult> {
        return new Promise<BasicResponse & COS.GetObjectAclResult>(
            (resolve, reject) => {
                this.client
                    .getObjectAcl({
                        Bucket: this.options.Bucket,
                        Region: this.options.Region,
                        Key: filePath,
                    })
                    .then((data) => {
                        resolve({
                            raw: data,
                            ...data,
                        })
                    })
                    .catch((err) => {
                        reject(err)
                    })
            },
        )
    }

    init(_options: any): void {
        // do nothing
    }

    list(
        filePath: string,
    ): AsyncIterable<FileListResponse & COS.CosObject> | undefined {
        const client = new COS(this.options)
        const options = this.options
        return (async function* () {
            let Marker: string | undefined = undefined
            do {
                const { Contents, NextMarker } = await client.getBucket({
                    Bucket: options.Bucket,
                    Region: options.Region,
                    Prefix: filePath,
                    Marker,
                })
                for (const item of Contents) {
                    yield {
                        raw: item,
                        ...item,
                        path: item.Key,
                    }
                }
                Marker = NextMarker as string | undefined
            } while (Marker != undefined)
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
        options?: Omit<OmitObjectOptions<COS.PutObjectParams>, 'Body'>,
    ): Promise<void> {
        return new Promise((resolve, reject) => {
            this.client.putObject(
                {
                    Bucket: this.options.Bucket,
                    Region: this.options.Region,
                    Key: filePath,
                    Body: contents,
                    ...options,
                },
                (err, _data) => {
                    if (err) {
                        reject(err)
                    } else {
                        resolve()
                    }
                },
            )
        })
    }

    async putStream(
        filePath: string,
        contents: NodeJS.ReadableStream,
        options?: Omit<OmitObjectOptions<COS.PutObjectParams>, 'Body'>,
    ): Promise<void> {
        return this.put(
            filePath,
            await AbstractStorageDrive.StreamToBuffer(contents),
            options,
        )
    }

    setVisibility(
        filePath: string,
        visibility: OmitObjectOptions<COS.PutObjectAclParams>,
    ): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            this.client
                .putObjectAcl({
                    Bucket: this.options.Bucket,
                    Region: this.options.Region,
                    Key: filePath,
                    ...visibility,
                })
                .then(() => {
                    resolve()
                })
                .catch((err) => {
                    reject(err)
                })
        })
    }
}
