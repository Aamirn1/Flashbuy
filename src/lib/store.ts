import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Page, CartItem, User } from './types';

// Flash USDT Pricing: 1000 Flash USDT = $10
export const FLASH_USDT_RATE = 0.01; // $0.01 per Flash USDT
export const FLASH_USDT_UNIT = 1000; // Step size
export const FLASH_USDT_MIN = 1000;
export const FLASH_USDT_MAX = 10000000;

export function calculatePrice(quantity: number): number {
  return parseFloat((quantity * FLASH_USDT_RATE).toFixed(2));
}

export function formatUSDT(quantity: number): string {
  if (quantity >= 1000000) return `${(quantity / 1000000).toFixed(1)}M`;
  if (quantity >= 1000) return `${(quantity / 1000).toFixed(quantity % 1000 === 0 ? 0 : 1)}K`;
  return quantity.toString();
}

interface AppState {
  // Navigation
  currentPage: Page;
  previousPage: Page | null;
  selectedProductId: string | null;
  selectedOrderId: string | null;
  selectedTicketId: string | null;
  
  // Auth
  user: User | null;
  isAuthenticated: boolean;
  showAuthDialog: boolean;
  authMode: 'login' | 'register';
  
  // Flash USDT
  flashQuantity: number;
  
  // Cart
  cart: CartItem[];
  couponCode: string | null;
  couponDiscount: number;
  
  // UI
  searchQuery: string;
  selectedCategory: string | null;
  sortBy: string;
  sidebarOpen: boolean;
  notifications: { id: string; title: string; message: string; type: string; isRead: boolean; createdAt: string }[];
  
