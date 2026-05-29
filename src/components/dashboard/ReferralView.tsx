'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useStore } from '@/lib/store';
import type { ReferralInfo } from '@/lib/types';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Users, Copy, DollarSign, TrendingUp, Gift, CheckCircle2, ArrowUpRight, RefreshCw, Share2, Zap } from 'lucide-react';

// Safe number conversion
const safeNum = (val: unknown): number => {
  if (typeof val === 'number') return val;
  const n = parseFloat(String(val));
  return isNaN(n) ? 0 : n;
};

export function ReferralView() {
  const { user } = useStore();
  const [referralInfo, setReferralInfo] = useState<ReferralInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState<string | null>(null);
  const [withdrawing, setWithdrawing] = useState(false);

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

  const handleCopy = async (text: string, type: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(type);
      setTimeout(() => setCopied(null), 2000);
    } catch {
      // fallback
    }
  };

  const handleWithdraw = async () => {
    setWithdrawing(true);
    try {
      const res = await fetch('/api/referrals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'withdraw' }),
      });
      if (res.ok) {
        fetchReferrals();
      }
    } catch {
      // handle error
    } finally {
      setWithdrawing(false);
    }
  };

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });

  const totalEarnings = safeNum(referralInfo?.totalEarnings);
  const totalReferrals = referralInfo?.totalReferrals || 0;
  const referrals = referralInfo?.referrals || [];

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
        <p className="text-muted-foreground text-sm">Earn 5% commission on every referral purchase</p>
      </motion.div>

      {/* Referral Code Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="glass-card rounded-xl glow-cyan p-4 sm:p-6 relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="relative flex items-center gap-3 mb-4">
          <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-2xl bg-emerald-500/15 flex items-center justify-center border border-emerald-500/20 animate-pulse-glow">
            <Gift className="h-5 w-5 sm:h-6 sm:w-6 text-emerald-400" />
          </div>
          <div>
            <p className="font-semibold text-base sm:text-lg text-gradient-cyan">Your Referral Code</p>
            <p className="text-emerald-400/60 text-xs sm:text-sm">Share this code with friends to earn commission</p>
          </div>
        </div>

        <div className="relative space-y-3">
          <div className="flex items-center gap-2">
            <div className="flex-1 glass-light rounded-xl px-4 py-3 border border-emerald-500/20 overflow-hidden">
              <p className="font-mono text-base sm:text-lg text-emerald-400 tracking-wider">{referralCode}</p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handleCopy(referralCode, 'code')}
              className="flex-shrink-0 text-emerald-400 hover:bg-emerald-500/10 border border-emerald-500/20 h-11 w-11 rounded-xl"
            >
              {copied === 'code' ? <CheckCircle2 className="h-5 w-5 text-emerald-400" /> : <Copy className="h-5 w-5" />}
            </Button>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex-1 glass-light rounded-xl px-4 py-2.5 border border-emerald-500/15 overflow-hidden">
              <p className="text-xs sm:text-sm text-foreground/70 break-all">{referralLink}</p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handleCopy(referralLink, 'link')}
              className="flex-shrink-0 text-emerald-400 hover:bg-emerald-500/10 border border-emerald-500/20 h-11 w-11 rounded-xl"
            >
              {copied === 'link' ? <CheckCircle2 className="h-5 w-5 text-emerald-400" /> : <Copy className="h-5 w-5" />}
            </Button>
          </div>
          {/* Share Button */}
          <button
            className="w-full flex items-center justify-center gap-2 rounded-xl px-4 py-3 bg-emerald-500/15 text-emerald-400 font-semibold text-sm border border-emerald-500/30 hover:bg-emerald-500/25 transition-all"
            onClick={() => {
              if (navigator.share) {
                navigator.share({
                  title: 'Flash Buy - Get Flash USDT',
                  text: `Join Flash Buy and get Flash USDT at just $0.01 per unit! Use my referral code: ${referralCode}`,
                  url: referralLink,
                }).catch(() => {});
              } else {
                handleCopy(referralLink, 'link');
              }
            }}
          >
            <Share2 className="h-4 w-4" />
            Share Referral Link
          </button>
        </div>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        {[
          {
            label: 'Total Referrals',
            value: totalReferrals.toString(),
            icon: Users,
            iconBg: 'bg-emerald-500/20',
            iconColor: 'text-emerald-400',
            isText: true,
          },
          {
            label: 'Total Earnings',
            value: `$${totalEarnings.toFixed(2)}`,
            icon: TrendingUp,
            iconBg: 'bg-emerald-500/20',
            iconColor: 'text-emerald-400',
            isText: false,
          },
          {
            label: 'Available to Withdraw',
            value: `$${totalEarnings.toFixed(2)}`,
            icon: DollarSign,
            iconBg: 'bg-amber-500/20',
            iconColor: 'text-amber-400',
            isText: false,
            showWithdraw: totalEarnings > 0,
          },
        ].map((stat, idx) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 + idx * 0.1 }}
            className="glass-card glass-card-hover rounded-xl p-4 sm:p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm text-muted-foreground">{stat.label}</p>
                <p className={`text-2xl sm:text-3xl font-bold mt-1 ${stat.isText ? 'text-foreground' : 'text-gradient-gold'}`}>
                  {stat.value}
                </p>
              </div>
              <div className={`h-10 w-10 sm:h-12 sm:w-12 rounded-xl ${stat.iconBg} flex items-center justify-center`}>
                <stat.icon className={`h-5 w-5 sm:h-6 sm:w-6 ${stat.iconColor}`} />
              </div>
            </div>
            {stat.showWithdraw && (
              <button
                className="w-full mt-3 sm:mt-4 rounded-lg px-4 py-2 bg-emerald-500/15 text-emerald-400 font-semibold text-sm border border-emerald-500/30 hover:bg-emerald-500/25 transition-all flex items-center justify-center gap-2"
                onClick={handleWithdraw}
                disabled={withdrawing}
              >
                {withdrawing ? (
                  <RefreshCw className="h-4 w-4 animate-spin" />
                ) : (
                  <ArrowUpRight className="h-4 w-4" />
                )}
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
        <div className="p-4 sm:p-6 pb-0">
          <h3 className="text-lg font-semibold text-glow-cyan">Your Referrals</h3>
        </div>
        {referrals.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
            <Users className="h-12 w-12 mb-4 opacity-50" />
            <p className="text-lg font-medium">No referrals yet</p>
            <p className="text-sm">Share your referral code to start earning commission.</p>
          </div>
        ) : (
          <div className="p-3 sm:p-4 space-y-2">
            {referrals.map((ref, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 rounded-lg glass-light hover:border-emerald-500/20 transition-all">
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center shrink-0">
                    <Users className="size-4 text-emerald-400" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{ref.name}</p>
                    <p className="text-xs text-muted-foreground">{formatDate(ref.date)}</p>
                  </div>
                </div>
                <Badge className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs shrink-0">
                  +${safeNum(ref.commission).toFixed(2)}
                </Badge>
              </div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
}
