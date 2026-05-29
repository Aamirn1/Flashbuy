import { db } from '@/lib/db';
import { requireAuth } from '@/lib/auth';
import { parseJsonField, serializeData } from '@/lib/utils';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const { user: authUser, error: authError } = await requireAuth(request);
  if (authError) return authError;

  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId') || authUser.id;
    const status = searchParams.get('status');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');

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
          ? { ...item.product, images: parseJsonField(item.product.images) }
          : item.productId === 'flash-usdt'
            ? { id: 'flash-usdt', name: 'Flash USDT', images: [], price: 0.01, slug: 'flash-usdt' }
            : null,
      })),
    }));

    return NextResponse.json({
      orders: serializeData(parsedOrders),
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

const FLASH_USDT_PRODUCT_ID = 'flash-usdt';
const FLASH_USDT_RATE = 0.01; // $0.01 per Flash USDT

export async function POST(request: NextRequest) {
  const { user: authUser, error: authError } = await requireAuth(request);
  if (authError) return authError;

  try {
    const body = await request.json();
    const { items, couponCode, couponDiscount: clientCouponDiscount, paymentMethod, total: clientTotal, deliveryWalletAddress, deliveryWalletNetwork } = body;
    const userId = authUser.id;

    if (!items || !items.length) {
      return NextResponse.json(
        { error: 'items are required' },
        { status: 400 }
      );
    }

    // Separate flash-usdt items from regular DB products
    const flashItems = items.filter((item: { productId: string }) => item.productId === FLASH_USDT_PRODUCT_ID);
    const dbItems = items.filter((item: { productId: string }) => item.productId !== FLASH_USDT_PRODUCT_ID);

    // Look up the real Flash USDT product from DB for foreign key
    let flashProduct: { id: string } | null = null;
    if (flashItems.length > 0) {
      flashProduct = await db.product.findFirst({ where: { slug: 'flash-usdt', isActive: true } });
      if (!flashProduct) {
        return NextResponse.json(
          { error: 'Flash USDT product is currently unavailable' },
          { status: 400 }
        );
      }
    }

    // Fetch DB products for non-flash items
    let dbProducts: Awaited<ReturnType<typeof db.product.findMany>> = [];
    if (dbItems.length > 0) {
      const productIds = dbItems.map((item: { productId: string }) => item.productId);
      dbProducts = await db.product.findMany({
        where: { id: { in: productIds }, isActive: true },
      });
      if (dbProducts.length !== productIds.length) {
        return NextResponse.json(
          { error: 'One or more products not found or inactive' },
          { status: 400 }
        );
      }
    }

    // Calculate items price
    let itemsPrice = 0;
    const orderItems: { productId: string; quantity: number; price: number; total: number }[] = [];

    // Process flash-usdt items — use real product ID for foreign key
    for (const item of flashItems) {
      const itemTotal = FLASH_USDT_RATE * item.quantity;
      itemsPrice += itemTotal;
      orderItems.push({
        productId: flashProduct!.id,
        quantity: item.quantity,
        price: FLASH_USDT_RATE,
        total: itemTotal,
      });
    }

    // Process DB product items
    for (const item of dbItems) {
      const product = dbProducts.find((p) => p.id === item.productId);
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
      const itemTotal = product.price * item.quantity;
      itemsPrice += itemTotal;
      orderItems.push({
        productId: item.productId,
        quantity: item.quantity,
        price: product.price,
        total: itemTotal,
      });
    }

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
        notes: deliveryWalletAddress
          ? `Delivery Wallet: ${deliveryWalletAddress}${deliveryWalletNetwork ? ` (${deliveryWalletNetwork})` : ''}`
          : null,
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

    // Decrement stock for DB products only (flash-usdt is virtual)
    for (const item of dbItems) {
      await db.product.update({
        where: { id: item.productId },
        data: { stock: { decrement: item.quantity } },
      });
    }

    // Unlock welcome bonus if order total >= $10
    if (total >= 10) {
      const userRecord = await db.user.findUnique({ where: { id: userId } });
      if (userRecord && !userRecord.welcomeBonusUnlocked) {
        await db.user.update({
          where: { id: userId },
          data: {
            welcomeBonusUnlocked: true,
            balance: { increment: userRecord.welcomeBonus },
          },
        });
        await db.walletTransaction.create({
          data: {
            userId,
            type: 'welcome_bonus',
            amount: userRecord.welcomeBonus,
            status: 'completed',
            description: `$${userRecord.welcomeBonus} Welcome Bonus unlocked with order ${orderNumber}`,
          },
        });
      }
    }

    const parsedOrder = {
      ...order,
      items: order.items.map((item) => ({
        ...item,
        product: item.product
          ? { ...item.product, images: parseJsonField(item.product.images) }
          : null,
      })),
    };

    return NextResponse.json({ order: serializeData(parsedOrder) }, { status: 201 });
  } catch (error) {
    console.error('Order creation error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
