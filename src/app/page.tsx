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
import CartView from '@/components/cart/CartView';
import CheckoutView from '@/components/checkout/CheckoutView';
import { UserDashboard } from '@/components/dashboard/UserDashboard';
import { AdminDashboard } from '@/components/admin/AdminDashboard';
import { useEffect } from 'react';
import type { Page } from '@/lib/types';

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
    requestAnimationFrame(() => {
      window.scrollTo(0, 0);
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
    });
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

  // All user dashboard pages render through UserDashboard (which has sidebar nav)
  const userDashboardPages: Page[] = ['dashboard', 'orders', 'order-detail', 'wallet', 'tickets', 'ticket-detail', 'referrals'];
  // All admin pages render through AdminDashboard (which has sidebar nav)
  const adminDashboardPages: Page[] = ['admin', 'admin-products', 'admin-orders', 'admin-users', 'admin-tickets', 'admin-payment-methods', 'admin-analytics', 'admin-coupons', 'admin-settings'];

  if (userDashboardPages.includes(currentPage)) {
    return <UserDashboard />;
  }

  if (adminDashboardPages.includes(currentPage)) {
    return <AdminDashboard />;
  }

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
  const currentPage = useStore((s) => s.currentPage);

  // Dashboard pages (admin & user) have their own full-height layouts with sidebar
  const isDashboardPage = [
    'dashboard', 'orders', 'order-detail', 'wallet', 'tickets', 'ticket-detail', 'referrals',
    'admin', 'admin-products', 'admin-orders', 'admin-users', 'admin-tickets', 'admin-payment-methods',
    'admin-analytics', 'admin-coupons', 'admin-settings',
  ].includes(currentPage);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {!isDashboardPage && <Header />}
      <main className={isDashboardPage ? '' : 'flex-1'}>
        <PageRouter />
      </main>
      {!isDashboardPage && <Footer />}
      <AuthDialog />
      <FloatingActions />
    </div>
  );
}
