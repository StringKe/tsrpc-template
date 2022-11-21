# TSRPC Template

> 客户端需要自行根据 `src/shared/protocols/base.ts` 将数据进行进行本地存储或使用
> 由于环境不同这里不提供具体实现代码

功能附加

- [x] 自定义请求封装，通过 `src/trd/index.ts` 可以自定义请求，同时会解析 `url` 参数和 `body` 序列化
- [x] Session 支持多种作用域方式 (`public`,`private`,`user`)
- [x] Throttler 频率限制，可以基于 key 或者 ip 或 用户 进行限制
- [x] 覆盖 tsrpc 日志，来自 `@midwayjs/logger` 支持日志审计，日志文件切割，日志级别控制

其他特性

- [x] Api 第三方调度，大小写忽略，api 文档中可忽略大小写
- [x] Prisma 类型支持，执行 `prisma generate` 自动生成 tsrpc 所需的类型定义
- [x] env 环境变量加载以及解析，同时支持类型定义和校验，代码中使用请导入 `import { env } from '/src/env'` 使用

第三方封装

- [x] tnwx 微信封装支持，已配置 redis 缓存，回调接口已封装，仅需在 `kernal/wechat` 中实现自己的 `adapter` 即可
- [x] Casbin 权限处理支持 `ACL` `RBAC` `ABAC` `RESTful` 等
- [x] Bullmq 队列, 通过修改 `/src/index.ts` 里的代码可以控制是否启用队列
- [x] COS,OSS,LOCAL 存储封装, 通过修改 `/src/env/index.ts` 里的代码可以检测环境变量，需要自行在 `/src/index.ts` 中初始化内容
- [x] nanoid 生成随机字符串，导入 `/src/utils/naonid` 使用

### 项目结构

- `/src/index.ts` 项目入口，初始化 `app` 和 `server`，并启动服务
- `/src/kernel` 大多数代码封装在此处
- `/src/env` 环境变量加载，同时支持类型定义和校验
- `/src/queue` 队列任务
- `/src/api/custom` 自定义 api 请求

### Session

- [x] Cookie 类似 Cookie 的使用方式，会发送给客户端，客户端可以读取，但无法修改, 通过 `call.session.setPublic`
  或者 `call.session.setPublic` 设置
- [x] Session 不会发送给客户端，仅和当前客户端绑定, 通过 `call.session.setPrivate` 或者 `call.session.setPrivate` 设置
- [x] User 会发送给客户端，和登陆后用户绑定，同一个客户不同端可以互通, 通过 `call.session.setUser`
  或者 `call.session.setUser` 设置
- [x] Device 用户设备管理，可以控制设备的登陆状态

### 自定义请求

```typescript
import {ApiHandleMap} from './types'

export const TrdApis: ApiHandleMap = {
    '/test': (req, res) => {
        // 以扩展的参数解析，可以直接获取
        console.log(req.query, req.rawQuery, req.body, req.rawBody)
        // 一定需要通过 res.end() 结束请求，否则不会返回任何内容
        res.end('Hello World')
    },
}
```

如果需要实现约定式路由，可以修改 `src/kernel/withHttpServer/index.ts` 里的代码
