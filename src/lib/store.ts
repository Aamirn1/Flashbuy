import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Page, CartItem, User, Product } from './types';

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
  setShowAuthDialog: (show: boolean, mode?: 'login' | 'register') => void;
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
      navigate: (page, id) => set((state) => ({
        previousPage: state.currentPage,
        currentPage: page,
        selectedProductId: page === 'product-detail' ? (id || state.selectedProductId) : state.selectedProductId,
        selectedOrderId: page === 'order-detail' ? (id || state.selectedOrderId) : state.selectedOrderId,
        selectedTicketId: page === 'ticket-detail' ? (id || state.selectedTicketId) : state.selectedTicketId,
      })),
      
      goBack: () => set((state) => ({
        currentPage: state.previousPage || 'home',
        previousPage: null,
      })),
      
      setUser: (user) => set({ user, isAuthenticated: !!user }),
      
      logout: () => set({ 
        user: null, 
        isAuthenticated: false,
        currentPage: 'home',
      }),
      
      setShowAuthDialog: (show, mode) => set({ 
        showAuthDialog: show, 
        authMode: mode || 'login' 
      }),
      
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
        return state.cart.reduce((sum, item) => sum + item.quantity, 0);
      },
      
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
      }),
    }
  )
);
