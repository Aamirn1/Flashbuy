'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import {
  ShoppingCart,
  Eye,
  RefreshCw,
  Search,
  Wallet,
  Hash,
  Image as ImageIcon,
  Zap,
  Copy,
  ExternalLink,
  ChevronDown,
  Package,
  Clock,
  DollarSign,
  CreditCard,
  Truck,
  FileText,
  ArrowUpDown,
} from 'lucide-react';

// ─── Status Colors ──────────────────────────────────────────────────────────

const GLASS_STATUS_COLORS: Record<string, string> = {
  pending: 'bg-amber-500/20 text-amber-400 border border-amber-500/30',
  payment_waiting: 'bg-orange-500/20 text-orange-400 border border-orange-500/30',
  paid: 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30',
  processing: 'bg-violet-500/20 text-violet-400 border border-violet-500/30',
  completed: 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30',
  cancelled: 'bg-red-500/20 text-red-400 border border-red-500/30',
  refunded: 'bg-slate-500/20 text-slate-400 border border-slate-500/30',
};

const PAYMENT_STATUS_COLORS: Record<string, string> = {
  pending: 'bg-amber-500/20 text-amber-400 border border-amber-500/30',
  confirmed: 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30',
  failed: 'bg-red-500/20 text-red-400 border border-red-500/30',
  expired: 'bg-slate-500/20 text-slate-400 border border-slate-500/30',
  refunded: 'bg-slate-500/20 text-slate-400 border border-slate-500/30',
};

// ─── Status Options ─────────────────────────────────────────────────────────

const STATUS_FILTER_OPTIONS: { value: string; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'pending', label: 'Pending' },
  { value: 'payment_waiting', label: 'Payment' },
  { value: 'paid', label: 'Paid' },
  { value: 'processing', label: 'Processing' },
  { value: 'completed', label: 'Completed' },
  { value: 'cancelled', label: 'Cancelled' },
  { value: 'refunded', label: 'Refunded' },
];

const ORDER_STATUS_OPTIONS = [
  'pending',
  'payment_waiting',
  'paid',
  'processing',
  'completed',
  'cancelled',
  'refunded',
] as const;

// ─── Types ──────────────────────────────────────────────────────────────────

interface AdminOrderUser {
  id: string;
  name: string;
  email: string;
  walletAddress?: string;
}

interface AdminOrderItem {
  id: string;
  productId: string;
  quantity: number;
  price: number;
  total: number;
  deliveryData?: string;
  product?: {
    id: string;
    name: string;
    images: string[];
    price: number;
    slug?: string;
  } | null;
}

interface AdminOrderPayment {
  id: string;
  orderId: string;
  method: string;
  amount: number;
  walletAddress?: string;
  txHash?: string;
  status: string;
  expiresAt?: string;
  createdAt: string;
}

interface AdminOrder {
  id: string;
  orderNumber: string;
  userId: string;
  status: string;
  itemsPrice: number;
  discount: number;
  fee: number;
  total: number;
  paymentMethod?: string;
  paymentStatus: string;
  deliveryStatus: string;
  deliveryWalletAddress?: string;
  deliveryWalletNetwork?: string;
  paymentTxHash?: string;
  paymentScreenshot?: string;
  flashUsdtAmount?: number;
  notes?: string;
  createdAt: string;
  user: AdminOrderUser;
  items: AdminOrderItem[];
  payment: AdminOrderPayment | null;
}

// ─── Helpers ────────────────────────────────────────────────────────────────

