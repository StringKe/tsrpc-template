// eslint-disable-next-line @typescript-eslint/no-var-requires
const nodeCrypto = require('crypto')

function getRandomValues(buf: any) {
    if (nodeCrypto.randomBytes) {
        if (!(buf instanceof Uint8Array)) {
            throw new TypeError('expected Uint8Array')
        }
        if (buf.length > 65536) {
            const e = new Error()
            // @ts-ignore
            e['code'] = 22
            e.message =
                "Failed to execute 'getRandomValues' on 'Crypto': The " +
                "ArrayBufferView's byte length (" +
                buf.length +
                ') exceeds the ' +
                'number of bytes of entropy available via this API (65536).'
            e.name = 'QuotaExceededError'
            throw e
        }
        const bytes = nodeCrypto.randomBytes(buf.length)
        buf.set(bytes)
        return buf
    } else {
        throw new Error('No secure random number generator available.')
    }
}

export const random: RandomValueFunction = (bytes) => {
    return getRandomValues(new Uint8Array(bytes))
}

export type RandomValueFunction = (bytes: number) => Uint8Array
