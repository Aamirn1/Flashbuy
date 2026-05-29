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
import { useEffect } from 'react';

function PageRouter() {
  const { currentPage, user, checkAuth } = useStore();

  // Check auth from server-side JWT cookie on initial load
  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  // Scroll to top on every page navigation
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' as ScrollBehavior });
  }, [currentPage]);

  // Redirect to home if trying to access protected pages without auth
  useEffect(() => {
    const protectedPages = ['dashboard', 'orders', 'order-detail', 'wallet', 'tickets', 'ticket-detail', 'referrals', 'admin', 'admin-products', 'admin-orders', 'admin-users', 'admin-analytics', 'admin-coupons', 'admin-settings'];
    if (protectedPages.includes(currentPage) && !user) {
      useStore.getState().setShowAuthDialog(true, 'login');
      useStore.getState().navigate('home');
    }
  }, [currentPage, user]);

  // Redirect non-admin users from admin pages
  useEffect(() => {
    const adminPages = ['admin', 'admin-products', 'admin-orders', 'admin-users', 'admin-analytics', 'admin-coupons', 'admin-settings'];
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
