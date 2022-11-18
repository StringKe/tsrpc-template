import { HttpConnection, HttpServer } from 'tsrpc'

export async function withCasbin(server: HttpServer) {
    server.flows.preRecvDataFlow.push(async (node) => {
        const conn = node.conn as HttpConnection
        const url = conn.httpReq.url

        const apiService = server.proto.services.find(
            (v) =>
                v.type === 'api' && v.name.toLowerCase() === url?.toLowerCase(),
        )
        if (apiService) {
            node.serviceId = apiService.id
            return node
        }
        ;(node.conn as HttpConnection).httpRes.end('Invalid URL')
        return undefined
    })
}
