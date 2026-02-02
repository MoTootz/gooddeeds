// Database client initialization
// This will be used throughout the app to interact with Prisma

import { PrismaClient } from '@prisma/client'

const prismaClientSingleton = () => {
  return new PrismaClient()
}

declare global {
  var prisma: undefined | ReturnType<typeof prismaClientSingleton>
}

const prisma = global.prisma ?? prismaClientSingleton()

export default prisma

if (process.env.NODE_ENV !== 'production') global.prisma = prisma
