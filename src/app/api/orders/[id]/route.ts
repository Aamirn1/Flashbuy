import { db } from '@/lib/db';
import { parseJsonField } from '@/lib/utils';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const order = await db.order.findUnique({
      where: { id },
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
                deliveryType: true,
              },
            },
          },
        },
        payment: true,
      },
    });

    if (!order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
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

    return NextResponse.json({ order: parsedOrder });
  } catch (error) {
    console.error('Order detail error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { status } = body;

    if (!status) {
      return NextResponse.json(
        { error: 'Status is required' },
        { status: 400 }
      );
    }

    const validStatuses = ['pending', 'payment_waiting', 'paid', 'processing', 'completed', 'cancelled', 'refunded'];
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status' },
        { status: 400 }
      );
    }

    const order = await db.order.findUnique({ where: { id } });
    if (!order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    const updatedOrder = await db.order.update({
      where: { id },
      data: { status },
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
        payment: true,
      },
    });

    // If order is completed and has automatic delivery products, set delivery data
    if (status === 'completed') {
      for (const item of updatedOrder.items) {
        if (item.product && !item.deliveryData) {
          const fullProduct = await db.product.findUnique({
            where: { id: item.productId },
            select: { deliveryInfo: true, deliveryType: true },
          });
          if (fullProduct?.deliveryType === 'automatic' && fullProduct.deliveryInfo) {
            await db.orderItem.update({
              where: { id: item.id },
              data: { deliveryData: fullProduct.deliveryInfo },
            });
            await db.order.update({
              where: { id },
              data: { deliveryStatus: 'delivered' },
            });
          }
        }
      }

      // Unlock welcome bonus if order total >= $10 and bonus not yet unlocked
      if (updatedOrder.total >= 10) {
        const orderUser = await db.user.findUnique({
          where: { id: updatedOrder.userId },
          select: { welcomeBonus: true, welcomeBonusUnlocked: true },
        });
        if (orderUser && !orderUser.welcomeBonusUnlocked && orderUser.welcomeBonus > 0) {
          // Add bonus to balance and mark as unlocked
          await db.user.update({
            where: { id: updatedOrder.userId },
            data: {
              balance: { increment: orderUser.welcomeBonus },
              welcomeBonusUnlocked: true,
            },
          });
          // Create a wallet transaction for the bonus unlock
          await db.walletTransaction.create({
            data: {
              userId: updatedOrder.userId,
              type: 'welcome_bonus',
              amount: orderUser.welcomeBonus,
              status: 'completed',
              description: `$${orderUser.welcomeBonus.toFixed(0)} Welcome Bonus unlocked — Order #${updatedOrder.orderNumber}`,
            },
          });
        }
      }
    }

    // If order is cancelled or refunded, restore stock
    if (status === 'cancelled' || status === 'refunded') {
      for (const item of updatedOrder.items) {
        await db.product.update({
          where: { id: item.productId },
          data: { stock: { increment: item.quantity } },
        });
      }
    }

    const parsedOrder = {
      ...updatedOrder,
      items: updatedOrder.items.map((item) => ({
        ...item,
        product: item.product
          ? { ...item.product, images: parseJsonField(item.product.images) }
          : null,
      })),
    };

    return NextResponse.json({ order: parsedOrder });
  } catch (error) {
    console.error('Order update error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
