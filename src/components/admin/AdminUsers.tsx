'use client';

import { useState, useEffect } from 'react';
import type { User, UserRole } from '@/lib/types';
import { Card, CardContent } from '@/components/ui/card';
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
      const res = await fetch(`/api/admin/users/${userId}/reset-password`, {
        method: 'POST',
      });
      if (res.ok) {
        setResetConfirm(null);
      }
    } catch {
      // handle error
    }
  };

  const openDetail = (user: AdminUser) => {
    setSelectedUser(user);
    setDetailOpen(true);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">Users</h2>
          <p className="text-muted-foreground">Manage user accounts and permissions</p>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search users by name or email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Users Table */}
      <Card>
        <CardContent className="p-0">
          {filteredUsers.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
              <Users className="h-12 w-12 mb-4 opacity-50" />
              <p className="text-lg font-medium">No users found</p>
              <p className="text-sm">Users will appear here when they register.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Orders</TableHead>
                  <TableHead>Balance</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                          <span className="text-xs font-medium">
                            {user.name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)}
                          </span>
                        </div>
                        <span className="font-medium text-sm">{user.name}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">{user.email}</TableCell>
                    <TableCell>
                      <Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>
                        {user.role === 'admin' ? <Shield className="h-3 w-3 mr-1" /> : null}
                        {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="secondary"
                        className={
                          user.isBanned
                            ? 'bg-red-100 text-red-800'
                            : 'bg-green-100 text-green-800'
                        }
                      >
                        {user.isBanned ? 'Banned' : 'Active'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm">{user.orderCount || 0}</TableCell>
                    <TableCell className="font-medium text-sm">${user.balance.toFixed(2)}</TableCell>
                    <TableCell className="text-muted-foreground text-xs">{formatDate(user.createdAt)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button variant="ghost" size="sm" onClick={() => openDetail(user)}>
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleToggleBan(user.id, !!user.isBanned)}
                          disabled={banToggling === user.id || user.role === 'admin'}
                          className={user.isBanned ? 'text-green-600' : 'text-red-600'}
                        >
                          {user.isBanned ? <Shield className="h-4 w-4" /> : <ShieldOff className="h-4 w-4" />}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-orange-600"
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
        </CardContent>
      </Card>

      {/* User Detail Dialog */}
      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="sm:max-w-[500px]">
          {selectedUser && (
            <>
              <DialogHeader>
                <DialogTitle>User Details</DialogTitle>
                <DialogDescription>View and manage user information</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="flex items-center gap-4">
                  <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center">
                    <span className="text-xl font-medium">
                      {selectedUser.name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)}
                    </span>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold">{selectedUser.name}</h3>
                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                      <Mail className="h-3 w-3" /> {selectedUser.email}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="p-3 rounded-lg border">
                    <p className="text-muted-foreground">Role</p>
                    <Badge variant={selectedUser.role === 'admin' ? 'default' : 'secondary'} className="mt-1">
                      {selectedUser.role.charAt(0).toUpperCase() + selectedUser.role.slice(1)}
                    </Badge>
                  </div>
                  <div className="p-3 rounded-lg border">
                    <p className="text-muted-foreground">Status</p>
                    <Badge
                      variant="secondary"
                      className={`mt-1 ${selectedUser.isBanned ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}
                    >
                      {selectedUser.isBanned ? 'Banned' : 'Active'}
                    </Badge>
                  </div>
                  <div className="p-3 rounded-lg border">
                    <p className="text-muted-foreground">Balance</p>
                    <p className="font-semibold mt-1">${selectedUser.balance.toFixed(2)} USDT</p>
                  </div>
                  <div className="p-3 rounded-lg border">
                    <p className="text-muted-foreground">Orders</p>
                    <p className="font-semibold mt-1">{selectedUser.orderCount || 0}</p>
                  </div>
                  <div className="p-3 rounded-lg border">
                    <p className="text-muted-foreground">Verified</p>
                    <Badge variant="secondary" className={`mt-1 ${selectedUser.isVerified ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                      {selectedUser.isVerified ? 'Yes' : 'No'}
                    </Badge>
                  </div>
                  <div className="p-3 rounded-lg border">
                    <p className="text-muted-foreground">Joined</p>
                    <p className="font-semibold mt-1">{formatDate(selectedUser.createdAt)}</p>
                  </div>
                </div>

                <div className="p-3 rounded-lg border">
                  <p className="text-muted-foreground text-sm">Referral Code</p>
                  <p className="font-mono text-sm mt-1">{selectedUser.referralCode || 'N/A'}</p>
                </div>

                <div className="flex gap-3 pt-2">
                  <Button
                    variant={selectedUser.isBanned ? 'default' : 'destructive'}
                    className="flex-1"
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
                    className="flex-1"
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
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reset Password</DialogTitle>
            <DialogDescription>
              Are you sure you want to reset this user&apos;s password? A new temporary password will be sent to their email.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setResetConfirm(null)}>Cancel</Button>
            <Button variant="destructive" onClick={() => resetConfirm && handleResetPassword(resetConfirm)}>
              Reset Password
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
