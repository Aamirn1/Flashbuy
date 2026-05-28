'use client';

import { useState, useEffect } from 'react';
import { useStore } from '@/lib/store';
import type { Page, DashboardStats, Order } from '@/lib/types';
import { ORDER_STATUS_COLORS } from '@/lib/constants';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  Tag,
  BarChart3,
  Settings,
  LogOut,
  DollarSign,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  Eye,
} from 'lucide-react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { AdminProducts } from './AdminProducts';
import { AdminOrders } from './AdminOrders';
import { AdminUsers } from './AdminUsers';

const NAV_ITEMS: { page: Page; label: string; icon: React.ReactNode }[] = [
  { page: 'admin', label: 'Overview', icon: <LayoutDashboard className="h-4 w-4" /> },
  { page: 'admin-products', label: 'Products', icon: <Package className="h-4 w-4" /> },
  { page: 'admin-orders', label: 'Orders', icon: <ShoppingCart className="h-4 w-4" /> },
  { page: 'admin-users', label: 'Users', icon: <Users className="h-4 w-4" /> },
  { page: 'admin-coupons', label: 'Coupons', icon: <Tag className="h-4 w-4" /> },
  { page: 'admin-analytics', label: 'Analytics', icon: <BarChart3 className="h-4 w-4" /> },
  { page: 'admin-settings', label: 'Settings', icon: <Settings className="h-4 w-4" /> },
];

// Demo chart data
const demoDailyRevenue = [
  { date: 'Jan 1', revenue: 1200 },
  { date: 'Jan 2', revenue: 1800 },
  { date: 'Jan 3', revenue: 1400 },
  { date: 'Jan 4', revenue: 2200 },
  { date: 'Jan 5', revenue: 1900 },
  { date: 'Jan 6', revenue: 2800 },
  { date: 'Jan 7', revenue: 3100 },
];

const demoMonthlyRevenue = [
  { month: 'Aug', revenue: 12000 },
  { month: 'Sep', revenue: 18000 },
  { month: 'Oct', revenue: 15000 },
  { month: 'Nov', revenue: 22000 },
  { month: 'Dec', revenue: 28000 },
  { month: 'Jan', revenue: 32000 },
];

const demoRecentOrders: (Order & { customerName?: string })[] = [
  { id: '1', orderNumber: 'ORD-001', status: 'completed', itemsPrice: 25.99, discount: 0, fee: 0, total: 25.99, paymentStatus: 'confirmed', deliveryStatus: 'delivered', createdAt: '2024-01-15T10:30:00Z', items: [], customerName: 'John D.' },
  { id: '2', orderNumber: 'ORD-002', status: 'processing', itemsPrice: 48.99, discount: 0, fee: 0, total: 48.99, paymentStatus: 'confirmed', deliveryStatus: 'pending', createdAt: '2024-01-14T15:20:00Z', items: [], customerName: 'Sarah K.' },
  { id: '3', orderNumber: 'ORD-003', status: 'pending', itemsPrice: 19.99, discount: 0, fee: 0, total: 19.99, paymentStatus: 'pending', deliveryStatus: 'pending', createdAt: '2024-01-14T08:45:00Z', items: [], customerName: 'Mike R.' },
  { id: '4', orderNumber: 'ORD-004', status: 'completed', itemsPrice: 95.99, discount: 5, fee: 0, total: 90.99, paymentStatus: 'confirmed', deliveryStatus: 'delivered', createdAt: '2024-01-13T12:00:00Z', items: [], customerName: 'Emma L.' },
  { id: '5', orderNumber: 'ORD-005', status: 'cancelled', itemsPrice: 14.99, discount: 0, fee: 0, total: 14.99, paymentStatus: 'expired', deliveryStatus: 'pending', createdAt: '2024-01-12T20:10:00Z', items: [], customerName: 'Alex P.' },
];

