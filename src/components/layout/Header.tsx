'use client';

import React, { useState, useEffect } from 'react';
import { useStore } from '@/lib/store';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
  SheetClose,
} from '@/components/ui/sheet';
import {
  Zap,
  Search,
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
  Grid3X3,
  ChevronDown,
  X,
} from 'lucide-react';
import type { Page } from '@/lib/types';

const CATEGORIES = [
  { id: 'software', label: 'Software & Keys' },
  { id: 'gaming', label: 'Gaming' },
  { id: 'streaming', label: 'Streaming & Subscriptions' },
  { id: 'gift-cards', label: 'Gift Cards' },
  { id: 'education', label: 'Education & Courses' },
  { id: 'tools', label: 'Tools & Utilities' },
];

export default function Header() {
  const {
    navigate,
    currentPage,
    getCartCount,
    isAuthenticated,
    user,
    setShowAuthDialog,
    logout,
    setSearchQuery,
    searchQuery,
    setSidebarOpen,
    sidebarOpen,
    selectedCategory,
    setSelectedCategory,
  } = useStore();

  const [searchOpen, setSearchOpen] = useState(false);
  const [localSearch, setLocalSearch] = useState(searchQuery);
  const [scrolled, setScrolled] = useState(false);
  const [categoryOpen, setCategoryOpen] = useState(false);

  const cartCount = getCartCount();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchQuery(localSearch);
    navigate('products');
  };

  const handleNavClick = (page: Page) => {
    navigate(page);
    setSidebarOpen(false);
  };

  const handleCategorySelect = (catId: string) => {
    setSelectedCategory(catId);
    navigate('products');
    setCategoryOpen(false);
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
    { label: 'Products', page: 'products' as Page, icon: Grid3X3 },
  ];

  return (
    <header
      className={cn(
        'sticky top-0 z-50 w-full transition-all duration-300',
        scrolled
          ? 'bg-zinc-950/95 backdrop-blur-xl border-b border-zinc-800/50 shadow-lg shadow-black/20'
          : 'bg-zinc-950 border-b border-zinc-800/30'
      )}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between gap-4">
          {/* Logo */}
          <div className="flex items-center gap-2 shrink-0">
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden text-zinc-400 hover:text-white hover:bg-zinc-800"
              onClick={() => setSidebarOpen(true)}
              aria-label="Open menu"
            >
              <Menu className="size-5" />
            </Button>
            <button
              onClick={() => handleNavClick('home')}
              className="flex items-center gap-2 group"
            >
              <div className="relative flex items-center justify-center size-9 rounded-lg bg-gradient-to-br from-emerald-500 to-emerald-700 shadow-lg shadow-emerald-500/20 group-hover:shadow-emerald-500/40 transition-shadow">
                <Zap className="size-5 text-white fill-white/30" />
              </div>
              <span className="text-xl font-bold text-white tracking-tight hidden sm:inline">
                Flash
                <span className="text-emerald-400"> Buy</span>
              </span>
            </button>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-1">
            {navItems.map((item) => (
              <Button
                key={item.page}
                variant="ghost"
                size="sm"
                onClick={() => handleNavClick(item.page)}
                className={cn(
                  'text-sm font-medium transition-colors',
                  currentPage === item.page
                    ? 'text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/15 hover:text-emerald-400'
                    : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
                )}
              >
                <item.icon className="size-4" />
                {item.label}
              </Button>
            ))}

            {/* Categories Dropdown */}
            <DropdownMenu open={categoryOpen} onOpenChange={setCategoryOpen}>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className={cn(
                    'text-sm font-medium transition-colors gap-1',
                    selectedCategory
                      ? 'text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/15 hover:text-emerald-400'
                      : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
                  )}
                >
                  <Grid3X3 className="size-4" />
                  Categories
                  <ChevronDown
                    className={cn(
                      'size-3 transition-transform',
                      categoryOpen && 'rotate-180'
                    )}
                  />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="start"
                className="w-56 bg-zinc-900 border-zinc-800"
              >
                <DropdownMenuLabel className="text-zinc-400 text-xs">
                  Browse Categories
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-zinc-800" />
                {CATEGORIES.map((cat) => (
                  <DropdownMenuItem
                    key={cat.id}
                    onClick={() => handleCategorySelect(cat.id)}
                    className={cn(
                      'text-zinc-300 hover:text-white hover:bg-zinc-800 focus:bg-zinc-800 focus:text-white cursor-pointer',
                      selectedCategory === cat.id && 'text-emerald-400'
                    )}
                  >
                    {cat.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </nav>

          {/* Search Bar */}
          <form
            onSubmit={handleSearch}
            className="hidden md:flex items-center flex-1 max-w-md"
          >
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-zinc-500" />
              <Input
                type="text"
                placeholder="Search products..."
                value={localSearch}
                onChange={(e) => setLocalSearch(e.target.value)}
                className="pl-9 h-9 bg-zinc-900 border-zinc-800 text-zinc-200 placeholder:text-zinc-500 focus-visible:border-emerald-500/50 focus-visible:ring-emerald-500/20 w-full"
              />
              {localSearch && (
                <button
                  type="button"
                  onClick={() => {
                    setLocalSearch('');
                    setSearchQuery('');
                  }}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition-colors"
                >
                  <X className="size-3.5" />
                </button>
              )}
            </div>
          </form>

          {/* Right Side Actions */}
          <div className="flex items-center gap-1.5 shrink-0">
            {/* Mobile Search Toggle */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden text-zinc-400 hover:text-white hover:bg-zinc-800"
              onClick={() => setSearchOpen(!searchOpen)}
              aria-label="Toggle search"
            >
              <Search className="size-5" />
            </Button>

            {/* Cart */}
            <Button
              variant="ghost"
              size="icon"
              className="relative text-zinc-400 hover:text-white hover:bg-zinc-800"
              onClick={() => handleNavClick('cart')}
              aria-label="Shopping cart"
            >
              <ShoppingCart className="size-5" />
              {cartCount > 0 && (
                <Badge className="absolute -top-1 -right-1 size-5 p-0 flex items-center justify-center bg-emerald-500 text-white text-[10px] font-bold border-0 hover:bg-emerald-500">
                  {cartCount > 99 ? '99+' : cartCount}
                </Badge>
              )}
            </Button>

            {/* User Menu */}
            {isAuthenticated && user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="relative h-9 w-9 rounded-full ring-2 ring-zinc-700 hover:ring-emerald-500/50 transition-all"
                  >
                    <Avatar className="size-8">
                      <AvatarImage
                        src={user.avatar}
                        alt={user.name}
                      />
                      <AvatarFallback className="bg-emerald-600 text-white text-xs font-semibold">
                        {getInitials(user.name)}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  className="w-56 bg-zinc-900 border-zinc-800"
                >
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium text-white">
                        {user.name}
                      </p>
                      <p className="text-xs text-zinc-400">{user.email}</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator className="bg-zinc-800" />
                  <DropdownMenuGroup>
                    <DropdownMenuItem
                      onClick={() => handleNavClick('dashboard')}
                      className="text-zinc-300 hover:text-white hover:bg-zinc-800 focus:bg-zinc-800 focus:text-white cursor-pointer"
                    >
                      <LayoutDashboard className="size-4 mr-2" />
                      Dashboard
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => handleNavClick('orders')}
                      className="text-zinc-300 hover:text-white hover:bg-zinc-800 focus:bg-zinc-800 focus:text-white cursor-pointer"
                    >
                      <Package className="size-4 mr-2" />
                      Orders
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => handleNavClick('wallet')}
                      className="text-zinc-300 hover:text-white hover:bg-zinc-800 focus:bg-zinc-800 focus:text-white cursor-pointer"
                    >
                      <Wallet className="size-4 mr-2" />
                      Wallet
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => handleNavClick('tickets')}
                      className="text-zinc-300 hover:text-white hover:bg-zinc-800 focus:bg-zinc-800 focus:text-white cursor-pointer"
                    >
                      <Ticket className="size-4 mr-2" />
                      Tickets
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => handleNavClick('referrals')}
                      className="text-zinc-300 hover:text-white hover:bg-zinc-800 focus:bg-zinc-800 focus:text-white cursor-pointer"
                    >
                      <Users className="size-4 mr-2" />
                      Referrals
                    </DropdownMenuItem>
                  </DropdownMenuGroup>
                  {user.role === 'admin' && (
                    <>
                      <DropdownMenuSeparator className="bg-zinc-800" />
                      <DropdownMenuItem
                        onClick={() => handleNavClick('admin')}
                        className="text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10 focus:bg-emerald-500/10 focus:text-emerald-300 cursor-pointer"
                      >
                        <ShieldCheck className="size-4 mr-2" />
                        Admin Panel
                      </DropdownMenuItem>
                    </>
                  )}
                  <DropdownMenuSeparator className="bg-zinc-800" />
                  <DropdownMenuItem
                    onClick={logout}
                    className="text-red-400 hover:text-red-300 hover:bg-red-500/10 focus:bg-red-500/10 focus:text-red-300 cursor-pointer"
                  >
                    <LogOut className="size-4 mr-2" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button
                onClick={() => setShowAuthDialog(true, 'login')}
                className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-600/20 hover:shadow-emerald-600/30 transition-all"
                size="sm"
              >
                <User className="size-4" />
                <span className="hidden sm:inline">Sign In</span>
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Search Bar */}
      {searchOpen && (
        <div className="md:hidden border-t border-zinc-800/50 bg-zinc-950/95 backdrop-blur-xl px-4 py-3">
          <form onSubmit={handleSearch} className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-zinc-500" />
            <Input
              type="text"
              placeholder="Search products..."
              value={localSearch}
              onChange={(e) => setLocalSearch(e.target.value)}
              autoFocus
              className="pl-9 h-9 bg-zinc-900 border-zinc-800 text-zinc-200 placeholder:text-zinc-500 focus-visible:border-emerald-500/50 focus-visible:ring-emerald-500/20 w-full"
            />
          </form>
        </div>
      )}

      {/* Mobile Sidebar */}
      <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
        <SheetContent
          side="left"
          className="bg-zinc-950 border-zinc-800 w-80 p-0"
        >
          <SheetHeader className="p-4 pb-0">
            <SheetTitle className="flex items-center gap-2">
              <div className="flex items-center justify-center size-8 rounded-lg bg-gradient-to-br from-emerald-500 to-emerald-700">
                <Zap className="size-4 text-white fill-white/30" />
              </div>
              <span className="text-lg font-bold text-white">
                Flash<span className="text-emerald-400"> Buy</span>
              </span>
            </SheetTitle>
          </SheetHeader>

          {/* Mobile Search */}
          <div className="px-4 pt-4">
            <form onSubmit={handleSearch} className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-zinc-500" />
              <Input
                type="text"
                placeholder="Search products..."
                value={localSearch}
                onChange={(e) => setLocalSearch(e.target.value)}
                className="pl-9 h-9 bg-zinc-900 border-zinc-800 text-zinc-200 placeholder:text-zinc-500 focus-visible:border-emerald-500/50 focus-visible:ring-emerald-500/20 w-full"
              />
            </form>
          </div>

          <Separator className="bg-zinc-800 my-4" />

          {/* Navigation */}
          <nav className="flex flex-col gap-1 px-3">
            {navItems.map((item) => (
              <button
                key={item.page}
                onClick={() => handleNavClick(item.page)}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors text-left',
                  currentPage === item.page
                    ? 'text-emerald-400 bg-emerald-500/10'
                    : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
                )}
              >
                <item.icon className="size-4" />
                {item.label}
              </button>
            ))}
          </nav>

          <Separator className="bg-zinc-800 my-4" />

          {/* Categories */}
          <div className="px-3">
            <p className="px-3 text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2">
              Categories
            </p>
            <div className="flex flex-col gap-0.5">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => handleCategorySelect(cat.id)}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors text-left',
                    selectedCategory === cat.id
                      ? 'text-emerald-400 bg-emerald-500/10'
                      : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
                  )}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          <Separator className="bg-zinc-800 my-4" />

          {/* User Section */}
          {isAuthenticated && user ? (
            <div className="px-3">
              <div className="flex items-center gap-3 px-3 py-2 mb-2">
                <Avatar className="size-8">
                  <AvatarImage src={user.avatar} alt={user.name} />
                  <AvatarFallback className="bg-emerald-600 text-white text-xs font-semibold">
                    {getInitials(user.name)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">
                    {user.name}
                  </p>
                  <p className="text-xs text-zinc-400 truncate">{user.email}</p>
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
                  <button
                    key={item.page}
                    onClick={() => handleNavClick(item.page)}
                    className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors text-left"
                  >
                    <item.icon className="size-4" />
                    {item.label}
                  </button>
                ))}
                {user.role === 'admin' && (
                  <button
                    onClick={() => handleNavClick('admin')}
                    className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10 transition-colors text-left"
                  >
                    <ShieldCheck className="size-4" />
                    Admin Panel
                  </button>
                )}
                <button
                  onClick={() => {
                    logout();
                    setSidebarOpen(false);
                  }}
                  className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors text-left"
                >
                  <LogOut className="size-4" />
                  Logout
                </button>
              </div>
            </div>
          ) : (
            <div className="px-4">
              <Button
                onClick={() => {
                  setShowAuthDialog(true, 'login');
                  setSidebarOpen(false);
                }}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
              >
                <User className="size-4" />
                Sign In
              </Button>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </header>
  );
}