function getStatusLabel(status: string): string {
  return status.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function formatDateShort(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function copyToClipboard(text: string) {
  if (typeof navigator !== 'undefined' && navigator.clipboard) {
    navigator.clipboard.writeText(text);
  }
}

// ─── Component ──────────────────────────────────────────────────────────────

export function AdminOrders() {
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<AdminOrder | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [updating, setUpdating] = useState<string | null>(null);
  const [detailStatus, setDetailStatus] = useState<string>('');
  const [sortBy, setSortBy] = useState<'date' | 'total'>('date');
  const [copiedField, setCopiedField] = useState<string | null>(null);

  // ─── Fetch Orders ───────────────────────────────────────────────────────

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/orders');
      if (res.ok) {
        const data = await res.json();
        setOrders(data.orders || []);
      }
    } catch {
      // handle error silently
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  // ─── Filter & Sort ──────────────────────────────────────────────────────

  const filteredOrders = orders
    .filter((order) => {
      if (statusFilter !== 'all' && order.status !== statusFilter) return false;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        return (
          order.orderNumber.toLowerCase().includes(q) ||
          order.user?.name?.toLowerCase().includes(q) ||
          order.user?.email?.toLowerCase().includes(q) ||
          order.deliveryWalletAddress?.toLowerCase().includes(q) ||
          order.paymentTxHash?.toLowerCase().includes(q)
        );
      }
      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'total') return b.total - a.total;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

  // ─── Status Counts ──────────────────────────────────────────────────────

  const statusCounts = orders.reduce<Record<string, number>>((acc, order) => {
    acc[order.status] = (acc[order.status] || 0) + 1;
    return acc;
  }, {});

  // ─── Handle Status Change ───────────────────────────────────────────────

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
          prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
        );
        if (selectedOrder?.id === orderId) {
          setSelectedOrder((prev) => (prev ? { ...prev, status: newStatus } : null));
        }
      }
    } catch {
      // handle error silently
    } finally {
      setUpdating(null);
    }
  };

  // ─── Handle Detail Status Save ──────────────────────────────────────────

  const handleDetailStatusSave = async () => {
    if (!selectedOrder || detailStatus === selectedOrder.status) return;
    await handleStatusChange(selectedOrder.id, detailStatus);
  };

  // ─── Open Detail ────────────────────────────────────────────────────────

  const openDetail = (order: AdminOrder) => {
    setSelectedOrder(order);
    setDetailStatus(order.status);
    setDetailOpen(true);
  };

  // ─── Copy with feedback ─────────────────────────────────────────────────

  const handleCopy = (text: string, field: string) => {
    copyToClipboard(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  // ─── Loading State ──────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <Skeleton className="h-10 w-48 bg-white/5" />
          <Skeleton className="h-8 w-64 bg-white/5" />
        </div>
        <div className="flex gap-2 flex-wrap">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-8 w-20 rounded-full bg-white/5" />
          ))}
        </div>
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-32 w-full bg-white/5 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  // ─── Render ─────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
      >
        <div>
          <h2 className="text-2xl font-bold text-gradient-cyan">Orders</h2>
          <p className="text-muted-foreground text-sm">
            Manage and track all customer orders
          </p>
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:flex-initial">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-emerald-400/50" />
            <Input
              placeholder="Search orders..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 glass-input sm:w-[240px]"
            />
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="glass-light text-emerald-400 hover:bg-emerald-500/10 hover:text-emerald-300"
            onClick={fetchOrders}
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </motion.div>

      {/* Status Filter Pills */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="flex gap-2 flex-wrap"
      >
        {STATUS_FILTER_OPTIONS.map((opt) => {
          const isActive = statusFilter === opt.value;
          const count =
            opt.value === 'all'
              ? orders.length
              : statusCounts[opt.value] || 0;
          return (
            <button
              key={opt.value}
              onClick={() => setStatusFilter(opt.value)}
              className={`rounded-full px-3 py-1.5 text-xs font-medium transition-all flex items-center gap-1.5 ${
                isActive
                  ? 'glass-light border-emerald-500/30 text-emerald-400'
                  : 'text-muted-foreground hover:text-foreground hover:bg-white/5'
              }`}
            >
              {opt.label}
              {count > 0 && (
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                    isActive
                      ? 'bg-emerald-500/20 text-emerald-400'
                      : 'bg-white/5 text-muted-foreground'
                  }`}
                >
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </motion.div>

      {/* Sort & Results Info */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="flex items-center justify-between text-xs text-muted-foreground"
      >
        <span>
          {filteredOrders.length} order{filteredOrders.length !== 1 ? 's' : ''} found
        </span>
        <button
          onClick={() => setSortBy(sortBy === 'date' ? 'total' : 'date')}
          className="flex items-center gap-1 hover:text-foreground transition-colors"
        >
          <ArrowUpDown className="h-3 w-3" />
          Sort by {sortBy === 'date' ? 'Date' : 'Total'}
        </button>
      </motion.div>

      {/* Order Cards List */}
      <AnimatePresence mode="popLayout">
        {filteredOrders.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card rounded-xl p-12 flex flex-col items-center justify-center text-muted-foreground"
          >
            <ShoppingCart className="h-16 w-16 mb-4 opacity-30" />
            <p className="text-lg font-medium">No orders found</p>
            <p className="text-sm mt-1">
              {searchQuery || statusFilter !== 'all'
                ? 'Try adjusting your search or filter criteria.'
                : 'Orders will appear here when customers make purchases.'}
            </p>
          </motion.div>
        ) : (
          <div className="space-y-3">
            {filteredOrders.map((order, idx) => (
              <motion.div
                key={order.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ delay: idx * 0.03 }}
                onClick={() => openDetail(order)}
                className="glass-card glass-card-hover rounded-xl p-4 sm:p-5 cursor-pointer group"
              >
                <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
                  {/* Left: Order Info */}
                  <div className="flex-1 min-w-0 space-y-2">
                    {/* Order Number & Date */}
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono text-sm font-semibold text-emerald-400">
                        #{order.orderNumber}
                      </span>
                      <Badge
                        className={`text-[10px] px-2 py-0 ${GLASS_STATUS_COLORS[order.status] || ''}`}
                      >
                        {getStatusLabel(order.status)}
                      </Badge>
                      <Badge
                        className={`text-[10px] px-2 py-0 ${PAYMENT_STATUS_COLORS[order.paymentStatus] || 'bg-amber-500/20 text-amber-400 border border-amber-500/30'}`}
                      >
                        {getStatusLabel(order.paymentStatus)}
                      </Badge>
                    </div>

                    {/* Customer */}
                    <div className="flex items-center gap-2 text-sm">
                      <div className="h-6 w-6 rounded-full bg-emerald-500/15 flex items-center justify-center flex-shrink-0 border border-emerald-500/20">
                        <span className="text-[10px] font-medium text-emerald-400">
                          {order.user?.name
                            ?.split(' ')
                            .map((n) => n[0])
                            .join('')
                            .toUpperCase()
                            .slice(0, 2) || '??'}
                        </span>
                      </div>
                      <span className="text-foreground truncate">
                        {order.user?.name || 'Unknown'}
                      </span>
                      <span className="text-muted-foreground text-xs hidden sm:inline">
                        {order.user?.email || ''}
                      </span>
                    </div>

                    {/* Items Preview */}
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Package className="h-3 w-3 text-emerald-400/50 flex-shrink-0" />
                      <span className="truncate">
                        {order.items
                          .map(
                            (item) =>
                              `${item.product?.name || `Product #${item.productId}`} ×${item.quantity}`
                          )
                          .join(', ')}
                      </span>
                    </div>

                    {/* FlashUSDT & Delivery Wallet Preview */}
                    <div className="flex items-center gap-3 flex-wrap">
                      {order.flashUsdtAmount && (
                        <div className="flex items-center gap-1 text-xs">
                          <Zap className="h-3 w-3 text-amber-400" />
                          <span className="text-amber-400 font-medium">
                            {order.flashUsdtAmount} FlashUSDT
                          </span>
                        </div>
                      )}
                      {order.deliveryWalletAddress && (
                        <div className="flex items-center gap-1 text-xs">
                          <Wallet className="h-3 w-3 text-emerald-400/50" />
                          <span className="text-muted-foreground font-mono truncate max-w-[180px]">
                            {order.deliveryWalletAddress}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right: Total & Actions */}
                  <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-2 sm:min-w-[120px]">
                    <div className="text-right">
                      <p className="text-lg font-bold text-gradient-gold">
                        ${order.total.toFixed(2)}
                      </p>
                      <p className="text-[10px] text-muted-foreground flex items-center gap-1 justify-end">
                        <Clock className="h-3 w-3" />
                        {formatDateShort(order.createdAt)}
                      </p>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-emerald-400 hover:bg-emerald-500/10 h-8 w-8 p-0"
                        onClick={(e) => {
                          e.stopPropagation();
                          openDetail(order);
                        }}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Select
                        value={order.status}
                        onValueChange={(v) => {
                          handleStatusChange(order.id, v);
                        }}
                        disabled={updating === order.id}
                      >
                        <SelectTrigger
                          className="h-8 w-8 p-0 border-0 bg-transparent hover:bg-emerald-500/10 [&>svg]:hidden"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="glass-strong border-emerald-500/20">
                          {ORDER_STATUS_OPTIONS.map((s) => (
                            <SelectItem key={s} value={s}>
                              <span className="flex items-center gap-2">
                                <span
                                  className={`inline-block h-2 w-2 rounded-full ${
                                    s === 'completed' || s === 'paid'
                                      ? 'bg-emerald-400'
                                      : s === 'cancelled' || s === 'refunded'
                                        ? 'bg-red-400'
                                        : s === 'processing'
                                          ? 'bg-violet-400'
                                          : s === 'payment_waiting'
                                            ? 'bg-orange-400'
                                            : 'bg-amber-400'
                                  }`}
                                />
                                {getStatusLabel(s)}
                              </span>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </AnimatePresence>

      {/* ─── Order Detail Dialog ────────────────────────────────────────── */}

      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="glass-strong border-emerald-500/20 sm:max-w-[680px] max-h-[90vh] overflow-y-auto">
          {selectedOrder && (
            <>
              <DialogHeader>
                <DialogTitle className="text-gradient-cyan flex items-center gap-2">
                  <ShoppingCart className="h-5 w-5 text-emerald-400" />
                  Order #{selectedOrder.orderNumber}
                </DialogTitle>
                <DialogDescription className="text-muted-foreground">
                  {formatDate(selectedOrder.createdAt)} ·{' '}
                  {selectedOrder.user?.name || 'Unknown Customer'}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-5 py-2">
                {/* ── Status Badges ── */}
                <div className="flex flex-wrap items-center gap-2">
                  <Badge
                    className={`${GLASS_STATUS_COLORS[selectedOrder.status] || ''} text-xs`}
                  >
                    {getStatusLabel(selectedOrder.status)}
                  </Badge>
                  <Badge
                    className={`${PAYMENT_STATUS_COLORS[selectedOrder.paymentStatus] || 'bg-amber-500/20 text-amber-400 border border-amber-500/30'} text-xs`}
                  >
                    <CreditCard className="h-3 w-3 mr-1" />
                    Payment: {getStatusLabel(selectedOrder.paymentStatus)}
                  </Badge>
                  {selectedOrder.deliveryStatus && (
                    <Badge className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs">
                      <Truck className="h-3 w-3 mr-1" />
                      {getStatusLabel(selectedOrder.deliveryStatus)}
                    </Badge>
                  )}
                </div>

                {/* ── Customer Info ── */}
                <div className="glass-light rounded-xl p-4">
                  <h4 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                    <span className="h-5 w-5 rounded-full bg-emerald-500/15 flex items-center justify-center border border-emerald-500/20 text-[10px] font-medium text-emerald-400">
                      {selectedOrder.user?.name
                        ?.split(' ')
                        .map((n) => n[0])
                        .join('')
                        .toUpperCase()
                        .slice(0, 2) || '??'}
                    </span>
                    Customer
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <p className="text-muted-foreground text-xs">Name</p>
                      <p className="text-sm text-foreground font-medium">
                        {selectedOrder.user?.name || 'Unknown'}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground text-xs">Email</p>
                      <p className="text-sm text-foreground">
                        {selectedOrder.user?.email || 'N/A'}
                      </p>
                    </div>
                    {selectedOrder.user?.walletAddress && (
                      <div className="sm:col-span-2">
                        <p className="text-muted-foreground text-xs">
                          Customer Wallet
                        </p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <p className="text-sm text-emerald-400 font-mono truncate">
                            {selectedOrder.user.walletAddress}
                          </p>
                          <button
                            onClick={() =>
                              handleCopy(
                                selectedOrder.user!.walletAddress!,
                                'userWallet'
                              )
                            }
                            className="text-emerald-400/50 hover:text-emerald-400 transition-colors flex-shrink-0"
                          >
                            <Copy className="h-3.5 w-3.5" />
                          </button>
                          {copiedField === 'userWallet' && (
                            <span className="text-[10px] text-emerald-400">
                              Copied!
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* ── Payment Details ── */}
                <div className="glass-light rounded-xl p-4">
                  <h4 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                    <CreditCard className="h-4 w-4 text-emerald-400" />
                    Payment Details
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <p className="text-muted-foreground text-xs">
                        Payment Method
                      </p>
                      <p className="text-sm text-foreground font-medium">
                        {selectedOrder.paymentMethod ||
                          selectedOrder.payment?.method ||
                          'N/A'}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground text-xs">
                        Payment Status
                      </p>
                      <Badge
                        className={`${PAYMENT_STATUS_COLORS[selectedOrder.paymentStatus] || 'bg-amber-500/20 text-amber-400 border border-amber-500/30'} mt-0.5 text-xs`}
                      >
                        {getStatusLabel(selectedOrder.paymentStatus)}
                      </Badge>
                    </div>

                    {/* Transaction Hash */}
                    {(selectedOrder.paymentTxHash ||
                      selectedOrder.payment?.txHash) && (
                      <div className="sm:col-span-2">
                        <p className="text-muted-foreground text-xs flex items-center gap-1">
                          <Hash className="h-3 w-3" />
                          Transaction Hash
                        </p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <p className="text-sm text-emerald-400 font-mono truncate">
                            {selectedOrder.paymentTxHash ||
                              selectedOrder.payment?.txHash}
                          </p>
                          <button
                            onClick={() =>
                              handleCopy(
                                selectedOrder.paymentTxHash ||
                                  selectedOrder.payment!.txHash!,
                                'txHash'
                              )
                            }
                            className="text-emerald-400/50 hover:text-emerald-400 transition-colors flex-shrink-0"
                          >
                            <Copy className="h-3.5 w-3.5" />
                          </button>
                          {copiedField === 'txHash' && (
                            <span className="text-[10px] text-emerald-400">
                              Copied!
                            </span>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Payment Screenshot */}
                    {(selectedOrder.paymentScreenshot) && (
                      <div className="sm:col-span-2">
                        <p className="text-muted-foreground text-xs flex items-center gap-1 mb-2">
                          <ImageIcon className="h-3 w-3" />
                          Payment Screenshot
                        </p>
                        <div className="rounded-lg overflow-hidden border border-emerald-500/20 max-w-md">
                          <img
                            src={selectedOrder.paymentScreenshot}
                            alt="Payment proof"
                            className="w-full h-auto object-cover max-h-[300px]"
                          />
                        </div>
                      </div>
                    )}

                    {/* Payment wallet from payment record */}
                    {selectedOrder.payment?.walletAddress && (
                      <div className="sm:col-span-2">
                        <p className="text-muted-foreground text-xs">
                          Payment Wallet Address
                        </p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <p className="text-sm text-foreground font-mono truncate">
                            {selectedOrder.payment.walletAddress}
                          </p>
                          <button
                            onClick={() =>
                              handleCopy(
                                selectedOrder.payment!.walletAddress!,
                                'payWallet'
                              )
                            }
                            className="text-emerald-400/50 hover:text-emerald-400 transition-colors flex-shrink-0"
                          >
                            <Copy className="h-3.5 w-3.5" />
                          </button>
                          {copiedField === 'payWallet' && (
                            <span className="text-[10px] text-emerald-400">
                              Copied!
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* ── Delivery / FlashUSDT Info ── */}
                <div className="glass-light rounded-xl p-4">
                  <h4 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                    <Zap className="h-4 w-4 text-amber-400" />
                    Delivery & FlashUSDT
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {/* FlashUSDT Amount */}
                    {selectedOrder.flashUsdtAmount != null && (
                      <div className="sm:col-span-2 glass-light rounded-lg p-3 border border-amber-500/15">
                        <p className="text-muted-foreground text-xs">
                          FlashUSDT Amount Ordered
                        </p>
                        <p className="text-xl font-bold text-gradient-gold mt-0.5">
                          {selectedOrder.flashUsdtAmount} FlashUSDT
                        </p>
                      </div>
                    )}

                    {/* Delivery Wallet Address */}
                    <div className={selectedOrder.deliveryWalletAddress ? 'sm:col-span-2' : ''}>
                      <p className="text-muted-foreground text-xs flex items-center gap-1">
                        <Wallet className="h-3 w-3" />
                        Delivery Wallet Address
                      </p>
                      {selectedOrder.deliveryWalletAddress ? (
                        <div className="flex items-center gap-2 mt-0.5">
                          <p className="text-sm text-emerald-400 font-mono truncate">
                            {selectedOrder.deliveryWalletAddress}
                          </p>
                          <button
                            onClick={() =>
                              handleCopy(
                                selectedOrder.deliveryWalletAddress!,
                                'delWallet'
                              )
                            }
                            className="text-emerald-400/50 hover:text-emerald-400 transition-colors flex-shrink-0"
                          >
                            <Copy className="h-3.5 w-3.5" />
                          </button>
                          {copiedField === 'delWallet' && (
                            <span className="text-[10px] text-emerald-400">
                              Copied!
                            </span>
                          )}
                        </div>
                      ) : (
                        <p className="text-sm text-muted-foreground mt-0.5">
                          Not provided
                        </p>
                      )}
                    </div>

                    {/* Delivery Wallet Network */}
                    {selectedOrder.deliveryWalletNetwork && (
                      <div>
                        <p className="text-muted-foreground text-xs">
                          Delivery Network
                        </p>
                        <Badge className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 mt-0.5">
                          {selectedOrder.deliveryWalletNetwork}
                        </Badge>
                      </div>
                    )}

                    {/* Delivery Status */}
                    <div>
                      <p className="text-muted-foreground text-xs">
                        Delivery Status
                      </p>
                      <Badge className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 mt-0.5">
                        <Truck className="h-3 w-3 mr-1" />
                        {getStatusLabel(selectedOrder.deliveryStatus)}
                      </Badge>
                    </div>
                  </div>
                </div>

                {/* ── Order Items ── */}
                <div className="glass-light rounded-xl p-4">
                  <h4 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                    <Package className="h-4 w-4 text-emerald-400" />
                    Order Items ({selectedOrder.items.length})
                  </h4>
                  <div className="space-y-2">
                    {selectedOrder.items.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/[0.02] transition-colors"
                      >
                        {/* Product Image */}
                        {item.product?.images?.[0] ? (
                          <div className="h-10 w-10 rounded-lg bg-emerald-500/10 overflow-hidden flex-shrink-0 border border-emerald-500/10">
                            <img
                              src={item.product.images[0]}
                              alt={item.product.name}
                              className="h-full w-full object-cover"
                            />
                          </div>
                        ) : (
                          <div className="h-10 w-10 rounded-lg bg-emerald-500/10 flex items-center justify-center flex-shrink-0 border border-emerald-500/10">
                            <Package className="h-5 w-5 text-emerald-400/50" />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-foreground truncate">
                            {item.product?.name || `Product #${item.productId}`}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            ${item.price.toFixed(2)} × {item.quantity}
                          </p>
                        </div>
                        <p className="text-sm font-semibold text-gradient-gold flex-shrink-0">
                          ${item.total.toFixed(2)}
                        </p>
                      </div>
                    ))}
                  </div>

                  {/* Price Breakdown */}
                  <Separator className="my-3 bg-emerald-500/15" />
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Subtotal</span>
                      <span className="text-foreground">
                        ${selectedOrder.itemsPrice.toFixed(2)}
                      </span>
                    </div>
                    {selectedOrder.discount > 0 && (
                      <div className="flex justify-between text-sm">
                        <span className="text-emerald-400">Discount</span>
                        <span className="text-emerald-400">
                          -${selectedOrder.discount.toFixed(2)}
                        </span>
                      </div>
                    )}
                    {selectedOrder.fee > 0 && (
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Fee</span>
                        <span className="text-foreground">
                          ${selectedOrder.fee.toFixed(2)}
                        </span>
                      </div>
                    )}
                    <Separator className="my-2 bg-emerald-500/15" />
                    <div className="flex justify-between font-bold">
                      <span className="text-foreground">Total</span>
                      <span className="text-gradient-gold text-lg">
                        ${selectedOrder.total.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* ── Notes ── */}
                {selectedOrder.notes && (
                  <div className="glass-light rounded-xl p-4">
                    <h4 className="text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
                      <FileText className="h-4 w-4 text-emerald-400" />
                      Notes
                    </h4>
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                      {selectedOrder.notes}
                    </p>
                  </div>
                )}

                {/* ── Status Change ── */}
                <div className="glass-light rounded-xl p-4">
                  <h4 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-emerald-400" />
                    Change Order Status
                  </h4>
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                    <Select
                      value={detailStatus}
                      onValueChange={setDetailStatus}
                    >
                      <SelectTrigger className="glass-input sm:w-[220px]">
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent className="glass-strong border-emerald-500/20">
                        {ORDER_STATUS_OPTIONS.map((s) => (
                          <SelectItem key={s} value={s}>
                            <span className="flex items-center gap-2">
                              <span
                                className={`inline-block h-2 w-2 rounded-full ${
                                  s === 'completed' || s === 'paid'
                                    ? 'bg-emerald-400'
                                    : s === 'cancelled' || s === 'refunded'
                                      ? 'bg-red-400'
                                      : s === 'processing'
                                        ? 'bg-violet-400'
                                        : s === 'payment_waiting'
                                          ? 'bg-orange-400'
                                          : 'bg-amber-400'
                                }`}
                              />
                              {getStatusLabel(s)}
                            </span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button
                      className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/30 disabled:opacity-50"
                      onClick={handleDetailStatusSave}
                      disabled={
                        updating === selectedOrder.id ||
                        detailStatus === selectedOrder.status
                      }
                    >
                      {updating === selectedOrder.id ? (
                        <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                      ) : null}
                      Update Status
                    </Button>
                  </div>
                  {detailStatus !== selectedOrder.status && detailStatus && (
                    <p className="text-xs text-amber-400 mt-2">
                      Status will change from{' '}
                      <strong>{getStatusLabel(selectedOrder.status)}</strong> to{' '}
                      <strong>{getStatusLabel(detailStatus)}</strong>
                    </p>
                  )}
                </div>
              </div>

              <DialogFooter>
                <Button
                  variant="ghost"
                  className="text-muted-foreground"
                  onClick={() => setDetailOpen(false)}
                >
                  Close
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
