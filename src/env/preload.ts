const DEFAULT_OPTIONS = {
    assignToProcessEnv: true,
    overrideProcessEnv: false,
    ignoreFunctions: true,
}

function _isSANB(str: string) {
    const l = str.length
    let a
    for (let i = 0; i < l; i++) {
        a = str.charCodeAt(i)
        if (
            (a < 9 || a > 13) &&
            a !== 32 &&
            a !== 133 &&
            a !== 160 &&
            a !== 5760 &&
            a !== 6158 &&
            (a < 8192 || a > 8205) &&
            a !== 8232 &&
            a !== 8233 &&
            a !== 8239 &&
            a !== 8287 &&
            a !== 8288 &&
            a !== 12288 &&
            a !== 65279
        ) {
            return false
        }
    }
    return true
}

function isSANB(value: any) {
    return typeof value === 'string' && !_isSANB(value)
}

export const preloadEnv = (
    env: any,
    options: typeof DEFAULT_OPTIONS = DEFAULT_OPTIONS,
) => {
    const envOptions = { ...DEFAULT_OPTIONS, ...(options || {}) }

    const parsed: Record<string, any> = {}

    for (const key of Object.keys(env)) {
        if (envOptions.ignoreFunctions && typeof env[key] === 'function') {
            continue
        }

        parsed[key] = parseKey(env[key])

        if (envOptions.overrideProcessEnv) {
            process.env[key] = parsed[key] || process.env[key]
        } else {
            process.env[key] = process.env[key] || parsed[key]
        }
    }

    return parsed
}

function parseKey(value: any) {
    if (
        value.toString().indexOf('`') === 0 &&
        value.toString().lastIndexOf('`') === value.toString().length - 1
    ) {
        return value.toString().slice(1, value.toString().length - 1)
    }

    if (
        value.toString().lastIndexOf('*') === value.toString().length - 1 &&
        !value.toString().includes(',')
    ) {
        return value
            .toString()
            .slice(0, Math.max(0, value.toString().length - 1))
    }

    // null
    if (
        value.toString().toLowerCase() === 'null' ||
        value.toLowerCase() === 'undefined' ||
        value.toLowerCase() === '(null)'
    ) {
        return null
    }

    // Boolean
    if (
        value.toString().toLowerCase() === 'true' ||
        value.toString().toLowerCase() === 'false'
    ) {
        return value.toString().toLowerCase() === 'true'
    }

    // Number
    if (isSANB(value) && !Number.isNaN(Number(value))) {
        return Number(value)
    }

    // Array
    if (
        (Array.isArray(value) || typeof value === 'string') &&
        typeof value.includes === 'function' &&
        value.includes(',')
    ) {
        return (value as any)
            .split(',')
            .filter((string: any) => {
                return string !== ''
            })
            .map((string: any) => parseKey(string))
    }

    return value
}
