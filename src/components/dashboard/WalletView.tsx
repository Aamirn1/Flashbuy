'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useStore } from '@/lib/store';
import type { WalletTransaction } from '@/lib/types';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { DollarSign, ArrowDownLeft, ArrowUpRight, Wallet, RefreshCw } from 'lucide-react';

const TYPE_OPTIONS = [
  { value: 'all', label: 'All Types' },
  { value: 'deposit', label: 'Deposit' },
  { value: 'withdrawal', label: 'Withdrawal' },
  { value: 'purchase', label: 'Purchase' },
  { value: 'refund', label: 'Refund' },
  { value: 'commission', label: 'Commission' },
];

const GLASS_TYPE_COLORS: Record<string, string> = {
  deposit: 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30',
  withdrawal: 'bg-red-500/20 text-red-400 border border-red-500/30',
  purchase: 'bg-amber-500/20 text-amber-400 border border-amber-500/30',
  refund: 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30',
  commission: 'bg-violet-500/20 text-violet-400 border border-violet-500/30',
};

export function WalletView() {
  const { user } = useStore();
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
      const res = await fetch('/api/wallet/deposit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: parseFloat(depositAmount), network: depositNetwork }),
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
      const res = await fetch('/api/wallet/withdraw', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: parseFloat(withdrawAmount), address: withdrawAddress }),
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

  const filteredTransactions = transactions.filter(
    (tx) => typeFilter === 'all' || tx.type === typeFilter
  );

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
    });

  const getAmountDisplay = (tx: WalletTransaction) => {
    const isPositive = ['deposit', 'refund', 'commission'].includes(tx.type);
    return (
      <span className={`font-semibold ${isPositive ? 'text-emerald-400' : 'text-red-400'}`}>
        {isPositive ? '+' : '-'}${Math.abs(tx.amount).toFixed(2)}
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
        <p className="text-muted-foreground">Manage your balance and transactions</p>
      </motion.div>

      {/* Balance Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="glass-card rounded-xl glow-cyan-strong p-6 relative overflow-hidden"
      >
        {/* Background decoration */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="relative flex items-center justify-between">
          <div>
            <p className="text-emerald-400/70 text-sm font-medium">Available Balance</p>
            <p className="text-4xl font-bold mt-2 text-gradient-gold">
              ${user?.balance?.toFixed(2) || '0.00'}{' '}
              <span className="text-lg text-emerald-400/60">USDT</span>
            </p>
          </div>
          <div className="h-16 w-16 rounded-2xl bg-emerald-500/15 flex items-center justify-center border border-emerald-500/20 animate-pulse-glow">
            <Wallet className="h-8 w-8 text-emerald-400" />
          </div>
        </div>
        <div className="flex gap-3 mt-6 relative">
          <Dialog open={depositOpen} onOpenChange={setDepositOpen}>
            <DialogTrigger asChild>
              <button className="flex items-center gap-2 rounded-xl px-5 py-2.5 glass-light glass-card-hover text-emerald-400 font-semibold text-sm transition-all hover:border-emerald-500/30">
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
              <button className="flex items-center gap-2 rounded-xl px-5 py-2.5 glass-light glass-card-hover text-foreground font-semibold text-sm transition-all hover:border-emerald-500/30">
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
                    Available: ${user?.balance?.toFixed(2) || '0.00'} USDT
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

      {/* Transactions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="glass-card rounded-xl overflow-hidden"
      >
        <div className="flex items-center justify-between p-6 pb-4">
          <h3 className="text-lg font-semibold text-glow-cyan">Transaction History</h3>
          <div className="flex gap-2 flex-wrap">
            {TYPE_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setTypeFilter(opt.value)}
                className={`rounded-full px-3 py-1 text-xs font-medium transition-all ${
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
          <Table>
            <TableHeader>
              <TableRow className="border-emerald-500/10 hover:bg-transparent">
                <TableHead className="text-muted-foreground">Type</TableHead>
                <TableHead className="text-muted-foreground">Amount</TableHead>
                <TableHead className="text-muted-foreground">Status</TableHead>
                <TableHead className="text-muted-foreground">Date</TableHead>
                <TableHead className="text-muted-foreground">Description</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTransactions.map((tx) => (
                <TableRow key={tx.id} className="border-emerald-500/5 hover:bg-emerald-500/5">
                  <TableCell>
                    <Badge className={`${GLASS_TYPE_COLORS[tx.type] || ''} text-xs`}>
                      {tx.type.charAt(0).toUpperCase() + tx.type.slice(1)}
                    </Badge>
                  </TableCell>
                  <TableCell>{getAmountDisplay(tx)}</TableCell>
                  <TableCell>
                    <Badge
                      className={
                        tx.status === 'confirmed' || tx.status === 'completed'
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          : tx.status === 'failed'
                            ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                            : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                      }
                    >
                      {tx.status.charAt(0).toUpperCase() + tx.status.slice(1)}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">{formatDate(tx.createdAt)}</TableCell>
                  <TableCell className="text-sm text-muted-foreground max-w-[200px] truncate">
                    {tx.description || '-'}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </motion.div>
    </div>
  );
}
