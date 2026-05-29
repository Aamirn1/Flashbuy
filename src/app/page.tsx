'use client';

import { useStore } from '@/lib/store';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import AuthDialog from '@/components/auth/AuthDialog';
import FloatingActions from '@/components/layout/FloatingActions';
import HeroBanner from '@/components/home/HeroBanner';
import FlashUSDTProduct from '@/components/home/FlashUSDTProduct';
import HowItWorks from '@/components/home/HowItWorks';
import FeaturesSection from '@/components/home/FeaturesSection';
import FAQSection from '@/components/home/FAQSection';
import CTASection from '@/components/home/CTASection';
import WelcomeBonusBanner from '@/components/home/WelcomeBonusBanner';
import CustomerReviews from '@/components/home/CustomerReviews';
import ProductGrid from '@/components/products/ProductGrid';
import ProductDetail from '@/components/products/ProductDetail';
import CartView from '@/components/cart/CartView';
import CheckoutView from '@/components/checkout/CheckoutView';
import { UserDashboard } from '@/components/dashboard/UserDashboard';
import { OrderHistory } from '@/components/dashboard/OrderHistory';
import { OrderDetail } from '@/components/dashboard/OrderDetail';
import { WalletView } from '@/components/dashboard/WalletView';
import { TicketList } from '@/components/dashboard/TicketList';
import { TicketDetail } from '@/components/dashboard/TicketDetail';
import { ReferralView } from '@/components/dashboard/ReferralView';
import { AdminDashboard } from '@/components/admin/AdminDashboard';
import { AdminProducts } from '@/components/admin/AdminProducts';
import { AdminOrders } from '@/components/admin/AdminOrders';
import { AdminUsers } from '@/components/admin/AdminUsers';
import { AdminTickets } from '@/components/admin/AdminTickets';
import { AdminPaymentMethods } from '@/components/admin/AdminPaymentMethods';
import { useEffect } from 'react';

function PageRouter() {
  const { currentPage, user, checkAuth, cleanupCart } = useStore();

  // Check auth from server-side JWT cookie on initial load
  useEffect(() => {
    checkAuth();
    cleanupCart(); // Clean up stale/duplicate cart items from localStorage
  }, [checkAuth, cleanupCart]);

  // Handle browser back button
  useEffect(() => {
    const handlePopState = (event: PopStateEvent) => {
      if (event.state && event.state.page) {
        // Restore the page state from history
        useStore.setState({
          currentPage: event.state.page,
          selectedProductId: event.state.selectedProductId || null,
          selectedOrderId: event.state.selectedOrderId || null,
          selectedTicketId: event.state.selectedTicketId || null,
        });
      } else {
        // No history state — user is at the very beginning
        // Push home back to prevent browser from closing
        const currentState = useStore.getState();
        if (currentState.currentPage !== 'home') {
          useStore.setState({ currentPage: 'home' });
        }
        // Push a state so back button doesn't exit the browser/app
        window.history.pushState({ page: 'home' }, '');
      }
    };
    window.addEventListener('popstate', handlePopState);

    // Replace the current history entry with our initial state
    window.history.replaceState({ page: 'home' }, '');

    // Push an extra entry so back button from home doesn't close browser
    // This creates a "buffer" that keeps the user in the app
    window.history.pushState({ page: 'home' }, '');

    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Scroll to top on every page navigation
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' as ScrollBehavior });
  }, [currentPage]);

  // Redirect to home if trying to access protected pages without auth
  useEffect(() => {
    const protectedPages = ['dashboard', 'orders', 'order-detail', 'wallet', 'tickets', 'ticket-detail', 'referrals', 'admin', 'admin-products', 'admin-orders', 'admin-users', 'admin-analytics', 'admin-coupons', 'admin-settings', 'admin-tickets', 'admin-payment-methods'];
    if (protectedPages.includes(currentPage) && !user) {
      useStore.getState().setShowAuthDialog(true, 'login');
      useStore.getState().navigate('home');
    }
  }, [currentPage, user]);

  // Redirect non-admin users from admin pages
  useEffect(() => {
    const adminPages = ['admin', 'admin-products', 'admin-orders', 'admin-users', 'admin-analytics', 'admin-coupons', 'admin-settings', 'admin-tickets', 'admin-payment-methods'];
    if (adminPages.includes(currentPage) && user?.role !== 'admin') {
      useStore.getState().navigate('home');
    }
  }, [currentPage, user]);

  switch (currentPage) {
    // Homepage
    case 'home':
      return (
        <>
          <HeroBanner />
          <WelcomeBonusBanner />
          <FlashUSDTProduct />
          <HowItWorks />
          <FeaturesSection />
          <CustomerReviews />
          <FAQSection />
          <CTASection />
        </>
      );

    // Products - Single product only
    case 'products':
      return <FlashUSDTProduct />;
    case 'product-detail':
      return <FlashUSDTProduct />;

    // Cart & Checkout
    case 'cart':
      return <CartView />;
    case 'checkout':
      return <CheckoutView />;

    // User Dashboard
    case 'dashboard':
      return <UserDashboard />;
    case 'orders':
      return <OrderHistory />;
    case 'order-detail':
      return <OrderDetail />;
    case 'wallet':
      return <WalletView />;
    case 'tickets':
      return <TicketList />;
    case 'ticket-detail':
      return <TicketDetail />;
    case 'referrals':
      return <ReferralView />;

    // Admin
    case 'admin':
      return <AdminDashboard />;
    case 'admin-products':
      return <AdminProducts />;
    case 'admin-orders':
      return <AdminOrders />;
    case 'admin-users':
      return <AdminUsers />;
    case 'admin-tickets':
      return <AdminTickets />;
    case 'admin-payment-methods':
      return <AdminPaymentMethods />;
    case 'admin-analytics':
      return <AdminDashboard />;
    case 'admin-coupons':
      return <AdminProducts />;
    case 'admin-settings':
      return <AdminDashboard />;

    default:
      return (
        <>
          <HeroBanner />
          <WelcomeBonusBanner />
          <FlashUSDTProduct />
          <HowItWorks />
          <FeaturesSection />
          <CustomerReviews />
          <FAQSection />
          <CTASection />
        </>
      );
  }
}

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1">
        <PageRouter />
      </main>
      <Footer />
      <AuthDialog />
      <FloatingActions />
    </div>
  );
}
