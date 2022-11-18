import { PrismaClient } from '@prisma/client/generate-client'

export * from '@prisma/client/generate-client'

export const db = new PrismaClient()

export default db
