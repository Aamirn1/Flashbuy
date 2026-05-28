'use client';

import { motion, useMotionValue, animate } from 'framer-motion';
import { useEffect, useState, useCallback } from 'react';
import { ShoppingCart, Zap, Minus, Plus } from 'lucide-react';
import { useStore, calculatePrice, FLASH_USDT_MIN, FLASH_USDT_MAX, FLASH_USDT_UNIT } from '@/lib/store';

const quickSelects = [
  { label: '1K', value: 1000 },
  { label: '5K', value: 5000 },
  { label: '10K', value: 10000 },
  { label: '50K', value: 50000 },
  { label: '100K', value: 100000 },
  { label: '500K', value: 500000 },
  { label: '1M', value: 1000000 },
];

export default function FlashUSDTProduct() {
  const {
    flashQuantity,
    setFlashQuantity,
    incrementFlash,
    decrementFlash,
    addToCart,
    navigate,
  } = useStore();

  const [displayPrice, setDisplayPrice] = useState(calculatePrice(flashQuantity));
  const motionPrice = useMotionValue(calculatePrice(flashQuantity));

  useEffect(() => {
    const controls = animate(motionPrice, calculatePrice(flashQuantity), {
      duration: 0.4,
      ease: 'easeOut',
      onUpdate: (v) => setDisplayPrice(Math.round(v * 100) / 100),
    });
    return () => controls.stop();
  }, [flashQuantity, motionPrice]);

  const handleAddToCart = useCallback(() => {
    addToCart({
      productId: 'flash-usdt',
      name: 'Flash USDT',
      price: calculatePrice(flashQuantity),
      quantity: 1,
      image: '',
      deliveryType: 'automatic',
      stock: 999999999,
    });
    navigate('cart');
  }, [addToCart, flashQuantity, navigate]);

  const handleBuyNow = useCallback(() => {
    addToCart({
      productId: 'flash-usdt',
      name: 'Flash USDT',
      price: calculatePrice(flashQuantity),
      quantity: 1,
      image: '',
      deliveryType: 'automatic',
      stock: 999999999,
    });
    navigate('checkout');
  }, [addToCart, flashQuantity, navigate]);

  const formatQuantityDisplay = (qty: number): string => {
    return qty.toLocaleString();
  };

  return (
    <section className="relative py-16 sm:py-24 overflow-hidden">
      {/* Background orbs */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="orb orb-cyan w-[400px] h-[400px] top-0 left-1/4 animate-float-slow" />
        <div className="orb orb-teal w-[300px] h-[300px] bottom-0 right-1/4 animate-float-slow" style={{ animationDelay: '3s' }} />
      </div>

      <div className="relative z-10 max-w-2xl mx-auto px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
        >
          {/* Product Card with 3D effect */}
          <div className="card-3d">
            <div className="card-3d-inner glass-card rounded-2xl p-6 sm:p-8 animate-pulse-glow">
              {/* 3D Coin */}
              <div className="flex justify-center mb-6">
                <motion.div
                  initial={{ scale: 0, rotateY: -180 }}
                  animate={{ scale: 1, rotateY: 0 }}
                  transition={{ duration: 0.8, ease: 'easeOut' }}
                >
                  <div className="coin-3d animate-spin-coin" style={{ width: 120, height: 120 }} />
                  <style>{`.coin-3d[style*="120px"]::after { font-size: 48px; inset: 6px; }`}</style>
                </motion.div>
              </div>

              {/* Title */}
              <div className="text-center mb-6">
                <h2 className="text-3xl sm:text-4xl font-black text-gradient-cyan">
                  Flash USDT
                </h2>
                <p className="mt-2 text-sm text-slate-400">
                  Instant Transfer &bull; TRC20 / BEP20
                </p>
              </div>

              {/* Quantity Selector */}
              <div className="mb-6">
                <label className="block text-xs font-medium text-slate-400 uppercase tracking-wider mb-3">
                  Quantity
                </label>
                <div className="flex items-center justify-center gap-4 mb-4">
                  <button
                    className="qty-btn"
                    onClick={() => decrementFlash(FLASH_USDT_UNIT)}
                    disabled={flashQuantity <= FLASH_USDT_MIN}
                    aria-label="Decrease quantity"
                  >
                    <Minus className="size-5" />
                  </button>

                  <motion.div
                    key={flashQuantity}
                    initial={{ scale: 1.1, opacity: 0.7 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.2 }}
                    className="min-w-[140px] text-center"
                  >
                    <span className="text-3xl sm:text-4xl font-black text-gradient-gold">
                      {formatQuantityDisplay(flashQuantity)}
                    </span>
                  </motion.div>

                  <button
                    className="qty-btn"
                    onClick={() => incrementFlash(FLASH_USDT_UNIT)}
                    disabled={flashQuantity >= FLASH_USDT_MAX}
                    aria-label="Increase quantity"
                  >
                    <Plus className="size-5" />
                  </button>
                </div>

                {/* Quick select buttons */}
                <div className="flex flex-wrap justify-center gap-2">
                  {quickSelects.map((qs) => (
                    <button
                      key={qs.value}
                      onClick={() => setFlashQuantity(qs.value)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 ${
                        flashQuantity === qs.value
                          ? 'bg-cyan-500/20 border border-cyan-400/40 text-cyan-300 glow-cyan'
                          : 'glass-light text-slate-400 hover:text-cyan-300 hover:border-cyan-400/30'
                      }`}
                    >
                      {qs.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Divider */}
              <div className="h-px bg-gradient-to-r from-transparent via-cyan-500/20 to-transparent my-6" />

              {/* Price Display */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-slate-400">Price</span>
                  <span className="text-xs text-slate-500">
                    Rate: 1000 Flash USDT = $10.00
                  </span>
                </div>
                <motion.div className="text-right">
                  <span className="text-4xl sm:text-5xl font-black text-gradient-cyan">
                    ${displayPrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </motion.div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col gap-3">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleAddToCart}
                  className="w-full flex items-center justify-center gap-2 px-6 py-4 rounded-xl glass-card glow-cyan text-cyan-300 font-bold text-base transition-all hover:text-white hover:border-cyan-400/40"
                >
                  <ShoppingCart className="size-5" />
                  Add to Cart
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleBuyNow}
                  className="w-full flex items-center justify-center gap-2 px-6 py-4 rounded-xl bg-gradient-to-r from-cyan-500 to-cyan-400 glow-cyan-strong text-gray-950 font-bold text-base transition-all hover:from-cyan-400 hover:to-cyan-300"
                >
                  <Zap className="size-5" />
                  Buy Now
                </motion.button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
