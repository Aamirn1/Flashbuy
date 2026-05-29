import { db } from '@/lib/db';
import { requireAdmin } from '@/lib/auth';
import { serializeData } from '@/lib/utils';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const { user: adminUser, error: authError } = await requireAdmin(request);
  if (authError) return authError;

  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');

    const where: Record<string, unknown> = {};
    if (status) where.status = status;

    const tickets = await db.ticket.findMany({
      where,
      include: {
        user: { select: { id: true, name: true, email: true, avatar: true } },
        messages: { orderBy: { createdAt: 'desc' }, take: 1 },
        _count: { select: { messages: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ tickets: serializeData(tickets) });
  } catch (error) {
    console.error('Admin tickets list error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
