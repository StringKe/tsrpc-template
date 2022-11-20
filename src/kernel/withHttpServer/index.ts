import { HttpConnection, HttpServer, WsServer } from 'tsrpc'
import { TrdApiKeys, TrdApis } from '../../api/trd'
import * as Url from 'url'
import contentType from 'content-type'
import { get } from 'lodash'
import * as multipart from 'parse-multipart-data'

const faviconData = Buffer.from(
    'iVBORw0KGgoAAAANSUhEUgAAAGQAAABkCAMAAABHPGVmAAAAnFBMVEUAAACNGP+OGP+QE/6QE/6QE/+QE/6QE/6QE/+QE/+OEP6QE/6QE/+QE/6QE/+PEv6QE/6QE/+NFf+QE/6PE/6PE/6QE/+PEv6QE/6QE/6RFf+QE/6QE/+QE/6QEv+RE/6RE/+PE/6PEv+OEvyPFv+PE/6QE/6QEv+QE/+QE/+QE/6QE/6QE/6QFP2PE/+QEv6QE/+YFP+TE/+VFP9J4z+dAAAAMHRSTlMAEwelooVhlGnqIYAm97gs88MW2HFO5NK1WAvu3cZ8d1xAOBs7NKlTSa2d+8uPvolR0VdZAAAETUlEQVRo3u1a6XKjMAw2V0JK7vskR5umSdquj/d/t7XAi41TsKeFmWYn348MNsafELYkS0EPPPBbMAy9btcLh6g+PA0ITkAGT6gmNAjOQBqoFvxhWAELUA1YJBydy3Z76SQsJ1Q9EiVF6XVEoFU9RxOEX+Req1k5CajIk02PN/tVc7S56ORZtp+5wli7YpI3qknex5i+VUyy4yQbtWPASXYVkyw4yVrtmHKSqhfxEb6J2gHf5IgqBqzZUDZDWNGoanT5rDSzvg7lzW7lJG0CO+NJmGPYNaQGS+wlBsuf9HoTj8G19wO3FKwZIfgzRDpGGEAZoxgwQjrCASaEjQKjS/Mzn9G58RjvFGeg7zfeppP5Gr+UwmmpHuNmbEQzjghpeKVYouUUc7ipMIyQ9InzzYDtDPpnWxdpOKfchLBUDW4hSTIDDY6OM5kzuBwjHUvC1bFEOsYUhJtPHOcY0ESOMvuER0KGPQbcCOQAyY0yXAoi7UVjhEvsWgu0mbVe4F0CO5IA3uOQm2haEPAQORLgwVA7kikfepHNg3Q+OkL+ziul3YOhrg3JEsTrIYkV11f4JUmk72J49NmG5Ek30a98qqgwVPC1+IS9GEnE57vmtjR/9KPwTeZqx1fzOYWdasecTxV/STKhXJOaW2d2H55oDh9mmsimNhSP8wZxYEcyyG+/MZZLRscG7mWLpAni7OxIdjC2mS1LoomnbRSOhmLwWshEItcspq/CHLNSjxZQGLtqjiOggLVvJpF7CmiicXOVTBKUOHKKFbAJsiVBJ4YV0FL33yTKyBdkT4JeFPnIhyG+WjPhGbwlsiYBLD3hhdj6aA5LYn8z9xsuQiYSHW7Dn2/8uI3sYU+i40Hy/5E0OiLuqw+9ERX7dNRD9WB5VtMe5yWqARHDANbtiouocopTP9XT9IDQoZVqbXWq9gQ0E0Y2zA5zADar7iTvivMEa8q+i9CZ735P6tgf5AzkVoi9ycVgzxvxctucgRzYGMiDbur36QegrbebJMW/O3sEcKxNfZPlndZQkfcWWyrecciFUZ0W6NXW/S6EoyRegeZdj4hZG9bu908aSHyMYy/VRPrErF227sSg5MeLxx8ykLAMiQD9hSHr0v8n/lnYNyxDInNwZ5vPDEBVlsGdHqZOIbpbWlk1ebQyhaknLeCeUOscDdECbCratkcHa0+mZ3vi7x2CJCwPQfbHOSPMxznzwdQA48HUfMReIytM80rYFx+x0dSYLJAwJwvK0h5rLe1hBReraY81NHaGBM5BT+CYIRM4h3T/z36QiorfKb/5HptTUd9PqsEMBaGKz7SkWt3pwYs50TlihFwLE538JitKdH5eDYlO25Tt3nH2vpqyrS/53AettCsn+QThh5lSlTT6nRUESkobd1akKSk33VnhrP4SIKBfWsy8p7JsWmAOhCeso8AsS+VXKJVf9VL5fRX9jX9fuKM/Yqh/KXnggV+CvzLSIHrncBfgAAAAAElFTkSuQmCC',
    'base64',
)

const parseTypes = {
    json: [
        'application/json',
        'application/json-patch+json',
        'application/vnd.api+json',
        'application/csp-report',
    ],
    form: ['application/x-www-form-urlencoded'],
    multipart: ['multipart/form-data'],
    text: ['text/plain', 'text/xml', 'application/xml'],
}

