'use client';

import { useState } from 'react';
import { useStore } from '@/lib/store';
import type { Page } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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

export function UserDashboard() {
  const { user, currentPage, navigate, logout } = useStore();
  const [activeTab, setActiveTab] = useState<string>('dashboard');

  const handleNavClick = (page: Page) => {
    setActiveTab(page === 'dashboard' ? 'dashboard' : page);
    navigate(page);
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const renderContent = () => {
    switch (currentPage) {
      case 'order-detail':
        return <OrderDetail />;
      case 'ticket-detail':
        return <TicketDetail />;
      case 'orders':
        return <OrderHistory />;
      case 'wallet':
        return <WalletView />;
      case 'tickets':
        return <TicketList />;
      case 'referrals':
        return <ReferralView />;
      default:
        return <OverviewContent />;
    }
  };

  const OverviewContent = () => (
    <div className="space-y-6">
      {/* Welcome */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Avatar className="h-14 w-14">
            <AvatarFallback className="bg-primary text-primary-foreground text-lg">
              {user ? getInitials(user.name) : 'U'}
            </AvatarFallback>
          </Avatar>
          <div>
            <h2 className="text-2xl font-bold">Welcome back, {user?.name || 'User'}!</h2>
            <p className="text-muted-foreground">Here&apos;s what&apos;s happening with your account.</p>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => handleNavClick('orders')}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Orders</p>
                <p className="text-2xl font-bold mt-1">12</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-orange-100 flex items-center justify-center">
                <Package className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => handleNavClick('wallet')}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Wallet Balance</p>
                <p className="text-2xl font-bold mt-1">${user?.balance?.toFixed(2) || '0.00'}</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
                <DollarSign className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => handleNavClick('tickets')}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active Tickets</p>
                <p className="text-2xl font-bold mt-1">2</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                <Ticket className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => handleNavClick('referrals')}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Referral Earnings</p>
                <p className="text-2xl font-bold mt-1">$45.50</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-purple-100 flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Orders & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Orders */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">Recent Orders</CardTitle>
            <Button variant="ghost" size="sm" onClick={() => handleNavClick('orders')}>
              View All <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { id: 'ORD-001', date: '2024-01-15', items: 'Netflix Premium, Spotify', total: 25.99, status: 'completed' },
                { id: 'ORD-002', date: '2024-01-14', items: 'Steam Gift Card $50', total: 48.99, status: 'processing' },
                { id: 'ORD-003', date: '2024-01-12', items: 'ChatGPT Plus', total: 19.99, status: 'paid' },
                { id: 'ORD-004', date: '2024-01-10', items: 'Xbox Game Pass', total: 14.99, status: 'pending' },
                { id: 'ORD-005', date: '2024-01-08', items: 'Apple Gift Card $100', total: 95.99, status: 'completed' },
              ].map((order) => (
                <div
                  key={order.id}
                  className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors cursor-pointer"
                  onClick={() => navigate('order-detail', order.id)}
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm">{order.id}</p>
                    <p className="text-xs text-muted-foreground truncate">{order.items}</p>
                  </div>
                  <div className="flex items-center gap-3 ml-4">
                    <p className="text-sm font-semibold">${order.total}</p>
                    <Badge
                      variant="secondary"
                      className={
                        order.status === 'completed'
                          ? 'bg-green-100 text-green-800'
                          : order.status === 'processing'
                            ? 'bg-purple-100 text-purple-800'
                            : order.status === 'paid'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-yellow-100 text-yellow-800'
                      }
                    >
                      {order.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button className="w-full justify-start gap-2" variant="outline" onClick={() => navigate('products')}>
              <ShoppingCart className="h-4 w-4" /> Browse Products
            </Button>
            <Button className="w-full justify-start gap-2" variant="outline" onClick={() => handleNavClick('wallet')}>
              <Wallet className="h-4 w-4" /> Deposit Funds
            </Button>
            <Button className="w-full justify-start gap-2" variant="outline" onClick={() => handleNavClick('tickets')}>
              <Ticket className="h-4 w-4" /> Open Support Ticket
            </Button>
            <Button className="w-full justify-start gap-2" variant="outline" onClick={() => handleNavClick('referrals')}>
              <Users className="h-4 w-4" /> Refer a Friend
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile Tabs */}
      <div className="lg:hidden">
        <div className="border-b bg-card px-4 py-3">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <Avatar className="h-9 w-9">
                <AvatarFallback className="bg-primary text-primary-foreground text-sm">
                  {user ? getInitials(user.name) : 'U'}
                </AvatarFallback>
              </Avatar>
              <span className="font-semibold text-sm">{user?.name || 'User'}</span>
            </div>
            <Button variant="ghost" size="sm" onClick={logout}>
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
          <Tabs value={activeTab} onValueChange={(v) => handleNavClick(v as Page)}>
            <TabsList className="w-full">
              {NAV_ITEMS.map((item) => (
                <TabsTrigger key={item.page} value={item.page} className="flex-1 gap-1 text-xs px-1">
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
            <div className="flex items-center gap-3">
              <Avatar className="h-12 w-12">
                <AvatarFallback className="bg-primary text-primary-foreground">
                  {user ? getInitials(user.name) : 'U'}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <p className="font-semibold truncate">{user?.name || 'User'}</p>
                <p className="text-xs text-muted-foreground truncate">{user?.email || ''}</p>
              </div>
            </div>
          </div>

          <ScrollArea className="flex-1 py-4">
            <nav className="space-y-1 px-3">
              {NAV_ITEMS.map((item) => (
                <button
                  key={item.page}
                  onClick={() => handleNavClick(item.page)}
                  className={`w-full flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                    (currentPage === item.page ||
                      (item.page === 'dashboard' && currentPage === 'dashboard') ||
                      (item.page === 'orders' && currentPage === 'order-detail') ||
                      (item.page === 'tickets' && currentPage === 'ticket-detail'))
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
            <Button variant="ghost" className="w-full justify-start gap-2 text-muted-foreground" onClick={logout}>
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
