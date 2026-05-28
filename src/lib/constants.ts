export const CRYPTO_WALLETS = {
  usdt_trc20: {
    name: 'USDT TRC20',
    network: 'TRON (TRC20)',
    icon: '🔗',
    address: 'TJYRaDpH7K4gFZyxE3xqFJQYk3bGFR5qkr',
    confirmations: 20,
    estimatedTime: '3-5 minutes',
  },
  usdt_bep20: {
    name: 'USDT BEP20',
    network: 'BNB Smart Chain (BEP20)',
    icon: '💛',
    address: '0x742d35Cc6634C0532925a3b844Bc9e7595f2bD28',
    confirmations: 15,
    estimatedTime: '1-3 minutes',
  },
} as const;

export const ORDER_STATUS_COLORS: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  payment_waiting: 'bg-orange-100 text-orange-800',
  paid: 'bg-blue-100 text-blue-800',
  processing: 'bg-purple-100 text-purple-800',
  completed: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
  refunded: 'bg-gray-100 text-gray-800',
};

export const TICKET_STATUS_COLORS: Record<string, string> = {
  open: 'bg-green-100 text-green-800',
  pending: 'bg-yellow-100 text-yellow-800',
  solved: 'bg-blue-100 text-blue-800',
  closed: 'bg-gray-100 text-gray-800',
};

export const TICKET_CATEGORIES = [
  { value: 'payment', label: 'Payment Issue' },
  { value: 'delivery', label: 'Delivery Problem' },
  { value: 'account', label: 'Account Issue' },
  { value: 'other', label: 'Other' },
];

export const FAQ_ITEMS = [
  {
    question: 'What is Flash Buy?',
    answer: 'Flash Buy is a crypto-powered eCommerce platform where you can purchase digital products and services using USDT (TRC20 & BEP20). We offer instant delivery for most products.',
  },
  {
    question: 'How do I pay with USDT?',
    answer: 'Simply add products to your cart, proceed to checkout, and select your preferred USDT network (TRC20 or BEP20). You\'ll receive a unique wallet address to send your payment. Once confirmed on the blockchain, your order will be processed automatically.',
  },
  {
    question: 'How long does payment confirmation take?',
    answer: 'USDT TRC20 payments typically confirm within 3-5 minutes, while BEP20 payments confirm within 1-3 minutes. Automatic delivery products are sent instantly after confirmation.',
  },
  {
    question: 'What is automatic delivery?',
    answer: 'Automatic delivery means your product is delivered instantly after payment confirmation. No manual processing is required. You\'ll receive your product details immediately in your dashboard.',
  },
  {
    question: 'Can I get a refund?',
    answer: 'Yes, refunds are available for products that haven\'t been delivered yet. If you encounter any issues with your order, please open a support ticket and our team will assist you.',
  },
  {
    question: 'How does the referral program work?',
    answer: 'Share your unique referral link with friends. When they register and make a purchase, you earn a 5% commission on their orders. The commission is tracked for lifetime and can be withdrawn to your wallet.',
  },
];

export const FEATURES_LIST = [
  {
    icon: '⚡',
    title: 'Instant Delivery',
    description: 'Get your products instantly after payment confirmation. No waiting, no delays.',
  },
  {
    icon: '🔒',
    title: 'Secure Payments',
    description: 'Blockchain-verified USDT payments with TRC20 and BEP20 support.',
  },
  {
    icon: '🌍',
    title: 'Global Access',
    description: 'Shop from anywhere in the world. No geographic restrictions.',
  },
  {
    icon: '💎',
    title: 'Best Prices',
    description: 'Competitive pricing with regular discounts and coupon codes.',
  },
  {
    icon: '🛡️',
    title: 'Buyer Protection',
    description: 'Full refund guarantee if your order is not delivered as described.',
  },
  {
    icon: '🤝',
    title: 'Referral Rewards',
    description: 'Earn 5% lifetime commission by referring friends to Flash Buy.',
  },
];
