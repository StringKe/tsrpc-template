import { customRandom } from './customRandom'
import { random } from './random'

export const customAlphabet = (alphabet: string, size: number) =>
    customRandom(random, alphabet, size)