  // Actions
  navigate: (page: Page, id?: string) => void;
  goBack: () => void;
  setUser: (user: User | null) => void;
  logout: () => void;
  checkAuth: () => Promise<void>;
  setShowAuthDialog: (show: boolean, mode?: 'login' | 'register') => void;
  setFlashQuantity: (qty: number) => void;
  incrementFlash: (step?: number) => void;
  decrementFlash: (step?: number) => void;
  addToCart: (item: CartItem) => void;
  removeFromCart: (productId: string) => void;
  updateCartQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  applyCoupon: (code: string, discount: number) => void;
  removeCoupon: () => void;
  setSearchQuery: (query: string) => void;
  setSelectedCategory: (category: string | null) => void;
  setSortBy: (sort: string) => void;
  setSidebarOpen: (open: boolean) => void;
  getCartTotal: () => number;
  getCartCount: () => number;
  cleanupCart: () => void;
  addNotification: (notification: Omit<AppState['notifications'][0], 'id' | 'createdAt'>) => void;
  markNotificationRead: (id: string) => void;
}

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      // Navigation
      currentPage: 'home',
      previousPage: null,
      selectedProductId: null,
      selectedOrderId: null,
      selectedTicketId: null,
      
      // Auth
      user: null,
      isAuthenticated: false,
      showAuthDialog: false,
      authMode: 'login',
      
      // Flash USDT
      flashQuantity: 1000,
      
      // Cart
      cart: [],
      couponCode: null,
      couponDiscount: 0,
      
      // UI
      searchQuery: '',
      selectedCategory: null,
      sortBy: 'featured',
      sidebarOpen: false,
      notifications: [],
      
      // Actions
      navigate: (page, id) => {
        // Push current state to browser history before navigating
        if (typeof window !== 'undefined') {
          const state = get();
          // Only push if page actually changes
          if (state.currentPage !== page) {
            window.history.pushState({ page: state.currentPage }, '');
          }
        }
        set((state) => ({
          previousPage: state.currentPage,
          currentPage: page,
          selectedProductId: page === 'product-detail' ? (id || state.selectedProductId) : state.selectedProductId,
          selectedOrderId: page === 'order-detail' ? (id || state.selectedOrderId) : state.selectedOrderId,
          selectedTicketId: page === 'ticket-detail' ? (id || state.selectedTicketId) : state.selectedTicketId,
        }));
      },
      
      goBack: () => {
        if (typeof window !== 'undefined') {
          window.history.back();
        }
        set((state) => ({
          currentPage: state.previousPage || 'home',
          previousPage: null,
        }));
      },
      
      setUser: (user) => set({ user, isAuthenticated: !!user }),
      
      logout: async () => {
        // Call server logout to clear httpOnly cookie
        try {
          await fetch('/api/auth/me', { method: 'POST' });
        } catch {}
        set({ 
          user: null, 
          isAuthenticated: false,
          currentPage: 'home',
        });
      },
      
      checkAuth: async () => {
        try {
          const res = await fetch('/api/auth/me');
          if (res.ok) {
            const data = await res.json();
            if (data.user) {
              set({ user: data.user, isAuthenticated: true });
              return;
            }
          }
        } catch {}
        // If cookie auth fails, clear stale client state
        set({ user: null, isAuthenticated: false });
      },
      
      setShowAuthDialog: (show, mode) => set({ 
        showAuthDialog: show, 
        authMode: mode || 'login' 
      }),
      
      setFlashQuantity: (qty) => set({ flashQuantity: Math.max(FLASH_USDT_MIN, Math.min(FLASH_USDT_MAX, qty)) }),
      
      incrementFlash: (step = 1000) => set((state) => ({
        flashQuantity: Math.min(FLASH_USDT_MAX, state.flashQuantity + step),
      })),
      
      decrementFlash: (step = 1000) => set((state) => ({
        flashQuantity: Math.max(FLASH_USDT_MIN, state.flashQuantity - step),
      })),
      
      addToCart: (item) => set((state) => {
        const existing = state.cart.find(c => c.productId === item.productId);
        if (existing) {
          return {
            cart: state.cart.map(c =>
              c.productId === item.productId
                ? { ...c, quantity: Math.min(c.quantity + item.quantity, c.stock) }
                : c
            ),
          };
        }
        return { cart: [...state.cart, item] };
      }),
      
      removeFromCart: (productId) => set((state) => ({
        cart: state.cart.filter(c => c.productId !== productId),
      })),
      
      updateCartQuantity: (productId, quantity) => set((state) => ({
        cart: state.cart.map(c =>
          c.productId === productId ? { ...c, quantity: Math.max(1, Math.min(quantity, c.stock)) } : c
        ),
      })),
      
      clearCart: () => set({ cart: [], couponCode: null, couponDiscount: 0 }),
      
      applyCoupon: (code, discount) => set({ couponCode: code, couponDiscount: discount }),
      
      removeCoupon: () => set({ couponCode: null, couponDiscount: 0 }),
      
      setSearchQuery: (query) => set({ searchQuery: query }),
      
      setSelectedCategory: (category) => set({ selectedCategory: category }),
      
      setSortBy: (sort) => set({ sortBy: sort }),
      
      setSidebarOpen: (open) => set({ sidebarOpen: open }),
      
      getCartTotal: () => {
        const state = get();
        const subtotal = state.cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
        return Math.max(0, subtotal - state.couponDiscount);
      },
      
      getCartCount: () => {
        const state = get();
        // Return number of distinct items in cart (not total quantity)
        // For Flash USDT this should be 0 or 1
        return state.cart.length;
      },

      // Clean up stale/duplicate cart items
      cleanupCart: () => set((state) => {
        const seen = new Set<string>();
        const cleanCart = state.cart.filter(item => {
          if (seen.has(item.productId)) return false;
          seen.add(item.productId);
          return true;
        });
        return { cart: cleanCart };
      }),
      
      addNotification: (notification) => set((state) => ({
        notifications: [
          { ...notification, id: Date.now().toString(), createdAt: new Date().toISOString() },
          ...state.notifications,
        ],
      })),
      
      markNotificationRead: (id) => set((state) => ({
        notifications: state.notifications.map(n =>
          n.id === id ? { ...n, isRead: true } : n
        ),
      })),
    }),
    {
      name: 'flashbuy-store',
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        cart: state.cart,
        couponCode: state.couponCode,
        couponDiscount: state.couponDiscount,
        flashQuantity: state.flashQuantity,
      }),
    }
  )
);
