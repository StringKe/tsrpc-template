import { HttpClient } from 'tsrpc'
import { serviceProto } from '../../../src/shared/protocols/serviceProto'
import assert from 'assert'

describe('ApiTestSession', function () {
    const client = new HttpClient(serviceProto, {
        server: 'http://127.0.0.1:3000',
        logger: console,
    })

    it('should session token reload', async function () {
        for (let i = 0; i < 3; i++) {
            const result = await client.callApi('test/Session', {})
            assert.strictEqual(result.isSucc, true)
            if (result.isSucc) {
                assert.strictEqual(result.res._token !== undefined, true)
            }
        }
    })

    it('should session saved value', async function () {
        let token: string | undefined = undefined
        for (let i = 0; i < 3; i++) {
            // @ts-ignore
            const result = await client.callApi('test/Session', {
                _token: token,
            })

            assert.strictEqual(result.isSucc, true)

            if (result.isSucc) {
                token = result.res._token as never
            }

            assert.strictEqual(result.res.count, i)
            assert.strictEqual(result.res.before, i + 1)
        }
    })
})
