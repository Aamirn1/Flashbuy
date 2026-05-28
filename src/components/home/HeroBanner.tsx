'use client';

import { motion } from 'framer-motion';
import { Zap, Shield, Globe, ArrowRight, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useStore } from '@/lib/store';

const stats = [
  { icon: Zap, label: '10,000+', description: 'Users', color: 'text-yellow-400' },
  { icon: Shield, label: '50,000+', description: 'Orders', color: 'text-emerald-400' },
  { icon: Globe, label: '99.9%', description: 'Uptime', color: 'text-sky-400' },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.15, delayChildren: 0.2 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } },
};

const statVariants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.5, ease: 'easeOut' } },
};

export default function HeroBanner() {
  const navigate = useStore((s) => s.navigate);

  const scrollToFeatures = () => {
    const el = document.getElementById('features-section');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-gray-950 via-gray-900 to-emerald-950">
      {/* Background image overlay */}
      <div
        className="absolute inset-0 opacity-15 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url('/images/hero-banner.png')" }}
      />
      {/* Gradient overlay for depth */}
      <div className="absolute inset-0 bg-gradient-to-r from-gray-950/80 via-transparent to-emerald-950/60" />

      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-emerald-500/10 blur-3xl"
          animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute -bottom-32 -left-32 w-[30rem] h-[30rem] rounded-full bg-emerald-600/10 blur-3xl"
          animate={{ scale: [1.1, 1, 1.1], opacity: [0.2, 0.4, 0.2] }}
          transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute top-1/3 left-1/4 w-64 h-64 rounded-full bg-emerald-400/5 blur-2xl"
          animate={{ y: [0, -20, 0], opacity: [0.2, 0.35, 0.2] }}
          transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
        />
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20 lg:py-28">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="flex flex-col lg:flex-row items-center gap-10 lg:gap-16"
        >
          {/* Left: Text content */}
          <div className="flex-1 text-center lg:text-left">
            <motion.div variants={itemVariants} className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 text-sm font-medium mb-6">
              <Zap className="size-3.5" />
              <span>Powered by USDT Crypto Payments</span>
            </motion.div>

            <motion.h1
              variants={itemVariants}
              className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white leading-tight tracking-tight"
            >
              Flash Buy —{' '}
              <span className="bg-gradient-to-r from-emerald-400 to-emerald-300 bg-clip-text text-transparent">
                Instant Crypto
              </span>{' '}
              Marketplace
            </motion.h1>

            <motion.p
              variants={itemVariants}
              className="mt-5 text-lg sm:text-xl text-gray-300 max-w-2xl leading-relaxed"
            >
              Purchase digital products instantly with USDT. Secure, fast, and global.
              Experience the future of online shopping with blockchain-verified payments.
            </motion.p>

            <motion.div variants={itemVariants} className="mt-8 flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start">
              <Button
                size="lg"
                className="bg-emerald-500 hover:bg-emerald-600 text-white font-semibold px-8 h-12 text-base shadow-lg shadow-emerald-500/25 transition-all hover:shadow-emerald-500/40"
                onClick={() => navigate('products')}
              >
                Shop Now
                <ArrowRight className="size-4 ml-1" />
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="border-gray-600 text-gray-300 hover:text-white hover:border-gray-400 bg-transparent h-12 text-base px-8"
                onClick={scrollToFeatures}
              >
                Learn More
                <ChevronDown className="size-4 ml-1" />
              </Button>
            </motion.div>
          </div>

          {/* Right: Stats */}
          <motion.div
            variants={containerVariants}
            className="flex flex-row lg:flex-col gap-4 lg:gap-5 w-full lg:w-auto"
          >
            {stats.map((stat) => (
              <motion.div
                key={stat.description}
                variants={statVariants}
                whileHover={{ scale: 1.03, y: -2 }}
                className="flex-1 lg:flex-none bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl px-5 py-4 lg:px-6 lg:py-5 min-w-[160px] transition-colors hover:bg-white/10"
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg bg-white/5 ${stat.color}`}>
                    <stat.icon className="size-5" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-white">{stat.label}</div>
                    <div className="text-sm text-gray-400">{stat.description}</div>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </div>

      {/* Bottom fade */}
      <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-background to-transparent" />
    </section>
  );
}
