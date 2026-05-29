import { db } from '@/lib/db';
import { requireAuth } from '@/lib/auth';
import { serializeData } from '@/lib/utils';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const { user: authUser, error: authError } = await requireAuth(request);
  if (authError) return authError;

  try {
    const userId = authUser.id;

    const user = await db.user.findUnique({
      where: { id: userId },
      select: { referralCode: true },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const referrals = await db.referral.findMany({
      where: { referrerId: userId },
      include: {
        referred: {
          select: { id: true, name: true, createdAt: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const totalEarnings = referrals.reduce((sum, r) => sum + Number(r.commission), 0);

    const referralsList = referrals.map((r) => ({
      name: r.referred.name,
      date: r.referred.createdAt.toISOString(),
      commission: Number(r.commission),
      status: r.status,
    }));

    return NextResponse.json(serializeData({
      code: user.referralCode,
      totalReferrals: referrals.length,
      totalEarnings,
      referrals: referralsList,
    }));
  } catch (error) {
    console.error('Referrals GET error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const { user: authUser, error: authError } = await requireAuth(request);
  if (authError) return authError;

  try {
    const body = await request.json();
    const { action } = body;
    const userId = authUser.id;

    // Withdraw referral earnings to wallet
    if (action === 'withdraw') {
      const referrals = await db.referral.findMany({
        where: { referrerId: userId, status: 'active' },
      });

      const totalEarnings = referrals.reduce((sum, r) => sum + Number(r.commission), 0);

      if (totalEarnings <= 0) {
        return NextResponse.json(
          { error: 'No earnings to withdraw' },
          { status: 400 }
        );
      }

      // Mark referrals as paid
      await db.referral.updateMany({
        where: { referrerId: userId, status: 'active' },
        data: { status: 'paid' },
      });

      // Add to user balance
      await db.user.update({
        where: { id: userId },
        data: { balance: { increment: totalEarnings } },
      });

      // Create wallet transaction
      await db.walletTransaction.create({
        data: {
          userId,
          type: 'commission',
          amount: totalEarnings,
          status: 'completed',
          description: `Referral commission withdrawal - $${totalEarnings.toFixed(2)}`,
        },
      });

      return NextResponse.json({ success: true, amount: totalEarnings });
    }

    return NextResponse.json(
      { error: 'Invalid action' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Referrals POST error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
