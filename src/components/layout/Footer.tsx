'use client';

import React from 'react';
import { useStore } from '@/lib/store';
import { Separator } from '@/components/ui/separator';
import { Zap, ShieldCheck, Link2, CircleDot } from 'lucide-react';
import { CRYPTO_WALLETS } from '@/lib/constants';
import type { Page } from '@/lib/types';

const QUICK_LINKS = [
  { label: 'Home', page: 'home' as Page },
  { label: 'Products', page: 'products' as Page },
  { label: 'FAQ', page: 'home' as Page },
];

const SUPPORT_LINKS = [
  { label: 'Support Tickets', page: 'tickets' as Page },
  { label: 'Terms of Service', page: 'home' as Page },
  { label: 'Privacy Policy', page: 'home' as Page },
];

export default function Footer() {
  const { navigate } = useStore();

  return (
    <footer className="mt-auto glass" style={{ borderTop: '1px solid rgba(34, 211, 238, 0.08)' }}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Main Footer Content */}
        <div className="py-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {/* Brand Section */}
          <div className="sm:col-span-2 lg:col-span-1">
            <button
              onClick={() => navigate('home')}
              className="flex items-center gap-2.5 mb-4 group"
            >
              <div className="relative flex items-center justify-center size-9 rounded-xl bg-gradient-to-br from-cyan-400 to-cyan-600 shadow-lg shadow-cyan-500/25 group-hover:shadow-cyan-500/40 transition-shadow duration-300">
                <Zap className="size-5 text-white fill-white/20" />
                <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-white/20 to-transparent" />
              </div>
              <span className="text-xl font-bold tracking-tight">
                <span className="text-gradient-cyan">Flash</span>
                <span className="text-foreground"> Buy</span>
              </span>
            </button>
            <p className="text-muted-foreground text-sm leading-relaxed mb-4 max-w-xs">
              The leading crypto-powered platform for Flash USDT. Purchase instantly using USDT on TRC20 and BEP20 networks.
            </p>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full glass-light text-xs">
                <ShieldCheck className="size-3.5 text-cyan-400" />
                <span className="text-cyan-400/80">Secure</span>
              </div>
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full glass-light text-xs">
                <Zap className="size-3.5 text-cyan-400" />
                <span className="text-cyan-400/80">Instant</span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider mb-4 flex items-center gap-2">
              <CircleDot className="size-3 text-cyan-400" />
              Quick Links
            </h3>
            <ul className="space-y-2.5">
              {QUICK_LINKS.map((link) => (
                <li key={link.label}>
                  <button
                    onClick={() => navigate(link.page)}
                    className="text-sm text-muted-foreground hover:text-cyan-400 transition-colors duration-300"
                  >
                    {link.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider mb-4 flex items-center gap-2">
              <CircleDot className="size-3 text-cyan-400" />
              Support
            </h3>
            <ul className="space-y-2.5">
              {SUPPORT_LINKS.map((link) => (
                <li key={link.label}>
                  <button
                    onClick={() => navigate(link.page)}
                    className="text-sm text-muted-foreground hover:text-cyan-400 transition-colors duration-300"
                  >
                    {link.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Crypto Payments */}
          <div>
            <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider mb-4 flex items-center gap-2">
              <CircleDot className="size-3 text-cyan-400" />
              Accepted Payments
            </h3>
            <div className="space-y-3">
              {Object.entries(CRYPTO_WALLETS).map(([key, wallet]) => (
                <div
                  key={key}
                  className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl glass-light transition-all duration-300 hover:border-cyan-500/20"
                >
                  <span className="text-lg">{wallet.icon}</span>
                  <div>
                    <p className="text-xs font-medium text-foreground">
                      {wallet.name}
                    </p>
                    <p className="text-[10px] text-muted-foreground">
                      {wallet.network}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <Separator className="bg-cyan-500/8" />

        {/* Bottom Bar */}
        <div className="py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()} Flash Buy. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Link2 className="size-3 text-cyan-500/50" />
              Powered by Blockchain
            </span>
            <span className="text-cyan-500/20">|</span>
            <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <ShieldCheck className="size-3 text-cyan-500/50" />
              Secure Payments
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
