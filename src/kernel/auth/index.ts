import { OAuthProvider } from './abstract-provider'
import { QQProvider } from './providers'

export * from './abstract-provider'
export * from './providers'

export declare type OAuthProviderClass = new (...args: any[]) => OAuthProvider

export class AuthManager {
    static drives: Map<string, OAuthProviderClass> = new Map()
    instances: Map<string, OAuthProvider> = new Map()

    static addDrive(drive: OAuthProviderClass) {
        this.drives.set(drive.name, drive)
    }

    static removeDrive(drive: OAuthProviderClass | string) {
        this.drives.delete(typeof drive === 'string' ? drive : drive.name)
    }

    static getDrive(drive: string): OAuthProviderClass {
        const driveClass = this.drives.get(drive)
        if (!driveClass) {
            throw new Error(`No such drive: ${drive}`)
        }
        return driveClass
    }

    init<T extends OAuthProvider>(
        driver: string,
        name: string,
        options: T['options'],
    ) {
        const driveClass = AuthManager.getDrive(driver)
        const instance = new driveClass({
            name,
            options,
        })
        this.instances.set(name, instance)
        return instance
    }

    getInstance<T extends OAuthProvider>(name: string): T {
        const instance = this.instances.get(name)
        if (!instance) {
            throw new Error(`No such instance: ${name}`)
        }
        return instance as T
    }

    removeInstance(name: string) {
        const instance = this.instances.get(name)
        if (!instance) {
            throw new Error(`No such instance: ${name}`)
        }
        this.instances.delete(name)
    }
}

AuthManager.addDrive(QQProvider)

export const authManager = new AuthManager()
export default authManager
