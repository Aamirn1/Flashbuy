'use client';

import { motion } from 'framer-motion';
import { Star, Quote } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
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
    comment: 'Absolutely love Flash Buy! The instant delivery is a game-changer. I purchased a software license and received it within seconds after my USDT payment confirmed. Will definitely be back!',
    date: '2 days ago',
    product: 'Software License',
  },
  {
    name: 'Maria Chen',
    avatar: 'MC',
    rating: 5,
    comment: 'The crypto payment process is so smooth. No more dealing with traditional payment gateways that reject transactions. TRC20 payments confirm quickly and the whole experience is seamless.',
    date: '1 week ago',
    product: 'VPN Subscription',
  },
  {
    name: 'James Wilson',
    avatar: 'JW',
    rating: 4,
    comment: 'Great platform with competitive prices. The referral program is a nice bonus — already earned some commission from friends I invited. Customer support is responsive too.',
    date: '2 weeks ago',
    product: 'Gaming Key',
  },
  {
    name: 'Sarah Kim',
    avatar: 'SK',
    rating: 5,
    comment: 'Finally a marketplace that accepts crypto properly! No conversion fees, no hassle. The automatic delivery feature means I get my products instantly. Highly recommended.',
    date: '3 weeks ago',
    product: 'E-book Bundle',
  },
  {
    name: 'David Okafor',
    avatar: 'DO',
    rating: 5,
    comment: 'Being in a region where traditional payment methods are limited, Flash Buy is a lifesaver. USDT payments work perfectly and I can access digital products from anywhere in the world.',
    date: '1 month ago',
    product: 'Course Access',
  },
  {
    name: 'Emily Rodriguez',
    avatar: 'ER',
    rating: 4,
    comment: 'Very professional platform. The buyer protection gives me confidence when making purchases. Had one issue and support resolved it within hours. The 5% first-order discount was a nice touch!',
    date: '1 month ago',
    product: 'Streaming Account',
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
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
};

export default function CustomerReviews() {
  return (
    <section className="py-16 sm:py-20 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
            What Our{' '}
            <span className="bg-gradient-to-r from-emerald-600 to-emerald-500 bg-clip-text text-transparent">
              Customers Say
            </span>
          </h2>
          <p className="mt-3 text-muted-foreground text-lg max-w-2xl mx-auto">
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
              <Card className="h-full border-border/50 hover:border-emerald-500/20 hover:shadow-md transition-all duration-300">
                <CardContent className="p-6 space-y-4">
                  {/* Quote icon */}
                  <Quote className="size-8 text-emerald-500/20" />

                  {/* Comment */}
                  <p className="text-sm leading-relaxed text-foreground/90">
                    &ldquo;{review.comment}&rdquo;
                  </p>

                  {/* Rating */}
                  <StarRating rating={review.rating} />

                  {/* Author */}
                  <div className="flex items-center gap-3 pt-2 border-t border-border/50">
                    <Avatar className="size-10 border-2 border-emerald-500/20">
                      <AvatarFallback className="bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 text-sm font-semibold">
                        {review.avatar}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-sm truncate">{review.name}</div>
                      <div className="text-xs text-muted-foreground">
                        Purchased: {review.product}
                      </div>
                    </div>
                    <span className="text-xs text-muted-foreground whitespace-nowrap">
                      {review.date}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
