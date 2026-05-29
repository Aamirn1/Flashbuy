import { db } from '@/lib/db';
import { requireAuth } from '@/lib/auth';
import { serializeData } from '@/lib/utils';
import { NextRequest, NextResponse } from 'next/server';

export async function PATCH(request: NextRequest) {
  const { user: authUser, error: authError } = await requireAuth(request);
  if (authError) return authError;

  try {
    const body = await request.json();
    const { walletAddress, name, phone, country } = body;
    const userId = authUser.id;

    const updateData: Record<string, unknown> = {};

    if (walletAddress !== undefined) {
      updateData.walletAddress = walletAddress || null;
    }
    if (name !== undefined) {
      updateData.name = name;
    }
    if (phone !== undefined) {
      updateData.phone = phone || null;
    }
    if (country !== undefined) {
      updateData.country = country || null;
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { error: 'No fields to update' },
        { status: 400 }
      );
    }

    const updatedUser = await db.user.update({
      where: { id: userId },
      data: updateData,
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        balance: true,
        welcomeBonus: true,
        welcomeBonusUnlocked: true,
        referralCode: true,
        walletAddress: true,
        phone: true,
        country: true,
        avatar: true,
        isVerified: true,
        createdAt: true,
      },
    });

    return NextResponse.json({ user: serializeData(updatedUser) });
  } catch (error) {
    console.error('Profile update error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
