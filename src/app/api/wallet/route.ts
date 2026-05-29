import { db } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'userId is required' },
        { status: 400 }
      );
    }

    const user = await db.user.findUnique({
      where: { id: userId },
      select: { balance: true, welcomeBonus: true, welcomeBonusUnlocked: true },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const transactions = await db.walletTransaction.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({
      balance: user.balance,
      welcomeBonus: user.welcomeBonus,
      welcomeBonusUnlocked: user.welcomeBonusUnlocked,
      transactions,
    });
  } catch (error) {
    console.error('Wallet GET error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, type, amount, method } = body;

    if (!userId || !type || !amount) {
      return NextResponse.json(
        { error: 'userId, type, and amount are required' },
        { status: 400 }
      );
    }

    const validTypes = ['deposit', 'withdrawal', 'welcome_bonus'];
    if (!validTypes.includes(type)) {
      return NextResponse.json(
        { error: 'Invalid type. Must be deposit, withdrawal, or welcome_bonus' },
        { status: 400 }
      );
    }

    if (amount <= 0) {
      return NextResponse.json(
        { error: 'Amount must be positive' },
        { status: 400 }
      );
    }

    const user = await db.user.findUnique({ where: { id: userId } });
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    if (type === 'withdrawal' && user.balance < amount) {
      return NextResponse.json(
        { error: 'Insufficient balance' },
        { status: 400 }
      );
    }

    // Create transaction
    const transaction = await db.walletTransaction.create({
      data: {
        userId,
        type,
        amount,
        method: method || null,
        status: 'completed',
        description: type === 'deposit'
          ? 'Wallet deposit'
          : type === 'welcome_bonus'
            ? 'Welcome bonus'
            : 'Wallet withdrawal',
      },
    });

    // Update user balance
    if (type === 'deposit' || type === 'welcome_bonus') {
      await db.user.update({
        where: { id: userId },
        data: { balance: { increment: amount } },
      });
    } else {
      await db.user.update({
        where: { id: userId },
        data: { balance: { decrement: amount } },
      });
    }

    return NextResponse.json({ transaction }, { status: 201 });
  } catch (error) {
    console.error('Wallet POST error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
