'use client';

import React, { useState, useEffect } from 'react';
import { useStore } from '@/lib/store';
import { cn } from '@/lib/utils';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Zap, Mail, Lock, User, Phone, Globe, Eye, EyeOff, Loader2, AlertCircle } from 'lucide-react';
import type { User as UserType } from '@/lib/types';

const COUNTRIES = [
  { value: 'US', label: 'United States' },
  { value: 'GB', label: 'United Kingdom' },
  { value: 'CA', label: 'Canada' },
  { value: 'AU', label: 'Australia' },
  { value: 'DE', label: 'Germany' },
  { value: 'FR', label: 'France' },
  { value: 'JP', label: 'Japan' },
  { value: 'KR', label: 'South Korea' },
  { value: 'SG', label: 'Singapore' },
  { value: 'AE', label: 'United Arab Emirates' },
  { value: 'TR', label: 'Turkey' },
  { value: 'RU', label: 'Russia' },
  { value: 'BR', label: 'Brazil' },
  { value: 'IN', label: 'India' },
  { value: 'CN', label: 'China' },
  { value: 'NG', label: 'Nigeria' },
  { value: 'ZA', label: 'South Africa' },
  { value: 'OTHER', label: 'Other' },
];

interface LoginForm {
  email: string;
  password: string;
}

interface RegisterForm {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  country: string;
  phone: string;
}

interface FormErrors {
  [key: string]: string;
}