const demoRecentUsers = [
  { id: '1', name: 'John Doe', email: 'john@example.com', joined: '2024-01-15', orders: 3 },
  { id: '2', name: 'Sarah Kim', email: 'sarah@example.com', joined: '2024-01-14', orders: 1 },
  { id: '3', name: 'Mike Ross', email: 'mike@example.com', joined: '2024-01-13', orders: 5 },
  { id: '4', name: 'Emma Lee', email: 'emma@example.com', joined: '2024-01-12', orders: 2 },
];

export function AdminDashboard() {
  const { currentPage, navigate, logout } = useStore();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/stats');
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      }
    } catch {
      // use demo data
    } finally {
      setLoading(false);
    }
  };

  const handleNavClick = (page: Page) => {
    navigate(page);
  };

  const getStatusLabel = (status: string) => {
    return status.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
  };

  const renderContent = () => {
    switch (currentPage) {
      case 'admin-products':
        return <AdminProducts />;
      case 'admin-orders':
        return <AdminOrders />;
      case 'admin-users':
        return <AdminUsers />;
      default:
        return <OverviewContent />;
    }
  };

  const OverviewContent = () => (
    <div className="space-y-6">
      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Revenue</p>
                <p className="text-2xl font-bold mt-1">${stats?.totalRevenue?.toLocaleString() || '32,450'}</p>
                <p className="text-xs text-green-600 flex items-center gap-1 mt-1">
                  <ArrowUpRight className="h-3 w-3" /> +12.5% from last month
                </p>
              </div>
              <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
                <DollarSign className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Orders</p>
                <p className="text-2xl font-bold mt-1">{stats?.totalOrders?.toLocaleString() || '284'}</p>
                <p className="text-xs text-green-600 flex items-center gap-1 mt-1">
                  <ArrowUpRight className="h-3 w-3" /> +8.2% from last month
                </p>
              </div>
              <div className="h-12 w-12 rounded-full bg-orange-100 flex items-center justify-center">
                <ShoppingCart className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Users</p>
                <p className="text-2xl font-bold mt-1">{stats?.totalUsers?.toLocaleString() || '1,429'}</p>
                <p className="text-xs text-green-600 flex items-center gap-1 mt-1">
                  <ArrowUpRight className="h-3 w-3" /> +15.3% from last month
                </p>
              </div>
              <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Products</p>
                <p className="text-2xl font-bold mt-1">{stats?.totalProducts?.toLocaleString() || '56'}</p>
                <p className="text-xs text-red-600 flex items-center gap-1 mt-1">
                  <ArrowDownRight className="h-3 w-3" /> -2 this month
                </p>
              </div>
              <div className="h-12 w-12 rounded-full bg-purple-100 flex items-center justify-center">
                <Package className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Line Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Daily Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={stats?.dailyRevenue || demoDailyRevenue}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="date" className="text-xs" tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                  <YAxis className="text-xs" tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                    }}
                    formatter={(value: number) => [`$${value.toLocaleString()}`, 'Revenue']}
                  />
                  <Line
                    type="monotone"
                    dataKey="revenue"
                    stroke="hsl(var(--primary))"
                    strokeWidth={2}
                    dot={{ fill: 'hsl(var(--primary))', strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Monthly Revenue Bar Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Monthly Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats?.monthlyRevenue || demoMonthlyRevenue}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="month" className="text-xs" tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                  <YAxis className="text-xs" tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                    }}
                    formatter={(value: number) => [`$${value.toLocaleString()}`, 'Revenue']}
                  />
                  <Bar dataKey="revenue" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Orders & Recent Users */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">Recent Orders</CardTitle>
            <Button variant="ghost" size="sm" onClick={() => handleNavClick('admin-orders')}>
              View All <ArrowUpRight className="h-4 w-4 ml-1" />
            </Button>
          </CardHeader>
          <CardContent className="space-y-3">
            {(stats?.recentOrders || demoRecentOrders).map((order) => (
              <div
                key={order.id}
                className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors cursor-pointer"
                onClick={() => navigate('admin-orders')}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-sm">{order.orderNumber}</p>
                    <Badge variant="secondary" className={`${ORDER_STATUS_COLORS[order.status] || ''} text-xs`}>
                      {getStatusLabel(order.status)}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {(order as Order & { customerName?: string }).customerName || 'Customer'} · {new Date(order.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <p className="font-semibold text-sm">${order.total.toFixed(2)}</p>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Recent Users */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">Recent Users</CardTitle>
            <Button variant="ghost" size="sm" onClick={() => handleNavClick('admin-users')}>
              View All <ArrowUpRight className="h-4 w-4 ml-1" />
            </Button>
          </CardHeader>
          <CardContent className="space-y-3">
            {demoRecentUsers.map((u) => (
              <div
                key={u.id}
                className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors cursor-pointer"
                onClick={() => handleNavClick('admin-users')}
              >
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
                    <Users className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">{u.name}</p>
                    <p className="text-xs text-muted-foreground">{u.email}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium">{u.orders} orders</p>
                  <p className="text-xs text-muted-foreground">{new Date(u.joined).toLocaleDateString()}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <Button variant="outline" className="h-auto py-4 flex-col gap-2" onClick={() => handleNavClick('admin-products')}>
              <Package className="h-5 w-5" />
              <span className="text-xs">Add Product</span>
            </Button>
            <Button variant="outline" className="h-auto py-4 flex-col gap-2" onClick={() => handleNavClick('admin-orders')}>
              <ShoppingCart className="h-5 w-5" />
              <span className="text-xs">Manage Orders</span>
            </Button>
            <Button variant="outline" className="h-auto py-4 flex-col gap-2" onClick={() => handleNavClick('admin-users')}>
              <Users className="h-5 w-5" />
              <span className="text-xs">Manage Users</span>
            </Button>
            <Button variant="outline" className="h-auto py-4 flex-col gap-2" onClick={() => handleNavClick('admin-analytics')}>
              <BarChart3 className="h-5 w-5" />
              <span className="text-xs">View Analytics</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile Layout */}
      <div className="lg:hidden">
        <div className="border-b bg-card px-4 py-3">
          <div className="flex items-center justify-between mb-3">
            <h1 className="font-bold text-lg">Admin Panel</h1>
            <Button variant="ghost" size="sm" onClick={logout}>
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
          <Tabs value={currentPage} onValueChange={(v) => handleNavClick(v as Page)}>
            <TabsList className="w-full overflow-x-auto">
              {NAV_ITEMS.map((item) => (
                <TabsTrigger key={item.page} value={item.page} className="flex-1 gap-1 text-xs px-1 min-w-fit">
                  {item.icon}
                  <span className="hidden sm:inline">{item.label}</span>
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </div>
        <div className="p-4">{renderContent()}</div>
      </div>

      {/* Desktop Layout */}
      <div className="hidden lg:flex lg:min-h-screen">
        {/* Sidebar */}
        <aside className="w-64 border-r bg-card flex flex-col">
          <div className="p-6 border-b">
            <h1 className="text-xl font-bold flex items-center gap-2">
              <LayoutDashboard className="h-5 w-5" /> Admin Panel
            </h1>
          </div>

          <ScrollArea className="flex-1 py-4">
            <nav className="space-y-1 px-3">
              {NAV_ITEMS.map((item) => (
                <button
                  key={item.page}
                  onClick={() => handleNavClick(item.page)}
                  className={`w-full flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                    currentPage === item.page
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                  }`}
                >
                  {item.icon}
                  {item.label}
                </button>
              ))}
            </nav>
          </ScrollArea>

          <div className="p-3 border-t">
            <Button variant="ghost" className="w-full justify-start gap-2 text-muted-foreground" onClick={() => navigate('home')}>
              <Eye className="h-4 w-4" /> View Store
            </Button>
            <Button variant="ghost" className="w-full justify-start gap-2 text-muted-foreground" onClick={logout}>
              <LogOut className="h-4 w-4" /> Sign Out
            </Button>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-8 overflow-y-auto">
          {renderContent()}
        </main>
      </div>
    </div>
  );
}
