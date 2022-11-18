import { HttpClient } from 'tsrpc'
import { serviceProto } from '../../../src/shared/protocols/serviceProto'
import assert from 'assert'

describe('ApiTestThrottler', function () {
    const client = new HttpClient(serviceProto, {
        server: 'http://127.0.0.1:3000',
        logger: console,
    })

    it('should 10 request must success', async function () {
        for (let i = 0; i < 10; i++) {
            const result = await client.callApi('test/Throttler', {})
            assert.strictEqual(result.isSucc, true)
        }
    })

    it('should 10 request must failed', async function () {
        for (let i = 0; i < 5; i++) {
            const result = await client.callApi('test/Throttler', {})
            assert.strictEqual(result.isSucc, false)
        }
    })
})
