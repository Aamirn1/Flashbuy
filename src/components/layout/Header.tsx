'use client';

import React, { useState, useEffect } from 'react';
import { useStore } from '@/lib/store';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import {
  Zap,
  ShoppingCart,
  User,
  Menu,
  LayoutDashboard,
  Package,
  Wallet,
  Ticket,
  Users,
  ShieldCheck,
  LogOut,
  Home,
  ShoppingBag,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Page } from '@/lib/types';

export default function Header() {
  const {
    navigate,
    currentPage,
    getCartCount,
    isAuthenticated,
    user,
    setShowAuthDialog,
    logout,
    setSidebarOpen,
    sidebarOpen,
  } = useStore();

  const [scrolled, setScrolled] = useState(false);
  const cartCount = getCartCount();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleNavClick = (page: Page) => {
    navigate(page);
    setSidebarOpen(false);
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const navItems = [
    { label: 'Home', page: 'home' as Page, icon: Home },
  ];

  return (
    <header
      className={cn(
        'sticky top-0 z-50 w-full transition-all duration-500',
        scrolled
          ? 'glass-strong shadow-lg shadow-emerald-500/5'
          : 'glass'
      )}
      style={{
        borderBottom: scrolled
          ? '1px solid rgba(52, 211, 153, 0.15)'
          : '1px solid rgba(148, 163, 184, 0.08)',
      }}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between gap-4">
          {/* Logo */}
          <motion.button
            onClick={() => handleNavClick('home')}
            className="flex items-center gap-2.5 group"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="relative flex items-center justify-center size-9 rounded-xl border border-emerald-500/30 bg-transparent group-hover:border-emerald-500/50 transition-all duration-300">
              <Zap className="size-5 text-emerald-400" />
            </div>
            <span className="text-xl font-bold tracking-tight hidden sm:inline">
              <span className="text-gradient-cyan">Flash</span>
              <span className="text-foreground"> Buy</span>
            </span>
          </motion.button>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-1">
            {navItems.map((item) => (
              <Button
                key={item.page}
                variant="ghost"
                size="sm"
                onClick={() => handleNavClick(item.page)}
                className={cn(
                  'text-sm font-medium transition-all duration-300 rounded-lg',
                  currentPage === item.page
                    ? 'text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/15 hover:text-emerald-400'
                    : 'text-muted-foreground hover:text-foreground hover:bg-white/5'
                )}
              >
                <item.icon className="size-4 mr-1.5" />
                {item.label}
              </Button>
            ))}
          </nav>

          {/* Right Side Actions */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Cart */}
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                variant="ghost"
                size="icon"
                className="relative text-muted-foreground hover:text-emerald-400 hover:bg-emerald-500/10 transition-all duration-300 rounded-xl"
                onClick={() => handleNavClick('cart')}
                aria-label="Shopping cart"
              >
                <ShoppingCart className="size-5" />
                <AnimatePresence>
                  {cartCount > 0 && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      exit={{ scale: 0 }}
                      transition={{ type: 'spring', stiffness: 500, damping: 25 }}
                    >
                      <Badge className="absolute -top-1 -right-1 size-5 p-0 flex items-center justify-center bg-gradient-to-r from-emerald-500 to-emerald-400 text-[10px] font-bold border-0 text-background hover:from-emerald-500 hover:to-emerald-400">
                        {cartCount > 99 ? '99+' : cartCount}
                      </Badge>
                    </motion.div>
                  )}
                </AnimatePresence>
              </Button>
            </motion.div>

            {/* User Menu */}
            {isAuthenticated && user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="relative h-9 w-9 rounded-full hover:bg-white/5 transition-all duration-300"
                  >
                    <Avatar className="size-8">
                      <AvatarImage src={user.avatar} alt={user.name} />
                      <AvatarFallback className="!bg-transparent text-emerald-400 text-xs font-semibold border-0">
                        {getInitials(user.name)}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  className="w-56 bg-black/95 border-emerald-500/10 backdrop-blur-xl"
                >
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium text-foreground">
                        {user.name}
                      </p>
                      <p className="text-xs text-muted-foreground">{user.email}</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator className="bg-emerald-500/10" />
                  <DropdownMenuGroup>
                    <DropdownMenuItem
                      onClick={() => handleNavClick('dashboard')}
                      className="text-muted-foreground hover:text-emerald-400 hover:bg-emerald-500/10 focus:bg-emerald-500/10 focus:text-emerald-400 cursor-pointer transition-colors"
                    >
                      <LayoutDashboard className="size-4 mr-2" />
                      Dashboard
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => handleNavClick('orders')}
                      className="text-muted-foreground hover:text-emerald-400 hover:bg-emerald-500/10 focus:bg-emerald-500/10 focus:text-emerald-400 cursor-pointer transition-colors"
                    >
                      <Package className="size-4 mr-2" />
                      Orders
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => handleNavClick('wallet')}
                      className="text-muted-foreground hover:text-emerald-400 hover:bg-emerald-500/10 focus:bg-emerald-500/10 focus:text-emerald-400 cursor-pointer transition-colors"
                    >
                      <Wallet className="size-4 mr-2" />
                      Wallet
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => handleNavClick('tickets')}
                      className="text-muted-foreground hover:text-emerald-400 hover:bg-emerald-500/10 focus:bg-emerald-500/10 focus:text-emerald-400 cursor-pointer transition-colors"
                    >
                      <Ticket className="size-4 mr-2" />
                      Tickets
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => handleNavClick('referrals')}
                      className="text-muted-foreground hover:text-emerald-400 hover:bg-emerald-500/10 focus:bg-emerald-500/10 focus:text-emerald-400 cursor-pointer transition-colors"
                    >
                      <Users className="size-4 mr-2" />
                      Referrals
                    </DropdownMenuItem>
                  </DropdownMenuGroup>
                  {user.role === 'admin' && (
                    <>
                      <DropdownMenuSeparator className="bg-emerald-500/10" />
                      <DropdownMenuItem
                        onClick={() => handleNavClick('admin')}
                        className="text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10 focus:bg-emerald-500/10 focus:text-emerald-300 cursor-pointer transition-colors"
                      >
                        <ShieldCheck className="size-4 mr-2" />
                        Admin Panel
                      </DropdownMenuItem>
                    </>
                  )}
                  <DropdownMenuSeparator className="bg-emerald-500/10" />
                  <DropdownMenuItem
                    onClick={logout}
                    className="text-red-400 hover:text-red-300 hover:bg-red-500/10 focus:bg-red-500/10 focus:text-red-300 cursor-pointer transition-colors"
                  >
                    <LogOut className="size-4 mr-2" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                <Button
                  onClick={() => setShowAuthDialog(true, 'login')}
                  className="bg-gradient-to-r from-emerald-500 to-emerald-400 hover:from-emerald-400 hover:to-emerald-300 text-background font-semibold shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 transition-all duration-300 rounded-xl"
                  size="sm"
                >
                  <User className="size-4 mr-1.5" />
                  <span className="hidden sm:inline">Sign In</span>
                </Button>
              </motion.div>
            )}

            {/* Mobile Hamburger */}
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden text-muted-foreground hover:text-emerald-400 hover:bg-emerald-500/10 transition-all duration-300 rounded-xl"
              onClick={() => setSidebarOpen(true)}
              aria-label="Open menu"
            >
              <Menu className="size-5" />
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Sidebar */}
      <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
        <SheetContent
          side="left"
          className="bg-black/95 border-emerald-500/10 w-80 p-0 backdrop-blur-xl"
        >
          <SheetHeader className="p-4 pb-0">
            <SheetTitle className="flex items-center gap-2.5">
              <div className="flex items-center justify-center size-8 rounded-lg border border-emerald-500/30 bg-transparent">
                <Zap className="size-4 text-emerald-400" />
              </div>
              <span className="text-lg font-bold">
                <span className="text-gradient-cyan">Flash</span>
                <span className="text-foreground"> Buy</span>
              </span>
            </SheetTitle>
          </SheetHeader>

          <Separator className="bg-emerald-500/10 my-4" />

          {/* Navigation */}
          <nav className="flex flex-col gap-1 px-3">
            {navItems.map((item) => (
              <motion.button
                key={item.page}
                onClick={() => handleNavClick(item.page)}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 text-left',
                  currentPage === item.page
                    ? 'text-emerald-400 bg-emerald-500/10 shadow-sm shadow-emerald-500/10'
                    : 'text-muted-foreground hover:text-foreground hover:bg-white/5'
                )}
                whileHover={{ x: 4 }}
                transition={{ duration: 0.2 }}
              >
                <item.icon className="size-4" />
                {item.label}
              </motion.button>
            ))}
          </nav>

          <Separator className="bg-emerald-500/10 my-4" />

          {/* User Section */}
          {isAuthenticated && user ? (
            <div className="px-3">
              <div className="flex items-center gap-3 px-3 py-2 mb-2">
                <Avatar className="size-8">
                  <AvatarImage src={user.avatar} alt={user.name} />
                  <AvatarFallback className="!bg-transparent text-emerald-400 text-xs font-semibold border-0">
                    {getInitials(user.name)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">
                    {user.name}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                </div>
              </div>
              <div className="flex flex-col gap-0.5">
                {[
                  { icon: LayoutDashboard, label: 'Dashboard', page: 'dashboard' as Page },
                  { icon: Package, label: 'Orders', page: 'orders' as Page },
                  { icon: Wallet, label: 'Wallet', page: 'wallet' as Page },
                  { icon: Ticket, label: 'Tickets', page: 'tickets' as Page },
                  { icon: Users, label: 'Referrals', page: 'referrals' as Page },
                ].map((item) => (
                  <motion.button
                    key={item.page}
                    onClick={() => handleNavClick(item.page)}
                    className="flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-muted-foreground hover:text-foreground hover:bg-white/5 transition-all duration-300 text-left"
                    whileHover={{ x: 4 }}
                    transition={{ duration: 0.2 }}
                  >
                    <item.icon className="size-4" />
                    {item.label}
                  </motion.button>
                ))}
                {user.role === 'admin' && (
                  <motion.button
                    onClick={() => handleNavClick('admin')}
                    className="flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10 transition-all duration-300 text-left"
                    whileHover={{ x: 4 }}
                    transition={{ duration: 0.2 }}
                  >
                    <ShieldCheck className="size-4" />
                    Admin Panel
                  </motion.button>
                )}
                <Separator className="bg-emerald-500/10 my-2" />
                <motion.button
                  onClick={() => {
                    logout();
                    setSidebarOpen(false);
                  }}
                  className="flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-all duration-300 text-left"
                  whileHover={{ x: 4 }}
                  transition={{ duration: 0.2 }}
                >
                  <LogOut className="size-4" />
                  Logout
                </motion.button>
              </div>
            </div>
          ) : (
            <div className="px-4">
              <Button
                onClick={() => {
                  setShowAuthDialog(true, 'login');
                  setSidebarOpen(false);
                }}
                className="w-full bg-gradient-to-r from-emerald-500 to-emerald-400 hover:from-emerald-400 hover:to-emerald-300 text-background font-semibold shadow-lg shadow-emerald-500/25 rounded-xl"
              >
                <User className="size-4 mr-2" />
                Sign In
              </Button>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </header>
  );
}
