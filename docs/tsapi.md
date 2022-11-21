# TSRPC API 接口文档

## 通用说明

- 所有请求方法均为 `POST`
- 所有请求均需加入以下 Header :
    - `Content-Type: application/json`

## 目录

- test
    - [Session](#/test/Session)
    - [Throttler](#/test/Throttler)

---

## test

### Session <a id="/test/Session"></a>

**路径**

- POST `/test/Session`

**请求**

```ts
interface ReqSession {
    _token?: string
}
```

**响应**

```ts
interface ResSession {
    count: number,
    before: number,
    _token?: string,
    _timestamp?: number,
    _throttler?: {
        limit?: number,
        remaining?: number,
        reset?: number
    }
}
```

---

### Throttler <a id="/test/Throttler"></a>

**路径**

- POST `/test/Throttler`

**请求**

```ts
interface ReqThrottler {
    _token?: string
}
```

**响应**

```ts
interface ResThrottler {
    _token?: string,
    _timestamp?: number,
    _throttler?: {
        limit?: number,
        remaining?: number,
        reset?: number
    }
}
```

**配置**

```ts
{
    "throttler"
:
    {
        "ttl"
    :
        120,
            "limit"
    :
        10
    }
}
```

