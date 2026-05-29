'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useStore } from '@/lib/store';
import type { Page, DashboardStats, Order } from '@/lib/types';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
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
  Zap,
  CreditCard,
  Headphones,
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
import { AdminPaymentMethods } from './AdminPaymentMethods';
import { AdminTickets } from './AdminTickets';

const NAV_ITEMS: { page: Page; label: string; icon: React.ReactNode }[] = [
  { page: 'admin', label: 'Overview', icon: <LayoutDashboard className="h-4 w-4" /> },
  { page: 'admin-products', label: 'Products', icon: <Package className="h-4 w-4" /> },
  { page: 'admin-orders', label: 'Orders', icon: <ShoppingCart className="h-4 w-4" /> },
  { page: 'admin-users', label: 'Users', icon: <Users className="h-4 w-4" /> },
  { page: 'admin-payment-methods', label: 'Payments', icon: <CreditCard className="h-4 w-4" /> },
  { page: 'admin-tickets', label: 'Tickets', icon: <Headphones className="h-4 w-4" /> },
  { page: 'admin-coupons', label: 'Coupons', icon: <Tag className="h-4 w-4" /> },
  { page: 'admin-analytics', label: 'Analytics', icon: <BarChart3 className="h-4 w-4" /> },
  { page: 'admin-settings', label: 'Settings', icon: <Settings className="h-4 w-4" /> },
];

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

const GLASS_STATUS_COLORS: Record<string, string> = {
  pending: 'bg-amber-500/20 text-amber-400 border border-amber-500/30',
  payment_waiting: 'bg-orange-500/20 text-orange-400 border border-orange-500/30',
  paid: 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30',
  processing: 'bg-violet-500/20 text-violet-400 border border-violet-500/30',
  completed: 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30',
  cancelled: 'bg-red-500/20 text-red-400 border border-red-500/30',
  refunded: 'bg-slate-500/20 text-slate-400 border border-slate-500/30',
};

