'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Zap, Shield, Globe, ArrowRight, Gift } from 'lucide-react';
import { Button } from '@/components/ui/button';

const quickStats = [
  { icon: Zap, label: 'Instant Delivery', color: 'text-emerald-400' },
  { icon: Shield, label: 'Secure', color: 'text-emerald-400' },
  { icon: Globe, label: 'Global', color: 'text-emerald-300' },
];

// Typewriter animation lines
const typewriterLines = [
  'Instant Crypto at Unbeatable Prices',
  'Get $500 Welcome Bonus',
  'Secure TRC20 & BEP20 Transfers',
  'The Fastest Way to Buy Flash USDT',
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
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: 'easeOut' as const } },
};

const statVariants = {
  hidden: { opacity: 0, scale: 0.85 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.5, ease: 'easeOut' as const } },
};

function TypewriterText({ lines, className }: { lines: string[]; className?: string }) {
  const [currentLineIndex, setCurrentLineIndex] = useState(0);
  const [currentText, setCurrentText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const currentLine = lines[currentLineIndex];

    const timeout = setTimeout(
      () => {
        if (!isDeleting) {
          // Typing
          setCurrentText(currentLine.slice(0, currentText.length + 1));
          if (currentText.length + 1 === currentLine.length) {
            // Finished typing, wait then start deleting
            setTimeout(() => setIsDeleting(true), 2500);
          }
        } else {
          // Deleting
          setCurrentText(currentLine.slice(0, currentText.length - 1));
          if (currentText.length === 0) {
            setIsDeleting(false);
            setCurrentLineIndex((prev) => (prev + 1) % lines.length);
          }
        }
      },
      isDeleting ? 30 : 70
    );

    return () => clearTimeout(timeout);
  }, [currentText, isDeleting, currentLineIndex, lines]);

  return (
    <span className={className}>
      {currentText}
      <span className="animate-pulse text-emerald-400">|</span>
    </span>
  );
}

export default function HeroBanner() {
  return (
    <section className="relative overflow-hidden bg-mesh">
      {/* Hex pattern overlay */}
      <div className="absolute inset-0 hex-pattern" />

      {/* Floating orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="orb orb-cyan w-[300px] h-[300px] sm:w-[500px] sm:h-[500px] -top-20 sm:-top-32 -left-20 sm:-left-32 animate-float-slow" />
        <div className="orb orb-blue w-[250px] h-[250px] sm:w-[400px] sm:h-[400px] top-1/4 -right-10 sm:-right-20 animate-float-slow" style={{ animationDelay: '2s' }} />
        <div className="orb orb-teal w-[200px] h-[200px] sm:w-[350px] sm:h-[350px] -bottom-10 sm:-bottom-20 left-1/3 animate-float-slow" style={{ animationDelay: '4s' }} />
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20 lg:py-36">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="flex flex-col lg:flex-row items-center gap-8 sm:gap-12 lg:gap-16"
        >
          {/* Left: Text content */}
          <div className="flex-1 text-center lg:text-left">
            <motion.div
              variants={itemVariants}
              className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full glass-light text-emerald-400 text-xs sm:text-sm font-medium mb-6 sm:mb-8"
            >
              <Zap className="size-3.5 sm:size-4" />
              <span>Powered by Blockchain Technology</span>
            </motion.div>

            <motion.h1
              variants={itemVariants}
              className="text-4xl sm:text-5xl lg:text-7xl font-black leading-tight tracking-tight"
            >
              <span className="text-gradient-cyan">Flash USDT</span>
            </motion.h1>

            {/* Typewriter animated subtitle */}
            <motion.div
              variants={itemVariants}
              className="mt-3 sm:mt-4 min-h-[2rem] sm:min-h-[2.5rem] lg:min-h-[3rem]"
            >
              <TypewriterText
                lines={typewriterLines}
                className="text-lg sm:text-xl lg:text-2xl text-slate-300 font-light"
              />
            </motion.div>

            <motion.p
              variants={itemVariants}
              className="mt-3 sm:mt-4 text-sm sm:text-base lg:text-lg text-slate-400 max-w-xl mx-auto lg:mx-0 leading-relaxed"
            >
              Get Flash USDT instantly with secure TRC20 &amp; BEP20 transfers.
              The fastest way to acquire crypto at the best rates — 1000 Flash USDT for just $10.
            </motion.p>

            {/* Quick stats row */}
            <motion.div
              variants={containerVariants}
              className="mt-6 sm:mt-8 flex flex-wrap items-center justify-center lg:justify-start gap-2 sm:gap-3"
            >
              {quickStats.map((stat) => (
                <motion.div
                  key={stat.label}
                  variants={statVariants}
                  className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl glass-light"
                >
                  <stat.icon className={`size-3.5 sm:size-4 ${stat.color}`} />
                  <span className="text-xs sm:text-sm font-medium text-slate-200">{stat.label}</span>
                </motion.div>
              ))}
            </motion.div>

            {/* CTA */}
            <motion.div variants={itemVariants} className="mt-8 sm:mt-10">
              <Button
                size="lg"
                className="glow-cyan-strong bg-gradient-to-r from-emerald-500 to-emerald-400 hover:from-emerald-400 hover:to-emerald-300 text-gray-950 font-bold px-8 sm:px-10 h-12 sm:h-14 text-sm sm:text-base rounded-xl shadow-lg shadow-emerald-500/25 transition-all hover:shadow-emerald-400/40 hover:scale-105"
                onClick={() => {
                  const el = document.getElementById('buy-flash-usdt');
                  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }}
              >
                Buy Flash USDT
                <ArrowRight className="size-4 sm:size-5 ml-2" />
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
              <div className="coin-3d animate-spin-coin" style={{ width: 140, height: 140 }} />
              <style>{`.coin-3d[style*="140px"]::after { font-size: 56px; inset: 7px; }`}</style>
            </motion.div>
          </motion.div>
        </motion.div>
      </div>

      {/* Bottom fade */}
      <div className="absolute bottom-0 left-0 right-0 h-16 sm:h-24 bg-gradient-to-t from-background to-transparent" />
    </section>
  );
}
