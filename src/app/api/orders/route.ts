import { db } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const status = searchParams.get('status');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');

    if (!userId) {
      return NextResponse.json(
        { error: 'userId is required' },
        { status: 400 }
      );
    }

    const where: Record<string, unknown> = { userId };
    if (status) {
      where.status = status;
    }

    const skip = (page - 1) * limit;

    const [orders, total] = await Promise.all([
      db.order.findMany({
        where,
        include: {
          items: {
            include: {
              product: {
                select: {
                  id: true,
                  name: true,
                  images: true,
                  price: true,
                  slug: true,
                },
              },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      db.order.count({ where }),
    ]);

    const parsedOrders = orders.map((order) => ({
      ...order,
      items: order.items.map((item) => ({
        ...item,
        product: item.product
          ? { ...item.product, images: JSON.parse(item.product.images || '[]') }
          : null,
      })),
    }));

    return NextResponse.json({
      orders: parsedOrders,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error('Orders list error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, items, couponCode, paymentMethod } = body;

    if (!userId || !items || !items.length) {
      return NextResponse.json(
        { error: 'userId and items are required' },
        { status: 400 }
      );
    }

    // Validate products and stock
    const productIds = items.map((item: { productId: string }) => item.productId);
    const products = await db.product.findMany({
      where: { id: { in: productIds }, isActive: true },
    });

    if (products.length !== productIds.length) {
      return NextResponse.json(
        { error: 'One or more products not found or inactive' },
        { status: 400 }
      );
    }

    // Validate stock
    for (const item of items) {
      const product = products.find((p) => p.id === item.productId);
      if (!product) {
        return NextResponse.json(
          { error: `Product ${item.productId} not found` },
          { status: 400 }
        );
      }
      if (product.stock < item.quantity) {
        return NextResponse.json(
          { error: `Insufficient stock for ${product.name}` },
          { status: 400 }
        );
      }
    }

    // Calculate items price
    let itemsPrice = 0;
    const orderItems = items.map((item: { productId: string; quantity: number }) => {
      const product = products.find((p) => p.id === item.productId)!;
      const total = product.price * item.quantity;
      itemsPrice += total;
      return {
        productId: item.productId,
        quantity: item.quantity,
        price: product.price,
        total,
      };
    });

    // Apply coupon
    let discount = 0;
    let couponId: string | null = null;
    if (couponCode) {
      const coupon = await db.coupon.findUnique({
        where: { code: couponCode },
      });
      if (coupon && coupon.isActive) {
        const now = new Date();
        const isExpired = coupon.expiresAt && coupon.expiresAt < now;
        const isOverLimit = coupon.usageLimit && coupon.usedCount >= coupon.usageLimit;
        const isMinNotMet = itemsPrice < coupon.minOrder;

        if (!isExpired && !isOverLimit && !isMinNotMet) {
          if (coupon.type === 'percentage') {
            discount = itemsPrice * (coupon.value / 100);
            if (coupon.maxDiscount && discount > coupon.maxDiscount) {
              discount = coupon.maxDiscount;
            }
          } else {
            discount = coupon.value;
          }
          couponId = coupon.id;
        }
      }
    }

    // Calculate fee (1% service fee)
    const fee = Math.round((itemsPrice - discount) * 0.01 * 100) / 100;
    const total = itemsPrice - discount + fee;

    // Generate order number
    const orderNumber = `FB-${Date.now()}-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;

    // Create order with items
    const order = await db.order.create({
      data: {
        orderNumber,
        userId,
        status: 'payment_waiting',
        itemsPrice,
        discount,
        fee,
        total,
        couponId,
        paymentMethod: paymentMethod || null,
        paymentStatus: 'pending',
        deliveryStatus: 'pending',
        items: {
          create: orderItems.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
            price: item.price,
            total: item.total,
          })),
        },
      },
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                images: true,
                price: true,
                slug: true,
              },
            },
          },
        },
      },
    });

    // Update coupon used count
    if (couponId) {
      await db.coupon.update({
        where: { id: couponId },
        data: { usedCount: { increment: 1 } },
      });
    }

    // Decrement stock
    for (const item of items) {
      await db.product.update({
        where: { id: item.productId },
        data: { stock: { decrement: item.quantity } },
      });
    }

    const parsedOrder = {
      ...order,
      items: order.items.map((item) => ({
        ...item,
        product: item.product
          ? { ...item.product, images: JSON.parse(item.product.images || '[]') }
          : null,
      })),
    };

    return NextResponse.json({ order: parsedOrder }, { status: 201 });
  } catch (error) {
    console.error('Order creation error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
