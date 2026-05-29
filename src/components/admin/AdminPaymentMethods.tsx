'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { PaymentMethodConfig } from '@/lib/types';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Plus,
  Pencil,
  Trash2,
  RefreshCw,
  CreditCard,
  Copy,
  Check,
  Wallet,
  Clock,
  ShieldCheck,
  Camera,
  Hash,
} from 'lucide-react';

// ─── Form Data ───────────────────────────────────────────────────────

interface PaymentMethodFormData {
  name: string;
  network: string;
  walletAddress: string;
  icon: string;
  estimatedTime: string;
  confirmations: string;
  requireTxId: boolean;
  requireScreenshot: boolean;
  isActive: boolean;
  sortOrder: string;
}

const emptyForm: PaymentMethodFormData = {
  name: '',
  network: '',
  walletAddress: '',
  icon: '💰',
  estimatedTime: '3-5 minutes',
  confirmations: '20',
  requireTxId: false,
  requireScreenshot: false,
  isActive: true,
  sortOrder: '0',
};

// ─── Helpers ─────────────────────────────────────────────────────────

function truncateAddress(address: string | undefined | null, chars = 6): string {
  if (!address) return '—';
  if (address.length <= chars * 2 + 3) return address;
  return `${address.slice(0, chars + 2)}...${address.slice(-chars)}`;
}

function copyToClipboard(text: string) {
  if (typeof navigator !== 'undefined' && navigator.clipboard) {
    navigator.clipboard.writeText(text);
  }
}

// ─── Component ───────────────────────────────────────────────────────

