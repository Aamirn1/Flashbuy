'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import type { User, UserRole } from '@/lib/types';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { Users, Search, Eye, Shield, ShieldOff, KeyRound, Mail } from 'lucide-react';

interface AdminUser extends User {
  orderCount?: number;
  isBanned?: boolean;
}

export function AdminUsers() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [resetConfirm, setResetConfirm] = useState<string | null>(null);
  const [banToggling, setBanToggling] = useState<string | null>(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/users');
      if (res.ok) {
        const data = await res.json();
        setUsers(data.users || []);
      }
    } catch {
      // handle error
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter(
    (u) =>
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase())
  );

  const handleToggleBan = async (userId: string, currentlyBanned: boolean) => {
    setBanToggling(userId);
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isBanned: !currentlyBanned }),
      });
      if (res.ok) {
        setUsers((prev) =>
          prev.map((u) => (u.id === userId ? { ...u, isBanned: !currentlyBanned } : u))
        );
        if (selectedUser?.id === userId) {
          setSelectedUser({ ...selectedUser, isBanned: !currentlyBanned });
        }
      }
    } catch {
      // handle error
    } finally {
      setBanToggling(null);
    }
  };

  const handleResetPassword = async (userId: string) => {
    try {
      const res = await fetch(`/api/admin/users/${userId}/reset-password`, { method: 'POST' });
      if (res.ok) setResetConfirm(null);
    } catch {
      // handle error
    }
  };

  const openDetail = (user: AdminUser) => {
    setSelectedUser(user);
    setDetailOpen(true);
  };

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-48 bg-white/5" />
        <Skeleton className="h-64 w-full bg-white/5" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h2 className="text-2xl font-bold text-gradient-cyan">Users</h2>
        <p className="text-muted-foreground">Manage user accounts and permissions</p>
      </motion.div>

      {/* Search */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="relative"
      >
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-emerald-400/50" />
        <Input
          placeholder="Search users by name or email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10 glass-input"
        />
      </motion.div>

      {/* Users Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="glass-card rounded-xl overflow-hidden"
      >
        {filteredUsers.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
            <Users className="h-12 w-12 mb-4 opacity-50" />
            <p className="text-lg font-medium">No users found</p>
            <p className="text-sm">Users will appear here when they register.</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="border-emerald-500/10 hover:bg-transparent">
                <TableHead className="text-muted-foreground">Name</TableHead>
                <TableHead className="text-muted-foreground">Email</TableHead>
                <TableHead className="text-muted-foreground">Role</TableHead>
                <TableHead className="text-muted-foreground">Status</TableHead>
                <TableHead className="text-muted-foreground">Orders</TableHead>
                <TableHead className="text-muted-foreground">Balance</TableHead>
                <TableHead className="text-muted-foreground">Joined</TableHead>
                <TableHead className="text-right text-muted-foreground">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.map((user) => (
                <TableRow key={user.id} className="border-emerald-500/5 hover:bg-emerald-500/5">
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-emerald-500/15 flex items-center justify-center flex-shrink-0 border border-emerald-500/20">
                        <span className="text-xs font-medium text-emerald-400">
                          {user.name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)}
                        </span>
                      </div>
                      <span className="font-medium text-sm text-foreground">{user.name}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">{user.email}</TableCell>
                  <TableCell>
                    <Badge className={
                      user.role === 'admin'
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        : 'bg-slate-500/20 text-slate-400 border border-slate-500/30'
                    }>
                      {user.role === 'admin' ? <Shield className="h-3 w-3 mr-1" /> : null}
                      {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge
                      className={
                        user.isBanned
                          ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                          : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      }
                    >
                      {user.isBanned ? 'Banned' : 'Active'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-foreground">{user.orderCount || 0}</TableCell>
                  <TableCell className="font-medium text-sm text-gradient-gold">${user.balance.toFixed(2)}</TableCell>
                  <TableCell className="text-muted-foreground text-xs">{formatDate(user.createdAt)}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button variant="ghost" size="sm" className="text-emerald-400 hover:bg-emerald-500/10" onClick={() => openDetail(user)}>
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleToggleBan(user.id, !!user.isBanned)}
                        disabled={banToggling === user.id || user.role === 'admin'}
                        className={user.isBanned ? 'text-emerald-400 hover:bg-emerald-500/10' : 'text-red-400 hover:bg-red-500/10'}
                      >
                        {user.isBanned ? <Shield className="h-4 w-4" /> : <ShieldOff className="h-4 w-4" />}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-amber-400 hover:bg-amber-500/10"
                        onClick={() => setResetConfirm(user.id)}
                      >
                        <KeyRound className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </motion.div>

      {/* User Detail Dialog */}
      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="glass-strong border-emerald-500/20 sm:max-w-[500px]">
          {selectedUser && (
            <>
              <DialogHeader>
                <DialogTitle className="text-gradient-cyan">User Details</DialogTitle>
                <DialogDescription className="text-muted-foreground">View and manage user information</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="flex items-center gap-4">
                  <div className="h-16 w-16 rounded-2xl bg-emerald-500/15 flex items-center justify-center border border-emerald-500/20">
                    <span className="text-xl font-medium text-emerald-400">
                      {selectedUser.name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)}
                    </span>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-foreground">{selectedUser.name}</h3>
                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                      <Mail className="h-3 w-3" /> {selectedUser.email}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  {[
                    { label: 'Role', content: <Badge className={selectedUser.role === 'admin' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-slate-500/20 text-slate-400 border border-slate-500/30'}>{selectedUser.role.charAt(0).toUpperCase() + selectedUser.role.slice(1)}</Badge> },
                    { label: 'Status', content: <Badge className={selectedUser.isBanned ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'}>{selectedUser.isBanned ? 'Banned' : 'Active'}</Badge> },
                    { label: 'Balance', content: <span className="font-semibold text-gradient-gold">${selectedUser.balance.toFixed(2)} USDT</span> },
                    { label: 'Orders', content: <span className="font-semibold text-foreground">{selectedUser.orderCount || 0}</span> },
                    { label: 'Verified', content: <Badge className={selectedUser.isVerified ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'}>{selectedUser.isVerified ? 'Yes' : 'No'}</Badge> },
                    { label: 'Joined', content: <span className="font-semibold text-foreground">{formatDate(selectedUser.createdAt)}</span> },
                  ].map((item) => (
                    <div key={item.label} className="glass-light rounded-lg p-3">
                      <p className="text-muted-foreground text-xs">{item.label}</p>
                      <div className="mt-1">{item.content}</div>
                    </div>
                  ))}
                </div>

                <div className="glass-light rounded-lg p-3">
                  <p className="text-muted-foreground text-sm">Referral Code</p>
                  <p className="font-mono text-sm mt-1 text-emerald-400">{selectedUser.referralCode || 'N/A'}</p>
                </div>

                <div className="flex gap-3 pt-2">
                  <Button
                    variant={selectedUser.isBanned ? 'default' : 'destructive'}
                    className={`flex-1 ${selectedUser.isBanned ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/30' : 'bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/30'}`}
                    onClick={() => handleToggleBan(selectedUser.id, !!selectedUser.isBanned)}
                    disabled={selectedUser.role === 'admin'}
                  >
                    {selectedUser.isBanned ? (
                      <><Shield className="h-4 w-4 mr-2" /> Unban User</>
                    ) : (
                      <><ShieldOff className="h-4 w-4 mr-2" /> Ban User</>
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    className="flex-1 glass-light border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/10"
                    onClick={() => setResetConfirm(selectedUser.id)}
                  >
                    <KeyRound className="h-4 w-4 mr-2" /> Reset Password
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Reset Password Confirm Dialog */}
      <Dialog open={!!resetConfirm} onOpenChange={() => setResetConfirm(null)}>
        <DialogContent className="glass-strong border-emerald-500/20">
          <DialogHeader>
            <DialogTitle className="text-gradient-cyan">Reset Password</DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Are you sure you want to reset this user&apos;s password? A new temporary password will be sent to their email.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="ghost" className="text-muted-foreground" onClick={() => setResetConfirm(null)}>Cancel</Button>
            <Button variant="destructive" className="bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/30" onClick={() => resetConfirm && handleResetPassword(resetConfirm)}>
              Reset Password
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
