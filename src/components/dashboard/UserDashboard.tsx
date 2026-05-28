'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useStore } from '@/lib/store';
import type { Page } from '@/lib/types';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  LayoutDashboard,
  ShoppingCart,
  Wallet,
  Ticket,
  Users,
  Package,
  DollarSign,
  Clock,
  TrendingUp,
  ArrowRight,
  LogOut,
  Zap,
} from 'lucide-react';
import { OrderHistory } from './OrderHistory';
import { OrderDetail } from './OrderDetail';
import { WalletView } from './WalletView';
import { TicketList } from './TicketList';
import { TicketDetail } from './TicketDetail';
import { ReferralView } from './ReferralView';

const NAV_ITEMS: { page: Page; label: string; icon: React.ReactNode }[] = [
  { page: 'dashboard', label: 'Overview', icon: <LayoutDashboard className="h-4 w-4" /> },
  { page: 'orders', label: 'Orders', icon: <ShoppingCart className="h-4 w-4" /> },
  { page: 'wallet', label: 'Wallet', icon: <Wallet className="h-4 w-4" /> },
  { page: 'tickets', label: 'Tickets', icon: <Ticket className="h-4 w-4" /> },
  { page: 'referrals', label: 'Referrals', icon: <Users className="h-4 w-4" /> },
];

const statCards = [
  { key: 'orders', page: 'orders' as Page, label: 'Total Orders', value: '12', icon: Package, color: 'from-cyan-500/20 to-cyan-600/5', iconBg: 'bg-cyan-500/20', iconColor: 'text-cyan-400' },
  { key: 'wallet', page: 'wallet' as Page, label: 'Wallet Balance', value: '$0.00', icon: DollarSign, color: 'from-emerald-500/20 to-emerald-600/5', iconBg: 'bg-emerald-500/20', iconColor: 'text-emerald-400' },
  { key: 'tickets', page: 'tickets' as Page, label: 'Active Tickets', value: '2', icon: Ticket, color: 'from-amber-500/20 to-amber-600/5', iconBg: 'bg-amber-500/20', iconColor: 'text-amber-400' },
  { key: 'referrals', page: 'referrals' as Page, label: 'Referral Earnings', value: '$45.50', icon: TrendingUp, color: 'from-violet-500/20 to-violet-600/5', iconBg: 'bg-violet-500/20', iconColor: 'text-violet-400' },
];

const recentOrders = [
  { id: 'ORD-001', date: '2024-01-15', items: 'Flash USDT 10K', total: 100.00, status: 'completed' },
  { id: 'ORD-002', date: '2024-01-14', items: 'Flash USDT 5K', total: 50.00, status: 'processing' },
  { id: 'ORD-003', date: '2024-01-12', items: 'Flash USDT 1K', total: 10.00, status: 'paid' },
  { id: 'ORD-004', date: '2024-01-10', items: 'Flash USDT 50K', total: 500.00, status: 'pending' },
  { id: 'ORD-005', date: '2024-01-08', items: 'Flash USDT 100K', total: 1000.00, status: 'completed' },
];

const statusColors: Record<string, string> = {
  completed: 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30',
  processing: 'bg-violet-500/20 text-violet-400 border border-violet-500/30',
  paid: 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30',
  pending: 'bg-amber-500/20 text-amber-400 border border-amber-500/30',
};

