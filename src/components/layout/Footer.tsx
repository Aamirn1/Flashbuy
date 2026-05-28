'use client';

import React, { useState } from 'react';
import { useStore } from '@/lib/store';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Zap, Mail, ArrowRight, Link2, ShieldCheck } from 'lucide-react';
import { CRYPTO_WALLETS } from '@/lib/constants';
import type { Page } from '@/lib/types';

const QUICK_LINKS = [
  { label: 'Home', page: 'home' as Page },
  { label: 'Products', page: 'products' as Page },
];

const SUPPORT_LINKS = [
  { label: 'Contact Us', page: 'tickets' as Page },
  { label: 'Support Tickets', page: 'tickets' as Page },
  { label: 'Terms of Service', page: 'home' as Page },
  { label: 'Privacy Policy', page: 'home' as Page },
];

export default function Footer() {
  const { navigate } = useStore();
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setSubscribed(true);
      setEmail('');
      setTimeout(() => setSubscribed(false), 3000);
    }
  };

  return (
    <footer className="mt-auto bg-zinc-950 border-t border-zinc-800/50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Main Footer Content */}
        <div className="py-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {/* Brand Section */}
          <div className="sm:col-span-2 lg:col-span-1">
            <button
              onClick={() => navigate('home')}
              className="flex items-center gap-2 mb-4 group"
            >
              <div className="flex items-center justify-center size-9 rounded-lg bg-gradient-to-br from-emerald-500 to-emerald-700 shadow-lg shadow-emerald-500/20 group-hover:shadow-emerald-500/40 transition-shadow">
                <Zap className="size-5 text-white fill-white/30" />
              </div>
              <span className="text-xl font-bold text-white tracking-tight">
                Flash<span className="text-emerald-400"> Buy</span>
              </span>
            </button>
            <p className="text-zinc-400 text-sm leading-relaxed mb-4 max-w-xs">
              The leading crypto-powered eCommerce platform. Purchase digital products and services instantly using USDT on TRC20 and BEP20 networks.
            </p>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-zinc-900 border border-zinc-800">
                <ShieldCheck className="size-3.5 text-emerald-400" />
                <span className="text-xs text-zinc-400">Secure</span>
              </div>
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-zinc-900 border border-zinc-800">
                <Zap className="size-3.5 text-emerald-400" />
                <span className="text-xs text-zinc-400">Instant</span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
              Quick Links
            </h3>
            <ul className="space-y-2.5">
              {QUICK_LINKS.map((link) => (
                <li key={link.label}>
                  <button
                    onClick={() => navigate(link.page)}
                    className="text-sm text-zinc-400 hover:text-emerald-400 transition-colors"
                  >
                    {link.label}
                  </button>
                </li>
              ))}
              <li>
                <a
                  href="#faq"
                  className="text-sm text-zinc-400 hover:text-emerald-400 transition-colors"
                >
                  FAQ
                </a>
              </li>
              <li>
                <a
                  href="#about"
                  className="text-sm text-zinc-400 hover:text-emerald-400 transition-colors"
                >
                  About Us
                </a>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
              Support
            </h3>
            <ul className="space-y-2.5">
              {SUPPORT_LINKS.map((link) => (
                <li key={link.label}>
                  <button
                    onClick={() => navigate(link.page)}
                    className="text-sm text-zinc-400 hover:text-emerald-400 transition-colors"
                  >
                    {link.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Crypto & Newsletter */}
          <div>
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
              Accepted Payments
            </h3>
            <div className="space-y-3 mb-6">
              {Object.entries(CRYPTO_WALLETS).map(([key, wallet]) => (
                <div
                  key={key}
                  className="flex items-center gap-2.5 px-3 py-2 rounded-lg bg-zinc-900/50 border border-zinc-800/50"
                >
                  <span className="text-lg">{wallet.icon}</span>
                  <div>
                    <p className="text-xs font-medium text-white">
                      {wallet.name}
                    </p>
                    <p className="text-[10px] text-zinc-500">
                      {wallet.network}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Newsletter */}
            <div>
              <h4 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">
                Newsletter
              </h4>
              <form onSubmit={handleNewsletterSubmit} className="flex gap-1.5">
                <div className="relative flex-1">
                  <Mail className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-zinc-500" />
                  <Input
                    type="email"
                    placeholder="Your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="h-8 pl-8 text-xs bg-zinc-900 border-zinc-800 text-zinc-200 placeholder:text-zinc-500 focus-visible:border-emerald-500/50 focus-visible:ring-emerald-500/20"
                  />
                </div>
                <Button
                  type="submit"
                  size="sm"
                  className="h-8 px-3 bg-emerald-600 hover:bg-emerald-700 text-white shrink-0"
                >
                  {subscribed ? (
                    'Done!'
                  ) : (
                    <ArrowRight className="size-3.5" />
                  )}
                </Button>
              </form>
            </div>
          </div>
        </div>

        <Separator className="bg-zinc-800/50" />

        {/* Bottom Bar */}
        <div className="py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-zinc-500">
            &copy; {new Date().getFullYear()} Flash Buy. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5 text-xs text-zinc-500">
              <Link2 className="size-3" />
              Powered by Blockchain
            </span>
            <span className="text-zinc-700">|</span>
            <span className="flex items-center gap-1.5 text-xs text-zinc-500">
              <ShieldCheck className="size-3" />
              Secure Payments
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
