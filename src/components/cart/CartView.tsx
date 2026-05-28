'use client';

import { useState } from 'react';
import {
  ShoppingCart,
  Minus,
  Plus,
  Trash2,
  ArrowLeft,
  ArrowRight,
  Tag,
  ShoppingBag,
  X,
  Loader2,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { useStore } from '@/lib/store';
import type { CartItem } from '@/lib/types';

export default function CartView() {
  const cart = useStore((s) => s.cart);
  const removeFromCart = useStore((s) => s.removeFromCart);
  const updateCartQuantity = useStore((s) => s.updateCartQuantity);
  const getCartTotal = useStore((s) => s.getCartTotal);
  const couponCode = useStore((s) => s.couponCode);
  const couponDiscount = useStore((s) => s.couponDiscount);
  const applyCoupon = useStore((s) => s.applyCoupon);
  const removeCoupon = useStore((s) => s.removeCoupon);
  const navigate = useStore((s) => s.navigate);

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

  if (cart.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="rounded-full bg-muted p-8 mb-6">
          <ShoppingCart className="size-16 text-muted-foreground" />
        </div>
        <h2 className="text-2xl font-bold mb-2">Your Cart is Empty</h2>
        <p className="text-muted-foreground mb-6 max-w-md">
          Looks like you haven&apos;t added anything to your cart yet. Browse our products and find something you&apos;ll love!
        </p>
        <Button size="lg" className="gap-2" onClick={() => navigate('products')}>
          <ShoppingBag className="size-5" />
          Start Shopping
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold tracking-tight">Shopping Cart</h1>
          <Badge variant="secondary" className="text-sm">
            {cart.length} item{cart.length !== 1 ? 's' : ''}
          </Badge>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="gap-1.5 text-muted-foreground"
          onClick={() => navigate('products')}
        >
          <ArrowLeft className="size-4" />
          Continue Shopping
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-3">
          {cart.map((item) => (
            <CartItemRow
              key={item.productId}
              item={item}
              onRemove={() => removeFromCart(item.productId)}
              onUpdateQuantity={(qty) => updateCartQuantity(item.productId, qty)}
            />
          ))}
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <Card className="sticky top-4">
            <CardHeader>
              <CardTitle className="text-lg">Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Coupon */}
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-1.5">
                  <Tag className="size-4" />
                  Coupon Code
                </label>
                {couponCode ? (
                  <div className="flex items-center gap-2">
                    <Badge variant="default" className="gap-1.5 py-1 px-3">
                      {couponCode}
                      <span className="text-xs">(-{couponDiscount.toFixed(2)} USDT)</span>
                    </Badge>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-7 text-muted-foreground hover:text-destructive"
                      onClick={removeCoupon}
                    >
                      <X className="size-3.5" />
                    </Button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <Input
                      placeholder="Enter coupon code"
                      value={couponInput}
                      onChange={(e) => {
                        setCouponInput(e.target.value);
                        setCouponError('');
                      }}
                      onKeyDown={(e) => e.key === 'Enter' && handleApplyCoupon()}
                      className="flex-1"
                    />
                    <Button
                      variant="outline"
                      onClick={handleApplyCoupon}
                      disabled={!couponInput.trim() || couponLoading}
                    >
                      {couponLoading ? <Loader2 className="size-4 animate-spin" /> : 'Apply'}
                    </Button>
                  </div>
                )}
                {couponError && (
                  <p className="text-xs text-destructive">{couponError}</p>
                )}
              </div>

              <Separator />

              {/* Price breakdown */}
              <div className="space-y-2.5">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="font-medium">{subtotal.toFixed(2)} USDT</span>
                </div>
                {couponDiscount > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-emerald-600">Discount</span>
                    <span className="font-medium text-emerald-600">-{couponDiscount.toFixed(2)} USDT</span>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Service Fee (1%)</span>
                  <span className="font-medium">{serviceFee.toFixed(2)} USDT</span>
                </div>
              </div>

              <Separator />

              <div className="flex justify-between items-baseline">
                <span className="font-semibold">Total</span>
                <span className="text-xl font-bold text-primary">{total.toFixed(2)} USDT</span>
              </div>
            </CardContent>
            <CardFooter className="flex-col gap-3">
              <Button
                size="lg"
                className="w-full gap-2 font-semibold"
                onClick={() => navigate('checkout')}
              >
                Proceed to Checkout
                <ArrowRight className="size-4" />
              </Button>
              <Button
                variant="outline"
                className="w-full gap-2"
                onClick={() => navigate('products')}
              >
                Continue Shopping
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}

// Cart Item Row Component
function CartItemRow({
  item,
  onRemove,
  onUpdateQuantity,
}: {
  item: CartItem;
  onRemove: () => void;
  onUpdateQuantity: (qty: number) => void;
}) {
  const initials = item.name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
  const hue = item.productId.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0) % 360;
  const itemSubtotal = item.price * item.quantity;

  return (
    <Card className="py-0 gap-0">
      <CardContent className="p-4">
        <div className="flex gap-4">
          {/* Image */}
          <div className="shrink-0 size-20 rounded-lg overflow-hidden bg-muted">
            {item.image ? (
              <img src={item.image} alt={item.name} className="h-full w-full object-cover" />
            ) : (
              <div
                className="flex h-full w-full items-center justify-center text-white font-bold text-lg"
                style={{ backgroundColor: `hsl(${hue}, 60%, 55%)` }}
              >
                {initials}
              </div>
            )}
          </div>

          {/* Details */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <h3 className="font-semibold text-sm truncate">{item.name}</h3>
                <div className="flex items-center gap-2 mt-1">
                  {item.deliveryType === 'automatic' ? (
                    <Badge variant="outline" className="text-xs gap-1 text-emerald-600 border-emerald-200 bg-emerald-50 py-0">
                      ⚡ Auto
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="text-xs gap-1 text-amber-600 border-amber-200 bg-amber-50 py-0">
                      🕐 Manual
                    </Badge>
                  )}
                  <span className="text-xs text-muted-foreground">
                    {item.price.toFixed(2)} USDT each
                  </span>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="shrink-0 size-8 text-muted-foreground hover:text-destructive"
                onClick={onRemove}
              >
                <Trash2 className="size-4" />
              </Button>
            </div>

            {/* Quantity & Subtotal */}
            <div className="flex items-center justify-between mt-3">
              <div className="flex items-center border rounded-md">
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-7 rounded-r-none"
                  onClick={() => onUpdateQuantity(item.quantity - 1)}
                  disabled={item.quantity <= 1}
                >
                  <Minus className="size-3" />
                </Button>
                <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-7 rounded-l-none"
                  onClick={() => onUpdateQuantity(item.quantity + 1)}
                  disabled={item.quantity >= item.stock}
                >
                  <Plus className="size-3" />
                </Button>
              </div>
              <span className="font-bold text-sm text-primary">
                {itemSubtotal.toFixed(2)} USDT
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
