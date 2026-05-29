'use client';

import { motion } from 'framer-motion';
import { FEATURES_LIST } from '@/lib/constants';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.2 },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
};

export default function FeaturesSection() {
  return (
    <section className="relative py-16 sm:py-24 overflow-hidden">
      {/* Background orbs */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="orb orb-emerald w-[400px] h-[400px] top-0 -left-20 animate-float-slow" />
        <div className="orb orb-green w-[300px] h-[300px] bottom-0 right-1/4 animate-float-slow" style={{ animationDelay: '3s' }} />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
            Why Choose{' '}
            <span className="text-gradient-cyan">Flash Buy</span>
          </h2>
          <p className="mt-3 text-slate-400 text-lg max-w-2xl mx-auto">
            We combine the power of blockchain payments with a seamless shopping experience.
          </p>
        </motion.div>

        {/* Feature cards */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-50px' }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {FEATURES_LIST.map((feature, index) => (
            <motion.div key={index} variants={cardVariants}>
              <div className="glass-card glass-card-hover rounded-2xl p-6 h-full flex flex-col items-center text-center gap-4">
                <div className="text-4xl p-3 rounded-xl bg-emerald-500/10 group-hover:scale-110 transition-transform duration-300">
                  {feature.icon}
                </div>
                <h3 className="text-lg font-semibold text-slate-100">{feature.title}</h3>
                <p className="text-sm text-slate-400 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
