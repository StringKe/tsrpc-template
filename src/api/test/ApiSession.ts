import { ApiCall } from 'tsrpc'
import { ReqSession, ResSession } from '../../shared/protocols/test/PtlSession'

export default async function (call: ApiCall<ReqSession, ResSession>) {
    const count = (await call.session.get('count')) || 0
    await call.session.set('count', count + 1)
    return await call.succ({
        count: count,
        before: count + 1,
    })
}
