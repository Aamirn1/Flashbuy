import { db } from '@/lib/db';
import { serializeData } from '@/lib/utils';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { code, orderTotal } = body;

    if (!code || orderTotal === undefined) {
      return NextResponse.json(
        { error: 'Code and orderTotal are required' },
        { status: 400 }
      );
    }

    const coupon = await db.coupon.findUnique({
      where: { code },
    });

    if (!coupon) {
      return NextResponse.json(
        { valid: false, error: 'Coupon not found' },
        { status: 200 }
      );
    }

    // Check if active
    if (!coupon.isActive) {
      return NextResponse.json(
        { valid: false, error: 'Coupon is not active' },
        { status: 200 }
      );
    }

    // Check expiration
    if (coupon.expiresAt && coupon.expiresAt < new Date()) {
      return NextResponse.json(
        { valid: false, error: 'Coupon has expired' },
        { status: 200 }
      );
    }

    // Check usage limit
    if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
      return NextResponse.json(
        { valid: false, error: 'Coupon usage limit reached' },
        { status: 200 }
      );
    }

    // Check minimum order
    if (orderTotal < coupon.minOrder) {
      return NextResponse.json(
        { valid: false, error: `Minimum order amount is $${coupon.minOrder}` },
        { status: 200 }
      );
    }

    // Calculate discount
    let discount = 0;
    if (coupon.type === 'percentage') {
      discount = orderTotal * (coupon.value / 100);
      if (coupon.maxDiscount && discount > coupon.maxDiscount) {
        discount = coupon.maxDiscount;
      }
    } else {
      discount = coupon.value;
    }

    return NextResponse.json(serializeData({
      valid: true,
      discount: Math.round(discount * 100) / 100,
      coupon: {
        id: coupon.id,
        code: coupon.code,
        type: coupon.type,
        value: coupon.value,
        minOrder: coupon.minOrder,
        maxDiscount: coupon.maxDiscount,
      },
    }));
  } catch (error) {
    console.error('Coupon validation error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