export function AdminPaymentMethods() {
  const [methods, setMethods] = useState<PaymentMethodConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<PaymentMethodFormData>(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  // ── Fetch ──────────────────────────────────────────────────────────

  const fetchMethods = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/payment-methods');
      if (res.ok) {
        const data = await res.json();
        setMethods(data.methods || []);
      }
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMethods();
  }, [fetchMethods]);

  // ── Toggle helpers ─────────────────────────────────────────────────

  const toggleField = async (
    id: string,
    field: 'isActive' | 'requireTxId' | 'requireScreenshot',
    value: boolean
  ) => {
    setTogglingId(id);
    // Optimistic update
    setMethods((prev) =>
      prev.map((m) => (m.id === id ? { ...m, [field]: value } : m))
    );
    try {
      const res = await fetch(`/api/admin/payment-methods/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ [field]: value }),
      });
      if (!res.ok) {
        // Revert on failure
        setMethods((prev) =>
          prev.map((m) => (m.id === id ? { ...m, [field]: !value } : m))
        );
      }
    } catch {
      setMethods((prev) =>
        prev.map((m) => (m.id === id ? { ...m, [field]: !value } : m))
      );
    } finally {
      setTogglingId(null);
    }
  };

  // ── Dialog handlers ────────────────────────────────────────────────

  const handleOpenCreate = () => {
    setEditId(null);
    setForm(emptyForm);
    setDialogOpen(true);
  };

  const handleOpenEdit = (method: PaymentMethodConfig) => {
    setEditId(method.id);
    setForm({
      name: method.name,
      network: method.network || '',
      walletAddress: method.walletAddress || '',
      icon: method.icon || '💰',
      estimatedTime: method.estimatedTime || '3-5 minutes',
      confirmations: method.confirmations?.toString() || '20',
      requireTxId: method.requireTxId,
      requireScreenshot: method.requireScreenshot,
      isActive: method.isActive,
      sortOrder: method.sortOrder?.toString() || '0',
    });
    setDialogOpen(true);
  };

  const handleSubmit = async () => {
    if (!form.name) return;
    setSubmitting(true);
    try {
      const payload = {
        name: form.name,
        network: form.network || undefined,
        walletAddress: form.walletAddress || undefined,
        icon: form.icon || undefined,
        estimatedTime: form.estimatedTime || undefined,
        confirmations: form.confirmations ? parseInt(form.confirmations, 10) : undefined,
        requireTxId: form.requireTxId,
        requireScreenshot: form.requireScreenshot,
        isActive: form.isActive,
        sortOrder: form.sortOrder ? parseInt(form.sortOrder, 10) : undefined,
      };

      const url = editId
        ? `/api/admin/payment-methods/${editId}`
        : '/api/admin/payment-methods';
      const method = editId ? 'PATCH' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        setDialogOpen(false);
        fetchMethods();
      }
    } catch {
      // silent
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/payment-methods/${id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setDeleteConfirm(null);
        fetchMethods();
      }
    } catch {
      // silent
    }
  };

  const handleCopy = (id: string, address: string) => {
    copyToClipboard(address);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // ── Loading state ──────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-48 bg-white/5" />
          <Skeleton className="h-10 w-36 bg-white/5" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-56 w-full bg-white/5 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  // ── Empty state ────────────────────────────────────────────────────

  const activeCount = methods.filter((m) => m.isActive).length;

  // ── Render ─────────────────────────────────────────────────────────

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
      >
        <div>
          <h2 className="text-2xl font-bold text-gradient-cyan">
            Payment Methods
          </h2>
          <p className="text-muted-foreground text-sm mt-1">
            Manage crypto &amp; payment options ·{' '}
            <span className="text-emerald-400">{activeCount}</span> of{' '}
            {methods.length} active
          </p>
        </div>
        <button
          onClick={handleOpenCreate}
          className="flex items-center gap-2 rounded-xl px-4 py-2.5 bg-emerald-500/15 text-emerald-400 font-semibold text-sm border border-emerald-500/30 hover:bg-emerald-500/25 transition-all glow-cyan"
        >
          <Plus className="h-4 w-4" /> Add Method
        </button>
      </motion.div>

      {/* Grid / Empty */}
      {methods.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-card rounded-xl flex flex-col items-center justify-center py-20 text-center"
        >
          <div className="h-16 w-16 rounded-2xl bg-emerald-500/10 flex items-center justify-center mb-4 border border-emerald-500/10">
            <CreditCard className="h-8 w-8 text-emerald-400/40" />
          </div>
          <p className="text-lg font-medium text-foreground">
            No payment methods
          </p>
          <p className="text-sm text-muted-foreground mt-1 max-w-xs">
            Add your first payment method to start accepting crypto payments.
          </p>
          <button
            onClick={handleOpenCreate}
            className="mt-6 flex items-center gap-2 rounded-xl px-5 py-2.5 bg-emerald-500/15 text-emerald-400 font-semibold text-sm border border-emerald-500/30 hover:bg-emerald-500/25 transition-all"
          >
            <Plus className="h-4 w-4" /> Add Payment Method
          </button>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <AnimatePresence mode="popLayout">
            {methods.map((method, idx) => (
              <motion.div
                key={method.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ delay: idx * 0.05 }}
                className={`glass-card glass-card-hover rounded-xl p-5 border transition-colors ${
                  method.isActive
                    ? 'border-emerald-500/15'
                    : 'border-white/5 opacity-70'
                }`}
              >
                {/* Card Top: Icon + Name + Status */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="h-11 w-11 rounded-xl bg-emerald-500/10 flex items-center justify-center text-xl flex-shrink-0 border border-emerald-500/10">
                      {method.icon || '💰'}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-semibold text-foreground text-sm truncate">
                          {method.name}
                        </h3>
                        <Badge
                          className={`text-[10px] px-1.5 py-0 ${
                            method.isActive
                              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                              : 'bg-slate-500/20 text-slate-400 border border-slate-500/30'
                          }`}
                        >
                          {method.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </div>
                      {method.network && (
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {method.network}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Quick Actions */}
                  <div className="flex items-center gap-0.5 flex-shrink-0">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-emerald-400 hover:bg-emerald-500/10 h-8 w-8 p-0"
                      onClick={() => handleOpenEdit(method)}
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-red-400 hover:bg-red-500/10 h-8 w-8 p-0"
                      onClick={() => setDeleteConfirm(method.id)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>

                {/* Wallet Address */}
                {method.walletAddress && (
                  <div className="mt-3 glass-light rounded-lg px-3 py-2 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <Wallet className="h-3.5 w-3.5 text-emerald-400/60 flex-shrink-0" />
                      <span className="text-xs font-mono text-muted-foreground truncate">
                        {truncateAddress(method.walletAddress, 8)}
                      </span>
                    </div>
                    <button
                      onClick={() => handleCopy(method.id, method.walletAddress!)}
                      className="flex-shrink-0 text-emerald-400/60 hover:text-emerald-400 transition-colors"
                    >
                      {copiedId === method.id ? (
                        <Check className="h-3.5 w-3.5 text-emerald-400" />
                      ) : (
                        <Copy className="h-3.5 w-3.5" />
                      )}
                    </button>
                  </div>
                )}

                {/* Info badges */}
                <div className="mt-3 flex items-center gap-2 flex-wrap">
                  <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
                    <Clock className="h-3 w-3 text-emerald-400/50" />
                    {method.estimatedTime}
                  </div>
                  <span className="text-emerald-500/30">·</span>
                  <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
                    <ShieldCheck className="h-3 w-3 text-emerald-400/50" />
                    {method.confirmations} confs
                  </div>
                  <span className="text-emerald-500/30">·</span>
                  <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
                    #{method.sortOrder}
                  </div>
                </div>

                <Separator className="my-3 bg-emerald-500/10" />

                {/* Toggle Row */}
                <div className="space-y-2.5">
                  {/* Active Toggle */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CreditCard className="h-3.5 w-3.5 text-emerald-400/50" />
                      <span className="text-xs text-muted-foreground">
                        Active
                      </span>
                    </div>
                    <Switch
                      checked={method.isActive}
                      onCheckedChange={(v) =>
                        toggleField(method.id, 'isActive', v)
                      }
                      disabled={togglingId === method.id}
                      className="data-[state=checked]:bg-emerald-500"
                    />
                  </div>

                  {/* Require TxId Toggle */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Hash className="h-3.5 w-3.5 text-emerald-400/50" />
                      <span className="text-xs text-muted-foreground">
                        Require Tx ID
                      </span>
                    </div>
                    <Switch
                      checked={method.requireTxId}
                      onCheckedChange={(v) =>
                        toggleField(method.id, 'requireTxId', v)
                      }
                      disabled={togglingId === method.id}
                      className="data-[state=checked]:bg-emerald-500"
                    />
                  </div>

                  {/* Require Screenshot Toggle */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Camera className="h-3.5 w-3.5 text-emerald-400/50" />
                      <span className="text-xs text-muted-foreground">
                        Require Screenshot
                      </span>
                    </div>
                    <Switch
                      checked={method.requireScreenshot}
                      onCheckedChange={(v) =>
                        toggleField(method.id, 'requireScreenshot', v)
                      }
                      disabled={togglingId === method.id}
                      className="data-[state=checked]:bg-emerald-500"
                    />
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* ── Add / Edit Dialog ──────────────────────────────────────── */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="glass-strong border-emerald-500/20 sm:max-w-[540px] max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-gradient-cyan">
              {editId ? 'Edit Payment Method' : 'Add Payment Method'}
            </DialogTitle>
            <DialogDescription className="text-muted-foreground">
              {editId
                ? 'Update payment method configuration'
                : 'Configure a new payment method for your store'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Row 1: Name + Icon */}
            <div className="grid grid-cols-[1fr_80px] gap-4">
              <div className="space-y-2">
                <Label className="text-foreground">Method Name *</Label>
                <Input
                  placeholder="e.g., USDT TRC20"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="glass-input"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-foreground">Icon</Label>
                <Input
                  placeholder="💰"
                  value={form.icon}
                  onChange={(e) => setForm({ ...form, icon: e.target.value })}
                  className="glass-input text-center text-lg"
                  maxLength={4}
                />
              </div>
            </div>

            {/* Row 2: Network + Sort Order */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-foreground">Network</Label>
                <Input
                  placeholder="e.g., TRC20, BEP20"
                  value={form.network}
                  onChange={(e) =>
                    setForm({ ...form, network: e.target.value })
                  }
                  className="glass-input"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-foreground">Sort Order</Label>
                <Input
                  type="number"
                  placeholder="0"
                  value={form.sortOrder}
                  onChange={(e) =>
                    setForm({ ...form, sortOrder: e.target.value })
                  }
                  min="0"
                  className="glass-input"
                />
              </div>
            </div>

            {/* Wallet Address */}
            <div className="space-y-2">
              <Label className="text-foreground">Wallet Address</Label>
              <Input
                placeholder="T9yD14Nj9j7xAB4dbGeiX9h8unk..."
                value={form.walletAddress}
                onChange={(e) =>
                  setForm({ ...form, walletAddress: e.target.value })
                }
                className="glass-input font-mono text-sm"
              />
            </div>

            {/* Row 3: Estimated Time + Confirmations */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-foreground">Estimated Time</Label>
                <Input
                  placeholder="3-5 minutes"
                  value={form.estimatedTime}
                  onChange={(e) =>
                    setForm({ ...form, estimatedTime: e.target.value })
                  }
                  className="glass-input"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-foreground">Confirmations</Label>
                <Input
                  type="number"
                  placeholder="20"
                  value={form.confirmations}
                  onChange={(e) =>
                    setForm({ ...form, confirmations: e.target.value })
                  }
                  min="0"
                  className="glass-input"
                />
              </div>
            </div>

            <Separator className="bg-emerald-500/10" />

            {/* Toggles as Checkboxes */}
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Checkbox
                  id="pm-active"
                  checked={form.isActive}
                  onCheckedChange={(v) =>
                    setForm({ ...form, isActive: v as boolean })
                  }
                  className="data-[state=checked]:bg-emerald-500 data-[state=checked]:border-emerald-500"
                />
                <Label htmlFor="pm-active" className="text-foreground text-sm cursor-pointer">
                  Active — enable this method for customers
                </Label>
              </div>
              <div className="flex items-center gap-3">
                <Checkbox
                  id="pm-txid"
                  checked={form.requireTxId}
                  onCheckedChange={(v) =>
                    setForm({ ...form, requireTxId: v as boolean })
                  }
                  className="data-[state=checked]:bg-emerald-500 data-[state=checked]:border-emerald-500"
                />
                <Label htmlFor="pm-txid" className="text-foreground text-sm cursor-pointer">
                  Require Transaction ID — ask user for tx hash
                </Label>
              </div>
              <div className="flex items-center gap-3">
                <Checkbox
                  id="pm-screenshot"
                  checked={form.requireScreenshot}
                  onCheckedChange={(v) =>
                    setForm({ ...form, requireScreenshot: v as boolean })
                  }
                  className="data-[state=checked]:bg-emerald-500 data-[state=checked]:border-emerald-500"
                />
                <Label
                  htmlFor="pm-screenshot"
                  className="text-foreground text-sm cursor-pointer"
                >
                  Require Screenshot — ask user for payment proof
                </Label>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="ghost"
              className="text-muted-foreground"
              onClick={() => setDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/30"
              onClick={handleSubmit}
              disabled={submitting || !form.name}
            >
              {submitting ? (
                <RefreshCw className="h-4 w-4 animate-spin mr-2" />
              ) : null}
              {editId ? 'Update Method' : 'Create Method'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Delete Confirm Dialog ──────────────────────────────────── */}
      <Dialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
        <DialogContent className="glass-strong border-emerald-500/20">
          <DialogHeader>
            <DialogTitle className="text-gradient-cyan">
              Delete Payment Method
            </DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Are you sure you want to delete this payment method? This action
              cannot be undone. Any orders referencing this method may be
              affected.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="ghost"
              className="text-muted-foreground"
              onClick={() => setDeleteConfirm(null)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              className="bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/30"
              onClick={() => deleteConfirm && handleDelete(deleteConfirm)}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
