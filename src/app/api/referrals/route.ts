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

    const totalEarnings = referrals.reduce((sum, r) => sum + r.commission, 0);

    const referralsList = referrals.map((r) => ({
      name: r.referred.name,
      date: r.referred.createdAt.toISOString(),
      commission: r.commission,
      status: r.status,
    }));

    return NextResponse.json({
      code: user.referralCode,
      totalReferrals: referrals.length,
      totalEarnings,
      referrals: referralsList,
    });
  } catch (error) {
    console.error('Referrals GET error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
