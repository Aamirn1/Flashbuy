'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import type { Order, OrderStatus } from '@/lib/types';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { ShoppingCart, Eye, RefreshCw, RotateCcw } from 'lucide-react';

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

const ORDER_STATUS_OPTIONS: OrderStatus[] = ['pending', 'payment_waiting', 'paid', 'processing', 'completed', 'cancelled', 'refunded'];

const GLASS_STATUS_COLORS: Record<string, string> = {
  pending: 'bg-amber-500/20 text-amber-400 border border-amber-500/30',
  payment_waiting: 'bg-orange-500/20 text-orange-400 border border-orange-500/30',
  paid: 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30',
  processing: 'bg-violet-500/20 text-violet-400 border border-violet-500/30',
  completed: 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30',
  cancelled: 'bg-red-500/20 text-red-400 border border-red-500/30',
  refunded: 'bg-slate-500/20 text-slate-400 border border-slate-500/30',
};

interface AdminOrder extends Order {
  customerName?: string;
  customerEmail?: string;
}

export function AdminOrders() {
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedOrder, setSelectedOrder] = useState<AdminOrder | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [refundConfirm, setRefundConfirm] = useState<string | null>(null);
  const [updating, setUpdating] = useState<string | null>(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/orders');
      if (res.ok) {
        const data = await res.json();
        setOrders(data.orders || []);
      }
    } catch {
      // handle error
    } finally {
      setLoading(false);
    }
  };

  const filteredOrders = orders.filter(
    (order) => statusFilter === 'all' || order.status === statusFilter
  );

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    setUpdating(orderId);
    try {
      const res = await fetch(`/api/admin/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        setOrders((prev) =>
          prev.map((o) => (o.id === orderId ? { ...o, status: newStatus as OrderStatus } : o))
        );
      }
    } catch {
      // handle error
    } finally {
      setUpdating(null);
    }
  };

  const handleRefund = async (orderId: string) => {
    try {
      const res = await fetch(`/api/admin/orders/${orderId}/refund`, { method: 'POST' });
      if (res.ok) {
        setRefundConfirm(null);
        fetchOrders();
      }
    } catch {
      // handle error
    }
  };

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
    });

  const getStatusLabel = (status: string) =>
    status.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());

  const openDetail = (order: AdminOrder) => {
    setSelectedOrder(order);
    setDetailOpen(true);
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
          <h2 className="text-2xl font-bold text-gradient-cyan">Orders</h2>
          <p className="text-muted-foreground">Manage and track all orders</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          {STATUS_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setStatusFilter(opt.value)}
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
            <p className="text-sm">Orders will appear here when customers make purchases.</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="border-emerald-500/10 hover:bg-transparent">
                <TableHead className="text-muted-foreground">Order #</TableHead>
                <TableHead className="text-muted-foreground">Customer</TableHead>
                <TableHead className="text-muted-foreground">Items</TableHead>
                <TableHead className="text-muted-foreground">Total</TableHead>
                <TableHead className="text-muted-foreground">Status</TableHead>
                <TableHead className="text-muted-foreground">Payment</TableHead>
                <TableHead className="text-muted-foreground">Date</TableHead>
                <TableHead className="text-right text-muted-foreground">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredOrders.map((order) => (
                <TableRow key={order.id} className="border-emerald-500/5 hover:bg-emerald-500/5">
                  <TableCell className="font-medium text-sm text-emerald-400 font-mono">{order.orderNumber}</TableCell>
                  <TableCell>
                    <div>
                      <p className="text-sm text-foreground">{order.customerName || 'Customer'}</p>
                      <p className="text-xs text-muted-foreground">{order.customerEmail || ''}</p>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-foreground">{order.items.length} item{order.items.length !== 1 ? 's' : ''}</TableCell>
                  <TableCell className="font-semibold text-sm text-gradient-gold">${order.total.toFixed(2)}</TableCell>
                  <TableCell>
                    <Select
                      value={order.status}
                      onValueChange={(v) => handleStatusChange(order.id, v)}
                      disabled={updating === order.id}
                    >
                      <SelectTrigger className="w-[140px] h-8 glass-input text-xs">
                        <SelectValue>
                          <Badge className={`${GLASS_STATUS_COLORS[order.status] || ''} text-xs`}>
                            {getStatusLabel(order.status)}
                          </Badge>
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent className="glass-strong border-emerald-500/20">
                        {ORDER_STATUS_OPTIONS.map((s) => (
                          <SelectItem key={s} value={s}>
                            {getStatusLabel(s)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>
                    <Badge
                      className={
                        order.paymentStatus === 'confirmed' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                        order.paymentStatus === 'failed' ? 'bg-red-500/20 text-red-400 border border-red-500/30' :
                        order.paymentStatus === 'refunded' ? 'bg-slate-500/20 text-slate-400 border border-slate-500/30' :
                        'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                      }
                    >
                      {getStatusLabel(order.paymentStatus)}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground text-xs">{formatDate(order.createdAt)}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button variant="ghost" size="sm" className="text-emerald-400 hover:bg-emerald-500/10" onClick={() => openDetail(order)}>
                        <Eye className="h-4 w-4" />
                      </Button>
                      {order.status !== 'refunded' && order.status !== 'cancelled' && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-amber-400 hover:bg-amber-500/10"
                          onClick={() => setRefundConfirm(order.id)}
                        >
                          <RotateCcw className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </motion.div>

      {/* Order Detail Dialog */}
      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="glass-strong border-emerald-500/20 sm:max-w-[600px] max-h-[85vh] overflow-y-auto">
          {selectedOrder && (
            <>
              <DialogHeader>
                <DialogTitle className="text-gradient-cyan">Order {selectedOrder.orderNumber}</DialogTitle>
                <DialogDescription className="text-muted-foreground">
                  {formatDate(selectedOrder.createdAt)} · {selectedOrder.customerName || 'Customer'}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="glass-light rounded-lg p-3">
                    <p className="text-muted-foreground text-xs">Status</p>
                    <Badge className={`${GLASS_STATUS_COLORS[selectedOrder.status] || ''} mt-1`}>
                      {getStatusLabel(selectedOrder.status)}
                    </Badge>
                  </div>
                  <div className="glass-light rounded-lg p-3">
                    <p className="text-muted-foreground text-xs">Payment</p>
                    <Badge className={
                      selectedOrder.paymentStatus === 'confirmed' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 mt-1' : 'bg-amber-500/20 text-amber-400 border border-amber-500/30 mt-1'
                    }>
                      {getStatusLabel(selectedOrder.paymentStatus)}
                    </Badge>
                  </div>
                </div>

                <div className="glass-light rounded-lg p-4">
                  <p className="font-medium text-sm mb-3 text-foreground">Items</p>
                  <div className="space-y-2">
                    {selectedOrder.items.map((item) => (
                      <div key={item.id} className="flex justify-between text-sm">
                        <span className="text-foreground">{item.product?.name || `Product #${item.productId}`} × {item.quantity}</span>
                        <span className="font-medium text-gradient-gold">${item.total.toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                  <div className="border-t border-emerald-500/10 mt-3 pt-3 space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Subtotal</span>
                      <span className="text-foreground">${selectedOrder.itemsPrice.toFixed(2)}</span>
                    </div>
                    {selectedOrder.discount > 0 && (
                      <div className="flex justify-between text-sm text-emerald-400">
                        <span>Discount</span>
                        <span>-${selectedOrder.discount.toFixed(2)}</span>
                      </div>
                    )}
                    <div className="flex justify-between font-semibold">
                      <span className="text-foreground">Total</span>
                      <span className="text-gradient-gold">${selectedOrder.total.toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="glass-light rounded-lg p-3">
                    <p className="text-muted-foreground text-xs">Payment Method</p>
                    <p className="font-medium text-foreground mt-1">{selectedOrder.paymentMethod || 'USDT'}</p>
                  </div>
                  <div className="glass-light rounded-lg p-3">
                    <p className="text-muted-foreground text-xs">Delivery Type</p>
                    <Badge className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 mt-1">
                      {selectedOrder.deliveryStatus === 'automatic' ? '⚡ Automatic' : '📋 Manual'}
                    </Badge>
                  </div>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Refund Confirm Dialog */}
      <Dialog open={!!refundConfirm} onOpenChange={() => setRefundConfirm(null)}>
        <DialogContent className="glass-strong border-emerald-500/20">
          <DialogHeader>
            <DialogTitle className="text-gradient-cyan">Refund Order</DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Are you sure you want to refund this order? The customer will be credited back to their wallet.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="ghost" className="text-muted-foreground" onClick={() => setRefundConfirm(null)}>Cancel</Button>
            <Button variant="destructive" className="bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/30" onClick={() => refundConfirm && handleRefund(refundConfirm)}>
              Confirm Refund
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
