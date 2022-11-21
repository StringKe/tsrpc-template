import { z, ZodFormattedError } from 'zod'
import { getWechatConfig } from './wechat'
import doenv from 'dotenv'
import { preloadEnv } from './preload'
import { getCosConfig, getLocalConfig } from './storageify'

const envs = preloadEnv(doenv.config({}).parsed)

// 定义环境变量的检测
export const serverSchema = z.object({
    DATABASE_URL: z.string().url(),
    NODE_ENV: z.enum(['development', 'test', 'production']),
    ...getWechatConfig('test'),
    ...getCosConfig('test1'),
    ...getLocalConfig('test2'),
})

const _serverEnv = serverSchema.safeParse(envs)

export const formatErrors = (
    errors: ZodFormattedError<Map<string, string>, string>,
) =>
    Object.entries(errors)
        .map(([name, value]) => {
            if (value && '_errors' in value) {
                return `${name}: ${value._errors.join(', ')}\n`
            }
        })
        .filter(Boolean)

if (!_serverEnv.success) {
    console.error(
        '❌ 无效的环境变量:\n',
        ...formatErrors(_serverEnv.error.format()),
    )
    throw new Error('有环境变量无法通过验证，请检查 .env 文件或环境变量')
}

// 导出检测后的环境变量
export const env = _serverEnv.data
export default env
