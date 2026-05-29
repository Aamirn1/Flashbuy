'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Copy,
  Check,
  Clock,
  AlertTriangle,
  Shield,
  QrCode,
  CheckCircle2,
  Loader2,
  ExternalLink,
  ArrowLeft,
  Zap,
  Link2,
  CircleDot,
  Sparkles,
  Wallet,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { useStore, formatUSDT } from '@/lib/store';
import { CRYPTO_WALLETS } from '@/lib/constants';

type PaymentMethod = 'usdt_trc20' | 'usdt_bep20';

export default function CheckoutView() {
  const cart = useStore((s) => s.cart);
  const couponDiscount = useStore((s) => s.couponDiscount);
  const clearCart = useStore((s) => s.clearCart);
  const removeCoupon = useStore((s) => s.removeCoupon);
  const navigate = useStore((s) => s.navigate);
  const user = useStore((s) => s.user);
  const isAuthenticated = useStore((s) => s.isAuthenticated);
  const setShowAuthDialog = useStore((s) => s.setShowAuthDialog);
  const setUser = useStore((s) => s.setUser);

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('usdt_trc20');
  const [copiedAddress, setCopiedAddress] = useState(false);
  const [timeLeft, setTimeLeft] = useState(15 * 60); // 15 minutes

  // Payment proof fields
  const [paymentTxHash, setPaymentTxHash] = useState('');
  const [paymentScreenshot, setPaymentScreenshot] = useState('');

  // Wallet selection for Flash USDT delivery
  const [deliveryWallet, setDeliveryWallet] = useState<'profile' | 'custom'>(
    user?.walletAddress ? 'profile' : 'custom'
  );
  const [customWalletAddress, setCustomWalletAddress] = useState('');
  const [customWalletNetwork, setCustomWalletNetwork] = useState<'usdt_trc20' | 'usdt_bep20'>('usdt_trc20');

  // Redirect to registration if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      setShowAuthDialog(true, 'register');
      navigate('products');
    }
  }, [isAuthenticated, setShowAuthDialog, navigate]);

  const [isConfirming, setIsConfirming] = useState(false);
  const [orderComplete, setOrderComplete] = useState(false);

  // Scroll to top when order is complete - MUST scroll to top!
  useEffect(() => {
    if (orderComplete) {
      // Multiple attempts to ensure scroll-to-top works on all browsers
      const scrollToTop = () => {
        window.scrollTo({ top: 0, left: 0, behavior: 'instant' as ScrollBehavior });
        document.documentElement.scrollTop = 0;
        document.body.scrollTop = 0;
        if (document.scrollingElement) {
          document.scrollingElement.scrollTop = 0;
        }
      };
      // Immediate attempt
      scrollToTop();
      // RAF attempt (after DOM update)
      requestAnimationFrame(() => {
        scrollToTop();
        // Double RAF for safety
        requestAnimationFrame(scrollToTop);
      });
      // Delayed attempt as final fallback
      setTimeout(scrollToTop, 100);
      setTimeout(scrollToTop, 300);
    }
  }, [orderComplete]);
  const [orderNumber, setOrderNumber] = useState('');
  const [disclaimerAccepted, setDisclaimerAccepted] = useState(false);
  const [completedTotal, setCompletedTotal] = useState(0);
  const [completedQuantity, setCompletedQuantity] = useState('');

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const serviceFee = subtotal > 0 ? parseFloat((subtotal * 0.01).toFixed(2)) : 0;
  const total = Math.max(0, subtotal - couponDiscount + serviceFee);

  const selectedWallet = CRYPTO_WALLETS[paymentMethod];

  // Get the delivery wallet address
  const getDeliveryWalletAddress = () => {
    if (deliveryWallet === 'profile') return user?.walletAddress || '';
    return customWalletAddress;
  };

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
    // Store totals BEFORE clearing cart
    const currentTotal = total;
    const currentQuantity = cart.map((item) =>
      item.name.toLowerCase().includes('flash')
        ? `${formatUSDT(item.quantity)} Flash USDT`
        : `Qty: ${item.quantity}`
    ).join(', ');
    setCompletedTotal(currentTotal);
    setCompletedQuantity(currentQuantity);

    // Determine delivery wallet address
    const walletAddr = getDeliveryWalletAddress();

    // Save wallet address to user profile if using custom and it's valid
    if (deliveryWallet === 'custom' && customWalletAddress && user) {
      try {
        const updateRes = await fetch('/api/user/profile', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ walletAddress: customWalletAddress }),
        });
        if (updateRes.ok) {
          const updateData = await updateRes.json();
          if (updateData.user) setUser(updateData.user);
        }
      } catch {
        // Non-critical, continue
      }
    }

    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user?.id,
          items: cart.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
            price: item.price,
          })),
          couponCode: useStore.getState().couponCode,
          couponDiscount,
          paymentMethod,
          total: currentTotal,
          deliveryWalletAddress: walletAddr,
          deliveryWalletNetwork: deliveryWallet === 'profile' ? paymentMethod : customWalletNetwork,
          paymentTxHash: paymentTxHash.trim() || undefined,
          paymentScreenshot: paymentScreenshot.trim() || undefined,
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
      <div className="relative bg-mesh min-h-screen overflow-hidden">
        {/* Animated Orbs */}
        <div className="orb orb-cyan w-[600px] h-[600px] -top-60 -right-60 animate-float-slow" />
        <div className="orb orb-teal w-[400px] h-[400px] bottom-20 -left-32 animate-float" />

        <div className="relative z-10 flex flex-col items-center justify-center py-16 text-center max-w-lg mx-auto px-4">
          {/* Animated Checkmark */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.2 }}
            className="relative mb-8"
          >
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center glow-cyan-strong shadow-2xl shadow-emerald-500/30">
              <motion.div
                initial={{ scale: 0, rotate: -90 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: 0.5, type: 'spring', stiffness: 200 }}
              >
                <CheckCircle2 className="size-14 text-white" />
              </motion.div>
            </div>
            {/* Sparkle ring */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1.4, opacity: 0 }}
              transition={{ delay: 0.3, duration: 1.2, ease: 'easeOut' }}
              className="absolute inset-0 rounded-full border-2 border-emerald-400/40"
            />
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1.8, opacity: 0 }}
              transition={{ delay: 0.5, duration: 1.5, ease: 'easeOut' }}
              className="absolute inset-0 rounded-full border border-emerald-400/20"
            />
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="text-3xl font-bold mb-2 text-gradient-cyan"
          >
            Payment Submitted!
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="text-muted-foreground mb-2"
          >
            Your payment confirmation has been received. We&apos;re verifying your transaction on the blockchain.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="glass-card rounded-2xl p-6 w-full mt-6 mb-6 space-y-4"
          >
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Order Number</span>
              <span className="font-mono font-semibold text-emerald-300">{orderNumber}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Order</span>
              <span className="font-semibold text-emerald-300">{completedQuantity}</span>
            </div>
            <div className="h-px bg-gradient-to-r from-transparent via-emerald-500/20 to-transparent" />
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Amount Paid</span>
              <span className="font-semibold text-gradient-gold text-lg">${completedTotal.toFixed(2)} USDT</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Payment Method</span>
              <span className="font-medium">{selectedWallet.name}</span>
            </div>
            <div className="h-px bg-gradient-to-r from-transparent via-emerald-500/20 to-transparent" />
            <div className="flex items-start gap-2 p-3 glass-light rounded-xl">
              <AlertTriangle className="size-4 text-amber-400 mt-0.5 shrink-0" />
              <p className="text-xs text-amber-300/80 text-left">
                Your order will be processed once the blockchain confirms your payment.
                This typically takes {selectedWallet.estimatedTime}. You can check your order status
                in the Orders page.
              </p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9 }}
            className="flex flex-col sm:flex-row gap-3 w-full"
          >
            <Button
              className="flex-1 gap-2 glow-cyan-strong bg-primary/90 hover:bg-primary text-primary-foreground rounded-xl h-11"
              onClick={() => navigate('orders')}
            >
              <ExternalLink className="size-4" />
              View Orders
            </Button>
            <Button
              variant="outline"
              className="flex-1 glass-light border-emerald-500/20 text-emerald-300 hover:bg-emerald-500/10 rounded-xl h-11"
              onClick={() => navigate('products')}
            >
              Continue Shopping
            </Button>
          </motion.div>
        </div>
      </div>
    );
  }

  // Empty cart state
  if (cart.length === 0) {
    return (
      <div className="relative bg-mesh min-h-screen overflow-hidden">
        <div className="orb orb-cyan w-[500px] h-[500px] -top-40 -left-40 animate-float-slow" />
        <div className="relative z-10 flex flex-col items-center justify-center py-20 text-center px-4">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200 }}
          >
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-emerald-500/20 to-emerald-600/5 border border-emerald-500/15 flex items-center justify-center mb-6 mx-auto">
              <Shield className="size-10 text-emerald-400" />
            </div>
          </motion.div>
          <h2 className="text-2xl font-bold mb-2">No Items to Checkout</h2>
          <p className="text-muted-foreground mb-6">Add some Flash USDT to your cart before proceeding.</p>
          <Button
            className="glow-cyan-strong bg-primary/90 hover:bg-primary text-primary-foreground rounded-xl"
            onClick={() => navigate('products')}
          >
            Browse Products
          </Button>
        </div>
      </div>
    );
  }

  const isExpired = timeLeft === 0;

  return (
    <div className="relative bg-mesh min-h-screen overflow-hidden">
      {/* Animated Orbs */}
      <div className="orb orb-cyan w-[600px] h-[600px] -top-60 -right-60 animate-float-slow" />
      <div className="orb orb-blue w-[400px] h-[400px] top-1/3 -left-48 animate-float" />
      <div className="orb orb-teal w-[350px] h-[350px] -bottom-32 right-1/4 animate-float-slow" />

      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-4 mb-8"
        >
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('cart')}
            className="size-10 rounded-xl glass-light border border-emerald-500/15 flex items-center justify-center text-muted-foreground hover:text-emerald-400 transition-colors"
          >
            <ArrowLeft className="size-5" />
          </motion.button>
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold text-gradient-cyan">Checkout</h1>
            <p className="text-sm text-muted-foreground mt-0.5">Complete your purchase with USDT</p>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Payment Section */}
          <div className="lg:col-span-2 space-y-6">
            {/* Timer Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <div className={`glass-card rounded-2xl p-5 ${isExpired ? 'border-red-500/30' : 'border-amber-500/20'}`}>
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isExpired ? 'bg-red-500/10' : 'bg-amber-500/10'}`}>
                    <Clock className={`size-5 ${isExpired ? 'text-red-400' : 'text-amber-400'}`} />
                  </div>
                  <div className="flex-1">
                    <p className={`text-sm font-semibold ${isExpired ? 'text-red-400' : 'text-amber-400'}`}>
                      {isExpired ? 'Payment window expired' : 'Complete payment within'}
                    </p>
                    {!isExpired && (
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Please send the exact amount before the timer runs out
                      </p>
                    )}
                  </div>
                  <motion.span
                    key={timeLeft}
                    initial={{ scale: 1.1 }}
                    animate={{ scale: 1 }}
                    className={`font-mono text-3xl font-bold ${isExpired ? 'text-red-400' : 'text-amber-400'}`}
                  >
                    {formatTime(timeLeft)}
                  </motion.span>
                </div>
              </div>
            </motion.div>

            {/* Delivery Wallet Selection */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.12 }}
            >
              <div className="glass-card rounded-2xl p-6">
                <div className="flex items-center gap-2.5 mb-5">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                    <Wallet className="size-4 text-emerald-400" />
                  </div>
                  <h2 className="text-lg font-bold">Delivery Wallet</h2>
                </div>
                <p className="text-sm text-muted-foreground mb-4">
                  Select the wallet where you want to receive your Flash USDT after payment approval.
                </p>

                <div className="space-y-3">
                  {/* Profile wallet option */}
                  {user?.walletAddress ? (
                    <Label className="flex items-center gap-4 p-4 rounded-xl cursor-pointer transition-all duration-300 glass-light border border-emerald-500/30">
                      <RadioGroupItem
                        value="profile"
                        checked={deliveryWallet === 'profile'}
                        onClick={() => setDeliveryWallet('profile')}
                        className="border-emerald-500/30 text-emerald-400"
                      />
                      <div className="flex-1">
                        <div className="font-semibold text-sm">Connected Wallet</div>
                        <p className="text-xs text-emerald-400 font-mono mt-0.5">{user.walletAddress}</p>
                      </div>
                      <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 text-xs">
                        Profile
                      </Badge>
                    </Label>
                  ) : (
                    <div className="p-4 rounded-xl glass-light border border-amber-500/20">
                      <p className="text-xs text-amber-400">
                        No wallet connected in profile. Add one below or in your Wallet settings.
                      </p>
                    </div>
                  )}

                  {/* Custom wallet option */}
                  <Label className="flex items-start gap-4 p-4 rounded-xl cursor-pointer transition-all duration-300 glass-light border border-emerald-500/15">
                    <RadioGroupItem
                      value="custom"
                      checked={deliveryWallet === 'custom'}
                      onClick={() => setDeliveryWallet('custom')}
                      className="border-emerald-500/30 text-emerald-400 mt-1"
                    />
                    <div className="flex-1">
                      <div className="font-semibold text-sm">Different Wallet</div>
                      <p className="text-xs text-muted-foreground mt-0.5">Enter a different wallet address to receive Flash USDT</p>
                      {deliveryWallet === 'custom' && (
                        <div className="mt-3 space-y-3">
                          <div className="flex gap-2">
                            {(['usdt_trc20', 'usdt_bep20'] as const).map((network) => (
                              <button
                                key={network}
                                onClick={() => setCustomWalletNetwork(network)}
                                className={`flex-1 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                                  customWalletNetwork === network
                                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                    : 'glass-light text-muted-foreground hover:text-foreground'
                                }`}
                              >
                                {network === 'usdt_trc20' ? 'TRC20' : 'BEP20'}
                              </button>
                            ))}
                          </div>
                          <Input
                            placeholder="Enter your USDT wallet address"
                            value={customWalletAddress}
                            onChange={(e) => setCustomWalletAddress(e.target.value)}
                            className="glass-input font-mono text-sm"
                          />
                        </div>
                      )}
                    </div>
                  </Label>
                </div>
              </div>
            </motion.div>

            {/* Payment Method Selection */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
            >
              <div className="glass-card rounded-2xl p-6">
                <div className="flex items-center gap-2.5 mb-5">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                    <CircleDot className="size-4 text-emerald-400" />
                  </div>
                  <h2 className="text-lg font-bold">Payment Method</h2>
                </div>
                <RadioGroup
                  value={paymentMethod}
                  onValueChange={(val) => setPaymentMethod(val as PaymentMethod)}
                  className="space-y-3"
                >
                  {Object.entries(CRYPTO_WALLETS).map(([key, wallet]) => (
                    <Label
                      key={key}
                      htmlFor={key}
                      className={`flex items-center gap-4 p-4 rounded-xl cursor-pointer transition-all duration-300 ${
                        paymentMethod === key
                          ? 'glass-light border-emerald-500/30 shadow-lg shadow-emerald-500/5'
                          : 'glass border-white/5 hover:border-emerald-500/15'
                      }`}
                    >
                      <RadioGroupItem value={key} id={key} className="border-emerald-500/30 text-emerald-400" />
                      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-emerald-500/15 to-emerald-600/5 border border-emerald-500/10 flex items-center justify-center text-xl">
                        {wallet.icon}
                      </div>
                      <div className="flex-1">
                        <div className="font-semibold text-sm">{wallet.name}</div>
                        <div className="text-xs text-muted-foreground flex items-center gap-1">
                          <Link2 className="size-3" />
                          {wallet.network}
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 text-xs">
                          ~{wallet.estimatedTime}
                        </Badge>
                        <div className="text-xs text-muted-foreground mt-1">
                          {wallet.confirmations} confirmations
                        </div>
                      </div>
                    </Label>
                  ))}
                </RadioGroup>
              </div>
            </motion.div>

            {/* Send Payment */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <div className="glass-card rounded-2xl p-6 space-y-6">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                    <Zap className="size-4 text-emerald-400" />
                  </div>
                  <h2 className="text-lg font-bold">Send Payment</h2>
                </div>

                {/* Amount to send */}
                <div className="glass-light rounded-xl p-5 text-center border border-emerald-500/15">
                  <p className="text-sm text-muted-foreground mb-1">Send exactly</p>
                  <p className="text-4xl font-bold text-gradient-gold">${total.toFixed(2)}</p>
                  <p className="text-sm text-muted-foreground mt-1">USDT on {selectedWallet.network}</p>
                </div>

                {/* Wallet Address */}
                <div className="space-y-2.5">
                  <p className="text-sm font-medium text-muted-foreground">To this wallet address:</p>
                  <div className="glass rounded-xl p-4">
                    <div className="flex items-center gap-2">
                      <p className="flex-1 font-mono text-sm break-all text-emerald-200/80">
                        {selectedWallet.address}
                      </p>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={copyAddress}
                        className={`shrink-0 size-10 rounded-xl flex items-center justify-center transition-all duration-300 ${
                          copiedAddress
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                            : 'glass-light border-emerald-500/15 text-emerald-400 hover:bg-emerald-500/10'
                        }`}
                      >
                        <AnimatePresence mode="wait">
                          {copiedAddress ? (
                            <motion.div
                              key="check"
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              exit={{ scale: 0 }}
                            >
                              <Check className="size-4" />
                            </motion.div>
                          ) : (
                            <motion.div
                              key="copy"
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              exit={{ scale: 0 }}
                            >
                              <Copy className="size-4" />
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </motion.button>
                    </div>
                    {copiedAddress && (
                      <motion.p
                        initial={{ opacity: 0, y: -5 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-xs text-emerald-400 font-medium mt-2"
                      >
                        Address copied to clipboard!
                      </motion.p>
                    )}
                  </div>
                </div>

                {/* QR Code Placeholder */}
                <div className="flex flex-col items-center gap-3 glass-light rounded-xl p-6">
                  <div className="w-40 h-40 rounded-xl bg-white/5 border border-emerald-500/10 flex items-center justify-center relative overflow-hidden">
                    <QrCode className="size-20 text-emerald-500/40" />
                    <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent" />
                  </div>
                  <p className="text-xs text-muted-foreground text-center">
                    Scan QR code with your wallet app to send payment
                  </p>
                </div>

                {/* Important notice */}
                <div className="glass-light rounded-xl p-4 border border-amber-500/15">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="size-4 text-amber-400 mt-0.5 shrink-0" />
                    <div className="text-xs text-amber-300/80 space-y-1.5">
                      <p className="font-semibold text-amber-400">Important:</p>
                      <ul className="list-disc list-inside space-y-1">
                        <li>Send only USDT on the {selectedWallet.network}</li>
                        <li>Sending on the wrong network may result in permanent loss</li>
                        <li>Send exactly ${total.toFixed(2)} USDT — no more, no less</li>
                        <li>Payment typically confirms in {selectedWallet.estimatedTime}</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Payment Proof */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.22 }}
            >
              <div className="glass-card rounded-2xl p-6 space-y-5">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                    <CheckCircle2 className="size-4 text-emerald-400" />
                  </div>
                  <h2 className="text-lg font-bold">Payment Proof</h2>
                </div>
                <p className="text-sm text-muted-foreground">
                  Provide your transaction details to speed up verification.
                </p>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-foreground text-sm font-medium">Transaction Hash / ID</Label>
                    <Input
                      placeholder="Enter your transaction hash (e.g. 0x...)"
                      value={paymentTxHash}
                      onChange={(e) => setPaymentTxHash(e.target.value)}
                      className="glass-input font-mono text-sm"
                    />
                    <p className="text-xs text-muted-foreground">
                      Find this in your wallet app after sending the payment
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-foreground text-sm font-medium">Payment Screenshot URL <span className="text-muted-foreground">(optional)</span></Label>
                    <Input
                      placeholder="https://example.com/screenshot.png"
                      value={paymentScreenshot}
                      onChange={(e) => setPaymentScreenshot(e.target.value)}
                      className="glass-input text-sm"
                    />
                    <p className="text-xs text-muted-foreground">
                      Upload your payment screenshot to an image host and paste the URL
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Right: Order Summary */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.25 }}
            className="lg:col-span-1"
          >
            <div className="glass-card rounded-2xl p-6 sticky top-24 space-y-5">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                  <Sparkles className="size-4 text-emerald-400" />
                </div>
                <h2 className="text-lg font-bold">Order Summary</h2>
              </div>

              {/* Items */}
              <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
                {cart.map((item) => (
                  <div key={item.productId} className="flex items-center gap-3 glass-light rounded-xl p-3">
                    <div className="shrink-0 w-10 h-10 rounded-lg bg-gradient-to-br from-emerald-500/15 to-emerald-600/5 border border-emerald-500/10 flex items-center justify-center">
                      <span className="text-emerald-400 font-bold text-xs">₮</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{item.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {item.name.toLowerCase().includes('flash')
                          ? `${formatUSDT(item.quantity)} USDT`
                          : `Qty: ${item.quantity}`}
                      </p>
                    </div>
                    <span className="text-sm font-semibold text-gradient-cyan shrink-0">
                      ${(item.price * item.quantity).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>

              <div className="h-px bg-gradient-to-r from-transparent via-emerald-500/20 to-transparent" />

              {/* Delivery wallet info */}
              {getDeliveryWalletAddress() && (
                <>
                  <div className="space-y-1.5">
                    <p className="text-xs font-medium text-muted-foreground">Delivery Wallet</p>
                    <p className="text-xs font-mono text-emerald-400 break-all">
                      {getDeliveryWalletAddress()}
                    </p>
                  </div>
                  <div className="h-px bg-gradient-to-r from-transparent via-emerald-500/20 to-transparent" />
                </>
              )}

              {/* Price breakdown */}
              <div className="space-y-2.5">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="font-medium">${subtotal.toFixed(2)}</span>
                </div>
                {couponDiscount > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-emerald-400">Discount</span>
                    <span className="text-emerald-400">-${couponDiscount.toFixed(2)}</span>
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
                <span className="text-2xl font-bold text-gradient-gold">${total.toFixed(2)} USDT</span>
              </div>

              {/* Disclaimer Checkbox */}
              <div className="rounded-xl p-4 border border-amber-500/20 bg-amber-500/5">
                <div className="flex items-start gap-3">
                  <Checkbox
                    id="disclaimer"
                    checked={disclaimerAccepted}
                    onCheckedChange={(checked) => setDisclaimerAccepted(checked === true)}
                    className="mt-0.5 border-amber-500/40 data-[state=checked]:bg-emerald-500 data-[state=checked]:border-emerald-500"
                  />
                  <Label
                    htmlFor="disclaimer"
                    className="text-xs text-amber-200/80 leading-relaxed cursor-pointer select-none"
                  >
                    I understand that these Flash USDT are <strong className="text-amber-400">only for trading purposes</strong> and should not be used for any other purpose. I acknowledge that Flash USDT may have limitations in certain wallets or exchanges and I accept full responsibility for my purchase.
                  </Label>
                </div>
              </div>

              <Button
                size="lg"
                className="w-full gap-2 font-semibold glow-cyan-strong bg-primary/90 hover:bg-primary text-primary-foreground rounded-xl h-12 text-base"
                onClick={handleConfirmPayment}
                disabled={isExpired || isConfirming || !disclaimerAccepted || (deliveryWallet === 'custom' && !customWalletAddress)}
              >
                {isConfirming ? (
                  <>
                    <Loader2 className="size-5 animate-spin" />
                    Confirming...
                  </>
                ) : !disclaimerAccepted ? (
                  <>
                    <Shield className="size-5" />
                    Accept Disclaimer to Continue
                  </>
                ) : deliveryWallet === 'custom' && !customWalletAddress ? (
                  <>
                    <Wallet className="size-5" />
                    Enter Delivery Wallet Address
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="size-5" />
                    I&apos;ve Paid
                  </>
                )}
              </Button>

              <button
                onClick={() => navigate('cart')}
                className="w-full text-center text-sm text-muted-foreground hover:text-emerald-400 transition-colors py-2 flex items-center justify-center gap-1.5"
              >
                <ArrowLeft className="size-3.5" />
                Back to Cart
              </button>
            </div>
          </motion.div>
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