export function UserDashboard() {
  const { user, currentPage, navigate, logout } = useStore();
  const [activeTab, setActiveTab] = useState<string>('dashboard');

  const handleNavClick = (page: Page) => {
    setActiveTab(page === 'dashboard' ? 'dashboard' : page);
    navigate(page);
  };

  const getInitials = (name: string) =>
    name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);

  const renderContent = () => {
    switch (currentPage) {
      case 'order-detail': return <OrderDetail />;
      case 'ticket-detail': return <TicketDetail />;
      case 'orders': return <OrderHistory />;
      case 'wallet': return <WalletView />;
      case 'tickets': return <TicketList />;
      case 'referrals': return <ReferralView />;
      default: return <OverviewContent />;
    }
  };

  const OverviewContent = () => (
    <div className="space-y-6">
      {/* Welcome */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
      >
        <div className="flex items-center gap-4">
          <div className="relative">
            <Avatar className="h-14 w-14 ring-2 ring-cyan-500/40 ring-offset-2 ring-offset-[#050a15]">
              <AvatarFallback className="bg-cyan-500/20 text-cyan-400 text-lg font-bold border border-cyan-500/30">
                {user ? getInitials(user.name) : 'U'}
              </AvatarFallback>
            </Avatar>
            <div className="absolute -bottom-1 -right-1 h-5 w-5 rounded-full bg-cyan-500 flex items-center justify-center animate-pulse-glow">
              <Zap className="h-3 w-3 text-[#050a15]" />
            </div>
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gradient-cyan">
              Welcome back, {user?.name || 'User'}!
            </h2>
            <p className="text-muted-foreground text-sm">Here&apos;s what&apos;s happening with your account.</p>
          </div>
        </div>
      </motion.div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat, idx) => (
          <motion.div
            key={stat.key}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="glass-card glass-card-hover rounded-xl cursor-pointer p-6"
            onClick={() => handleNavClick(stat.page)}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
                <p className="text-2xl font-bold mt-1 text-gradient-gold">
                  {stat.key === 'wallet' ? `$${user?.balance?.toFixed(2) || '0.00'}` : stat.value}
                </p>
              </div>
              <div className={`h-12 w-12 rounded-xl ${stat.iconBg} flex items-center justify-center`}>
                <stat.icon className={`h-6 w-6 ${stat.iconColor}`} />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Recent Orders & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Orders */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
          className="lg:col-span-2 glass-card rounded-xl"
        >
          <div className="flex items-center justify-between p-6 pb-0">
            <h3 className="text-lg font-semibold text-glow-cyan">Recent Orders</h3>
            <Button
              variant="ghost"
              size="sm"
              className="text-cyan-400 hover:text-cyan-300 hover:bg-cyan-500/10"
              onClick={() => handleNavClick('orders')}
            >
              View All <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
          <div className="p-4 space-y-2">
            {recentOrders.map((order) => (
              <div
                key={order.id}
                className="flex items-center justify-between p-3 rounded-lg glass-light hover:border-cyan-500/30 transition-all cursor-pointer"
                onClick={() => navigate('order-detail', order.id)}
              >
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm text-foreground">{order.id}</p>
                  <p className="text-xs text-muted-foreground truncate">{order.items}</p>
                </div>
                <div className="flex items-center gap-3 ml-4">
                  <p className="text-sm font-semibold text-gradient-gold">${order.total.toFixed(2)}</p>
                  <Badge className={`${statusColors[order.status] || 'bg-muted/50 text-muted-foreground'} text-xs`}>
                    {order.status}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
          className="glass-card rounded-xl p-6"
        >
          <h3 className="text-lg font-semibold text-glow-cyan mb-4">Quick Actions</h3>
          <div className="space-y-3">
            {[
              { icon: <ShoppingCart className="h-4 w-4" />, label: 'Browse Products', action: () => navigate('products') },
              { icon: <Wallet className="h-4 w-4" />, label: 'Deposit Funds', action: () => handleNavClick('wallet') },
              { icon: <Ticket className="h-4 w-4" />, label: 'Open Support Ticket', action: () => handleNavClick('tickets') },
              { icon: <Users className="h-4 w-4" />, label: 'Refer a Friend', action: () => handleNavClick('referrals') },
            ].map((action) => (
              <button
                key={action.label}
                onClick={action.action}
                className="w-full flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium glass-light glass-card-hover text-foreground transition-all hover:border-cyan-500/30"
              >
                <span className="text-cyan-400">{action.icon}</span>
                {action.label}
              </button>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-mesh">
      {/* Mobile Tabs */}
      <div className="lg:hidden">
        <div className="glass border-b border-cyan-500/10 px-4 py-3">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <Avatar className="h-9 w-9 ring-1 ring-cyan-500/30">
                <AvatarFallback className="bg-cyan-500/20 text-cyan-400 text-sm font-bold">
                  {user ? getInitials(user.name) : 'U'}
                </AvatarFallback>
              </Avatar>
              <span className="font-semibold text-sm text-gradient-cyan">{user?.name || 'User'}</span>
            </div>
            <Button variant="ghost" size="sm" className="text-cyan-400 hover:bg-cyan-500/10" onClick={logout}>
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex gap-1 overflow-x-auto pb-1">
            {NAV_ITEMS.map((item) => {
              const isActive = currentPage === item.page ||
                (item.page === 'orders' && currentPage === 'order-detail') ||
                (item.page === 'tickets' && currentPage === 'ticket-detail');
              return (
                <button
                  key={item.page}
                  onClick={() => handleNavClick(item.page)}
                  className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium whitespace-nowrap transition-all ${
                    isActive
                      ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                      : 'text-muted-foreground hover:text-foreground hover:bg-white/5'
                  }`}
                >
                  {item.icon}
                  {item.label}
                </button>
              );
            })}
          </div>
        </div>
        <div className="p-4">{renderContent()}</div>
      </div>

      {/* Desktop Layout */}
      <div className="hidden lg:flex lg:min-h-screen">
        {/* Glass Sidebar */}
        <aside className="w-64 glass-strong flex flex-col border-r border-cyan-500/10">
          <div className="p-6 border-b border-cyan-500/10">
            <div className="flex items-center gap-3">
              <Avatar className="h-12 w-12 ring-2 ring-cyan-500/40 ring-offset-2 ring-offset-[#050a15]">
                <AvatarFallback className="bg-cyan-500/20 text-cyan-400 font-bold border border-cyan-500/30">
                  {user ? getInitials(user.name) : 'U'}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <p className="font-semibold truncate text-gradient-cyan">{user?.name || 'User'}</p>
                <p className="text-xs text-muted-foreground truncate">{user?.email || ''}</p>
              </div>
            </div>
          </div>

          <ScrollArea className="flex-1 py-4">
            <nav className="space-y-1 px-3">
              {NAV_ITEMS.map((item) => {
                const isActive = currentPage === item.page ||
                  (item.page === 'dashboard' && currentPage === 'dashboard') ||
                  (item.page === 'orders' && currentPage === 'order-detail') ||
                  (item.page === 'tickets' && currentPage === 'ticket-detail');
                return (
                  <button
                    key={item.page}
                    onClick={() => handleNavClick(item.page)}
                    className={`w-full flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all ${
                      isActive
                        ? 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/20 glow-cyan'
                        : 'text-muted-foreground hover:bg-white/5 hover:text-foreground border border-transparent'
                    }`}
                  >
                    {item.icon}
                    {item.label}
                    {isActive && <div className="ml-auto h-1.5 w-1.5 rounded-full bg-cyan-400 animate-pulse" />}
                  </button>
                );
              })}
            </nav>
          </ScrollArea>

          <div className="p-3 border-t border-cyan-500/10">
            <Button variant="ghost" className="w-full justify-start gap-2 text-muted-foreground hover:text-foreground hover:bg-white/5" onClick={logout}>
              <LogOut className="h-4 w-4" />
              Sign Out
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
