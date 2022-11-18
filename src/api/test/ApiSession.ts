import { ApiCall } from 'tsrpc'
import { ReqSession, ResSession } from '../../shared/protocols/test/PtlSession'

export default async function (call: ApiCall<ReqSession, ResSession>) {
    call.logger.log('Session Request')
    console.log(call.req)
    if (call.req.userId) {
        await call.session.bindUser(call.req.userId)
    }

    if (call.req.type === 'public') {
        const count = (await call.session.getPublic('count')) || 0
        await call.session.setPublic('count', count + 1)

        return await call.succ({
            count: count,
            before: count + 1,
        })
    }

    if (call.req.type === 'private') {
        const count = (await call.session.getPrivate('count')) || 0
        await call.session.setPrivate('count', count + 1)

        return await call.succ({
            count: count,
            before: count + 1,
        })
    }

    if (call.req.type === 'user') {
        const count = (await call.session.getUser('count')) || 0
        await call.session.setUser('count', count + 1)

        return await call.succ({
            count: count,
            before: count + 1,
            userId: call.session.userId,
        })
    }

    return await call.succ({
        count: -1,
        before: -1,
    })
}
