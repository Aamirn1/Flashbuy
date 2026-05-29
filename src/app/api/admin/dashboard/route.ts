import { db } from '@/lib/db';
import { requireAdmin } from '@/lib/auth';
import { parseJsonField } from '@/lib/utils';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const { user: adminUser, error: authError } = await requireAdmin(request);
  if (authError) return authError;

  try {
    // Total revenue from completed orders
    const completedOrders = await db.order.findMany({
      where: { status: 'completed' },
      select: { total: true },
    });
    const totalRevenue = completedOrders.reduce((sum, o) => sum + o.total, 0);

    // Total counts
    const [totalOrders, totalUsers, totalProducts] = await Promise.all([
      db.order.count(),
      db.user.count(),
      db.product.count({ where: { isActive: true } }),
    ]);

    // Daily revenue for last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const dailyOrders = await db.order.findMany({
      where: {
        status: 'completed',
        createdAt: { gte: thirtyDaysAgo },
      },
      select: { createdAt: true, total: true },
    });

    const dailyRevenueMap = new Map<string, number>();
    for (const order of dailyOrders) {
      const dateKey = order.createdAt.toISOString().split('T')[0];
      dailyRevenueMap.set(dateKey, (dailyRevenueMap.get(dateKey) || 0) + order.total);
    }

    const dailyRevenue = [];
    for (let i = 29; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateKey = d.toISOString().split('T')[0];
      dailyRevenue.push({
        date: dateKey,
        revenue: Math.round((dailyRevenueMap.get(dateKey) || 0) * 100) / 100,
      });
    }

    // Monthly revenue for last 12 months
    const twelveMonthsAgo = new Date();
    twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);

    const monthlyOrders = await db.order.findMany({
      where: {
        status: 'completed',
        createdAt: { gte: twelveMonthsAgo },
      },
      select: { createdAt: true, total: true },
    });

    const monthlyRevenueMap = new Map<string, number>();
    for (const order of monthlyOrders) {
      const monthKey = order.createdAt.toISOString().substring(0, 7);
      monthlyRevenueMap.set(monthKey, (monthlyRevenueMap.get(monthKey) || 0) + order.total);
    }

    const monthlyRevenue = [];
    for (let i = 11; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const monthKey = d.toISOString().substring(0, 7);
      monthlyRevenue.push({
        month: monthKey,
        revenue: Math.round((monthlyRevenueMap.get(monthKey) || 0) * 100) / 100,
      });
    }

    // User growth for last 30 days
    const recentUsers = await db.user.findMany({
      where: { createdAt: { gte: thirtyDaysAgo } },
      select: { createdAt: true },
    });

    const userGrowthMap = new Map<string, number>();
    for (const user of recentUsers) {
      const dateKey = user.createdAt.toISOString().split('T')[0];
      userGrowthMap.set(dateKey, (userGrowthMap.get(dateKey) || 0) + 1);
    }

    const userGrowth = [];
    for (let i = 29; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateKey = d.toISOString().split('T')[0];
      userGrowth.push({
        date: dateKey,
        users: userGrowthMap.get(dateKey) || 0,
      });
    }

    // Top 5 products by sold count
    const topProducts = await db.product.findMany({
      where: { isActive: true },
      select: { name: true, soldCount: true, price: true },
      orderBy: { soldCount: 'desc' },
      take: 5,
    });

    const topProductsWithRevenue = topProducts.map((p) => ({
      name: p.name,
      sold: p.soldCount,
      revenue: Math.round(p.soldCount * p.price * 100) / 100,
    }));

    // Recent 5 orders
    const recentOrders = await db.order.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { id: true, name: true, email: true } },
        items: {
          include: {
            product: {
              select: { id: true, name: true, images: true, price: true },
            },
          },
        },
      },
    });

    const parsedRecentOrders = recentOrders.map((order) => ({
      ...order,
      items: order.items.map((item) => ({
        ...item,
        product: item.product
          ? { ...item.product, images: parseJsonField(item.product.images) }
          : null,
      })),
    }));

    return NextResponse.json({
      totalRevenue: Math.round(totalRevenue * 100) / 100,
      totalOrders,
      totalUsers,
      totalProducts,
      dailyRevenue,
      monthlyRevenue,
      userGrowth,
      topProducts: topProductsWithRevenue,
      recentOrders: parsedRecentOrders,
    });
  } catch (error) {
    console.error('Admin dashboard error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