const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number }>; label?: string }) => {
  if (active && payload && payload.length) {
    return (
      <div className="glass-strong rounded-lg px-3 py-2 border border-emerald-500/20">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-sm font-semibold text-gradient-gold">${payload[0].value.toLocaleString()}</p>
      </div>
    );
  }
  return null;
};

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
      const res = await fetch('/api/admin/dashboard');
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

  const handleNavClick = (page: Page) => navigate(page);

  const getStatusLabel = (status: string) =>
    status.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());

  const renderContent = () => {
    switch (currentPage) {
      case 'admin-products': return <AdminProducts />;
      case 'admin-orders': return <AdminOrders />;
      case 'admin-users': return <AdminUsers />;
      case 'admin-tickets': return <AdminTickets />;
      case 'admin-payment-methods': return <AdminPaymentMethods />;
      default: return <OverviewContent />;
    }
  };

  const OverviewContent = () => (
    <div className="space-y-6">
      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Revenue', value: `$${stats?.totalRevenue?.toLocaleString() || '32,450'}`, trend: '+12.5%', up: true, icon: DollarSign, iconBg: 'bg-emerald-500/20', iconColor: 'text-emerald-400' },
          { label: 'Total Orders', value: stats?.totalOrders?.toLocaleString() || '284', trend: '+8.2%', up: true, icon: ShoppingCart, iconBg: 'bg-amber-500/20', iconColor: 'text-amber-400' },
          { label: 'Total Users', value: stats?.totalUsers?.toLocaleString() || '1,429', trend: '+15.3%', up: true, icon: Users, iconBg: 'bg-emerald-500/20', iconColor: 'text-emerald-400' },
          { label: 'Total Products', value: stats?.totalProducts?.toLocaleString() || '56', trend: '-2', up: false, icon: Package, iconBg: 'bg-violet-500/20', iconColor: 'text-violet-400' },
        ].map((stat, idx) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="glass-card glass-card-hover rounded-xl p-6 border border-emerald-500/10"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
                <p className="text-2xl font-bold mt-1 text-gradient-gold">{stat.value}</p>
                <p className={`text-xs flex items-center gap-1 mt-1 ${stat.up ? 'text-emerald-400' : 'text-red-400'}`}>
                  {stat.up ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                  {stat.trend} from last month
                </p>
              </div>
              <div className={`h-12 w-12 rounded-xl ${stat.iconBg} flex items-center justify-center border border-current/20`}>
                <stat.icon className={`h-6 w-6 ${stat.iconColor}`} />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
          className="glass-card rounded-xl p-6"
        >
          <h3 className="text-lg font-semibold text-glow-cyan mb-4">Daily Revenue</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={stats?.dailyRevenue || demoDailyRevenue}>
                <defs>
                  <linearGradient id="emeraldGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#34d399" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#34d399" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.08)" />
                <XAxis dataKey="date" tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="#34d399"
                  strokeWidth={2}
                  fill="url(#emeraldGradient)"
                  dot={{ fill: '#34d399', strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6, fill: '#34d399', stroke: '#050a15', strokeWidth: 2 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
          className="glass-card rounded-xl p-6"
        >
          <h3 className="text-lg font-semibold text-glow-cyan mb-4">Monthly Revenue</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats?.monthlyRevenue || demoMonthlyRevenue}>
                <defs>
                  <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#34d399" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#059669" stopOpacity={0.4} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.08)" />
                <XAxis dataKey="month" tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="revenue" fill="url(#barGradient)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>

      {/* Recent Orders & Recent Users */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="glass-card rounded-xl"
        >
          <div className="flex items-center justify-between p-6 pb-0">
            <h3 className="text-lg font-semibold text-glow-cyan">Recent Orders</h3>
            <Button variant="ghost" size="sm" className="text-emerald-400 hover:bg-emerald-500/10" onClick={() => handleNavClick('admin-orders')}>
              View All <ArrowUpRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
          <div className="p-4 space-y-2">
            {(stats?.recentOrders || demoRecentOrders).map((order) => (
              <div
                key={order.id}
                className="flex items-center justify-between p-3 rounded-lg glass-light hover:border-emerald-500/30 transition-all cursor-pointer"
                onClick={() => navigate('admin-orders')}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-sm text-emerald-400 font-mono">{order.orderNumber}</p>
                    <Badge className={`${GLASS_STATUS_COLORS[order.status] || ''} text-xs`}>
                      {getStatusLabel(order.status)}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {(order as Order & { customerName?: string }).customerName || 'Customer'} · {new Date(order.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <p className="font-semibold text-sm text-gradient-gold">${order.total.toFixed(2)}</p>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="glass-card rounded-xl"
        >
          <div className="flex items-center justify-between p-6 pb-0">
            <h3 className="text-lg font-semibold text-glow-cyan">Recent Users</h3>
            <Button variant="ghost" size="sm" className="text-emerald-400 hover:bg-emerald-500/10" onClick={() => handleNavClick('admin-users')}>
              View All <ArrowUpRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
          <div className="p-4 space-y-2">
            {demoRecentUsers.map((u) => (
              <div
                key={u.id}
                className="flex items-center justify-between p-3 rounded-lg glass-light hover:border-emerald-500/30 transition-all cursor-pointer"
                onClick={() => handleNavClick('admin-users')}
              >
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-full bg-emerald-500/15 flex items-center justify-center border border-emerald-500/20">
                    <Users className="h-4 w-4 text-emerald-400" />
                  </div>
                  <div>
                    <p className="font-medium text-sm text-foreground">{u.name}</p>
                    <p className="text-xs text-muted-foreground">{u.email}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-foreground">{u.orders} orders</p>
                  <p className="text-xs text-muted-foreground">{new Date(u.joined).toLocaleDateString()}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className="glass-card rounded-xl p-6"
      >
        <h3 className="text-lg font-semibold text-glow-cyan mb-4">Quick Actions</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { icon: <Package className="h-5 w-5" />, label: 'Add Product', action: () => handleNavClick('admin-products') },
            { icon: <ShoppingCart className="h-5 w-5" />, label: 'Manage Orders', action: () => handleNavClick('admin-orders') },
            { icon: <Users className="h-5 w-5" />, label: 'Manage Users', action: () => handleNavClick('admin-users') },
            { icon: <BarChart3 className="h-5 w-5" />, label: 'View Analytics', action: () => handleNavClick('admin-analytics') },
          ].map((action) => (
            <button
              key={action.label}
              onClick={action.action}
              className="flex flex-col items-center gap-2 h-auto py-4 rounded-xl glass-light glass-card-hover text-emerald-400 text-xs font-medium transition-all hover:border-emerald-500/30"
            >
              {action.icon}
              {action.label}
            </button>
          ))}
        </div>
      </motion.div>
    </div>
  );

  return (
    <div className="min-h-screen bg-mesh">
      {/* Mobile Layout */}
      <div className="lg:hidden">
        <div className="glass border-b border-emerald-500/10 px-4 py-3">
          <div className="flex items-center justify-between mb-3">
            <h1 className="font-bold text-lg text-gradient-cyan flex items-center gap-2">
              <Zap className="h-5 w-5 text-emerald-400" /> Admin Panel
            </h1>
            <Button variant="ghost" size="sm" className="text-emerald-400 hover:bg-emerald-500/10" onClick={logout}>
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex gap-1 overflow-x-auto pb-1">
            {NAV_ITEMS.map((item) => (
              <button
                key={item.page}
                onClick={() => handleNavClick(item.page)}
                className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium whitespace-nowrap transition-all ${
                  currentPage === item.page
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    : 'text-muted-foreground hover:text-foreground hover:bg-white/5'
                }`}
              >
                {item.icon}
                {item.label}
              </button>
            ))}
          </div>
        </div>
        <div className="p-4">{renderContent()}</div>
      </div>

      {/* Desktop Layout */}
      <div className="hidden lg:flex lg:min-h-screen">
        {/* Glass Sidebar */}
        <aside className="w-64 glass-strong flex flex-col border-r border-emerald-500/10">
          <div className="p-6 border-b border-emerald-500/10">
            <h1 className="text-xl font-bold flex items-center gap-2 text-gradient-cyan">
              <Zap className="h-5 w-5 text-emerald-400" /> Admin Panel
            </h1>
          </div>

          <ScrollArea className="flex-1 py-4">
            <nav className="space-y-1 px-3">
              {NAV_ITEMS.map((item) => {
                const isActive = currentPage === item.page;
                return (
                  <button
                    key={item.page}
                    onClick={() => handleNavClick(item.page)}
                    className={`w-full flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all ${
                      isActive
                        ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20 glow-cyan'
                        : 'text-muted-foreground hover:bg-white/5 hover:text-foreground border border-transparent'
                    }`}
                  >
                    {item.icon}
                    {item.label}
                    {isActive && <div className="ml-auto h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />}
                  </button>
                );
              })}
            </nav>
          </ScrollArea>

          <div className="p-3 border-t border-emerald-500/10 space-y-1">
            <Button variant="ghost" className="w-full justify-start gap-2 text-muted-foreground hover:text-foreground hover:bg-white/5" onClick={() => navigate('home')}>
              <Eye className="h-4 w-4" /> View Store
            </Button>
            <Button variant="ghost" className="w-full justify-start gap-2 text-muted-foreground hover:text-foreground hover:bg-white/5" onClick={logout}>
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
