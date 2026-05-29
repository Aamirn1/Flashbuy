---
Task ID: 1
Agent: Main Agent
Task: Fix "Internal Server Error" on signup

Work Log:
- Investigated signup error by testing API endpoints directly
- Found root cause #1: System-level DATABASE_URL env var was set to SQLite path (file:/home/z/my-project/db/custom.db), overriding the .env.local PostgreSQL URL
- Found root cause #2: JSON.parse() calls on Prisma Json fields caused "Unexpected end of JSON input" errors (Prisma auto-parses Json fields, so calling JSON.parse on already-parsed objects fails)
- Fixed db.ts: Added getDatabaseUrl() function that checks URL protocol and falls back to Neon PostgreSQL URL
- Fixed all API routes: Replaced JSON.parse(x || '[]') with parseJsonField(x) utility function
- Created parseJsonField() utility in src/lib/utils.ts for safe JSON field parsing
- Reduced Prisma connection pool to connection_limit=3 and pool_timeout=30 for Neon stability
- Simplified package.json dev script (removed tee pipe)
- Tested all endpoints: register (201), login (200), products (200), categories (200), coupons (200)
- All lint checks pass

Stage Summary:
- Signup and all API endpoints now work correctly
- Two root causes fixed: DATABASE_URL override and JSON.parse on Prisma Json fields
- Server is stable with connection_limit=3 for Neon PostgreSQL