function parseBody(
    buffer: Buffer,
    charset: BufferEncoding,
    contentType: string,
) {
    if (!buffer || buffer.byteLength === 0) {
        return
    }

    const type = (Object.keys(parseTypes) as (keyof typeof parseTypes)[]).find(
        (type) => parseTypes[type].some((type) => contentType.startsWith(type)),
    )

    if (type === 'json') {
        return JSON.parse(buffer.toString(charset))
    } else if (type === 'form') {
        const data = new URLSearchParams(buffer.toString(charset))
        const result: Record<string, string> = {}
        for (const [key, value] of data) {
            result[key] = value
        }
        return result
    } else if (type === 'multipart') {
        const boundary = contentType.split('boundary=')[1]
        if (!boundary) {
            throw new Error('Invalid boundary')
        }
        const multipartData = multipart.parse(buffer, boundary)
        const result: Record<string, any> = {}
        for (const { name, data, type, filename } of multipartData) {
            if (name) {
                if (type) {
                    if (type === 'application/octet-stream') {
                        result[name] = {
                            data,
                            filename,
                        }
                        continue
                    }
                }
                try {
                    result[name] = JSON.parse(data.toString())
                } catch (e) {
                    result[name] = data
                }
            }
        }
        return result
    } else if (type === 'text') {
        return buffer.toString(charset)
    }

    return buffer
}

export function withHttpServer(server: HttpServer | WsServer) {
    const isHttpServer = server instanceof HttpServer
    if (!isHttpServer) {
        return
    }

    server.flows.preRecvDataFlow.push(async (node) => {
        const serviceId = node.serviceId
        if (!serviceId) {
            const conn = node.conn as HttpConnection

            if (Object.keys(TrdApis).length) {
                const urlParse = Url.parse(conn.httpReq.url || '', true)
                let urlPath = urlParse.pathname || ''
                urlPath = urlPath.replaceAll('//', '/').toLowerCase()

                if (urlPath == 'favicon.ico') {
                    // png
                    conn.httpRes.writeHead(200, {
                        'Content-Type': 'image/png',
                    })
                    conn.httpRes.end(faviconData, 'binary')
                    return
                }

                if (urlPath.length !== 0) {
                    const handleKey = TrdApiKeys.reduce<
                        keyof typeof TrdApis | undefined
                    >(
                        (
                            previousValue,
                            [currentValue, handleKey],
                            currentIndex,
                            array,
                        ) => {
                            if (urlPath === currentValue) {
                                previousValue = handleKey
                                array.splice(1)
                            }
                            return previousValue
                        },
                        undefined,
                    )

                    const handle = handleKey ? TrdApis[handleKey] : undefined
                    if (handle) {
                        conn.httpReq.query = urlParse.query
                        conn.httpReq.rawQuery = urlParse.search

                        const contentTypeStr = get(
                            conn.httpReq.headers,
                            'content-type',
                        )

                        const charset = contentTypeStr
                            ? (contentType.parse(conn.httpReq).parameters
                                  .charset as BufferEncoding)
                            : 'utf-8'

                        conn.httpReq.body = parseBody(
                            conn.httpReq.rawBody,
                            charset,
                            conn.httpReq.headers['content-type'] || '',
                        )

                        conn.httpRes.json = (data: any) => {
                            conn.httpRes.writeHead(200, {
                                'Content-Type': 'application/json',
                            })
                            conn.httpRes.end(JSON.stringify(data))
                        }
                        conn.httpRes.xml = (data: any) => {
                            conn.httpRes.writeHead(200, {
                                'Content-Type': 'text/xml',
                            })
                            conn.httpRes.end(data)
                        }
                        conn.httpRes.text = (data: any) => {
                            conn.httpRes.writeHead(200, {
                                'Content-Type': 'text/plain',
                            })
                            conn.httpRes.end(data)
                        }
                        conn.httpRes.html = (data: any) => {
                            conn.httpRes.writeHead(200, {
                                'Content-Type': 'text/html',
                            })
                            conn.httpRes.end(data)
                        }
                        conn.httpRes.file = (data: Buffer, filename) => {
                            conn.httpRes.writeHead(200, {
                                'Content-Type': 'application/octet-stream',
                                'Content-Disposition': `attachment; filename=${filename}`,
                            })
                            conn.httpRes.end(data)
                        }
                        conn.httpRes.redirect = (url: string) => {
                            conn.httpRes.writeHead(302, {
                                Location: url,
                            })
                            conn.httpRes.end()
                        }
                        conn.httpRes.redirectBack = () => {
                            conn.httpRes.writeHead(302, {
                                Location: conn.httpReq.headers.referer || '/',
                            })
                            conn.httpRes.end()
                        }
                        conn.httpRes.send = (data: any, code = 200) => {
                            conn.httpRes.statusCode = code
                            conn.httpRes.end(data)
                        }

                        server.logger.log(`custom http request: ${urlPath}`)

                        await handle(conn.httpReq, conn.httpRes)
                        return null
                    }
                }
            }
            conn.httpRes.statusCode = 404
            conn.httpRes.end()
            return null
        }

        return node
    })
}
