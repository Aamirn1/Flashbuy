'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useStore } from '@/lib/store';
import type { ReferralInfo } from '@/lib/types';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Users, Copy, DollarSign, TrendingUp, Gift, CheckCircle2 } from 'lucide-react';

export function ReferralView() {
  const { user } = useStore();
  const [referralInfo, setReferralInfo] = useState<ReferralInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetchReferrals();
  }, []);

  const fetchReferrals = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/referrals');
      if (res.ok) {
        const data = await res.json();
        setReferralInfo(data);
      }
    } catch {
      // handle error
    } finally {
      setLoading(false);
    }
  };

  const referralCode = referralInfo?.code || user?.referralCode || '';
  const referralLink = typeof window !== 'undefined' ? `${window.location.origin}?ref=${referralCode}` : '';

  const handleCopy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
    }
  };

  const handleWithdraw = async () => {
    try {
      const res = await fetch('/api/referrals/withdraw', { method: 'POST' });
      if (res.ok) fetchReferrals();
    } catch {
      // handle error
    }
  };

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-48 bg-white/5" />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Skeleton className="h-32 w-full bg-white/5" />
          <Skeleton className="h-32 w-full bg-white/5" />
          <Skeleton className="h-32 w-full bg-white/5" />
        </div>
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
        <h2 className="text-2xl font-bold text-gradient-cyan">Referral Program</h2>
        <p className="text-muted-foreground">Earn 5% commission on every referral purchase</p>
      </motion.div>

      {/* Referral Code Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="glass-card rounded-xl glow-cyan p-6 relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="relative flex items-center gap-3 mb-4">
          <div className="h-12 w-12 rounded-2xl bg-cyan-500/15 flex items-center justify-center border border-cyan-500/20 animate-pulse-glow">
            <Gift className="h-6 w-6 text-cyan-400" />
          </div>
          <div>
            <p className="font-semibold text-lg text-gradient-cyan">Your Referral Code</p>
            <p className="text-cyan-400/60 text-sm">Share this code with friends to earn commission</p>
          </div>
        </div>

        <div className="relative space-y-3">
          <div className="flex items-center gap-2">
            <Input
              readOnly
              value={referralCode}
              className="glass-input font-mono text-lg text-cyan-400"
            />
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handleCopy(referralCode)}
              className="flex-shrink-0 text-cyan-400 hover:bg-cyan-500/10 border border-cyan-500/20 h-10 w-10"
            >
              {copied ? <CheckCircle2 className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
            </Button>
          </div>
          <div className="flex items-center gap-2">
            <Input
              readOnly
              value={referralLink}
              className="glass-input text-sm text-foreground/60"
            />
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handleCopy(referralLink)}
              className="flex-shrink-0 text-cyan-400 hover:bg-cyan-500/10 border border-cyan-500/20 h-10 w-10"
            >
              <Copy className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          {
            label: 'Total Referrals',
            value: referralInfo?.totalReferrals || 0,
            icon: Users,
            iconBg: 'bg-violet-500/20',
            iconColor: 'text-violet-400',
            isText: true,
          },
          {
            label: 'Total Earnings',
            value: `$${referralInfo?.totalEarnings?.toFixed(2) || '0.00'}`,
            icon: TrendingUp,
            iconBg: 'bg-emerald-500/20',
            iconColor: 'text-emerald-400',
            isText: false,
          },
          {
            label: 'Available to Withdraw',
            value: `$${(referralInfo?.totalEarnings || 0) > 0 ? referralInfo!.totalEarnings.toFixed(2) : '0.00'}`,
            icon: DollarSign,
            iconBg: 'bg-amber-500/20',
            iconColor: 'text-amber-400',
            isText: false,
            showWithdraw: (referralInfo?.totalEarnings || 0) > 0,
          },
        ].map((stat, idx) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 + idx * 0.1 }}
            className="glass-card glass-card-hover rounded-xl p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
                <p className={`text-3xl font-bold mt-1 ${stat.isText ? 'text-foreground' : 'text-gradient-gold'}`}>
                  {stat.value}
                </p>
              </div>
              <div className={`h-12 w-12 rounded-xl ${stat.iconBg} flex items-center justify-center`}>
                <stat.icon className={`h-6 w-6 ${stat.iconColor}`} />
              </div>
            </div>
            {stat.showWithdraw && (
              <button
                className="w-full mt-4 rounded-lg px-4 py-2 bg-cyan-500/15 text-cyan-400 font-semibold text-sm border border-cyan-500/30 hover:bg-cyan-500/25 transition-all"
                onClick={handleWithdraw}
              >
                Withdraw to Wallet
              </button>
            )}
          </motion.div>
        ))}
      </div>

      {/* Referral List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="glass-card rounded-xl overflow-hidden"
      >
        <div className="p-6 pb-0">
          <h3 className="text-lg font-semibold text-glow-cyan">Your Referrals</h3>
        </div>
        {!referralInfo?.referrals || referralInfo.referrals.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
            <Users className="h-12 w-12 mb-4 opacity-50" />
            <p className="text-lg font-medium">No referrals yet</p>
            <p className="text-sm">Share your referral code to start earning commission.</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="border-cyan-500/10 hover:bg-transparent">
                <TableHead className="text-muted-foreground">Name</TableHead>
                <TableHead className="text-muted-foreground">Date</TableHead>
                <TableHead className="text-muted-foreground">Commission</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {referralInfo.referrals.map((ref, idx) => (
                <TableRow key={idx} className="border-cyan-500/5 hover:bg-cyan-500/5">
                  <TableCell className="font-medium text-foreground">{ref.name}</TableCell>
                  <TableCell className="text-muted-foreground text-sm">{formatDate(ref.date)}</TableCell>
                  <TableCell>
                    <Badge className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs">
                      +${ref.commission.toFixed(2)}
                    </Badge>
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
