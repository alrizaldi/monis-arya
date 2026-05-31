import { PrismaClient } from '@prisma/client'

declare global {
  // This prevents PrismaClient from being bundled during SSR/Next.js builds
  var prisma: PrismaClient | undefined
}

const prisma = global.prisma || new PrismaClient()

if (process.env.NODE_ENV === 'development') global.prisma = prisma

export default prisma