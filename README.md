# TSRPC Template

> 客户端需要自行根据 `src/shared/protocols/base.ts` 将数据进行存储

- [x] Session 支持多种作用域方式 (`public`,`private`,`user`)
- [x] Casbin 权限处理支持 `ACL` `RBAC` `ABAC` `RESTful` 等
- [x] Api 第三方调度，大小写忽略
- [x] Bullmq 队列, 通过修改 `/src/index.ts` 里的代码可以控制是否启用队列
- [x] Throttler 频率限制，可以基于 key 或者 ip 或 用户 进行限制
- [x] Prisma Tsrpc 支持，执行 `prisma generate` 自动生成 tsrpc 所需的类型定义
-
- [ ] Python 客户端
- [ ] Java 客户端
- [ ] Go 客户端

### Session

- [x] Cookie 类似 Cookie 的使用方式，会发送给客户端，客户端可以读取，但无法修改, 通过 `call.session.setPublic`
  或者 `call.session.setPublic` 设置
- [x] Session 不会发送给客户端，仅和当前客户端绑定, 通过 `call.session.setPrivate` 或者 `call.session.setPrivate` 设置
- [x] User 会发送给客户端，和登陆后用户绑定，同一个客户不同端可以互通, 通过 `call.session.setUser`
  或者 `call.session.setUser` 设置
- [ ] Device 用户设备管理，可以控制设备的登陆状态
