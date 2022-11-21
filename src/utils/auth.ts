import { authManager, QQProvider } from '../kernel/auth'

export const testQQProvider = new QQProvider({
    clientId: '102018312',
    clientSecret: 'AC1cz83mIbhZEfsr',
    canGetUnionId: true,
    name: 'test-qq',
})

authManager.registerProvider(testQQProvider)
