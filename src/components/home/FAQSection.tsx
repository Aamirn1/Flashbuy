'use client';

import { motion } from 'framer-motion';
import { HelpCircle } from 'lucide-react';
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '@/components/ui/accordion';
import { FAQ_ITEMS } from '@/lib/constants';

export default function FAQSection() {
  return (
    <section className="relative py-16 sm:py-24 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="orb orb-teal w-[350px] h-[350px] top-0 right-0 animate-float-slow" />
      </div>

      <div className="relative z-10 max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-10"
        >
          <div className="inline-flex items-center justify-center size-12 rounded-full glass-light mb-4">
            <HelpCircle className="size-6 text-emerald-400" />
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
            Frequently Asked{' '}
            <span className="text-gradient-cyan">Questions</span>
          </h2>
          <p className="mt-3 text-slate-400 text-lg">
            Everything you need to know about Flash Buy and crypto payments.
          </p>
        </motion.div>

        {/* Accordion */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <div className="glass-card rounded-2xl overflow-hidden">
            <Accordion type="single" collapsible className="w-full px-6">
              {FAQ_ITEMS.map((item, index) => (
                <AccordionItem
                  key={index}
                  value={`faq-${index}`}
                  className="border-emerald-500/10 last:border-b-0"
                >
                  <AccordionTrigger className="text-left text-sm sm:text-base font-medium hover:text-emerald-400 hover:no-underline transition-colors py-4">
                    {item.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-slate-400 text-sm leading-relaxed pb-4">
                    {item.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
