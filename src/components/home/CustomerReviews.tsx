'use client';

import { motion } from 'framer-motion';
import { Star, Quote } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

interface Review {
  name: string;
  avatar: string;
  rating: number;
  comment: string;
  date: string;
  product: string;
}

const reviews: Review[] = [
  {
    name: 'Alex Thompson',
    avatar: 'AT',
    rating: 5,
    comment: 'Flash USDT is incredible! The instant delivery after TRC20 payment confirmation blew my mind. Got 10K Flash USDT in seconds. Will definitely be back for more!',
    date: '2 days ago',
    product: '10K Flash USDT',
  },
  {
    name: 'Maria Chen',
    avatar: 'MC',
    rating: 5,
    comment: 'The crypto payment process is so smooth. No more dealing with traditional payment gateways that reject transactions. BEP20 payments confirm quickly and the whole experience is seamless.',
    date: '1 week ago',
    product: '50K Flash USDT',
  },
  {
    name: 'James Wilson',
    avatar: 'JW',
    rating: 5,
    comment: 'Best prices for Flash USDT anywhere! 1000 Flash USDT for just $10 is an unbeatable rate. The referral program is a nice bonus too — already earned commission from friends I invited.',
    date: '2 weeks ago',
    product: '100K Flash USDT',
  },
  {
    name: 'Sarah Kim',
    avatar: 'SK',
    rating: 5,
    comment: 'Finally a platform that handles crypto properly! No conversion fees, no hassle. The automatic delivery means I get my Flash USDT instantly after payment. Highly recommended!',
    date: '3 weeks ago',
    product: '5K Flash USDT',
  },
  {
    name: 'David Okafor',
    avatar: 'DO',
    rating: 5,
    comment: 'Being in a region where traditional payment methods are limited, Flash Buy is a lifesaver. USDT TRC20 payments work perfectly and I can purchase Flash USDT from anywhere in the world.',
    date: '1 month ago',
    product: '500K Flash USDT',
  },
  {
    name: 'Emily Rodriguez',
    avatar: 'ER',
    rating: 4,
    comment: 'Very professional platform. The buyer protection gives me confidence when purchasing Flash USDT. Had one issue and support resolved it within hours. Great rates and fast delivery!',
    date: '1 month ago',
    product: '1M Flash USDT',
  },
];

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={`size-4 ${i < rating ? 'text-amber-400 fill-amber-400' : 'text-gray-300'}`}
        />
      ))}
    </div>
  );
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.15 },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' as const } },
};

export default function CustomerReviews() {
  return (
    <section className="relative py-16 sm:py-24 overflow-hidden">
      {/* Background orbs */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="orb orb-green w-[400px] h-[400px] top-1/4 -right-20 animate-float-slow" />
        <div className="orb orb-teal w-[300px] h-[300px] bottom-0 left-0 animate-float-slow" style={{ animationDelay: '3s' }} />
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
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight">
            What Our{' '}
            <span className="text-gradient-cyan">Customers Say</span>
          </h2>
          <p className="mt-2 sm:mt-3 text-slate-400 text-base sm:text-lg max-w-2xl mx-auto">
            Trusted by thousands of crypto users worldwide. Read their experiences.
          </p>
        </motion.div>

        {/* Reviews grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-50px' }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {reviews.map((review, index) => (
            <motion.div key={index} variants={cardVariants}>
              <div className="glass-card glass-card-hover rounded-2xl p-6 h-full flex flex-col gap-4">
                {/* Quote icon */}
                <Quote className="size-8 text-emerald-500/20" />

                {/* Comment */}
                <p className="text-sm leading-relaxed text-slate-300/90 flex-1">
                  &ldquo;{review.comment}&rdquo;
                </p>

                {/* Rating */}
                <StarRating rating={review.rating} />

                {/* Author */}
                <div className="flex items-center gap-3 pt-3 border-t border-emerald-500/10">
                  <Avatar className="size-10 border-2 border-emerald-500/20">
                    <AvatarFallback className="bg-emerald-500/10 text-emerald-400 text-sm font-semibold">
                      {review.avatar}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-sm truncate text-slate-200">{review.name}</div>
                    <div className="text-xs text-slate-500">
                      Purchased: {review.product}
                    </div>
                  </div>
                  <span className="text-xs text-slate-500 whitespace-nowrap">
                    {review.date}
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
