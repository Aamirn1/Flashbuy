import { db } from '@/lib/db';
import { requireAdmin } from '@/lib/auth';
import { parseJsonField, serializeData } from '@/lib/utils';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { user: adminUser, error: authError } = await requireAdmin(request);
  if (authError) return authError;

  try {
    const { id } = await params;
    const order = await db.order.findUnique({
      where: { id },
      include: {
        user: { select: { id: true, name: true, email: true, walletAddress: true } },
        items: {
          include: {
            product: { select: { id: true, name: true, images: true, price: true, slug: true } },
          },
        },
        payment: true,
      },
    });

    if (!order) return NextResponse.json({ error: 'Order not found' }, { status: 404 });

    const parsedOrder = {
      ...order,
      items: order.items.map((item) => ({
        ...item,
        product: item.product
          ? { ...item.product, images: parseJsonField(item.product.images) }
          : null,
      })),
    };

    return NextResponse.json({ order: serializeData(parsedOrder) });
  } catch (error) {
    console.error('Admin order detail error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { user: adminUser, error: authError } = await requireAdmin(request);
  if (authError) return authError;

  try {
    const { id } = await params;
    const body = await request.json();
    const { status } = body;

    if (!status) return NextResponse.json({ error: 'status is required' }, { status: 400 });

    const validStatuses = ['pending', 'payment_waiting', 'paid', 'processing', 'completed', 'cancelled', 'refunded'];
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
    }

    const order = await db.order.findUnique({ where: { id } });
    if (!order) return NextResponse.json({ error: 'Order not found' }, { status: 404 });

    // Build cascade update data based on status
    const cascadeData: Record<string, unknown> = {};

    // Update related payment status
    if (status === 'paid') {
      cascadeData.paymentStatus = 'confirmed';
    } else if (status === 'refunded') {
      cascadeData.paymentStatus = 'refunded';
    } else if (status === 'cancelled') {
      cascadeData.paymentStatus = 'failed';
    } else if (status === 'payment_waiting') {
      cascadeData.paymentStatus = 'pending';
    }

    // Update related delivery status
    if (status === 'completed') {
      cascadeData.deliveryStatus = 'delivered';
    } else if (status === 'cancelled' || status === 'refunded') {
      cascadeData.deliveryStatus = 'failed';
    } else if (status === 'processing') {
      cascadeData.deliveryStatus = 'pending';
    }

    // Perform the main order update with cascaded fields
    const updatedOrder = await db.order.update({
      where: { id },
      data: { status, ...cascadeData },
      include: {
        user: { select: { id: true, name: true, email: true, walletAddress: true } },
        items: { include: { product: { select: { id: true, name: true, images: true, price: true, slug: true } } } },
        payment: true,
      },
    });

    // Update related Payment record
    if (status === 'paid' && updatedOrder.payment) {
      await db.payment.update({
        where: { id: updatedOrder.payment.id },
        data: { status: 'confirmed', confirmedAt: new Date() },
      });
    }

    if (status === 'refunded' && updatedOrder.payment) {
      await db.payment.update({ where: { id: updatedOrder.payment.id }, data: { status: 'refunded' } });
    }

    if (status === 'cancelled' && updatedOrder.payment) {
      await db.payment.update({ where: { id: updatedOrder.payment.id }, data: { status: 'failed' } });
    }

    // Handle delivery for completed orders
    if (status === 'completed') {
      for (const item of updatedOrder.items) {
        if (!item.deliveryData) {
          const fullProduct = await db.product.findUnique({
            where: { id: item.productId },
            select: { deliveryInfo: true, deliveryType: true },
          });
          if (fullProduct?.deliveryType === 'automatic' && fullProduct.deliveryInfo) {
            await db.orderItem.update({
              where: { id: item.id },
              data: { deliveryData: fullProduct.deliveryInfo },
            });
          }
        }
      }
    }

    // Restore stock for cancelled/refunded
    if (status === 'cancelled' || status === 'refunded') {
      for (const item of updatedOrder.items) {
        await db.product.update({
          where: { id: item.productId },
          data: { stock: { increment: item.quantity } },
        });
      }
    }

    // Re-fetch the order to get the latest data after all cascade updates
    const freshOrder = await db.order.findUnique({
      where: { id },
      include: {
        user: { select: { id: true, name: true, email: true, walletAddress: true } },
        items: { include: { product: { select: { id: true, name: true, images: true, price: true, slug: true } } } },
        payment: true,
      },
    });

    const orderToReturn = freshOrder || updatedOrder;

    const parsedOrder = {
      ...orderToReturn,
      items: orderToReturn.items.map((item) => ({
        ...item,
        product: item.product
          ? { ...item.product, images: parseJsonField(item.product.images) }
          : null,
      })),
    };

    return NextResponse.json({ order: serializeData(parsedOrder) });
  } catch (error) {
    console.error('Admin order update error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
