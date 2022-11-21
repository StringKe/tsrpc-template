import { z } from 'zod'
import { snakeCase } from 'lodash'
import type { ScreamingSnakeCase } from 'type-fest'

export function getWechatConfig<T extends string>(
    name: T,
): {
    [key in
        | `WECHAT_MP_${ScreamingSnakeCase<T>}_APP_ID`
        | `WECHAT_MP_${ScreamingSnakeCase<T>}_APP_SECRET`
        | `WECHAT_MP_${ScreamingSnakeCase<T>}_TOKEN`]: z.ZodString
} & {
    [key in `WECHAT_MP_${ScreamingSnakeCase<T>}_ENCRYPT_MESSAGE`]: z.ZodOptional<z.ZodBoolean>
} & {
    [key in `WECHAT_MP_${ScreamingSnakeCase<T>}_ENCODING_AES_KEY`]: z.ZodNullable<
        z.ZodOptional<z.ZodString>
    >
} {
    const nameCase = snakeCase(
        name,
    ).toUpperCase() as unknown as ScreamingSnakeCase<T>

    return {
        [`WECHAT_MP_${nameCase}_APP_ID`]: z.string(),
        [`WECHAT_MP_${nameCase}_APP_SECRET`]: z.string(),
        [`WECHAT_MP_${nameCase}_TOKEN`]: z.string(),
        [`WECHAT_MP_${nameCase}_ENCRYPT_MESSAGE`]: z.boolean().optional(),
        [`WECHAT_MP_${nameCase}_ENCODING_AES_KEY`]: z
            .string()
            .optional()
            .nullable(),
    } as never
}
