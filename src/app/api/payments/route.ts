import { db } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

function generateWalletAddress(method: string): string {
  if (method === 'usdt_trc20') {
    return 'T' + Array.from({ length: 33 }, () =>
      '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz'.charAt(
        Math.floor(Math.random() * 58)
      )
    ).join('');
  }
  if (method === 'usdt_bep20') {
    return '0x' + Array.from({ length: 40 }, () =>
      '0123456789abcdef'.charAt(Math.floor(Math.random() * 16))
    ).join('');
  }
  return 'mock_wallet_address';
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { orderId, userId, method } = body;

    if (!orderId || !userId || !method) {
      return NextResponse.json(
        { error: 'orderId, userId, and method are required' },
        { status: 400 }
      );
    }

    const order = await db.order.findUnique({ where: { id: orderId } });
    if (!order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    if (order.userId !== userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
    }

    // Check if payment already exists for this order
    const existingPayment = await db.payment.findUnique({
      where: { orderId },
    });
    if (existingPayment) {
      return NextResponse.json({ payment: existingPayment });
    }

    const walletAddress = generateWalletAddress(method);
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes from now

    const payment = await db.payment.create({
      data: {
        orderId,
        userId,
        method,
        amount: order.total,
        walletAddress,
        status: 'pending',
        expiresAt,
      },
    });

    // Update order payment method and status
    await db.order.update({
      where: { id: orderId },
      data: {
        paymentMethod: method,
        status: 'payment_waiting',
      },
    });

    return NextResponse.json({ payment }, { status: 201 });
  } catch (error) {
    console.error('Payment creation error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
