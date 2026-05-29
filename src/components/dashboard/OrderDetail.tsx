'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useStore } from '@/lib/store';
import type { Order } from '@/lib/types';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import {
  ArrowLeft,
  Package,
  CreditCard,
  Truck,
  CheckCircle2,
  Clock,
  XCircle,
} from 'lucide-react';

const ORDER_STEPS = [
  { key: 'pending', label: 'Pending', icon: Clock },
  { key: 'payment_waiting', label: 'Payment', icon: CreditCard },
  { key: 'paid', label: 'Paid', icon: CreditCard },
  { key: 'processing', label: 'Processing', icon: Package },
  { key: 'completed', label: 'Completed', icon: CheckCircle2 },
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

// Safe number conversion for values that might be strings from API
const safeNum = (val: unknown): number => {
  if (typeof val === 'number') return val;
  const n = parseFloat(String(val));
  return isNaN(n) ? 0 : n;
};

function getStepIndex(status: string): number {
  const idx = ORDER_STEPS.findIndex((s) => s.key === status);
  return idx >= 0 ? idx : -1;
}

export function OrderDetail() {
  const { selectedOrderId, goBack } = useStore();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (selectedOrderId) fetchOrder(selectedOrderId);
  }, [selectedOrderId]);

  const fetchOrder = async (id: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/orders/${id}`);
      if (res.ok) {
        const data = await res.json();
        setOrder(data.order || data);
      }
    } catch {
      // handle error
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit',
    });

  const getStatusLabel = (status: string) =>
    status.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-32 bg-white/5" />
        <Skeleton className="h-48 w-full bg-white/5" />
        <Skeleton className="h-48 w-full bg-white/5" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="text-center py-16">
        <p className="text-muted-foreground">Order not found</p>
        <Button variant="outline" className="mt-4 glass-light border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/10" onClick={goBack}>
          Go Back
        </Button>
      </div>
    );
  }

  const currentStep = getStepIndex(order.status);
  const isCancelled = order.status === 'cancelled';
  const isRefunded = order.status === 'refunded';

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center gap-3"
      >
        <Button variant="ghost" size="sm" className="text-emerald-400 hover:bg-emerald-500/10 w-fit" onClick={goBack}>
          <ArrowLeft className="h-4 w-4 mr-1" /> Back
        </Button>
        <div className="flex-1 min-w-0">
          <h2 className="text-xl sm:text-2xl font-bold text-gradient-cyan">Order {order.orderNumber}</h2>
          <p className="text-muted-foreground text-sm">{formatDate(order.createdAt)}</p>
        </div>
        <Badge className={`${GLASS_STATUS_COLORS[order.status] || ''} text-sm px-3 py-1 w-fit`}>
          {getStatusLabel(order.status)}
        </Badge>
      </motion.div>

      {/* Order Timeline */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="glass-card rounded-xl p-4 sm:p-6"
      >
        <h3 className="text-lg font-semibold text-glow-cyan mb-6">Order Timeline</h3>
        {isCancelled || isRefunded ? (
          <div className="flex items-center gap-3 p-4 rounded-lg bg-red-500/10 border border-red-500/20">
            <XCircle className="h-6 w-6 text-red-400" />
            <div>
              <p className="font-semibold text-red-400">
                {isCancelled ? 'Order Cancelled' : 'Order Refunded'}
              </p>
              <p className="text-sm text-red-400/70">This order was {isCancelled ? 'cancelled' : 'refunded'}.</p>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-between relative">
            {/* Progress Bar */}
            <div className="absolute top-5 left-8 right-8 h-1 bg-white/5 rounded-full hidden sm:block">
              <div
                className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full transition-all duration-500 glow-cyan"
                style={{ width: `${currentStep >= 0 ? (currentStep / (ORDER_STEPS.length - 1)) * 100 : 0}%` }}
              />
            </div>

            {/* Mobile vertical timeline */}
            <div className="sm:hidden w-full space-y-4">
              {ORDER_STEPS.map((step, idx) => {
                const StepIcon = step.icon;
                const isCompleted = idx <= currentStep;
                const isCurrent = idx === currentStep;
                return (
                  <div key={step.key} className="flex items-center gap-3">
                    <div
                      className={`h-8 w-8 rounded-full flex items-center justify-center border-2 transition-all shrink-0 ${
                        isCompleted
                          ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400'
                          : 'bg-white/5 border-white/10 text-muted-foreground'
                      } ${isCurrent ? 'ring-4 ring-emerald-500/20 animate-pulse-glow' : ''}`}
                    >
                      <StepIcon className="h-4 w-4" />
                    </div>
                    <p className={`text-sm font-medium ${isCompleted ? 'text-emerald-400' : 'text-muted-foreground'}`}>
                      {step.label}
                    </p>
                  </div>
                );
              })}
            </div>

            {/* Desktop horizontal timeline */}
            <div className="hidden sm:flex items-center justify-between w-full relative">
              {ORDER_STEPS.map((step, idx) => {
                const StepIcon = step.icon;
                const isCompleted = idx <= currentStep;
                const isCurrent = idx === currentStep;
                return (
                  <div key={step.key} className="flex flex-col items-center relative z-10">
                    <div
                      className={`h-10 w-10 rounded-full flex items-center justify-center border-2 transition-all ${
                        isCompleted
                          ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400'
                          : 'bg-white/5 border-white/10 text-muted-foreground'
                      } ${isCurrent ? 'ring-4 ring-emerald-500/20 animate-pulse-glow' : ''}`}
                    >
                      <StepIcon className="h-5 w-5" />
                    </div>
                    <p className={`text-xs mt-2 font-medium ${isCompleted ? 'text-emerald-400' : 'text-muted-foreground'}`}>
                      {step.label}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Items */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-card rounded-xl p-4 sm:p-6"
        >
          <h3 className="text-lg font-semibold text-glow-cyan mb-4">Order Items</h3>
          <div className="space-y-3">
            {order.items.map((item) => (
              <div key={item.id} className="flex items-start gap-3 p-3 rounded-lg glass-light">
                <div className="h-10 w-10 rounded-lg bg-emerald-500/10 flex items-center justify-center flex-shrink-0 border border-emerald-500/10">
                  <Package className="h-5 w-5 text-emerald-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate text-foreground">
                    {item.product?.name || `Product #${item.productId}`}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Qty: {item.quantity >= 1000 ? `${(item.quantity / 1000).toFixed(0)}K` : item.quantity} × ${safeNum(item.price).toFixed(4)}
                  </p>
                  {item.deliveryData && (
                    <div className="mt-2 p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                      <p className="text-xs font-medium text-emerald-400 flex items-center gap-1">
                        <Truck className="h-3 w-3" /> Delivery Data:
                      </p>
                      <p className="text-xs text-emerald-400/80 mt-1 font-mono break-all">{item.deliveryData}</p>
                    </div>
                  )}
                </div>
                <p className="font-semibold text-sm text-gradient-gold">${safeNum(item.total).toFixed(2)}</p>
              </div>
            ))}
            <Separator className="bg-emerald-500/10" />
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="text-foreground">${safeNum(order.itemsPrice).toFixed(2)}</span>
              </div>
              {safeNum(order.discount) > 0 && (
                <div className="flex justify-between text-sm text-emerald-400">
                  <span>Discount</span>
                  <span>-${safeNum(order.discount).toFixed(2)}</span>
                </div>
              )}
              {safeNum(order.fee) > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Fee</span>
                  <span className="text-foreground">${safeNum(order.fee).toFixed(2)}</span>
                </div>
              )}
              <Separator className="bg-emerald-500/10" />
              <div className="flex justify-between font-semibold">
                <span className="text-foreground">Total</span>
                <span className="text-gradient-gold text-lg">${safeNum(order.total).toFixed(2)}</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Payment & Delivery Info */}
        <div className="space-y-6">
          {/* Payment Info */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="glass-card rounded-xl p-4 sm:p-6"
          >
            <h3 className="text-lg font-semibold text-glow-cyan mb-4">Payment Information</h3>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Method</span>
                <span className="font-medium text-foreground">{order.paymentMethod || 'USDT'}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Amount</span>
                <span className="font-medium text-gradient-gold">${safeNum(order.total).toFixed(2)}</span>
              </div>
              {(order as Record<string, unknown>).flashUsdtAmount ? (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Flash USDT Amount</span>
                  <span className="font-medium text-emerald-400">{Number((order as Record<string, unknown>).flashUsdtAmount).toLocaleString()} Flash USDT</span>
                </div>
              ) : null}
              {(order as Record<string, unknown>).paymentTxHash ? (
                <div className="p-3 rounded-lg glass-light">
                  <p className="text-xs text-muted-foreground mb-1">Transaction Hash</p>
                  <p className="text-xs font-mono text-emerald-400 break-all">{String((order as Record<string, unknown>).paymentTxHash)}</p>
                </div>
              ) : null}
              <div className="flex justify-between text-sm items-center">
                <span className="text-muted-foreground">Payment Status</span>
                <Badge
                  className={
                    order.paymentStatus === 'confirmed'
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      : order.paymentStatus === 'failed'
                        ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                        : order.paymentStatus === 'refunded'
                          ? 'bg-slate-500/20 text-slate-400 border border-slate-500/30'
                          : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                  }
                >
                  {getStatusLabel(order.paymentStatus)}
                </Badge>
              </div>
            </div>
          </motion.div>

          {/* Delivery Info */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="glass-card rounded-xl p-4 sm:p-6"
          >
            <h3 className="text-lg font-semibold text-glow-cyan mb-4">Delivery Information</h3>
            <div className="space-y-3">
              {(order as Record<string, unknown>).deliveryWalletAddress ? (
                <div className="p-3 rounded-lg glass-light border border-emerald-500/15">
                  <p className="text-xs text-muted-foreground mb-1">Delivery Wallet Address</p>
                  <p className="text-sm font-mono text-emerald-400 break-all">{String((order as Record<string, unknown>).deliveryWalletAddress)}</p>
                  {(order as Record<string, unknown>).deliveryWalletNetwork && (
                    <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 text-[10px] mt-1">
                      {String((order as Record<string, unknown>).deliveryWalletNetwork)}
                    </Badge>
                  )}
                </div>
              ) : null}
              <div className="flex justify-between text-sm items-center">
                <span className="text-muted-foreground">Delivery Type</span>
                <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20">
                  ⚡ Automatic
                </Badge>
              </div>
              <div className="flex justify-between text-sm items-center">
                <span className="text-muted-foreground">Delivery Status</span>
                <Badge
                  className={
                    order.deliveryStatus === 'delivered'
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                  }
                >
                  {getStatusLabel(order.deliveryStatus)}
                </Badge>
              </div>
              {order.items.some((i) => i.deliveryData) && (
                <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                  <p className="text-sm font-medium text-emerald-400 flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4" /> Products Delivered
                  </p>
                  <p className="text-xs text-emerald-400/70 mt-1">
                    Your product codes/keys are shown in the items section above.
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
