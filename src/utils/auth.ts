import { authManager, QQProvider } from '../kernel/auth'

authManager.init<QQProvider>('qq', 'test-qq', {
    clientId: '102018312',
    clientSecret: 'AC1cz83mIbhZEfsr',
    canGetUnionId: true,
})
