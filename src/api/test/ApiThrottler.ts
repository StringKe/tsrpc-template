import { ApiCall } from 'tsrpc'
import {
    ReqThrottler,
    ResThrottler,
} from '../../shared/protocols/test/PtlThrottler'

export default async function (call: ApiCall<ReqThrottler, ResThrottler>) {
    return call.succ({})
}
