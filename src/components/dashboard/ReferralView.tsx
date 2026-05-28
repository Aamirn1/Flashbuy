'use client';

import { useState, useEffect } from 'react';
import { useStore } from '@/lib/store';
import type { ReferralInfo } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
      if (res.ok) {
        fetchReferrals();
      }
    } catch {
      // handle error
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-48" />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Referral Program</h2>
        <p className="text-muted-foreground">Earn 5% commission on every referral purchase</p>
      </div>

      {/* Referral Code Card */}
      <Card className="bg-gradient-to-br from-purple-500 to-pink-600 text-white border-0">
        <CardContent className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-12 w-12 rounded-full bg-white/20 flex items-center justify-center">
              <Gift className="h-6 w-6 text-white" />
            </div>
            <div>
              <p className="font-semibold text-lg">Your Referral Code</p>
              <p className="text-purple-200 text-sm">Share this code with friends to earn commission</p>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Input
                readOnly
                value={referralCode}
                className="bg-white/10 border-white/20 text-white font-mono text-lg"
              />
              <Button
                variant="secondary"
                size="icon"
                onClick={() => handleCopy(referralCode)}
                className="flex-shrink-0"
              >
                {copied ? <CheckCircle2 className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
            <div className="flex items-center gap-2">
              <Input
                readOnly
                value={referralLink}
                className="bg-white/10 border-white/20 text-white text-sm"
              />
              <Button
                variant="secondary"
                size="icon"
                onClick={() => handleCopy(referralLink)}
                className="flex-shrink-0"
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Referrals</p>
                <p className="text-3xl font-bold mt-1">{referralInfo?.totalReferrals || 0}</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-purple-100 flex items-center justify-center">
                <Users className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Earnings</p>
                <p className="text-3xl font-bold mt-1">${referralInfo?.totalEarnings?.toFixed(2) || '0.00'}</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Available to Withdraw</p>
                <p className="text-3xl font-bold mt-1">
                  ${(referralInfo?.totalEarnings || 0) > 0 ? referralInfo!.totalEarnings.toFixed(2) : '0.00'}
                </p>
              </div>
              <div className="h-12 w-12 rounded-full bg-orange-100 flex items-center justify-center">
                <DollarSign className="h-6 w-6 text-orange-600" />
              </div>
            </div>
            {(referralInfo?.totalEarnings || 0) > 0 && (
              <Button className="w-full mt-4" onClick={handleWithdraw}>
                Withdraw to Wallet
              </Button>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Referral List */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Your Referrals</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {!referralInfo?.referrals || referralInfo.referrals.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
              <Users className="h-12 w-12 mb-4 opacity-50" />
              <p className="text-lg font-medium">No referrals yet</p>
              <p className="text-sm">Share your referral code to start earning commission.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Commission</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {referralInfo.referrals.map((ref, idx) => (
                  <TableRow key={idx}>
                    <TableCell className="font-medium">{ref.name}</TableCell>
                    <TableCell className="text-muted-foreground text-sm">{formatDate(ref.date)}</TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="bg-green-100 text-green-800">
                        +${ref.commission.toFixed(2)}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
