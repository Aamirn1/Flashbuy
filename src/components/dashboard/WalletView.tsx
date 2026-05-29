'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useStore } from '@/lib/store';
import type { WalletTransaction } from '@/lib/types';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { DollarSign, ArrowDownLeft, ArrowUpRight, Wallet, RefreshCw, Gift, Lock, CheckCircle2, AlertCircle, Plus, Trash2, Edit3 } from 'lucide-react';

const TYPE_OPTIONS = [
  { value: 'all', label: 'All' },
  { value: 'deposit', label: 'Deposit' },
  { value: 'withdrawal', label: 'Withdrawal' },
  { value: 'welcome_bonus', label: 'Bonus' },
  { value: 'purchase', label: 'Purchase' },
  { value: 'refund', label: 'Refund' },
  { value: 'commission', label: 'Commission' },
];

const GLASS_TYPE_COLORS: Record<string, string> = {
  deposit: 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30',
  withdrawal: 'bg-red-500/20 text-red-400 border border-red-500/30',
  welcome_bonus: 'bg-amber-500/20 text-amber-400 border border-amber-500/30',
  purchase: 'bg-amber-500/20 text-amber-400 border border-amber-500/30',
  refund: 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30',
  commission: 'bg-violet-500/20 text-violet-400 border border-violet-500/30',
};

// Safe number conversion
const safeNum = (val: unknown): number => {
  if (typeof val === 'number') return val;
  const n = parseFloat(String(val));
  return isNaN(n) ? 0 : n;
};

