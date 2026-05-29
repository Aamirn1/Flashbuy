import { db } from '@/lib/db';
import { serializeData } from '@/lib/utils';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const methods = await db.paymentMethodConfig.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' },
    });
    return NextResponse.json({ methods: serializeData(methods) });
  } catch (error) {
    console.error('Payment methods public list error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
