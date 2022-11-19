export function RetryFn<T extends (...args: any[]) => Promise<any>>(
    fn: T,
    maxRetry = 3,
    interval = 0,
): T {
    return ((...args: any[]) => {
        let retry = 0
        return new Promise((resolve, reject) => {
            const retryFn = () => {
                fn(...args)
                    .then(resolve)
                    .catch((err: any) => {
                        if (retry < maxRetry) {
                            retry++
                            setTimeout(retryFn, interval)
                        } else {
                            reject(err)
                        }
                    })
            }
            retryFn()
        }) as any
    }) as any
}
