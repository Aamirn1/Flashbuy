'use client';

import { motion } from 'framer-motion';
import { Zap, Shield, Globe, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useStore } from '@/lib/store';

const quickStats = [
  { icon: Zap, label: 'Instant Delivery', color: 'text-emerald-400' },
  { icon: Shield, label: 'Secure', color: 'text-emerald-400' },
  { icon: Globe, label: 'Global', color: 'text-emerald-300' },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.15, delayChildren: 0.3 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: 'easeOut' } },
};

const statVariants = {
  hidden: { opacity: 0, scale: 0.85 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.5, ease: 'easeOut' } },
};

export default function HeroBanner() {
  const navigate = useStore((s) => s.navigate);

  return (
    <section className="relative overflow-hidden bg-mesh">
      {/* Hex pattern overlay */}
      <div className="absolute inset-0 hex-pattern" />

      {/* Floating orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="orb orb-cyan w-[500px] h-[500px] -top-32 -left-32 animate-float-slow" />
        <div className="orb orb-blue w-[400px] h-[400px] top-1/4 -right-20 animate-float-slow" style={{ animationDelay: '2s' }} />
        <div className="orb orb-teal w-[350px] h-[350px] -bottom-20 left-1/3 animate-float-slow" style={{ animationDelay: '4s' }} />
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28 lg:py-36">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="flex flex-col lg:flex-row items-center gap-12 lg:gap-16"
        >
          {/* Left: Text content */}
          <div className="flex-1 text-center lg:text-left">
            <motion.div
              variants={itemVariants}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-light text-emerald-400 text-sm font-medium mb-8"
            >
              <Zap className="size-4" />
              <span>Powered by Blockchain Technology</span>
            </motion.div>

            <motion.h1
              variants={itemVariants}
              className="text-5xl sm:text-6xl lg:text-7xl font-black leading-tight tracking-tight"
            >
              <span className="text-gradient-cyan text-glow-cyan">Flash USDT</span>
            </motion.h1>

            <motion.p
              variants={itemVariants}
              className="mt-4 text-xl sm:text-2xl text-slate-300 font-light"
            >
              Instant Crypto at Unbeatable Prices
            </motion.p>

            <motion.p
              variants={itemVariants}
              className="mt-4 text-base sm:text-lg text-slate-400 max-w-xl mx-auto lg:mx-0 leading-relaxed"
            >
              Get Flash USDT instantly with secure TRC20 &amp; BEP20 transfers.
              The fastest way to acquire crypto at the best rates — 1000 Flash USDT for just $10.
            </motion.p>

            {/* Quick stats row */}
            <motion.div
              variants={containerVariants}
              className="mt-8 flex flex-wrap items-center justify-center lg:justify-start gap-3"
            >
              {quickStats.map((stat) => (
                <motion.div
                  key={stat.label}
                  variants={statVariants}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl glass-light"
                >
                  <stat.icon className={`size-4 ${stat.color}`} />
                  <span className="text-sm font-medium text-slate-200">{stat.label}</span>
                </motion.div>
              ))}
            </motion.div>

            {/* CTA */}
            <motion.div variants={itemVariants} className="mt-10">
              <Button
                size="lg"
                className="glow-cyan-strong bg-gradient-to-r from-emerald-500 to-emerald-400 hover:from-emerald-400 hover:to-emerald-300 text-gray-950 font-bold px-10 h-14 text-base rounded-xl shadow-lg shadow-emerald-500/25 transition-all hover:shadow-emerald-400/40 hover:scale-105"
                onClick={() => navigate('products')}
              >
                Buy Flash USDT
                <ArrowRight className="size-5 ml-2" />
              </Button>
            </motion.div>
          </div>

          {/* Right: 3D Coin */}
          <motion.div
            variants={itemVariants}
            className="flex-shrink-0"
          >
            <motion.div
              className="animate-float"
              animate={{ y: [0, -12, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
            >
              <div className="coin-3d animate-spin-coin" />
            </motion.div>
          </motion.div>
        </motion.div>
      </div>

      {/* Bottom fade */}
      <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-background to-transparent" />
    </section>
  );
}
