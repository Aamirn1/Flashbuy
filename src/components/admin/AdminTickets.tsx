'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { AdminTicket, TicketMessage, TicketStatus } from '@/lib/types';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Headphones,
  MessageSquare,
  Send,
  RefreshCw,
  User,
  Eye,
  Filter,
  TicketIcon,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
} from 'lucide-react';

const GLASS_STATUS_COLORS: Record<string, string> = {
  open: 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30',
  pending: 'bg-amber-500/20 text-amber-400 border border-amber-500/30',
  solved: 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30',
  closed: 'bg-slate-500/20 text-slate-400 border border-slate-500/30',
};

const STATUS_OPTIONS: { value: string; label: string; icon: React.ReactNode }[] = [
  { value: 'all', label: 'All', icon: <Filter className="h-3 w-3" /> },
  { value: 'open', label: 'Open', icon: <AlertCircle className="h-3 w-3" /> },
  { value: 'pending', label: 'Pending', icon: <Clock className="h-3 w-3" /> },
  { value: 'solved', label: 'Solved', icon: <CheckCircle2 className="h-3 w-3" /> },
  { value: 'closed', label: 'Closed', icon: <XCircle className="h-3 w-3" /> },
];

const TICKET_STATUS_LIST: TicketStatus[] = ['open', 'pending', 'solved', 'closed'];

const CATEGORY_LABELS: Record<string, string> = {
  payment: 'Payment',
  delivery: 'Delivery',
  account: 'Account',
  other: 'Other',
};

const CATEGORY_ICONS: Record<string, string> = {
  payment: '💳',
  delivery: '📦',
  account: '👤',
  other: '❓',
};

