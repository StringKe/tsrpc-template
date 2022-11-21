import { ApiCall } from "tsrpc";
import { ReqSocial, ResSocial } from "../../shared/protocols/auth/PtlSocial";

export default async function (call: ApiCall<ReqSocial, ResSocial>) {
    // TODO
    call.error('API Not Implemented');
}