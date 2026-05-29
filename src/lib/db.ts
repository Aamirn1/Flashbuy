import { PrismaClient } from '@prisma/client'

const NEON_DATABASE_URL = "postgresql://neondb_owner:npg_J2qnWFlAd8Yr@ep-morning-hill-aq7h926o.c-8.us-east-1.aws.neon.tech/neondb?sslmode=require&connection_limit=3&pool_timeout=30";

function getDatabaseUrl(): string {
  const envUrl = process.env.DATABASE_URL;
  // Only use env URL if it's a valid PostgreSQL URL
  if (envUrl && (envUrl.startsWith('postgresql://') || envUrl.startsWith('postgres://'))) {
    return envUrl;
  }
  // Fallback to Neon PostgreSQL
  return NEON_DATABASE_URL;
}

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: ['error'],
    datasources: {
      db: {
        url: getDatabaseUrl(),
      },
    },
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db
