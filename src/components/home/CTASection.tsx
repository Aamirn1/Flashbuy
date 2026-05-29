'use client';

import { motion } from 'framer-motion';
import { ArrowRight, Sparkles, UserPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useStore } from '@/lib/store';

export default function CTASection() {
  const { navigate, setShowAuthDialog } = useStore();

  return (
    <section className="relative overflow-hidden py-16 sm:py-24">
      {/* Background */}
      <div className="absolute inset-0 bg-mesh" />
      <div className="absolute inset-0 hex-pattern opacity-50" />

      {/* Animated orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="orb orb-cyan w-[400px] h-[400px] -top-20 -left-20 animate-float-slow" />
        <div className="orb orb-teal w-[350px] h-[350px] -bottom-16 -right-16 animate-float-slow" style={{ animationDelay: '3s' }} />
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div className="glass-card rounded-3xl p-8 sm:p-12 glow-cyan">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-light text-emerald-400 text-sm font-medium mb-6">
              <Sparkles className="size-4" />
              <span>Get Started Today</span>
            </div>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight leading-tight">
              Ready to Buy{' '}
              <span className="text-gradient-cyan text-glow-cyan">Flash USDT</span>?
            </h2>

            <p className="mt-4 text-lg sm:text-xl text-slate-300 max-w-2xl mx-auto">
              Join thousands of users who trust Flash Buy for instant crypto transfers.
              Secure, fast, and available worldwide.
            </p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4"
            >
              <Button
                size="lg"
                className="bg-gradient-to-r from-emerald-500 to-emerald-400 hover:from-emerald-400 hover:to-emerald-300 text-gray-950 font-bold px-8 h-14 text-base rounded-xl glow-cyan-strong shadow-lg shadow-emerald-500/25 transition-all hover:shadow-emerald-400/40"
                onClick={() => navigate('products')}
              >
                Get Started
                <ArrowRight className="size-5 ml-2" />
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="border-emerald-500/30 text-emerald-300 hover:text-white hover:border-emerald-400/50 bg-transparent h-14 text-base px-8 rounded-xl transition-all"
                onClick={() => setShowAuthDialog(true, 'register')}
              >
                <UserPlus className="size-4 mr-2" />
                Create Account
              </Button>
            </motion.div>

            {/* Trust indicators */}
            <div className="mt-8 flex items-center justify-center gap-6 text-sm text-slate-400">
              <div className="flex items-center gap-1.5">
                <div className="size-2 rounded-full bg-emerald-400 glow-cyan" />
                <span>No registration fee</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="size-2 rounded-full bg-emerald-400 glow-cyan" />
                <span>Instant delivery</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="size-2 rounded-full bg-emerald-400 glow-cyan" />
                <span>Buyer protection</span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
