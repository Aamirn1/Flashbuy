'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShoppingCart,
  Trash2,
  ArrowRight,
  Tag,
  ShoppingBag,
  X,
  Loader2,
  Zap,
  Minus,
  Plus,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { useStore, formatUSDT } from '@/lib/store';
import type { CartItem } from '@/lib/types';

export default function CartView() {
  const cart = useStore((s) => s.cart);
  const removeFromCart = useStore((s) => s.removeFromCart);
  const updateCartQuantity = useStore((s) => s.updateCartQuantity);
  const couponCode = useStore((s) => s.couponCode);
  const couponDiscount = useStore((s) => s.couponDiscount);
  const applyCoupon = useStore((s) => s.applyCoupon);
  const removeCoupon = useStore((s) => s.removeCoupon);
  const navigate = useStore((s) => s.navigate);
  const isAuthenticated = useStore((s) => s.isAuthenticated);
  const setShowAuthDialog = useStore((s) => s.setShowAuthDialog);

  const [couponInput, setCouponInput] = useState('');
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponError, setCouponError] = useState('');

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const serviceFee = subtotal > 0 ? parseFloat((subtotal * 0.01).toFixed(2)) : 0;
  const total = Math.max(0, subtotal - couponDiscount + serviceFee);

  const handleApplyCoupon = async () => {
    if (!couponInput.trim()) return;
    setCouponLoading(true);
    setCouponError('');

    try {
      const res = await fetch('/api/coupons/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: couponInput.trim(), subtotal }),
      });

      if (res.ok) {
        const data = await res.json();
        applyCoupon(data.code, data.discount);
        setCouponInput('');
      } else {
        const data = await res.json();
        setCouponError(data.error || 'Invalid coupon code');
      }
    } catch {
      setCouponError('Failed to validate coupon. Please try again.');
    } finally {
      setCouponLoading(false);
    }
  };

  // Empty cart state
  if (cart.length === 0) {
    return (
      <div className="relative min-h-[80vh] bg-mesh overflow-hidden">
        {/* Animated Orbs */}
        <div className="orb orb-cyan w-[500px] h-[500px] -top-40 -left-40 animate-float-slow" />
        <div className="orb orb-teal w-[400px] h-[400px] bottom-20 -right-32 animate-float" />

        <div className="relative z-10 flex flex-col items-center justify-center py-20 text-center px-4">
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', stiffness: 200, damping: 20 }}
          >
            <div className="coin-3d animate-float mx-auto mb-8" />
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-3xl font-bold mb-3"
          >
            Your cart is empty
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-muted-foreground mb-8 max-w-md"
          >
            Looks like you haven&apos;t added any Flash USDT yet. Get started with our amazing rates!
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Button
              size="lg"
              className="gap-2 glow-cyan-strong bg-primary/90 hover:bg-primary text-primary-foreground font-semibold px-8"
              onClick={() => navigate('products')}
            >
              <ShoppingBag className="size-5" />
              Browse Products
            </Button>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative bg-mesh min-h-screen overflow-hidden">
      {/* Animated Orbs */}
      <div className="orb orb-cyan w-[600px] h-[600px] -top-60 -left-60 animate-float-slow" />
      <div className="orb orb-blue w-[400px] h-[400px] top-1/3 -right-48 animate-float" />
      <div className="orb orb-teal w-[350px] h-[350px] -bottom-32 left-1/4 animate-float-slow" />

      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-8"
        >
          <div className="flex items-center gap-4">
            <h1 className="text-3xl sm:text-4xl font-bold text-gradient-cyan">Your Cart</h1>
            <Badge className="glass-light text-emerald-300 border-emerald-500/20 px-3 py-1 text-sm font-semibold">
              {cart.length} item{cart.length !== 1 ? 's' : ''}
            </Badge>
          </div>
          <button
            onClick={() => navigate('products')}
            className="text-sm text-muted-foreground hover:text-emerald-400 transition-colors flex items-center gap-1.5"
          >
            Continue Shopping
          </button>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            <AnimatePresence mode="popLayout">
              {cart.map((item, index) => (
                <CartItemRow
                  key={item.productId}
                  item={item}
                  index={index}
                  onRemove={() => removeFromCart(item.productId)}
                  onUpdateQuantity={(qty) => updateCartQuantity(item.productId, qty)}
                />
              ))}
            </AnimatePresence>
          </div>

          {/* Order Summary */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-1"
          >
            <div className="glass-card rounded-2xl p-6 sticky top-24 space-y-5">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                  <ShieldCheck className="size-4 text-emerald-400" />
                </div>
                <h2 className="text-lg font-bold">Order Summary</h2>
              </div>

              {/* Coupon */}
              <div className="space-y-2.5">
                <label className="text-sm font-medium flex items-center gap-1.5 text-muted-foreground">
                  <Tag className="size-3.5" />
                  Coupon Code
                </label>
                {couponCode ? (
                  <motion.div
                    initial={{ scale: 0.95 }}
                    animate={{ scale: 1 }}
                    className="flex items-center gap-2"
                  >
                    <Badge className="glass-light text-emerald-300 border-emerald-500/20 gap-1.5 py-1.5 px-3">
                      <Sparkles className="size-3" />
                      {couponCode}
                      <span className="text-xs opacity-75">(-${couponDiscount.toFixed(2)})</span>
                    </Badge>
                    <button
                      className="size-6 rounded-full flex items-center justify-center hover:bg-red-500/20 text-muted-foreground hover:text-red-400 transition-colors"
                      onClick={removeCoupon}
                    >
                      <X className="size-3" />
                    </button>
                  </motion.div>
                ) : (
                  <div className="flex gap-2">
                    <Input
                      placeholder="Enter code"
                      value={couponInput}
                      onChange={(e) => {
                        setCouponInput(e.target.value);
                        setCouponError('');
                      }}
                      onKeyDown={(e) => e.key === 'Enter' && handleApplyCoupon()}
                      className="flex-1 glass-input rounded-xl h-10"
                    />
                    <Button
                      variant="outline"
                      onClick={handleApplyCoupon}
                      disabled={!couponInput.trim() || couponLoading}
                      className="glass-light border-emerald-500/20 text-emerald-300 hover:bg-emerald-500/10 hover:text-emerald-200 rounded-xl"
                    >
                      {couponLoading ? <Loader2 className="size-4 animate-spin" /> : 'Apply'}
                    </Button>
                  </div>
                )}
                {couponError && (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-xs text-red-400"
                  >
                    {couponError}
                  </motion.p>
                )}
              </div>

              <div className="h-px bg-gradient-to-r from-transparent via-emerald-500/20 to-transparent" />

              {/* Price breakdown */}
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="font-medium">${subtotal.toFixed(2)}</span>
                </div>
                {couponDiscount > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-emerald-400">Discount</span>
                    <span className="font-medium text-emerald-400">-${couponDiscount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Service Fee (1%)</span>
                  <span className="font-medium">${serviceFee.toFixed(2)}</span>
                </div>
              </div>

              <div className="h-px bg-gradient-to-r from-transparent via-emerald-500/20 to-transparent" />

              <div className="flex justify-between items-baseline">
                <span className="font-semibold text-lg">Total</span>
                <span className="text-2xl font-bold text-gradient-gold">${total.toFixed(2)}</span>
              </div>

              <Button
                size="lg"
                className="w-full gap-2 font-semibold glow-cyan-strong bg-primary/90 hover:bg-primary text-primary-foreground rounded-xl h-12 text-base"
                onClick={() => {
                  if (!isAuthenticated) {
                    setShowAuthDialog(true, 'register');
                  } else {
                    navigate('checkout');
                  }
                }}
              >
                {isAuthenticated ? 'Proceed to Checkout' : 'Sign Up to Checkout'}
                <ArrowRight className="size-5" />
              </Button>

              <button
                onClick={() => navigate('products')}
                className="w-full text-center text-sm text-muted-foreground hover:text-emerald-400 transition-colors py-2"
              >
                Continue Shopping
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

// Cart Item Row with glassmorphism
function CartItemRow({
  item,
  index,
  onRemove,
  onUpdateQuantity,
}: {
  item: CartItem;
  index: number;
  onRemove: () => void;
  onUpdateQuantity: (qty: number) => void;
}) {
  const itemSubtotal = item.price * item.quantity;
  // Format quantity for Flash USDT display
  const displayQuantity = item.name.toLowerCase().includes('flash')
    ? `${formatUSDT(item.quantity)} Flash USDT`
    : `Qty: ${item.quantity}`;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -100, scale: 0.9 }}
      transition={{ delay: index * 0.05 }}
    >
      <div className="glass-card glass-card-hover rounded-2xl p-4 sm:p-5 group">
        <div className="flex gap-3 sm:gap-4">
          {/* Coin Icon */}
          <div className="shrink-0">
            <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-xl bg-gradient-to-br from-emerald-500/20 to-emerald-600/5 border border-emerald-500/15 flex items-center justify-center">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-500/20">
                <span className="text-white font-bold text-xs sm:text-sm">₮</span>
              </div>
            </div>
          </div>

          {/* Details */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <h3 className="font-bold text-base">{item.name}</h3>
                <div className="flex items-center gap-2 mt-1">
                  {item.deliveryType === 'automatic' ? (
                    <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 text-xs gap-1 py-0">
                      <Zap className="size-3" />
                      Auto Delivery
                    </Badge>
                  ) : (
                    <Badge className="bg-amber-500/10 text-amber-400 border-amber-500/20 text-xs gap-1 py-0">
                      Manual
                    </Badge>
                  )}
                  <span className="text-xs text-muted-foreground">
                    {item.name.toLowerCase().includes('flash')
                      ? '1,000 = $10.00'
                      : `$${item.price.toFixed(2)} each`}
                  </span>
                </div>
              </div>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="shrink-0 size-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-red-400 hover:bg-red-500/10 transition-colors"
                onClick={onRemove}
              >
                <Trash2 className="size-4" />
              </motion.button>
            </div>

            {/* Quantity & Price */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mt-4 gap-3">
              <div className="flex items-center gap-2 sm:gap-3">
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className="qty-btn shrink-0"
                  onClick={() => onUpdateQuantity(item.quantity - 1000)}
                  disabled={item.quantity <= 1000}
                >
                  <Minus className="size-4" />
                </motion.button>
                <span className="text-sm font-semibold min-w-[80px] sm:min-w-[140px] text-center">
                  {displayQuantity}
                </span>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className="qty-btn shrink-0"
                  onClick={() => onUpdateQuantity(item.quantity + 1000)}
                  disabled={item.quantity >= item.stock}
                >
                  <Plus className="size-4" />
                </motion.button>
              </div>
              <span className="text-lg font-bold text-gradient-cyan sm:text-right">
                ${itemSubtotal.toFixed(2)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
