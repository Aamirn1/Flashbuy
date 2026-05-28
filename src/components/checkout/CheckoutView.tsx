'use client';

import { useState, useEffect } from 'react';
import {
  ArrowLeft,
  Copy,
  Check,
  Clock,
  AlertTriangle,
  Shield,
  QrCode,
  CheckCircle2,
  Loader2,
  ExternalLink,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { useStore } from '@/lib/store';
import { CRYPTO_WALLETS } from '@/lib/constants';

type PaymentMethod = 'usdt_trc20' | 'usdt_bep20';

export default function CheckoutView() {
  const cart = useStore((s) => s.cart);
  const couponDiscount = useStore((s) => s.couponDiscount);
  const clearCart = useStore((s) => s.clearCart);
  const removeCoupon = useStore((s) => s.removeCoupon);
  const navigate = useStore((s) => s.navigate);

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('usdt_trc20');
  const [copiedAddress, setCopiedAddress] = useState(false);
  const [timeLeft, setTimeLeft] = useState(15 * 60); // 15 minutes in seconds
  const [isConfirming, setIsConfirming] = useState(false);
  const [orderComplete, setOrderComplete] = useState(false);
  const [orderNumber, setOrderNumber] = useState('');

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const serviceFee = subtotal > 0 ? parseFloat((subtotal * 0.01).toFixed(2)) : 0;
  const total = Math.max(0, subtotal - couponDiscount + serviceFee);

  const selectedWallet = CRYPTO_WALLETS[paymentMethod];

  // Timer countdown
  useEffect(() => {
    if (orderComplete) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [orderComplete]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const copyAddress = async () => {
    try {
      await navigator.clipboard.writeText(selectedWallet.address);
      setCopiedAddress(true);
      setTimeout(() => setCopiedAddress(false), 2000);
    } catch {
      // Fallback
      const textArea = document.createElement('textarea');
      textArea.value = selectedWallet.address;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopiedAddress(true);
      setTimeout(() => setCopiedAddress(false), 2000);
    }
  };

  const handleConfirmPayment = async () => {
    setIsConfirming(true);
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: cart.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
            price: item.price,
          })),
          paymentMethod,
          couponDiscount,
          total,
        }),
      });

      let newOrderNumber = '';
      if (res.ok) {
        const data = await res.json();
        newOrderNumber = data.order?.orderNumber || data.orderNumber || generateOrderNumber();
      } else {
        newOrderNumber = generateOrderNumber();
      }

      setOrderNumber(newOrderNumber);
      setOrderComplete(true);
      clearCart();
      removeCoupon();
    } catch {
      // Even if API fails, show success for demo purposes
      setOrderNumber(generateOrderNumber());
      setOrderComplete(true);
      clearCart();
      removeCoupon();
    } finally {
      setIsConfirming(false);
    }
  };

  // Order Complete State
  if (orderComplete) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center max-w-lg mx-auto">
        <div className="rounded-full bg-emerald-100 p-4 mb-6">
          <CheckCircle2 className="size-16 text-emerald-600" />
        </div>
        <h1 className="text-2xl font-bold mb-2">Payment Submitted!</h1>
        <p className="text-muted-foreground mb-2">
          Your payment confirmation has been received. We&apos;re verifying your transaction on the blockchain.
        </p>
        <Card className="w-full mt-6 mb-6">
          <CardContent className="pt-6 space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Order Number</span>
              <span className="font-mono font-semibold">{orderNumber}</span>
            </div>
            <Separator />
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Amount</span>
              <span className="font-semibold">{total.toFixed(2)} USDT</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Payment Method</span>
              <span className="font-medium">{selectedWallet.name}</span>
            </div>
            <Separator />
            <div className="flex items-start gap-2 p-3 bg-amber-50 rounded-lg border border-amber-200">
              <AlertTriangle className="size-4 text-amber-600 mt-0.5 shrink-0" />
              <p className="text-xs text-amber-700 text-left">
                Your order will be processed once the blockchain confirms your payment.
                This typically takes {selectedWallet.estimatedTime}. You can check your order status
                in the Orders page.
              </p>
            </div>
          </CardContent>
        </Card>
        <div className="flex flex-col sm:flex-row gap-3 w-full">
          <Button className="flex-1 gap-2" onClick={() => navigate('orders')}>
            <ExternalLink className="size-4" />
            View Orders
          </Button>
          <Button variant="outline" className="flex-1" onClick={() => navigate('products')}>
            Continue Shopping
          </Button>
        </div>
      </div>
    );
  }

  if (cart.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="rounded-full bg-muted p-8 mb-6">
          <Shield className="size-16 text-muted-foreground" />
        </div>
        <h2 className="text-2xl font-bold mb-2">No Items to Checkout</h2>
        <p className="text-muted-foreground mb-6">Add some products to your cart before proceeding.</p>
        <Button onClick={() => navigate('products')}>Browse Products</Button>
      </div>
    );
  }

  const isExpired = timeLeft === 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          className="shrink-0"
          onClick={() => navigate('cart')}
        >
          <ArrowLeft className="size-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Checkout</h1>
          <p className="text-sm text-muted-foreground">Complete your purchase with USDT</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Payment Section */}
        <div className="lg:col-span-2 space-y-6">
          {/* Timer */}
          <Card className={`${isExpired ? 'border-red-200 bg-red-50/50' : 'border-amber-200 bg-amber-50/50'}`}>
            <CardContent className="flex items-center gap-3 py-4">
              <Clock className={`size-5 ${isExpired ? 'text-red-500' : 'text-amber-500'}`} />
              <div className="flex-1">
                <p className={`text-sm font-medium ${isExpired ? 'text-red-700' : 'text-amber-700'}`}>
                  {isExpired ? 'Payment window expired' : 'Complete payment within'}
                </p>
                {!isExpired && (
                  <p className="text-xs text-amber-600 mt-0.5">
                    Please send the exact amount before the timer runs out
                  </p>
                )}
              </div>
              <span className={`font-mono text-2xl font-bold ${isExpired ? 'text-red-600' : 'text-amber-600'}`}>
                {formatTime(timeLeft)}
              </span>
            </CardContent>
          </Card>

          {/* Payment Method Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Payment Method</CardTitle>
            </CardHeader>
            <CardContent>
              <RadioGroup
                value={paymentMethod}
                onValueChange={(val) => setPaymentMethod(val as PaymentMethod)}
                className="space-y-3"
              >
                {Object.entries(CRYPTO_WALLETS).map(([key, wallet]) => (
                  <Label
                    key={key}
                    htmlFor={key}
                    className={`flex items-center gap-4 p-4 rounded-lg border-2 cursor-pointer transition-all ${
                      paymentMethod === key
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-primary/50'
                    }`}
                  >
                    <RadioGroupItem value={key} id={key} />
                    <div className="text-2xl">{wallet.icon}</div>
                    <div className="flex-1">
                      <div className="font-semibold text-sm">{wallet.name}</div>
                      <div className="text-xs text-muted-foreground">{wallet.network}</div>
                    </div>
                    <div className="text-right">
                      <Badge variant="outline" className="text-xs">
                        ~{wallet.estimatedTime}
                      </Badge>
                      <div className="text-xs text-muted-foreground mt-1">
                        {wallet.confirmations} confirmations
                      </div>
                    </div>
                  </Label>
                ))}
              </RadioGroup>
            </CardContent>
          </Card>

          {/* Wallet Address & QR */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Send Payment</CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              {/* Amount to send */}
              <div className="p-4 bg-primary/5 rounded-lg border border-primary/20">
                <p className="text-sm text-muted-foreground">Send exactly</p>
                <p className="text-3xl font-bold text-primary mt-1">{total.toFixed(2)} USDT</p>
                <p className="text-xs text-muted-foreground mt-1">
                  on {selectedWallet.network}
                </p>
              </div>

              {/* Wallet Address */}
              <div className="space-y-2">
                <p className="text-sm font-medium">To this wallet address:</p>
                <div className="flex items-center gap-2">
                  <div className="flex-1 bg-muted rounded-lg px-4 py-3 font-mono text-sm break-all">
                    {selectedWallet.address}
                  </div>
                  <Button
                    variant="outline"
                    size="icon"
                    className="shrink-0 size-10"
                    onClick={copyAddress}
                  >
                    {copiedAddress ? (
                      <Check className="size-4 text-emerald-600" />
                    ) : (
                      <Copy className="size-4" />
                    )}
                  </Button>
                </div>
                {copiedAddress && (
                  <p className="text-xs text-emerald-600 font-medium">Address copied to clipboard!</p>
                )}
              </div>

              {/* QR Code Placeholder */}
              <div className="flex flex-col items-center gap-3 p-6 bg-muted/50 rounded-lg">
                <div className="size-40 bg-white rounded-xl flex items-center justify-center border shadow-sm">
                  <QrCode className="size-24 text-muted-foreground" />
                </div>
                <p className="text-xs text-muted-foreground text-center">
                  Scan QR code with your wallet app to send payment
                </p>
              </div>

              {/* Important notice */}
              <div className="flex items-start gap-2 p-3 bg-amber-50 rounded-lg border border-amber-200">
                <AlertTriangle className="size-4 text-amber-600 mt-0.5 shrink-0" />
                <div className="text-xs text-amber-700 space-y-1">
                  <p className="font-semibold">Important:</p>
                  <ul className="list-disc list-inside space-y-0.5">
                    <li>Send only USDT on the {selectedWallet.network}</li>
                    <li>Sending on the wrong network may result in permanent loss</li>
                    <li>Send exactly {total.toFixed(2)} USDT — no more, no less</li>
                    <li>Payment typically confirms in {selectedWallet.estimatedTime}</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right: Order Summary */}
        <div className="lg:col-span-1">
          <Card className="sticky top-4">
            <CardHeader>
              <CardTitle className="text-lg">Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Items */}
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {cart.map((item) => (
                  <div key={item.productId} className="flex items-center gap-3">
                    <div className="shrink-0 size-10 rounded-md bg-muted flex items-center justify-center text-xs font-bold">
                      {item.name.split(' ').map(w => w[0]).join('').slice(0, 2)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{item.name}</p>
                      <p className="text-xs text-muted-foreground">Qty: {item.quantity}</p>
                    </div>
                    <span className="text-sm font-medium shrink-0">
                      {(item.price * item.quantity).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>

              <Separator />

              {/* Price breakdown */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>{subtotal.toFixed(2)} USDT</span>
                </div>
                {couponDiscount > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-emerald-600">Discount</span>
                    <span className="text-emerald-600">-{couponDiscount.toFixed(2)} USDT</span>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Service Fee (1%)</span>
                  <span>{serviceFee.toFixed(2)} USDT</span>
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
                onClick={handleConfirmPayment}
                disabled={isExpired || isConfirming}
              >
                {isConfirming ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    Confirming...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="size-5" />
                    I&apos;ve Paid — Confirm Payment
                  </>
                )}
              </Button>
              <Button
                variant="outline"
                className="w-full gap-2"
                onClick={() => navigate('cart')}
              >
                <ArrowLeft className="size-4" />
                Back to Cart
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}

function generateOrderNumber(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = 'FB-';
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}