export function AdminTickets() {
  const [tickets, setTickets] = useState<AdminTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedTicket, setSelectedTicket] = useState<AdminTicket | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [reply, setReply] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [confirmStatus, setConfirmStatus] = useState<{ ticketId: string; newStatus: string } | null>(null);

  const fetchTickets = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/tickets');
      if (res.ok) {
        const data = await res.json();
        setTickets(data.tickets || []);
      }
    } catch {
      // handle error
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTickets();
  }, [fetchTickets]);

  const filteredTickets = tickets.filter(
    (ticket) => statusFilter === 'all' || ticket.status === statusFilter
  );

  const fetchTicketDetail = async (id: string) => {
    setDetailLoading(true);
    try {
      const res = await fetch(`/api/admin/tickets/${id}`);
      if (res.ok) {
        const data = await res.json();
        setSelectedTicket(data.ticket);
      }
    } catch {
      // handle error
    } finally {
      setDetailLoading(false);
    }
  };

  const openDetail = (ticket: AdminTicket) => {
    setSelectedTicket(ticket);
    setDetailOpen(true);
    setReply('');
    fetchTicketDetail(ticket.id);
  };

  const handleReply = async () => {
    if (!reply.trim() || !selectedTicket) return;
    setSubmitting(true);
    try {
      const res = await fetch(`/api/admin/tickets/${selectedTicket.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: reply }),
      });
      if (res.ok) {
        const data = await res.json();
        setSelectedTicket(data.ticket);
        setReply('');
        // Also update the list
        setTickets((prev) =>
          prev.map((t) => (t.id === selectedTicket.id ? { ...t, ...data.ticket } : t))
        );
      }
    } catch {
      // handle error
    } finally {
      setSubmitting(false);
    }
  };

  const handleStatusChange = async (ticketId: string, newStatus: string) => {
    setUpdatingStatus(true);
    try {
      const res = await fetch(`/api/admin/tickets/${ticketId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        const data = await res.json();
        setTickets((prev) =>
          prev.map((t) => (t.id === ticketId ? { ...t, status: newStatus as TicketStatus } : t))
        );
        if (selectedTicket?.id === ticketId) {
          setSelectedTicket(data.ticket);
        }
      }
    } catch {
      // handle error
    } finally {
      setUpdatingStatus(false);
      setConfirmStatus(null);
    }
  };

  const confirmStatusChange = (ticketId: string, newStatus: string) => {
    setConfirmStatus({ ticketId, newStatus });
  };

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

  const formatMessageTime = (dateStr: string) =>
    new Date(dateStr).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });

  const getStatusLabel = (status: string) =>
    status.charAt(0).toUpperCase() + status.slice(1);

  // Count tickets by status
  const statusCounts = tickets.reduce<Record<string, number>>((acc, t) => {
    acc[t.status] = (acc[t.status] || 0) + 1;
    return acc;
  }, {});

  const messages = selectedTicket?.messages
    ? Array.isArray(selectedTicket.messages)
      ? selectedTicket.messages
      : []
    : [];

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-48 bg-white/5" />
        <div className="flex gap-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-8 w-20 bg-white/5" />
          ))}
        </div>
        <Skeleton className="h-64 w-full bg-white/5" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
      >
        <div>
          <h2 className="text-2xl font-bold text-gradient-cyan flex items-center gap-2">
            <Headphones className="h-6 w-6 text-emerald-400" />
            Support Tickets
          </h2>
          <p className="text-muted-foreground mt-1">Manage customer support requests</p>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="text-emerald-400 hover:bg-emerald-500/10"
          onClick={fetchTickets}
        >
          <RefreshCw className="h-4 w-4 mr-1" /> Refresh
        </Button>
      </motion.div>

      {/* Status Filter Pills */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="flex gap-2 flex-wrap"
      >
        {STATUS_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            onClick={() => setStatusFilter(opt.value)}
            className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-all ${
              statusFilter === opt.value
                ? 'glass-light border-emerald-500/30 text-emerald-400'
                : 'text-muted-foreground hover:text-foreground hover:bg-white/5'
            }`}
          >
            {opt.icon}
            {opt.label}
            {opt.value !== 'all' && statusCounts[opt.value] !== undefined && (
              <span className="ml-0.5 text-[10px] opacity-70">({statusCounts[opt.value]})</span>
            )}
            {opt.value === 'all' && (
              <span className="ml-0.5 text-[10px] opacity-70">({tickets.length})</span>
            )}
          </button>
        ))}
      </motion.div>

      {/* Tickets Table / Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="glass-card rounded-xl overflow-hidden"
      >
        {filteredTickets.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
            <TicketIcon className="h-12 w-12 mb-4 opacity-50" />
            <p className="text-lg font-medium">No tickets found</p>
            <p className="text-sm">
              {statusFilter !== 'all'
                ? `No ${statusFilter} tickets at the moment.`
                : 'Support tickets will appear here when customers submit requests.'}
            </p>
          </div>
        ) : (
          <>
            {/* Desktop Table View */}
            <div className="hidden md:block">
              <Table>
                <TableHeader>
                  <TableRow className="border-emerald-500/10 hover:bg-transparent">
                    <TableHead className="text-muted-foreground">Subject</TableHead>
                    <TableHead className="text-muted-foreground">User</TableHead>
                    <TableHead className="text-muted-foreground">Category</TableHead>
                    <TableHead className="text-muted-foreground">Status</TableHead>
                    <TableHead className="text-muted-foreground">Messages</TableHead>
                    <TableHead className="text-muted-foreground">Date</TableHead>
                    <TableHead className="text-right text-muted-foreground">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTickets.map((ticket) => (
                    <TableRow
                      key={ticket.id}
                      className="border-emerald-500/5 hover:bg-emerald-500/5 cursor-pointer"
                      onClick={() => openDetail(ticket)}
                    >
                      <TableCell>
                        <div className="max-w-[200px]">
                          <p className="font-medium text-sm text-foreground truncate">{ticket.subject}</p>
                          <p className="text-xs text-muted-foreground truncate mt-0.5">{ticket.description}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Avatar className="h-7 w-7 ring-1 ring-emerald-500/20">
                            <AvatarFallback className="bg-emerald-500/20 text-emerald-400 text-xs">
                              {ticket.user?.name?.charAt(0)?.toUpperCase() || 'U'}
                            </AvatarFallback>
                          </Avatar>
                          <div className="min-w-0">
                            <p className="text-sm text-foreground truncate">{ticket.user?.name || 'Unknown'}</p>
                            <p className="text-xs text-muted-foreground truncate">{ticket.user?.email || ''}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs">
                          {CATEGORY_ICONS[ticket.category] || '📋'} {CATEGORY_LABELS[ticket.category] || ticket.category}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={`${GLASS_STATUS_COLORS[ticket.status] || ''} text-xs`}>
                          {getStatusLabel(ticket.status)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <MessageSquare className="h-3.5 w-3.5" />
                          {ticket._count?.messages ?? 0}
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground text-xs">
                        {formatDate(ticket.createdAt)}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-emerald-400 hover:bg-emerald-500/10"
                          onClick={(e) => {
                            e.stopPropagation();
                            openDetail(ticket);
                          }}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Mobile Card View */}
            <div className="md:hidden space-y-2 p-4">
              {filteredTickets.map((ticket) => (
                <motion.div
                  key={ticket.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="glass-light rounded-xl p-4 border border-emerald-500/10 hover:border-emerald-500/20 transition-all cursor-pointer"
                  onClick={() => openDetail(ticket)}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm text-foreground truncate">{ticket.subject}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge className={`${GLASS_STATUS_COLORS[ticket.status] || ''} text-[10px] px-1.5 py-0`}>
                          {getStatusLabel(ticket.status)}
                        </Badge>
                        <Badge className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] px-1.5 py-0">
                          {CATEGORY_LABELS[ticket.category] || ticket.category}
                        </Badge>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <MessageSquare className="h-3 w-3" />
                      {ticket._count?.messages ?? 0}
                    </div>
                  </div>
                  <Separator className="my-3 bg-emerald-500/10" />
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Avatar className="h-5 w-5 ring-1 ring-emerald-500/20">
                        <AvatarFallback className="bg-emerald-500/20 text-emerald-400 text-[8px]">
                          {ticket.user?.name?.charAt(0)?.toUpperCase() || 'U'}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-xs text-muted-foreground truncate">{ticket.user?.name || 'Unknown'}</span>
                    </div>
                    <span className="text-[10px] text-muted-foreground">{formatDate(ticket.createdAt)}</span>
                  </div>
                </motion.div>
              ))}
            </div>
          </>
        )}
      </motion.div>

      {/* Ticket Detail Dialog */}
      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="glass-strong border-emerald-500/20 sm:max-w-[700px] max-h-[90vh] overflow-hidden flex flex-col p-0">
          {detailLoading ? (
            <div className="p-6 space-y-4">
              <Skeleton className="h-8 w-48 bg-white/5" />
              <Skeleton className="h-24 w-full bg-white/5" />
              <Skeleton className="h-32 w-full bg-white/5" />
            </div>
          ) : selectedTicket ? (
            <>
              <DialogHeader className="p-6 pb-0">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <DialogTitle className="text-gradient-cyan text-left">{selectedTicket.subject}</DialogTitle>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <Select
                      value={selectedTicket.status}
                      onValueChange={(v) => confirmStatusChange(selectedTicket.id, v)}
                      disabled={updatingStatus}
                    >
                      <SelectTrigger className="w-[130px] h-8 glass-input text-xs">
                        <SelectValue>
                          <Badge className={`${GLASS_STATUS_COLORS[selectedTicket.status] || ''} text-xs`}>
                            {getStatusLabel(selectedTicket.status)}
                          </Badge>
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent className="glass-strong border-emerald-500/20">
                        {TICKET_STATUS_LIST.map((s) => (
                          <SelectItem key={s} value={s}>
                            <span className="flex items-center gap-2">
                              <span className={`h-2 w-2 rounded-full ${
                                s === 'open' ? 'bg-emerald-400' :
                                s === 'pending' ? 'bg-amber-400' :
                                s === 'solved' ? 'bg-emerald-400' :
                                'bg-slate-400'
                              }`} />
                              {getStatusLabel(s)}
                            </span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground mt-1">
                  <div className="flex items-center gap-1.5">
                    <Avatar className="h-5 w-5 ring-1 ring-emerald-500/20">
                      <AvatarFallback className="bg-emerald-500/20 text-emerald-400 text-[8px]">
                        {selectedTicket.user?.name?.charAt(0)?.toUpperCase() || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <span>{selectedTicket.user?.name || 'Unknown'}</span>
                    <span className="text-xs">({selectedTicket.user?.email || ''})</span>
                  </div>
                  <span>·</span>
                  <span>{CATEGORY_ICONS[selectedTicket.category]} {CATEGORY_LABELS[selectedTicket.category] || selectedTicket.category}</span>
                  <span>·</span>
                  <span>{formatDate(selectedTicket.createdAt)}</span>
                </div>
              </DialogHeader>

              {/* Ticket Description */}
              <div className="px-6 pt-4">
                <div className="glass-light rounded-lg p-3">
                  <p className="text-xs text-muted-foreground mb-1">Description</p>
                  <p className="text-sm text-foreground/90 leading-relaxed">{selectedTicket.description}</p>
                  {selectedTicket.screenshot && (
                    <a
                      href={selectedTicket.screenshot}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-emerald-400 hover:underline mt-2 inline-block"
                    >
                      📎 View Attachment
                    </a>
                  )}
                </div>
              </div>

              <Separator className="bg-emerald-500/10 mx-6" />

              {/* Message Thread */}
              <div className="flex-1 min-h-0 px-6">
                <h4 className="text-sm font-semibold text-glow-cyan mb-3 flex items-center gap-1.5">
                  <MessageSquare className="h-4 w-4 text-emerald-400" />
                  Messages ({messages.length})
                </h4>
                <ScrollArea className="max-h-[280px] pr-2">
                  <div className="space-y-4 pb-2">
                    {messages.length > 0 ? (
                      messages.map((msg: TicketMessage, idx: number) => (
                        <motion.div
                          key={msg.id || idx}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: idx * 0.03 }}
                          className={`flex gap-3 ${msg.isAdmin ? 'flex-row' : 'flex-row-reverse'}`}
                        >
                          <Avatar className="h-8 w-8 flex-shrink-0 ring-1 ring-emerald-500/20">
                            <AvatarFallback
                              className={
                                msg.isAdmin
                                  ? 'bg-emerald-500/20 text-emerald-400'
                                  : 'bg-emerald-500/15 text-emerald-400'
                              }
                            >
                              {msg.isAdmin ? (
                                <Headphones className="h-4 w-4" />
                              ) : (
                                <User className="h-4 w-4" />
                              )}
                            </AvatarFallback>
                          </Avatar>
                          <div className={`max-w-[80%] ${msg.isAdmin ? '' : 'text-right'}`}>
                            <div className="flex items-center gap-2 mb-1">
                              {msg.isAdmin && (
                                <span className="text-xs font-medium text-emerald-400">
                                  Support Team
                                </span>
                              )}
                              <span className="text-[10px] text-muted-foreground">
                                {msg.timestamp ? formatMessageTime(msg.timestamp) : ''}
                              </span>
                              {!msg.isAdmin && (
                                <span className="text-xs font-medium text-emerald-400">
                                  {selectedTicket.user?.name || 'Customer'}
                                </span>
                              )}
                            </div>
                            <div
                              className={`inline-block rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                                msg.isAdmin
                                  ? 'bg-emerald-500/15 text-foreground border border-emerald-500/20 rounded-tl-sm'
                                  : 'bg-emerald-500/10 text-foreground border border-emerald-500/15 rounded-tr-sm'
                              }`}
                            >
                              {msg.message}
                            </div>
                          </div>
                        </motion.div>
                      ))
                    ) : (
                      <p className="text-center text-muted-foreground py-8 text-sm">
                        No messages yet. Reply to start the conversation.
                      </p>
                    )}
                  </div>
                </ScrollArea>
              </div>

              {/* Reply Form */}
              <div className="p-6 pt-4 border-t border-emerald-500/10">
                <div className="flex gap-3">
                  <Textarea
                    placeholder="Type your reply..."
                    value={reply}
                    onChange={(e) => setReply(e.target.value)}
                    rows={3}
                    className="flex-1 glass-input min-h-[80px] resize-none"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                        handleReply();
                      }
                    }}
                  />
                  <Button
                    className="self-end bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/30 h-10 w-10 p-0 flex-shrink-0"
                    disabled={!reply.trim() || submitting}
                    onClick={handleReply}
                  >
                    {submitting ? (
                      <RefreshCw className="h-4 w-4 animate-spin" />
                    ) : (
                      <Send className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                <p className="text-[10px] text-muted-foreground mt-2">
                  Press Ctrl+Enter to send
                </p>
              </div>
            </>
          ) : (
            <div className="p-6 text-center text-muted-foreground">
              <p>Ticket not found</p>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Status Change Confirmation Dialog */}
      <Dialog open={!!confirmStatus} onOpenChange={() => setConfirmStatus(null)}>
        <DialogContent className="glass-strong border-emerald-500/20 sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle className="text-gradient-cyan">Change Ticket Status</DialogTitle>
            <p className="text-sm text-muted-foreground mt-2">
              Are you sure you want to change this ticket&apos;s status to{' '}
              <Badge className={`${GLASS_STATUS_COLORS[confirmStatus?.newStatus || ''] || ''} text-xs ml-1`}>
                {getStatusLabel(confirmStatus?.newStatus || '')}
              </Badge>
              ?
            </p>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button
              variant="ghost"
              className="text-muted-foreground"
              onClick={() => setConfirmStatus(null)}
            >
              Cancel
            </Button>
            <Button
              className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/30"
              onClick={() =>
                confirmStatus &&
                handleStatusChange(confirmStatus.ticketId, confirmStatus.newStatus)
              }
              disabled={updatingStatus}
            >
              {updatingStatus ? (
                <RefreshCw className="h-4 w-4 animate-spin mr-1" />
              ) : null}
              Confirm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
