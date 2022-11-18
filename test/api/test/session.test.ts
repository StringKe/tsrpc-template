import { HttpClient } from 'tsrpc'
import { serviceProto } from '../../../src/shared/protocols/serviceProto'
import assert from 'assert'

describe('ApiTestSession', function () {
    const client = new HttpClient(serviceProto, {
        server: 'http://127.0.0.1:3000',
        logger: console,
    })

    it('should session will not empty', async function () {
        const result = await client.callApi('test/Session', {
            type: null,
        })
        assert(result.isSucc, 'Should success')
        assert(result.res.count === -1, 'Should be -1')
        assert(result.res.before === -1, 'Should be -1')
    })

    it('should session public data', async function () {
        const result = await client.callApi('test/Session', {
            type: 'public',
        })
        assert(result.isSucc, 'Should success')
        assert(result.res.count === 0, 'Should be 0')
        assert(result.res.before === 1, 'Should be 1')
    })

    it('should session public data verify error', async function () {
        const result = await client.callApi('test/Session', {
            type: 'public',
        })
        assert(result.isSucc, 'Should success')
        assert(result.res.count === 0, 'Should be 0')
        assert(result.res.before === 1, 'Should be 1')

        const result2 = await client.callApi('test/Session', {
            type: 'public',
            _publicData: {
                ...result.res._publicData,
                _hash: 'word',
            },
        })
        assert(!result2.isSucc, 'Should fail')
        assert(
            result2.err.code === 'INVALID_SESSION',
            'Should be INVALID_SESSION',
        )
    })

    it('should session user data not found', async function () {
        const result = await client.callApi('test/Session', {
            type: 'user',
        })
        assert(!result.isSucc, 'Should fail')
        assert(result.err.code === 'USER_NOT_FOUND', 'Should be USER_NOT_FOUND')
    })

    it('should session user data must load userId', async function () {
        const UserId = Math.round(Math.random() * 1000000)
        const result = await client.callApi('test/Session', {
            type: 'user',
            userId: UserId,
        })
        assert(result.isSucc, 'Should success')
        assert(result.res.count === 0, 'Should be 0')
        assert(result.res.before === 1, 'Should be 1')
        assert(
            Number(result.res.userId) === UserId,
            `UserId Should be ${UserId}`,
        )
    })

    it('should session saved value', async function () {
        const types = ['public', 'private', 'user'] as const
        for (const type of types) {
            let publicData: any = undefined
            const UserId =
                type === 'user'
                    ? Math.round(Math.random() * 1000000)
                    : undefined
            for (let i = 0; i < 3; i++) {
                // @ts-ignore
                const result = await client.callApi('test/Session', {
                    _publicData: publicData,
                    type,
                    userId: UserId,
                })

                assert(result.isSucc, 'Should success')

                if (result.isSucc) {
                    publicData = result.res._publicData as never

                    assert(result.res.count === i, `Should be ${i} for ${type}`)
                    assert(
                        result.res.before === i + 1,
                        `Should be ${i + 1} for ${type}`,
                    )
                    if (type === 'user') {
                        assert(
                            Number(result.res.userId) === UserId,
                            `UserId Should be ${UserId}`,
                        )
                    }
                }
            }
        }
    })
})
