import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// Neon PostgreSQL connection string
// Hardcoded as fallback because a system-level DATABASE_URL env var
// (pointing to SQLite) was overriding the .env.local file
const NEON_DATABASE_URL = 'postgresql://neondb_owner:npg_J2qnWFlAd8Yr@ep-morning-hill-aq7h926o.c-8.us-east-1.aws.neon.tech/neondb?sslmode=require&connect_timeout=10&connection_limit=3&pool_timeout=30';

function getDatabaseUrl(): string {
  const envUrl = process.env.DATABASE_URL || '';
  if (envUrl.startsWith('postgresql://') || envUrl.startsWith('postgres://')) {
    return envUrl;
  }
  return NEON_DATABASE_URL;
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
