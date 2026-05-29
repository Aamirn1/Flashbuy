import { db } from '@/lib/db';
import { requireAdmin } from '@/lib/auth';
import { serializeData } from '@/lib/utils';
import { NextRequest, NextResponse } from 'next/server';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { user: adminUser, error: authError } = await requireAdmin(request);
  if (authError) return authError;

  try {
    const { id } = await params;
    const body = await request.json();

    const method = await db.paymentMethodConfig.findUnique({ where: { id } });
    if (!method) return NextResponse.json({ error: 'Payment method not found' }, { status: 404 });

    const updated = await db.paymentMethodConfig.update({
      where: { id },
      data: {
        ...(body.name !== undefined && { name: body.name }),
        ...(body.network !== undefined && { network: body.network }),
        ...(body.walletAddress !== undefined && { walletAddress: body.walletAddress }),
        ...(body.icon !== undefined && { icon: body.icon }),
        ...(body.isActive !== undefined && { isActive: body.isActive }),
        ...(body.sortOrder !== undefined && { sortOrder: body.sortOrder }),
        ...(body.requireTxId !== undefined && { requireTxId: body.requireTxId }),
        ...(body.requireScreenshot !== undefined && { requireScreenshot: body.requireScreenshot }),
        ...(body.estimatedTime !== undefined && { estimatedTime: body.estimatedTime }),
        ...(body.confirmations !== undefined && { confirmations: body.confirmations }),
      },
    });

    return NextResponse.json({ method: serializeData(updated) });
  } catch (error) {
    console.error('Payment method update error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { user: adminUser, error: authError } = await requireAdmin(request);
  if (authError) return authError;

  try {
    const { id } = await params;
    const method = await db.paymentMethodConfig.findUnique({ where: { id } });
    if (!method) return NextResponse.json({ error: 'Payment method not found' }, { status: 404 });

    await db.paymentMethodConfig.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Payment method delete error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