export function WalletView() {
  const { user, setUser } = useStore();
  const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [depositOpen, setDepositOpen] = useState(false);
  const [withdrawOpen, setWithdrawOpen] = useState(false);
  const [depositAmount, setDepositAmount] = useState('');
  const [depositNetwork, setDepositNetwork] = useState('usdt_trc20');
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [withdrawAddress, setWithdrawAddress] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [welcomeBonus, setWelcomeBonus] = useState(safeNum(user?.welcomeBonus));
  const [welcomeBonusUnlocked, setWelcomeBonusUnlocked] = useState(user?.welcomeBonusUnlocked || false);

  // Wallet address management
  const [walletEditOpen, setWalletEditOpen] = useState(false);
  const [editWalletAddress, setEditWalletAddress] = useState(user?.walletAddress || '');
  const [editWalletNetwork, setEditWalletNetwork] = useState('usdt_trc20');

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/wallet');
      if (res.ok) {
        const data = await res.json();
        setTransactions(data.transactions || []);
        setWelcomeBonus(safeNum(data.welcomeBonus));
        setWelcomeBonusUnlocked(data.welcomeBonusUnlocked ?? false);

        // Update user in store with latest balance info
        if (user) {
          setUser({
            ...user,
            balance: safeNum(data.balance),
            welcomeBonus: safeNum(data.welcomeBonus),
            welcomeBonusUnlocked: data.welcomeBonusUnlocked ?? false,
          });
        }
      }
    } catch {
      // handle error
    } finally {
      setLoading(false);
    }
  };

  const handleDeposit = async () => {
    if (!depositAmount || parseFloat(depositAmount) <= 0) return;
    setSubmitting(true);
    try {
      const res = await fetch('/api/wallet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'deposit', amount: parseFloat(depositAmount), method: depositNetwork }),
      });
      if (res.ok) {
        setDepositOpen(false);
        setDepositAmount('');
        fetchTransactions();
      }
    } catch {
      // handle error
    } finally {
      setSubmitting(false);
    }
  };

  const handleWithdraw = async () => {
    if (!withdrawAmount || !withdrawAddress || parseFloat(withdrawAmount) <= 0) return;
    setSubmitting(true);
    try {
      const res = await fetch('/api/wallet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'withdrawal', amount: parseFloat(withdrawAmount) }),
      });
      if (res.ok) {
        setWithdrawOpen(false);
        setWithdrawAmount('');
        setWithdrawAddress('');
        fetchTransactions();
      }
    } catch {
      // handle error
    } finally {
      setSubmitting(false);
    }
  };

  const handleSaveWallet = async () => {
    if (!editWalletAddress.trim()) return;
    setSubmitting(true);
    try {
      const res = await fetch('/api/user/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ walletAddress: editWalletAddress.trim() }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.user && user) {
          setUser({ ...user, walletAddress: editWalletAddress.trim() });
        }
        setWalletEditOpen(false);
      }
    } catch {
      // handle error
    } finally {
      setSubmitting(false);
    }
  };

  const filteredTransactions = transactions.filter(
    (tx) => typeFilter === 'all' || tx.type === typeFilter
  );

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
    });

  const getAmountDisplay = (tx: WalletTransaction) => {
    const amount = safeNum(tx.amount);
    const isPositive = ['deposit', 'refund', 'commission', 'welcome_bonus'].includes(tx.type);
    return (
      <span className={`font-semibold ${isPositive ? 'text-emerald-400' : 'text-red-400'}`}>
        {isPositive ? '+' : '-'}${Math.abs(amount).toFixed(2)}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-32 w-full bg-white/5" />
        <Skeleton className="h-64 w-full bg-white/5" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h2 className="text-2xl font-bold text-gradient-cyan">Wallet</h2>
        <p className="text-muted-foreground text-sm">Manage your balance and transactions</p>
      </motion.div>

      {/* Balance Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="glass-card rounded-xl glow-cyan-strong p-4 sm:p-6 relative overflow-hidden"
      >
        {/* Background decoration */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="relative">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-emerald-400/70 text-sm font-medium">Available Balance</p>
              <p className="text-3xl sm:text-4xl font-bold mt-2 text-gradient-gold">
                ${safeNum(user?.balance).toFixed(2)}{' '}
                <span className="text-lg text-emerald-400/60">USDT</span>
              </p>
            </div>
            <div className="h-14 w-14 sm:h-16 sm:w-16 rounded-2xl bg-emerald-500/15 flex items-center justify-center border border-emerald-500/20 animate-pulse-glow">
              <Wallet className="h-7 w-7 sm:h-8 sm:w-8 text-emerald-400" />
            </div>
          </div>

          {/* Connected Wallet Section */}
          <div className="mt-4 p-3 sm:p-4 rounded-xl glass-light border border-emerald-500/15">
            <div className="flex items-center justify-between gap-2">
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-muted-foreground mb-1">Delivery Wallet Address</p>
                {user?.walletAddress ? (
                  <p className="text-sm font-mono text-emerald-400 truncate">{user.walletAddress}</p>
                ) : (
                  <p className="text-xs text-amber-400">No wallet connected — add one to receive Flash USDT</p>
                )}
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="text-emerald-400 hover:bg-emerald-500/10 shrink-0"
                onClick={() => {
                  setEditWalletAddress(user?.walletAddress || '');
                  setWalletEditOpen(true);
                }}
              >
                {user?.walletAddress ? <Edit3 className="size-4" /> : <Plus className="size-4" />}
              </Button>
            </div>
          </div>

          {/* Welcome Bonus Section */}
          {welcomeBonus > 0 && !welcomeBonusUnlocked && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="mt-4 p-3 sm:p-4 rounded-xl border border-amber-500/20 bg-amber-500/5"
            >
              <div className="flex items-start gap-3">
                <div className="h-9 w-9 rounded-xl bg-amber-500/15 flex items-center justify-center flex-shrink-0 border border-amber-500/20">
                  <Gift className="h-4 w-4 text-amber-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold text-amber-400">Welcome Bonus</p>
                    <Badge className="bg-amber-500/20 text-amber-400 border border-amber-500/30 text-[10px] px-1.5 py-0">
                      <Lock className="size-2.5 mr-0.5" /> Locked
                    </Badge>
                  </div>
                  <p className="text-xl sm:text-2xl font-bold text-gradient-cyan mt-1">
                    ${welcomeBonus.toFixed(2)} <span className="text-sm text-emerald-400/60">USDT</span>
                  </p>
                  <div className="flex items-center gap-1.5 mt-2 text-xs text-slate-400">
                    <AlertCircle className="size-3.5 text-amber-400/60 flex-shrink-0" />
                    <span>Place a minimum <strong className="text-emerald-400">$10 order</strong> to unlock your bonus</span>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Unlocked Bonus Success */}
          {welcomeBonusUnlocked && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="mt-4 p-3 rounded-xl border border-emerald-500/20 bg-emerald-500/5 flex items-center gap-2"
            >
              <CheckCircle2 className="size-4 text-emerald-400 flex-shrink-0" />
              <span className="text-sm text-emerald-400 font-medium">$500 Welcome Bonus unlocked and added to your balance!</span>
            </motion.div>
          )}
        </div>

        <div className="flex gap-3 mt-5 relative">
          <Dialog open={depositOpen} onOpenChange={setDepositOpen}>
            <DialogTrigger asChild>
              <button className="flex items-center gap-2 rounded-xl px-4 sm:px-5 py-2.5 glass-light glass-card-hover text-emerald-400 font-semibold text-sm transition-all hover:border-emerald-500/30">
                <ArrowDownLeft className="h-4 w-4" /> Deposit
              </button>
            </DialogTrigger>
            <DialogContent className="glass-strong border-emerald-500/20">
              <DialogHeader>
                <DialogTitle className="text-gradient-cyan">Deposit USDT</DialogTitle>
                <DialogDescription className="text-muted-foreground">Add funds to your Flash Buy wallet</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label className="text-foreground">Network</Label>
                  <Select value={depositNetwork} onValueChange={setDepositNetwork}>
                    <SelectTrigger className="glass-input">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="glass-strong border-emerald-500/20">
                      <SelectItem value="usdt_trc20">USDT TRC20</SelectItem>
                      <SelectItem value="usdt_bep20">USDT BEP20</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-foreground">Amount (USDT)</Label>
                  <Input
                    type="number"
                    placeholder="Enter amount"
                    value={depositAmount}
                    onChange={(e) => setDepositAmount(e.target.value)}
                    min="1"
                    step="0.01"
                    className="glass-input"
                  />
                </div>
                <div className="p-3 rounded-lg glass-light text-sm">
                  <p className="font-medium text-foreground">Deposit Instructions:</p>
                  <p className="text-muted-foreground mt-1">
                    Send USDT to the provided wallet address after confirming. Payment will be credited after blockchain confirmation.
                  </p>
                </div>
              </div>
              <DialogFooter>
                <Button variant="ghost" className="text-muted-foreground" onClick={() => setDepositOpen(false)}>Cancel</Button>
                <Button className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/30" onClick={handleDeposit} disabled={submitting || !depositAmount}>
                  {submitting ? <RefreshCw className="h-4 w-4 animate-spin mr-2" /> : null}
                  Confirm Deposit
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Dialog open={withdrawOpen} onOpenChange={setWithdrawOpen}>
            <DialogTrigger asChild>
              <button className="flex items-center gap-2 rounded-xl px-4 sm:px-5 py-2.5 glass-light glass-card-hover text-foreground font-semibold text-sm transition-all hover:border-emerald-500/30">
                <ArrowUpRight className="h-4 w-4" /> Withdraw
              </button>
            </DialogTrigger>
            <DialogContent className="glass-strong border-emerald-500/20">
              <DialogHeader>
                <DialogTitle className="text-gradient-cyan">Withdraw USDT</DialogTitle>
                <DialogDescription className="text-muted-foreground">Withdraw funds from your wallet</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label className="text-foreground">Withdrawal Address</Label>
                  <Input
                    placeholder="Enter your USDT wallet address"
                    value={withdrawAddress}
                    onChange={(e) => setWithdrawAddress(e.target.value)}
                    className="glass-input"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-foreground">Amount (USDT)</Label>
                  <Input
                    type="number"
                    placeholder="Enter amount"
                    value={withdrawAmount}
                    onChange={(e) => setWithdrawAmount(e.target.value)}
                    min="1"
                    step="0.01"
                    className="glass-input"
                  />
                  <p className="text-xs text-muted-foreground">
                    Available: ${safeNum(user?.balance).toFixed(2)} USDT
                  </p>
                </div>
              </div>
              <DialogFooter>
                <Button variant="ghost" className="text-muted-foreground" onClick={() => setWithdrawOpen(false)}>Cancel</Button>
                <Button className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/30" onClick={handleWithdraw} disabled={submitting || !withdrawAmount || !withdrawAddress}>
                  {submitting ? <RefreshCw className="h-4 w-4 animate-spin mr-2" /> : null}
                  Confirm Withdrawal
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </motion.div>

      {/* Wallet Address Edit Dialog */}
      <Dialog open={walletEditOpen} onOpenChange={setWalletEditOpen}>
        <DialogContent className="glass-strong border-emerald-500/20">
          <DialogHeader>
            <DialogTitle className="text-gradient-cyan">Delivery Wallet Address</DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Add or update the wallet where you want to receive Flash USDT after purchase
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label className="text-foreground">Network</Label>
              <Select value={editWalletNetwork} onValueChange={setEditWalletNetwork}>
                <SelectTrigger className="glass-input">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="glass-strong border-emerald-500/20">
                  <SelectItem value="usdt_trc20">USDT TRC20</SelectItem>
                  <SelectItem value="usdt_bep20">USDT BEP20</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-foreground">Wallet Address</Label>
              <Input
                placeholder="Enter your USDT wallet address"
                value={editWalletAddress}
                onChange={(e) => setEditWalletAddress(e.target.value)}
                className="glass-input font-mono text-sm"
              />
              <p className="text-xs text-muted-foreground">
                This is where your ordered Flash USDT will be delivered after payment approval.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" className="text-muted-foreground" onClick={() => setWalletEditOpen(false)}>Cancel</Button>
            <Button className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/30" onClick={handleSaveWallet} disabled={submitting || !editWalletAddress.trim()}>
              {submitting ? <RefreshCw className="h-4 w-4 animate-spin mr-2" /> : null}
              Save Address
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Transactions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="glass-card rounded-xl overflow-hidden"
      >
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 sm:p-6 pb-4 gap-3">
          <h3 className="text-lg font-semibold text-glow-cyan">Transaction History</h3>
          <div className="flex gap-1.5 flex-wrap">
            {TYPE_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setTypeFilter(opt.value)}
                className={`rounded-xl px-2.5 py-1.5 text-xs font-medium transition-all ${
                  typeFilter === opt.value
                    ? 'glass-light border-emerald-500/30 text-emerald-400'
                    : 'text-muted-foreground hover:text-foreground hover:bg-white/5'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
        {filteredTransactions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
            <DollarSign className="h-12 w-12 mb-4 opacity-50" />
            <p className="text-lg font-medium">No transactions found</p>
            <p className="text-sm">Your transaction history will appear here.</p>
          </div>
        ) : (
          <div className="max-h-[400px] overflow-y-auto px-4 sm:px-6 pb-4 space-y-2">
            {filteredTransactions.map((tx) => (
              <div key={tx.id} className="flex items-center justify-between p-3 rounded-xl glass-light hover:border-emerald-500/20 transition-all">
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <div className={`shrink-0 w-9 h-9 rounded-lg flex items-center justify-center ${
                    ['deposit', 'refund', 'commission', 'welcome_bonus'].includes(tx.type)
                      ? 'bg-emerald-500/20' : 'bg-red-500/20'
                  }`}>
                    {['deposit', 'refund', 'commission', 'welcome_bonus'].includes(tx.type)
                      ? <ArrowDownLeft className="size-4 text-emerald-400" />
                      : <ArrowUpRight className="size-4 text-red-400" />
                    }
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">
                      {tx.type === 'welcome_bonus' ? 'Welcome Bonus' : tx.type.charAt(0).toUpperCase() + tx.type.slice(1)}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">{tx.description || formatDate(tx.createdAt)}</p>
                  </div>
                </div>
                <div className="text-right shrink-0 ml-3">
                  {getAmountDisplay(tx)}
                  <p className="text-[10px] text-muted-foreground mt-0.5">
                    <Badge className={
                      tx.status === 'confirmed' || tx.status === 'completed'
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] px-1 py-0'
                        : tx.status === 'failed'
                          ? 'bg-red-500/20 text-red-400 border border-red-500/30 text-[10px] px-1 py-0'
                          : 'bg-amber-500/20 text-amber-400 border border-amber-500/30 text-[10px] px-1 py-0'
                    }>
                      {tx.status.charAt(0).toUpperCase() + tx.status.slice(1)}
                    </Badge>
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
}
