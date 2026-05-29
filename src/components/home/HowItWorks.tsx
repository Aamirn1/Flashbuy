'use client';

import { motion } from 'framer-motion';
import { MousePointerClick, Wallet, Rocket } from 'lucide-react';

const steps = [
  {
    icon: MousePointerClick,
    title: 'Select Amount',
    description: 'Choose how much Flash USDT you need — from 1,000 to 10,000,000.',
    step: 1,
  },
  {
    icon: Wallet,
    title: 'Pay with USDT',
    description: 'Send payment via TRC20 or BEP20 network directly from your wallet.',
    step: 2,
  },
  {
    icon: Rocket,
    title: 'Instant Delivery',
    description: 'Receive Flash USDT in your wallet instantly after payment confirmation.',
    step: 3,
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.2, delayChildren: 0.3 },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 40, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.6, ease: 'easeOut' as const },
  },
};

export default function HowItWorks() {
  return (
    <section className="relative py-16 sm:py-24 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="orb orb-blue w-[400px] h-[400px] top-1/4 -left-20 animate-float-slow" />
        <div className="orb orb-cyan w-[300px] h-[300px] bottom-0 right-0 animate-float-slow" style={{ animationDelay: '2s' }} />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-8 sm:mb-14"
        >
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight">
            How It{' '}
            <span className="text-gradient-cyan">Works</span>
          </h2>
          <p className="mt-2 sm:mt-3 text-slate-400 text-base sm:text-lg max-w-xl mx-auto">
            Get your Flash USDT in three simple steps.
          </p>
        </motion.div>

        {/* Steps */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-50px' }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 relative"
        >
          {/* Connecting line (desktop only) */}
          <div className="hidden md:block absolute top-1/2 left-[18%] right-[18%] h-px -translate-y-1/2">
            <div className="w-full h-px bg-gradient-to-r from-emerald-500/30 via-emerald-400/50 to-emerald-500/30" />
            <div className="absolute top-1/2 left-1/3 -translate-y-1/2 -translate-x-1/2">
              <div className="w-2 h-2 rounded-full bg-emerald-400/50 glow-cyan" />
            </div>
            <div className="absolute top-1/2 left-2/3 -translate-y-1/2 -translate-x-1/2">
              <div className="w-2 h-2 rounded-full bg-emerald-400/50 glow-cyan" />
            </div>
          </div>

          {steps.map((step) => (
            <motion.div
              key={step.step}
              variants={cardVariants}
              className="relative"
            >
              <div className="glass-card glass-card-hover rounded-2xl p-6 text-center h-full">
                {/* Step number */}
                <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-r from-emerald-500 to-emerald-400 text-gray-950 font-black text-sm mb-4 glow-cyan">
                  {step.step}
                </div>

                {/* Icon */}
                <div className="flex justify-center mb-4">
                  <div className="p-4 rounded-2xl glass-light">
                    <step.icon className="size-8 text-emerald-400" />
                  </div>
                </div>

                {/* Text */}
                <h3 className="text-lg font-bold text-slate-100 mb-2">
                  {step.title}
                </h3>
                <p className="text-sm text-slate-400 leading-relaxed">
                  {step.description}
                </p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
