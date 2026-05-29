// Types for the Flash Buy application

export type Page = 
  | 'home' 
  | 'products' 
  | 'product-detail' 
  | 'cart' 
  | 'checkout' 
  | 'dashboard' 
  | 'admin'
  | 'orders'
  | 'order-detail'
  | 'wallet'
  | 'tickets'
  | 'ticket-detail'
  | 'referrals'
  | 'admin-products'
  | 'admin-orders'
  | 'admin-users'
  | 'admin-analytics'
  | 'admin-coupons'
  | 'admin-settings'
  | 'admin-tickets'
  | 'admin-payment-methods';

export type UserRole = 'customer' | 'admin' | 'support';

export type OrderStatus = 'pending' | 'payment_waiting' | 'paid' | 'processing' | 'completed' | 'cancelled' | 'refunded';

export type PaymentStatus = 'pending' | 'confirmed' | 'failed' | 'expired' | 'refunded';

export type TicketStatus = 'open' | 'pending' | 'solved' | 'closed';

export type DeliveryType = 'automatic' | 'manual';

export type CouponType = 'percentage' | 'fixed';

export interface CartItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
  deliveryType: DeliveryType;
  stock: number;
}

export interface User {
  id: string;
  email: string;
  name: string;
  phone?: string;
  country?: string;
  role: UserRole;
  avatar?: string;
  balance: number;
  welcomeBonus: number;
  welcomeBonusUnlocked: boolean;
  referralCode: string;
  walletAddress?: string;
  isVerified: boolean;
  createdAt: string;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  shortDesc?: string;
  images: string[];
  price: number;
  comparePrice?: number;
  sku: string;
  categoryId: string;
  stock: number;
  deliveryType: DeliveryType;
  isFeatured: boolean;
  isNew: boolean;
  isTrending: boolean;
  rating: number;
  reviewCount: number;
  soldCount: number;
  category?: Category;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  image?: string;
  productCount?: number;
}

export interface Order {
  id: string;
  orderNumber: string;
  status: OrderStatus;
  itemsPrice: number;
  discount: number;
  fee: number;
  total: number;
  paymentMethod?: string;
  paymentStatus: string;
  deliveryStatus: string;
  notes?: string;
  deliveryWalletAddress?: string;
  deliveryWalletNetwork?: string;
  paymentTxHash?: string;
  paymentScreenshot?: string;
  flashUsdtAmount?: number;
  createdAt: string;
  items: OrderItem[];
}

export interface OrderItem {
  id: string;
  productId: string;
  quantity: number;
  price: number;
  total: number;
  deliveryData?: string;
  product?: Product;
}

export interface Payment {
  id: string;
  orderId: string;
  method: string;
  amount: number;
  walletAddress?: string;
  txHash?: string;
  status: PaymentStatus;
  expiresAt?: string;
  createdAt: string;
}

export interface Coupon {
  id: string;
  code: string;
  type: CouponType;
  value: number;
  minOrder: number;
  maxDiscount?: number;
  usageLimit?: number;
  usedCount: number;
  expiresAt?: string;
  isActive: boolean;
}

export interface Ticket {
  id: string;
  subject: string;
  category: string;
  description: string;
  status: TicketStatus;
  priority: string;
  messages: TicketMessage[];
  createdAt: string;
}

export interface TicketMessage {
  id: string;
  sender: string;
  message: string;
  timestamp: string;
  isAdmin: boolean;
}

export interface PaymentMethodConfig {
  id: string;
  name: string;
  network?: string;
  walletAddress?: string;
  icon?: string;
  isActive: boolean;
  sortOrder: number;
  requireTxId: boolean;
  requireScreenshot: boolean;
  estimatedTime: string;
  confirmations: number;
  createdAt: string;
  updatedAt: string;
}

export interface AdminTicket extends Ticket {
  user: {
    id: string;
    name: string;
    email: string;
    avatar?: string;
  };
  _count?: {
    messages: number;
  };
}

export interface Review {
  id: string;
  userId: string;
  productId: string;
  rating: number;
  comment?: string;
  createdAt: string;
  user?: { name: string; avatar?: string };
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  createdAt: string;
}

export interface WalletTransaction {
  id: string;
  type: string;
  amount: number;
  status: string;
  txHash?: string;
  method?: string;
  description?: string;
  createdAt: string;
}

export interface ReferralInfo {
  totalReferrals: number;
  totalEarnings: number;
  code: string;
  referrals: { name: string; date: string; commission: number }[];
}

export interface DashboardStats {
  totalRevenue: number;
  totalOrders: number;
  totalUsers: number;
  totalProducts: number;
  conversionRate: number;
  dailyRevenue: { date: string; revenue: number }[];
  monthlyRevenue: { month: string; revenue: number }[];
  userGrowth: { date: string; users: number }[];
  topProducts: { name: string; sold: number; revenue: number }[];
  recentOrders: Order[];
}
