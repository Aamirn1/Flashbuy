'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useStore, formatUSDT } from '@/lib/store';
import type { Order } from '@/lib/types';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ChevronLeft, ChevronRight, Eye, ShoppingCart, Package, Clock, CreditCard, CheckCircle2, XCircle, RefreshCw } from 'lucide-react';

const STATUS_OPTIONS: { value: string; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'pending', label: 'Pending' },
  { value: 'payment_waiting', label: 'Awaiting' },
  { value: 'paid', label: 'Paid' },
  { value: 'processing', label: 'Processing' },
  { value: 'completed', label: 'Completed' },
  { value: 'cancelled', label: 'Cancelled' },
  { value: 'refunded', label: 'Refunded' },
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

const STATUS_ICONS: Record<string, React.ReactNode> = {
  pending: <Clock className="size-3.5" />,
  payment_waiting: <Clock className="size-3.5" />,
  paid: <CreditCard className="size-3.5" />,
  processing: <RefreshCw className="size-3.5" />,
  completed: <CheckCircle2 className="size-3.5" />,
  cancelled: <XCircle className="size-3.5" />,
  refunded: <XCircle className="size-3.5" />,
};

const PAGE_SIZE = 10;

export function OrderHistory() {
  const { navigate } = useStore();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/orders');
      if (res.ok) {
        const data = await res.json();
        setOrders(data.orders || []);
      }
    } catch {
      // Use empty array on error
    } finally {
      setLoading(false);
    }
  };

  const filteredOrders = orders.filter(
    (order) => statusFilter === 'all' || order.status === statusFilter
  );

  const totalPages = Math.max(1, Math.ceil(filteredOrders.length / PAGE_SIZE));
  const paginatedOrders = filteredOrders.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
    });

  const getStatusLabel = (status: string) =>
    status.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());

  // Safe number conversion for values that might be strings from API
  const safeToFixed = (val: unknown, decimals = 2): string => {
    const num = typeof val === 'number' ? val : parseFloat(String(val));
    return isNaN(num) ? '0.00' : num.toFixed(decimals);
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-48 bg-white/5" />
        <Skeleton className="h-64 w-full bg-white/5" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
      >
        <div>
          <h2 className="text-2xl font-bold text-gradient-cyan">Order History</h2>
          <p className="text-muted-foreground text-sm">View and manage your orders</p>
        </div>
        <div className="flex gap-1.5 flex-wrap">
          {STATUS_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => { setStatusFilter(opt.value); setCurrentPage(1); }}
              className={`rounded-full px-3 py-1.5 text-xs font-medium transition-all ${
                statusFilter === opt.value
                  ? 'glass-light border-emerald-500/30 text-emerald-400'
                  : 'text-muted-foreground hover:text-foreground hover:bg-white/5'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        {filteredOrders.length === 0 ? (
          <div className="glass-card rounded-xl flex flex-col items-center justify-center py-16 text-muted-foreground">
            <ShoppingCart className="h-12 w-12 mb-4 opacity-50" />
            <p className="text-lg font-medium">No orders found</p>
            <p className="text-sm">
              {statusFilter !== 'all'
                ? 'Try changing the filter to see more orders.'
                : 'Start shopping to see your orders here.'}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {paginatedOrders.map((order) => (
              <motion.div
                key={order.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-card glass-card-hover rounded-xl p-4 sm:p-5 cursor-pointer transition-all"
                onClick={() => navigate('order-detail', order.id)}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  {/* Left: Order info */}
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <div className={`shrink-0 w-10 h-10 rounded-lg flex items-center justify-center ${
                      order.status === 'completed' ? 'bg-emerald-500/20' :
                      order.status === 'cancelled' || order.status === 'refunded' ? 'bg-red-500/20' :
                      'bg-amber-500/20'
                    }`}>
                      {STATUS_ICONS[order.status] || <Package className="size-4 text-muted-foreground" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono font-semibold text-emerald-400 text-sm">
                          {order.orderNumber}
                        </span>
                        <Badge className={`${GLASS_STATUS_COLORS[order.status] || 'bg-muted/50 text-muted-foreground'} text-[10px] px-1.5 py-0`}>
                          {getStatusLabel(order.status)}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        {formatDate(order.createdAt)} · {order.items?.length || 0} item{(order.items?.length || 0) !== 1 ? 's' : ''}
                      </p>
                      {/* Show items preview on mobile */}
                      <div className="sm:hidden mt-2 space-y-1">
                        {order.items?.slice(0, 2).map((item) => (
                          <p key={item.id} className="text-xs text-muted-foreground truncate">
                            {item.product?.name || 'Flash USDT'} × {item.quantity >= 1000 ? `${formatUSDT(item.quantity)}` : item.quantity}
                          </p>
                        ))}
                        {order.items?.length > 2 && (
                          <p className="text-xs text-muted-foreground">+{order.items.length - 2} more</p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right: Amount & Action */}
                  <div className="flex items-center justify-between sm:justify-end gap-4">
                    <span className="text-lg font-bold text-gradient-gold">
                      ${safeToFixed(order.total)}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10"
                      onClick={(e) => { e.stopPropagation(); navigate('order-detail', order.id); }}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </motion.div>
            ))}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-2 py-3">
                <p className="text-sm text-muted-foreground">
                  {(currentPage - 1) * PAGE_SIZE + 1}-{Math.min(currentPage * PAGE_SIZE, filteredOrders.length)} of {filteredOrders.length}
                </p>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-emerald-400 hover:bg-emerald-500/10"
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage((p) => p - 1)}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <span className="text-sm font-medium">
                    {currentPage}/{totalPages}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-emerald-400 hover:bg-emerald-500/10"
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage((p) => p + 1)}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </motion.div>
    </div>
  );
}