export default function AuthDialog() {
  const { showAuthDialog, setShowAuthDialog, authMode, setUser } = useStore();

  const [activeTab, setActiveTab] = useState<string>(authMode);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [serverError, setServerError] = useState('');

  const [loginForm, setLoginForm] = useState<LoginForm>({
    email: '',
    password: '',
  });
  const [loginErrors, setLoginErrors] = useState<FormErrors>({});

  const [registerForm, setRegisterForm] = useState<RegisterForm>({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    country: '',
    phone: '',
  });
  const [registerErrors, setRegisterErrors] = useState<FormErrors>({});

  // Sync tab with store authMode
  useEffect(() => {
    setActiveTab(authMode);
  }, [authMode]);

  // Reset forms when dialog opens/closes
  useEffect(() => {
    if (!showAuthDialog) {
      setLoginForm({ email: '', password: '' });
      setRegisterForm({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        country: '',
        phone: '',
      });
      setLoginErrors({});
      setRegisterErrors({});
      setServerError('');
      setShowPassword(false);
      setShowConfirmPassword(false);
    }
  }, [showAuthDialog]);

  const validateLogin = (): boolean => {
    const errors: FormErrors = {};
    if (!loginForm.email.trim()) {
      errors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(loginForm.email)) {
      errors.email = 'Invalid email address';
    }
    if (!loginForm.password) {
      errors.password = 'Password is required';
    } else if (loginForm.password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
    }
    setLoginErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validateRegister = (): boolean => {
    const errors: FormErrors = {};
    if (!registerForm.name.trim()) {
      errors.name = 'Name is required';
    } else if (registerForm.name.trim().length < 2) {
      errors.name = 'Name must be at least 2 characters';
    }
    if (!registerForm.email.trim()) {
      errors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(registerForm.email)) {
      errors.email = 'Invalid email address';
    }
    if (!registerForm.password) {
      errors.password = 'Password is required';
    } else if (registerForm.password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
    }
    if (!registerForm.confirmPassword) {
      errors.confirmPassword = 'Please confirm your password';
    } else if (registerForm.password !== registerForm.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }
    if (!registerForm.country) {
      errors.country = 'Please select a country';
    }
    if (registerForm.phone && !/^[+]?[\d\s-]{7,15}$/.test(registerForm.phone)) {
      errors.phone = 'Invalid phone number';
    }
    setRegisterErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError('');

    if (!validateLogin()) return;

    setIsLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(loginForm),
      });

      const data = await res.json();

      if (!res.ok) {
        setServerError(data.error || 'Login failed. Please try again.');
        return;
      }

      setUser(data.user as UserType);
      setShowAuthDialog(false);
    } catch {
      setServerError('Network error. Please check your connection.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError('');

    if (!validateRegister()) return;

    setIsLoading(true);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: registerForm.name,
          email: registerForm.email,
          password: registerForm.password,
          country: registerForm.country,
          phone: registerForm.phone || undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setServerError(data.error || 'Registration failed. Please try again.');
        return;
      }

      setUser(data.user as UserType);
      setShowAuthDialog(false);
    } catch {
      setServerError('Network error. Please check your connection.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    setServerError('');
    setLoginErrors({});
    setRegisterErrors({});
  };

  return (
    <Dialog open={showAuthDialog} onOpenChange={(open) => setShowAuthDialog(open)}>
      <DialogContent className="sm:max-w-[440px] bg-zinc-950 border-zinc-800 p-0 overflow-hidden">
        {/* Header with gradient */}
        <div className="relative bg-gradient-to-br from-emerald-600/20 via-zinc-900 to-zinc-900 px-6 pt-6 pb-4">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-emerald-500/10 via-transparent to-transparent" />
          <DialogHeader className="relative">
            <div className="flex items-center justify-center gap-2 mb-2">
              <div className="flex items-center justify-center size-10 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-700 shadow-lg shadow-emerald-500/20">
                <Zap className="size-5 text-white fill-white/30" />
              </div>
            </div>
            <DialogTitle className="text-center text-xl font-bold text-white">
              Welcome to Flash Buy
            </DialogTitle>
            <DialogDescription className="text-center text-zinc-400 text-sm">
              Sign in to your account or create a new one
            </DialogDescription>
          </DialogHeader>
        </div>

        <Tabs
          value={activeTab}
          onValueChange={handleTabChange}
          className="w-full"
        >
          <div className="px-6">
            <TabsList className="w-full bg-zinc-900 border border-zinc-800 h-10">
              <TabsTrigger
                value="login"
                className="flex-1 data-[state=active]:bg-emerald-600 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-emerald-600/20 text-zinc-400"
              >
                Sign In
              </TabsTrigger>
              <TabsTrigger
                value="register"
                className="flex-1 data-[state=active]:bg-emerald-600 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-emerald-600/20 text-zinc-400"
              >
                Create Account
              </TabsTrigger>
            </TabsList>
          </div>

          {/* Login Tab */}
          <TabsContent value="login" className="mt-0">
            <form onSubmit={handleLogin} className="px-6 pb-6 pt-4 space-y-4">
              {serverError && (
                <div className="flex items-center gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/20">
                  <AlertCircle className="size-4 text-red-400 shrink-0" />
                  <p className="text-sm text-red-400">{serverError}</p>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="login-email" className="text-zinc-300 text-sm">
                  Email
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-zinc-500" />
                  <Input
                    id="login-email"
                    type="email"
                    placeholder="your@email.com"
                    value={loginForm.email}
                    onChange={(e) =>
                      setLoginForm({ ...loginForm, email: e.target.value })
                    }
                    className={cn(
                      'pl-9 h-10 bg-zinc-900 border-zinc-800 text-zinc-200 placeholder:text-zinc-500 focus-visible:border-emerald-500/50 focus-visible:ring-emerald-500/20',
                      loginErrors.email && 'border-red-500/50 focus-visible:border-red-500/50 focus-visible:ring-red-500/20'
                    )}
                    autoComplete="email"
                  />
                </div>
                {loginErrors.email && (
                  <p className="text-xs text-red-400">{loginErrors.email}</p>
                )}
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="login-password" className="text-zinc-300 text-sm">
                    Password
                  </Label>
                  <button
                    type="button"
                    className="text-xs text-emerald-400 hover:text-emerald-300 transition-colors"
                    onClick={() => {
                      // TODO: implement forgot password
                    }}
                  >
                    Forgot Password?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-zinc-500" />
                  <Input
                    id="login-password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter your password"
                    value={loginForm.password}
                    onChange={(e) =>
                      setLoginForm({ ...loginForm, password: e.target.value })
                    }
                    className={cn(
                      'pl-9 pr-10 h-10 bg-zinc-900 border-zinc-800 text-zinc-200 placeholder:text-zinc-500 focus-visible:border-emerald-500/50 focus-visible:ring-emerald-500/20',
                      loginErrors.password && 'border-red-500/50 focus-visible:border-red-500/50 focus-visible:ring-red-500/20'
                    )}
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition-colors"
                  >
                    {showPassword ? (
                      <EyeOff className="size-4" />
                    ) : (
                      <Eye className="size-4" />
                    )}
                  </button>
                </div>
                {loginErrors.password && (
                  <p className="text-xs text-red-400">{loginErrors.password}</p>
                )}
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full h-10 bg-emerald-600 hover:bg-emerald-700 text-white font-medium shadow-lg shadow-emerald-600/20 hover:shadow-emerald-600/30 transition-all"
              >
                {isLoading ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  'Sign In'
                )}
              </Button>

              <div className="relative">
                <Separator className="bg-zinc-800" />
                <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-zinc-950 px-3 text-xs text-zinc-500">
                  or continue with
                </span>
              </div>

              <Button
                type="button"
                variant="outline"
                className="w-full h-10 border-zinc-800 bg-zinc-900 text-zinc-300 hover:bg-zinc-800 hover:text-white"
                onClick={() => {
                  // TODO: implement Google login
                }}
              >
                <svg className="size-4 mr-2" viewBox="0 0 24 24">
                  <path
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                    fill="#4285F4"
                  />
                  <path
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    fill="#34A853"
                  />
                  <path
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    fill="#FBBC05"
                  />
                  <path
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    fill="#EA4335"
                  />
                </svg>
                Continue with Google
              </Button>
            </form>
          </TabsContent>

          {/* Register Tab */}
          <TabsContent value="register" className="mt-0">
            <form onSubmit={handleRegister} className="px-6 pb-6 pt-4 space-y-4">
              {serverError && (
                <div className="flex items-center gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/20">
                  <AlertCircle className="size-4 text-red-400 shrink-0" />
                  <p className="text-sm text-red-400">{serverError}</p>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="reg-name" className="text-zinc-300 text-sm">
                  Full Name
                </Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-zinc-500" />
                  <Input
                    id="reg-name"
                    type="text"
                    placeholder="John Doe"
                    value={registerForm.name}
                    onChange={(e) =>
                      setRegisterForm({ ...registerForm, name: e.target.value })
                    }
                    className={cn(
                      'pl-9 h-10 bg-zinc-900 border-zinc-800 text-zinc-200 placeholder:text-zinc-500 focus-visible:border-emerald-500/50 focus-visible:ring-emerald-500/20',
                      registerErrors.name && 'border-red-500/50 focus-visible:border-red-500/50 focus-visible:ring-red-500/20'
                    )}
                    autoComplete="name"
                  />
                </div>
                {registerErrors.name && (
                  <p className="text-xs text-red-400">{registerErrors.name}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="reg-email" className="text-zinc-300 text-sm">
                  Email
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-zinc-500" />
                  <Input
                    id="reg-email"
                    type="email"
                    placeholder="your@email.com"
                    value={registerForm.email}
                    onChange={(e) =>
                      setRegisterForm({ ...registerForm, email: e.target.value })
                    }
                    className={cn(
                      'pl-9 h-10 bg-zinc-900 border-zinc-800 text-zinc-200 placeholder:text-zinc-500 focus-visible:border-emerald-500/50 focus-visible:ring-emerald-500/20',
                      registerErrors.email && 'border-red-500/50 focus-visible:border-red-500/50 focus-visible:ring-red-500/20'
                    )}
                    autoComplete="email"
                  />
                </div>
                {registerErrors.email && (
                  <p className="text-xs text-red-400">{registerErrors.email}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="reg-password" className="text-zinc-300 text-sm">
                    Password
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-zinc-500" />
                    <Input
                      id="reg-password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Min 6 chars"
                      value={registerForm.password}
                      onChange={(e) =>
                        setRegisterForm({ ...registerForm, password: e.target.value })
                      }
                      className={cn(
                        'pl-9 pr-10 h-10 bg-zinc-900 border-zinc-800 text-zinc-200 placeholder:text-zinc-500 focus-visible:border-emerald-500/50 focus-visible:ring-emerald-500/20',
                        registerErrors.password && 'border-red-500/50 focus-visible:border-red-500/50 focus-visible:ring-red-500/20'
                      )}
                      autoComplete="new-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition-colors"
                    >
                      {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                    </button>
                  </div>
                  {registerErrors.password && (
                    <p className="text-xs text-red-400">{registerErrors.password}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="reg-confirm" className="text-zinc-300 text-sm">
                    Confirm
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-zinc-500" />
                    <Input
                      id="reg-confirm"
                      type={showConfirmPassword ? 'text' : 'password'}
                      placeholder="Confirm"
                      value={registerForm.confirmPassword}
                      onChange={(e) =>
                        setRegisterForm({ ...registerForm, confirmPassword: e.target.value })
                      }
                      className={cn(
                        'pl-9 pr-10 h-10 bg-zinc-900 border-zinc-800 text-zinc-200 placeholder:text-zinc-500 focus-visible:border-emerald-500/50 focus-visible:ring-emerald-500/20',
                        registerErrors.confirmPassword && 'border-red-500/50 focus-visible:border-red-500/50 focus-visible:ring-red-500/20'
                      )}
                      autoComplete="new-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition-colors"
                    >
                      {showConfirmPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                    </button>
                  </div>
                  {registerErrors.confirmPassword && (
                    <p className="text-xs text-red-400">{registerErrors.confirmPassword}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label className="text-zinc-300 text-sm">Country</Label>
                  <Select
                    value={registerForm.country}
                    onValueChange={(value) =>
                      setRegisterForm({ ...registerForm, country: value })
                    }
                  >
                    <SelectTrigger
                      className={cn(
                        'h-10 bg-zinc-900 border-zinc-800 text-zinc-200 focus:ring-emerald-500/20 w-full',
                        registerErrors.country && 'border-red-500/50'
                      )}
                    >
                      <Globe className="size-4 text-zinc-500 mr-1" />
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent className="bg-zinc-900 border-zinc-800">
                      {COUNTRIES.map((country) => (
                        <SelectItem
                          key={country.value}
                          value={country.value}
                          className="text-zinc-300 hover:text-white hover:bg-zinc-800 focus:bg-zinc-800 focus:text-white"
                        >
                          {country.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {registerErrors.country && (
                    <p className="text-xs text-red-400">{registerErrors.country}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="reg-phone" className="text-zinc-300 text-sm">
                    Phone <span className="text-zinc-500 text-xs">(optional)</span>
                  </Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-zinc-500" />
                    <Input
                      id="reg-phone"
                      type="tel"
                      placeholder="+1 234 567"
                      value={registerForm.phone}
                      onChange={(e) =>
                        setRegisterForm({ ...registerForm, phone: e.target.value })
                      }
                      className={cn(
                        'pl-9 h-10 bg-zinc-900 border-zinc-800 text-zinc-200 placeholder:text-zinc-500 focus-visible:border-emerald-500/50 focus-visible:ring-emerald-500/20',
                        registerErrors.phone && 'border-red-500/50 focus-visible:border-red-500/50 focus-visible:ring-red-500/20'
                      )}
                      autoComplete="tel"
                    />
                  </div>
                  {registerErrors.phone && (
                    <p className="text-xs text-red-400">{registerErrors.phone}</p>
                  )}
                </div>
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full h-10 bg-emerald-600 hover:bg-emerald-700 text-white font-medium shadow-lg shadow-emerald-600/20 hover:shadow-emerald-600/30 transition-all"
              >
                {isLoading ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  'Create Account'
                )}
              </Button>

              <p className="text-xs text-zinc-500 text-center leading-relaxed">
                By creating an account, you agree to our{' '}
                <button type="button" className="text-emerald-400 hover:text-emerald-300 underline underline-offset-2">
                  Terms of Service
                </button>{' '}
                and{' '}
                <button type="button" className="text-emerald-400 hover:text-emerald-300 underline underline-offset-2">
                  Privacy Policy
                </button>
              </p>
            </form>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
