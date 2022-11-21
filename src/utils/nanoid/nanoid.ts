import { customAlphabet } from './customAlphabet'
import { random } from './random'

export const urlAlphabet =
    'ModuleSymbhasOwnPr-0123456789ABCDEFGHNRVfgctiUvz_KqYTJkLxpZXIjQW'

export const nanoid = (size = 21): string => {
    let id = ''
    const bytes: Uint8Array = random(size)
    while (size--) {
        id += urlAlphabet[bytes[size] & 63]
    }
    return id
}

const alphabet = '0123456789abcdefghijklmnopqrstuvwxyz'

/**
 * url 友好 id, 忽略大小写
 */
export const getUrlId = customAlphabet(alphabet, 8)

/**
 * 数据 id，足够的长度来避免重复
 */
export const getDataId = customAlphabet(alphabet, 16)
