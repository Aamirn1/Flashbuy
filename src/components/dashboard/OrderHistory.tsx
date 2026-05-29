'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useStore } from '@/lib/store';
import type { Order } from '@/lib/types';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { ChevronLeft, ChevronRight, Eye, ShoppingCart } from 'lucide-react';

const STATUS_OPTIONS: { value: string; label: string }[] = [
  { value: 'all', label: 'All Status' },
  { value: 'pending', label: 'Pending' },
  { value: 'payment_waiting', label: 'Payment Waiting' },
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
          <p className="text-muted-foreground">View and manage your orders</p>
        </div>
        <div className="flex gap-2 flex-wrap">
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
        className="glass-card rounded-xl overflow-hidden"
      >
        {filteredOrders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
            <ShoppingCart className="h-12 w-12 mb-4 opacity-50" />
            <p className="text-lg font-medium">No orders found</p>
            <p className="text-sm">
              {statusFilter !== 'all'
                ? 'Try changing the filter to see more orders.'
                : 'Start shopping to see your orders here.'}
            </p>
          </div>
        ) : (
          <>
            <Table>
              <TableHeader>
                <TableRow className="border-emerald-500/10 hover:bg-transparent">
                  <TableHead className="text-muted-foreground">Order Number</TableHead>
                  <TableHead className="text-muted-foreground">Date</TableHead>
                  <TableHead className="text-muted-foreground">Items</TableHead>
                  <TableHead className="text-muted-foreground">Total</TableHead>
                  <TableHead className="text-muted-foreground">Status</TableHead>
                  <TableHead className="text-right text-muted-foreground">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedOrders.map((order) => (
                  <TableRow
                    key={order.id}
                    className="cursor-pointer border-emerald-500/5 hover:bg-emerald-500/5 transition-colors"
                    onClick={() => navigate('order-detail', order.id)}
                  >
                    <TableCell className="font-medium text-emerald-400 font-mono">{order.orderNumber}</TableCell>
                    <TableCell className="text-muted-foreground text-sm">{formatDate(order.createdAt)}</TableCell>
                    <TableCell>
                      <span className="text-sm text-foreground">
                        {order.items.length} item{order.items.length !== 1 ? 's' : ''}
                      </span>
                    </TableCell>
                    <TableCell className="font-semibold text-gradient-gold">${order.total.toFixed(2)}</TableCell>
                    <TableCell>
                      <Badge className={`${GLASS_STATUS_COLORS[order.status] || 'bg-muted/50 text-muted-foreground'} text-xs`}>
                        {getStatusLabel(order.status)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm" className="text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10" onClick={(e) => { e.stopPropagation(); navigate('order-detail', order.id); }}>
                        <Eye className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-4 py-3 border-t border-emerald-500/10">
                <p className="text-sm text-muted-foreground">
                  Showing {(currentPage - 1) * PAGE_SIZE + 1} to{' '}
                  {Math.min(currentPage * PAGE_SIZE, filteredOrders.length)} of{' '}
                  {filteredOrders.length} orders
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
                  <span className="text-sm font-medium text-foreground">
                    {currentPage} / {totalPages}
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
          </>
        )}
      </motion.div>
    </div>
  );
}
