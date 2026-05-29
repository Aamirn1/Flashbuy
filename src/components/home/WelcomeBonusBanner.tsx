'use client';

import { motion } from 'framer-motion';
import { Gift, ArrowRight, Lock, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useStore } from '@/lib/store';

export default function WelcomeBonusBanner() {
  const { isAuthenticated, user, setShowAuthDialog } = useStore();

  // Don't show if user already has unlocked bonus
  if (isAuthenticated && user?.welcomeBonusUnlocked) return null;

  return (
    <section className="relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="relative rounded-2xl overflow-hidden"
        >
          {/* Background */}
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-900/40 via-emerald-800/30 to-emerald-900/40" />
          <div className="absolute inset-0 border border-emerald-500/20 rounded-2xl" />

          {/* Decorative elements */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-emerald-400/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 p-6 sm:p-8 lg:p-10 flex flex-col lg:flex-row items-center gap-6 lg:gap-10">
            {/* Left: Icon & Amount */}
            <div className="flex items-center gap-4 sm:gap-6">
              <motion.div
                animate={{ rotate: [0, -5, 5, -5, 0] }}
                transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                className="h-16 w-16 sm:h-20 sm:w-20 rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-400 flex items-center justify-center shadow-lg shadow-emerald-500/30 flex-shrink-0"
              >
                <Gift className="h-8 w-8 sm:h-10 sm:w-10 text-gray-950" />
              </motion.div>
              <div>
                <p className="text-emerald-400 text-xs sm:text-sm font-semibold uppercase tracking-wider">Welcome Bonus</p>
                <p className="text-3xl sm:text-4xl lg:text-5xl font-black text-gradient-cyan mt-1">$500</p>
                <p className="text-slate-400 text-xs sm:text-sm mt-1">Free on every new account</p>
              </div>
            </div>

            {/* Right: Details & CTA */}
            <div className="flex-1 text-center lg:text-left">
              <h3 className="text-lg sm:text-xl font-bold text-foreground">
                Start Your Crypto Journey with $500 Free!
              </h3>
              <p className="text-sm sm:text-base text-slate-400 mt-2 max-w-lg">
                Create your account today and receive a <span className="text-emerald-400 font-semibold">$500 welcome bonus</span> instantly.
                Place a minimum order of <span className="text-emerald-400 font-semibold">$10</span> to unlock and withdraw your bonus.
              </p>

              {/* How it works */}
              <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-6 mt-4">
                <div className="flex items-center gap-2 text-sm text-slate-300">
                  <div className="h-6 w-6 rounded-full bg-emerald-500/20 flex items-center justify-center flex-shrink-0">
                    <span className="text-emerald-400 text-xs font-bold">1</span>
                  </div>
                  <span>Create Account</span>
                </div>
                <div className="hidden sm:block text-emerald-500/40">→</div>
                <div className="flex items-center gap-2 text-sm text-slate-300">
                  <div className="h-6 w-6 rounded-full bg-emerald-500/20 flex items-center justify-center flex-shrink-0">
                    <Lock className="size-3 text-emerald-400" />
                  </div>
                  <span>Get $500 Bonus</span>
                </div>
                <div className="hidden sm:block text-emerald-500/40">→</div>
                <div className="flex items-center gap-2 text-sm text-slate-300">
                  <div className="h-6 w-6 rounded-full bg-emerald-500/20 flex items-center justify-center flex-shrink-0">
                    <CheckCircle2 className="size-3 text-emerald-400" />
                  </div>
                  <span>Order $10+ to Unlock</span>
                </div>
              </div>

              {/* CTA Button */}
              {!isAuthenticated && (
                <div className="mt-5">
                  <Button
                    size="lg"
                    className="bg-gradient-to-r from-emerald-500 to-emerald-400 hover:from-emerald-400 hover:to-emerald-300 text-gray-950 font-bold px-8 h-12 text-sm rounded-xl shadow-lg shadow-emerald-500/25 transition-all hover:shadow-emerald-400/40 hover:scale-105"
                    onClick={() => setShowAuthDialog(true, 'register')}
                  >
                    Claim Your $500 Bonus
                    <ArrowRight className="size-4 ml-2" />
                  </Button>
                </div>
              )}

              {isAuthenticated && !user?.welcomeBonusUnlocked && (
                <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-xl glass-light text-emerald-400 text-sm font-medium">
                  <Gift className="size-4" />
                  <span>Your $500 bonus is active! Place a $10+ order to unlock it.</span>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
