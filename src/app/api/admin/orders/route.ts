import { db } from '@/lib/db';
import { requireAdmin } from '@/lib/auth';
import { parseJsonField, serializeData } from '@/lib/utils';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const { user: adminUser, error: authError } = await requireAdmin(request);
  if (authError) return authError;

  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const status = searchParams.get('status');

    const where: Record<string, unknown> = {};
    if (status) {
      where.status = status;
    }

    const skip = (page - 1) * limit;

    const [orders, total] = await Promise.all([
      db.order.findMany({
        where,
        include: {
          user: {
            select: { id: true, name: true, email: true },
          },
          items: {
            include: {
              product: {
                select: { id: true, name: true, images: true, price: true },
              },
            },
          },
          payment: true,
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
    console.error('Admin orders list error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  const { user: adminUser, error: authError } = await requireAdmin(request);
  if (authError) return authError;

  try {
    const body = await request.json();
    const { orderId, status } = body;

    if (!orderId || !status) {
      return NextResponse.json(
        { error: 'orderId and status are required' },
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

    const order = await db.order.findUnique({
      where: { id: orderId },
    });

    if (!order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    const updatedOrder = await db.order.update({
      where: { id: orderId },
      data: { status },
      include: {
        user: { select: { id: true, name: true, email: true } },
        items: {
          include: {
            product: {
              select: { id: true, name: true, images: true, price: true },
            },
          },
        },
        payment: true,
      },
    });

    // Update related payment status
    if (status === 'paid' && updatedOrder.payment) {
      await db.payment.update({
        where: { id: updatedOrder.payment.id },
        data: { status: 'confirmed', confirmedAt: new Date() },
      });
      await db.order.update({
        where: { id: orderId },
        data: { paymentStatus: 'confirmed' },
      });
    }

    if (status === 'refunded' && updatedOrder.payment) {
      await db.payment.update({
        where: { id: updatedOrder.payment.id },
        data: { status: 'refunded' },
      });
      await db.order.update({
        where: { id: orderId },
        data: { paymentStatus: 'refunded' },
      });
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
      await db.order.update({
        where: { id: orderId },
        data: { deliveryStatus: 'delivered' },
      });
    }

    // Restore stock for cancelled/refunded orders
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

    return NextResponse.json({ order: serializeData(parsedOrder) });
  } catch (error) {
    console.error('Admin order update error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
