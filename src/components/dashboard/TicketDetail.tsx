'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useStore } from '@/lib/store';
import type { Ticket, TicketMessage } from '@/lib/types';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ArrowLeft, Send, XCircle, RefreshCw, User, Headphones } from 'lucide-react';

const GLASS_STATUS_COLORS: Record<string, string> = {
  open: 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30',
  pending: 'bg-amber-500/20 text-amber-400 border border-amber-500/30',
  solved: 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30',
  closed: 'bg-slate-500/20 text-slate-400 border border-slate-500/30',
};

export function TicketDetail() {
  const { selectedTicketId, goBack } = useStore();
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [loading, setLoading] = useState(true);
  const [reply, setReply] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (selectedTicketId) fetchTicket(selectedTicketId);
  }, [selectedTicketId]);

  const fetchTicket = async (id: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/tickets/${id}`);
      if (res.ok) {
        const data = await res.json();
        setTicket(data.ticket || data);
      }
    } catch {
      // handle error
    } finally {
      setLoading(false);
    }
  };

  const handleReply = async () => {
    if (!reply.trim() || !ticket) return;
    setSubmitting(true);
    try {
      const res = await fetch(`/api/tickets/${ticket.id}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: reply }),
      });
      if (res.ok) {
        setReply('');
        fetchTicket(ticket.id);
      }
    } catch {
      // handle error
    } finally {
      setSubmitting(false);
    }
  };

  const handleCloseTicket = async () => {
    if (!ticket) return;
    try {
      const res = await fetch(`/api/tickets/${ticket.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'closed' }),
      });
      if (res.ok) fetchTicket(ticket.id);
    } catch {
      // handle error
    }
  };

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
    });

  const getStatusLabel = (status: string) => status.charAt(0).toUpperCase() + status.slice(1);

  const getCategoryLabel = (value: string) => {
    const categories: Record<string, string> = {
      payment: 'Payment Issue',
      delivery: 'Delivery Problem',
      account: 'Account Issue',
      other: 'Other',
    };
    return categories[value] || value;
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-32 bg-white/5" />
        <Skeleton className="h-48 w-full bg-white/5" />
        <Skeleton className="h-32 w-full bg-white/5" />
      </div>
    );
  }

  if (!ticket) {
    return (
      <div className="text-center py-16">
        <p className="text-muted-foreground">Ticket not found</p>
        <Button variant="outline" className="mt-4 glass-light border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/10" onClick={goBack}>
          Go Back
        </Button>
      </div>
    );
  }

  const isOpen = ticket.status === 'open' || ticket.status === 'pending';

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-4"
      >
        <Button variant="ghost" size="sm" className="text-emerald-400 hover:bg-emerald-500/10" onClick={goBack}>
          <ArrowLeft className="h-4 w-4 mr-1" /> Back
        </Button>
        <div className="flex-1">
          <h2 className="text-2xl font-bold text-gradient-cyan">{ticket.subject}</h2>
          <p className="text-muted-foreground text-sm">{getCategoryLabel(ticket.category)} · {formatDate(ticket.createdAt)}</p>
        </div>
        <Badge className={`${GLASS_STATUS_COLORS[ticket.status] || ''} px-3 py-1`}>
          {getStatusLabel(ticket.status)}
        </Badge>
      </motion.div>

      {/* Ticket Info */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="glass-card rounded-xl p-6"
      >
        <div className="flex flex-wrap gap-4 text-sm">
          <div>
            <span className="text-muted-foreground">Priority: </span>
            <Badge className={
              ticket.priority === 'high' ? 'bg-red-500/20 text-red-400 border border-red-500/30' :
              ticket.priority === 'medium' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
              'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
            }>
              {ticket.priority?.charAt(0).toUpperCase() + ticket.priority?.slice(1) || 'Normal'}
            </Badge>
          </div>
          <div>
            <span className="text-muted-foreground">Category: </span>
            <span className="font-medium text-foreground">{getCategoryLabel(ticket.category)}</span>
          </div>
        </div>
        <Separator className="my-4 bg-emerald-500/10" />
        <p className="text-sm leading-relaxed text-foreground/80">{ticket.description}</p>
      </motion.div>

      {/* Message Thread */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="glass-card rounded-xl"
      >
        <div className="flex items-center justify-between p-6 pb-0">
          <h3 className="text-lg font-semibold text-glow-cyan">Messages</h3>
          {isOpen && (
            <Button
              variant="ghost"
              size="sm"
              className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
              onClick={handleCloseTicket}
            >
              <XCircle className="h-4 w-4 mr-1" /> Close Ticket
            </Button>
          )}
        </div>
        <div className="p-4 space-y-4 max-h-96 overflow-y-auto">
          {ticket.messages && ticket.messages.length > 0 ? (
            ticket.messages.map((msg: TicketMessage, idx: number) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className={`flex gap-3 ${msg.isAdmin ? 'flex-row' : 'flex-row-reverse'}`}
              >
                <Avatar className="h-8 w-8 flex-shrink-0 ring-1 ring-emerald-500/20">
                  <AvatarFallback className={msg.isAdmin ? 'bg-emerald-500/20 text-emerald-400' : 'bg-violet-500/20 text-violet-400'}>
                    {msg.isAdmin ? <Headphones className="h-4 w-4" /> : <User className="h-4 w-4" />}
                  </AvatarFallback>
                </Avatar>
                <div className={`max-w-[80%] ${msg.isAdmin ? '' : 'text-right'}`}>
                  <div className="flex items-center gap-2 mb-1">
                    {msg.isAdmin && <span className="text-xs font-medium text-emerald-400">Support Team</span>}
                    <span className="text-xs text-muted-foreground">{formatDate(msg.timestamp)}</span>
                    {!msg.isAdmin && <span className="text-xs font-medium text-violet-400">You</span>}
                  </div>
                  <div className={`inline-block rounded-2xl px-4 py-2.5 text-sm ${
                    msg.isAdmin
                      ? 'glass-light text-foreground rounded-tl-sm'
                      : 'bg-emerald-500/15 text-foreground border border-emerald-500/20 rounded-tr-sm'
                  }`}>
                    {msg.message}
                  </div>
                </div>
              </motion.div>
            ))
          ) : (
            <p className="text-center text-muted-foreground py-8">No messages yet. Reply to start the conversation.</p>
          )}
        </div>
      </motion.div>

      {/* Reply Form */}
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="glass-card rounded-xl p-4"
        >
          <div className="flex gap-3">
            <Textarea
              placeholder="Type your reply..."
              value={reply}
              onChange={(e) => setReply(e.target.value)}
              rows={3}
              className="flex-1 glass-input min-h-[80px]"
            />
            <Button
              className="self-end bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/30 h-10 w-10 p-0"
              disabled={!reply.trim() || submitting}
              onClick={handleReply}
            >
              {submitting ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            </Button>
          </div>
        </motion.div>
      )}
    </div>
  );
}
