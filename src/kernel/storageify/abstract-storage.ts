export interface HandleResponse {
    raw: any
}

export interface ExistsResponse extends HandleResponse {
    exists: boolean
}

export interface BasicResponse extends HandleResponse {
    [key: string]: any
}

export interface FileListResponse extends HandleResponse {
    path: string
}

export interface StorageDriver {
    exists(filePath: string): Promise<ExistsResponse>

    get(filePath: string): Promise<Buffer>

    getStream(filePath: string): Promise<NodeJS.ReadableStream>

    getVisibility(filePath: string): Promise<BasicResponse>

    getStats(filePath: string): Promise<BasicResponse>

    getSignedUrl(filePath: string, options?: any): Promise<string>

    getUrl(filePath: string): Promise<string>

    put(
        filePath: string,
        contents: Buffer | string,
        options?: any,
    ): Promise<void>

    putStream(
        filePath: string,
        contents: NodeJS.ReadableStream,
        options?: any,
    ): Promise<void>

    setVisibility(filePath: string, visibility: any): Promise<void>

    delete(filePath: string): Promise<void>

    copy(source: string, destination: string, options?: any): Promise<void>

    move(source: string, destination: string, options?: any): Promise<void>

    list?(filePath: string): AsyncIterable<FileListResponse> | undefined
}

export abstract class AbstractStorageDrive implements StorageDriver {
    name: string

    static StreamToBuffer(stream: NodeJS.ReadableStream): Promise<Buffer> {
        return new Promise((resolve, reject) => {
            const chunks: any[] = []
            stream.on('data', (chunk) => chunks.push(chunk))
            stream.on('end', () => resolve(Buffer.concat(chunks)))
            stream.on('error', reject)
        })
    }

    abstract init(options: any): void

    abstract destroy(): void

    abstract exists(filePath: string): Promise<ExistsResponse>

    abstract get(filePath: string): Promise<Buffer>

    abstract getStream(filePath: string): Promise<NodeJS.ReadableStream>

    abstract getVisibility(filePath: string): Promise<BasicResponse>

    abstract getStats(filePath: string): Promise<BasicResponse>

    abstract getSignedUrl(filePath: string, options?: any): Promise<string>

    abstract getUrl(filePath: string): Promise<string>

    abstract put(
        filePath: string,
        contents: Buffer | string,
        options?: any,
    ): Promise<void>

    abstract putStream(
        filePath: string,
        contents: NodeJS.ReadableStream,
        options?: any,
    ): Promise<void>

    abstract setVisibility(filePath: string, visibility: any): Promise<void>

    abstract delete(filePath: string): Promise<void>

    abstract copy(
        source: string,
        destination: string,
        options?: any,
    ): Promise<void>

    abstract move(
        source: string,
        destination: string,
        options?: any,
    ): Promise<void>

    abstract list?(
        filePath: string,
    ): AsyncIterable<FileListResponse> | undefined
}
