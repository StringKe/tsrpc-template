import { z } from 'zod'
import { snakeCase } from 'lodash'
import type { ScreamingSnakeCase } from 'type-fest'

export function getLocalConfig<T extends string>(
    name: T,
): {
    [key in
        | `STORAGE_LOCAL_${ScreamingSnakeCase<T>}_PATH`
        | `STORAGE_LOCAL_${ScreamingSnakeCase<T>}_URL`]: z.ZodNullable<
        z.ZodOptional<z.ZodString>
    >
} {
    const nameCase = snakeCase(
        name,
    ).toUpperCase() as unknown as ScreamingSnakeCase<T>

    return {
        [`STORAGE_LOCAL_${nameCase}_PATH`]: z.string().optional().nullable(),
        [`STORAGE_LOCAL_${nameCase}_URL`]: z
            .string()
            .url()
            .optional()
            .nullable(),
    } as never
}

export function getCosConfig<T extends string>(
    name: T,
): {
    [key in
        | `STORAGE_COS_${ScreamingSnakeCase<T>}_SECRET_KEY`
        | `STORAGE_COS_${ScreamingSnakeCase<T>}_SECRET_ID`
        | `STORAGE_COS_${ScreamingSnakeCase<T>}_BUCKET`
        | `STORAGE_COS_${ScreamingSnakeCase<T>}_REGION`]: z.ZodNullable<
        z.ZodOptional<z.ZodString>
    >
} {
    const nameCase = snakeCase(
        name,
    ).toUpperCase() as unknown as ScreamingSnakeCase<T>

    return {
        [`STORAGE_COS_${nameCase}_SECRET_KEY`]: z
            .string()
            .optional()
            .nullable(),
        [`STORAGE_COS_${nameCase}_SECRET_ID`]: z.string().optional().nullable(),
        [`STORAGE_COS_${nameCase}_BUCKET`]: z.string().optional().nullable(),
        [`STORAGE_COS_${nameCase}_REGION`]: z.string().optional().nullable(),
    } as never
}

export function getOssConfig<T extends string>(
    name: T,
): {
    [key in
        | `STORAGE_OSS_${ScreamingSnakeCase<T>}_SECRET_KEY`
        | `STORAGE_OSS_${ScreamingSnakeCase<T>}_SECRET_ID`
        | `STORAGE_OSS_${ScreamingSnakeCase<T>}_BUCKET`
        | `STORAGE_OSS_${ScreamingSnakeCase<T>}_REGION`]: z.ZodNullable<
        z.ZodOptional<z.ZodString>
    >
} {
    const nameCase = snakeCase(
        name,
    ).toUpperCase() as unknown as ScreamingSnakeCase<T>

    return {
        [`STORAGE_OSS_${nameCase}_SECRET_KEY`]: z
            .string()
            .optional()
            .nullable(),
        [`STORAGE_OSS_${nameCase}_SECRET_ID`]: z.string().optional().nullable(),
        [`STORAGE_OSS_${nameCase}_BUCKET`]: z.string().optional().nullable(),
        [`STORAGE_OSS_${nameCase}_REGION`]: z.string().optional().nullable(),
    } as never
}
