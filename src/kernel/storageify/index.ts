import {
    AbstractStorageDrive,
    BasicResponse,
    ExistsResponse,
    FileListResponse,
    StorageDriver,
} from './abstract-storage'
import { CosDrive, LocalDrive, OssDrive } from './drive'

export declare type StorageDriveClass = new (
    ...args: any[]
) => AbstractStorageDrive

export class Storageify implements StorageDriver {
    static drives: Map<string, StorageDriveClass> = new Map()
    instances: Map<string, AbstractStorageDrive> = new Map()

    static addDrive(drive: StorageDriveClass) {
        // @ts-ignore
        const diveName = drive['driveName']
        this.drives.set(diveName, drive)
    }

    static removeDrive(drive: StorageDriveClass | string) {
        this.drives.delete(typeof drive === 'string' ? drive : drive.name)
    }

    static getDrive(drive: string): StorageDriveClass {
        const driveClass = this.drives.get(drive)
        if (!driveClass) {
            throw new Error(`No such drive: ${drive}`)
        }
        return driveClass
    }

    createInstance<T extends AbstractStorageDrive>(
        name: string,
        drive: string,
        options: T['options'],
    ) {
        const instanceName = name || 'default'
        if (this.instances.has(instanceName)) {
            throw new Error(`Instance ${instanceName} already exists`)
        }

        const driveClass = Storageify.getDrive(drive)
        const instance = new driveClass(options)
        instance.init(options)

        this.instances.set(instanceName, instance)
    }

    getInstance<T extends AbstractStorageDrive>(name = 'default'): T {
        const instance = this.instances.get(name)
        if (!instance) {
            throw new Error(`No such instance: ${name}`)
        }
        return instance as T
    }

    async removeInstance(name = 'default') {
        const instance = this.instances.get(name)
        if (!instance) {
            throw new Error(`No such instance: ${name}`)
        }
        await instance.destroy()
    }

    copy(source: string, destination: string, options?: any): Promise<void> {
        return this.getInstance().copy(source, destination, options)
    }

    delete(filePath: string): Promise<void> {
        return this.getInstance().delete(filePath)
    }

    exists(filePath: string): Promise<ExistsResponse> {
        return this.getInstance().exists(filePath)
    }

    get(filePath: string): Promise<Buffer> {
        return this.getInstance().get(filePath)
    }

    getSignedUrl(filePath: string, options?: any): Promise<string> {
        return this.getInstance().getSignedUrl(filePath, options)
    }

    getStats(filePath: string): Promise<BasicResponse> {
        return this.getInstance().getStats(filePath)
    }

    getStream(filePath: string): Promise<NodeJS.ReadableStream> {
        return this.getInstance().getStream(filePath)
    }

    getUrl(filePath: string): Promise<string> {
        return this.getInstance().getUrl(filePath)
    }

    getVisibility(filePath: string): Promise<BasicResponse> {
        return this.getInstance().getVisibility(filePath)
    }

    list(filePath: string): AsyncIterable<FileListResponse> | undefined {
        return this.getInstance().list?.(filePath)
    }

    move(source: string, destination: string, options?: any): Promise<void> {
        return this.getInstance().move(source, destination, options)
    }

    put(
        filePath: string,
        contents: Buffer | string,
        options?: any,
    ): Promise<void> {
        return this.getInstance().put(filePath, contents, options)
    }

    putStream(
        filePath: string,
        contents: NodeJS.ReadableStream,
        options?: any,
    ): Promise<void> {
        return this.getInstance().putStream(filePath, contents, options)
    }

    setVisibility(filePath: string, visibility: any): Promise<void> {
        return this.getInstance().setVisibility(filePath, visibility)
    }
}

Storageify.addDrive(LocalDrive)
Storageify.addDrive(CosDrive)
Storageify.addDrive(OssDrive)

export const storageify = new Storageify()
export default storageify

export * from './drive'
export * from './abstract-storage'
