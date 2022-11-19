import { ApiHandleMap } from '../../kernel/withHttpServer/types'

export const TrdApis: ApiHandleMap = {
    '/test': (req, res) => {
        console.log(req.query, req.rawQuery, req.body, req.rawBody)
        res.end('Hello World')
    },
}

export const TrdApiKeys = Object.keys(TrdApis)
    .map((item) => {
        return [item.replaceAll('//', '/').toLowerCase(), item] as [
            string,
            keyof typeof TrdApis,
        ]
    })
    .filter((item) => item[0].length)
