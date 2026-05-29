import { db } from '@/lib/db';
import { requireAdmin } from '@/lib/auth';
import { serializeData } from '@/lib/utils';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const { user: adminUser, error: authError } = await requireAdmin(request);
  if (authError) return authError;

  try {
    const methods = await db.paymentMethodConfig.findMany({
      orderBy: { sortOrder: 'asc' },
    });
    return NextResponse.json({ methods: serializeData(methods) });
  } catch (error) {
    console.error('Payment methods list error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const { user: adminUser, error: authError } = await requireAdmin(request);
  if (authError) return authError;

  try {
    const body = await request.json();
    const { name, network, walletAddress, icon, isActive, sortOrder, requireTxId, requireScreenshot, estimatedTime, confirmations } = body;

    if (!name) return NextResponse.json({ error: 'name is required' }, { status: 400 });

    const method = await db.paymentMethodConfig.create({
      data: {
        name,
        network: network || null,
        walletAddress: walletAddress || null,
        icon: icon || null,
        isActive: isActive !== false,
        sortOrder: sortOrder || 0,
        requireTxId: requireTxId || false,
        requireScreenshot: requireScreenshot || false,
        estimatedTime: estimatedTime || '3-5 minutes',
        confirmations: confirmations || 20,
      },
    });

    return NextResponse.json({ method: serializeData(method) }, { status: 201 });
  } catch (error) {
    console.error('Payment method create error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
