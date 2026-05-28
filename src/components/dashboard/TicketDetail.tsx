'use client';

import { useState, useEffect } from 'react';
import { useStore } from '@/lib/store';
import type { Ticket, TicketMessage } from '@/lib/types';
import { TICKET_STATUS_COLORS } from '@/lib/constants';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ArrowLeft, Send, XCircle, RefreshCw, User, Headphones } from 'lucide-react';

export function TicketDetail() {
  const { selectedTicketId, goBack } = useStore();
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [loading, setLoading] = useState(true);
  const [reply, setReply] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (selectedTicketId) {
      fetchTicket(selectedTicketId);
    }
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
      if (res.ok) {
        fetchTicket(ticket.id);
      }
    } catch {
      // handle error
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusLabel = (status: string) => {
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

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
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-48 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  if (!ticket) {
    return (
      <div className="text-center py-16">
        <p className="text-muted-foreground">Ticket not found</p>
        <Button variant="outline" className="mt-4" onClick={goBack}>
          Go Back
        </Button>
      </div>
    );
  }

  const isOpen = ticket.status === 'open' || ticket.status === 'pending';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={goBack}>
          <ArrowLeft className="h-4 w-4 mr-1" /> Back
        </Button>
        <div className="flex-1">
          <h2 className="text-2xl font-bold">{ticket.subject}</h2>
          <p className="text-muted-foreground text-sm">{getCategoryLabel(ticket.category)} · {formatDate(ticket.createdAt)}</p>
        </div>
        <Badge variant="secondary" className={`${TICKET_STATUS_COLORS[ticket.status] || ''} px-3 py-1`}>
          {getStatusLabel(ticket.status)}
        </Badge>
      </div>

      {/* Ticket Info */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-wrap gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">Priority: </span>
              <Badge variant="outline" className={
                ticket.priority === 'high' ? 'border-red-300 text-red-700' :
                ticket.priority === 'medium' ? 'border-yellow-300 text-yellow-700' :
                'border-green-300 text-green-700'
              }>
                {ticket.priority?.charAt(0).toUpperCase() + ticket.priority?.slice(1) || 'Normal'}
              </Badge>
            </div>
            <div>
              <span className="text-muted-foreground">Category: </span>
              <span className="font-medium">{getCategoryLabel(ticket.category)}</span>
            </div>
          </div>
          <Separator className="my-4" />
          <p className="text-sm leading-relaxed">{ticket.description}</p>
        </CardContent>
      </Card>

      {/* Message Thread */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg">Messages</CardTitle>
          {isOpen && (
            <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700" onClick={handleCloseTicket}>
              <XCircle className="h-4 w-4 mr-1" /> Close Ticket
            </Button>
          )}
        </CardHeader>
        <CardContent className="space-y-4 max-h-96 overflow-y-auto">
          {ticket.messages && ticket.messages.length > 0 ? (
            ticket.messages.map((msg: TicketMessage) => (
              <div
                key={msg.id}
                className={`flex gap-3 ${msg.isAdmin ? 'flex-row' : 'flex-row-reverse'}`}
              >
                <Avatar className="h-8 w-8 flex-shrink-0">
                  <AvatarFallback className={msg.isAdmin ? 'bg-primary text-primary-foreground' : 'bg-muted'}>
                    {msg.isAdmin ? <Headphones className="h-4 w-4" /> : <User className="h-4 w-4" />}
                  </AvatarFallback>
                </Avatar>
                <div className={`max-w-[80%] ${msg.isAdmin ? '' : 'text-right'}`}>
                  <div className="flex items-center gap-2 mb-1">
                    {msg.isAdmin && <span className="text-xs font-medium">Support Team</span>}
                    <span className="text-xs text-muted-foreground">{formatDate(msg.timestamp)}</span>
                    {!msg.isAdmin && <span className="text-xs font-medium">You</span>}
                  </div>
                  <div className={`inline-block rounded-lg px-4 py-2.5 text-sm ${
                    msg.isAdmin
                      ? 'bg-muted text-foreground'
                      : 'bg-primary text-primary-foreground'
                  }`}>
                    {msg.message}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <p className="text-center text-muted-foreground py-8">No messages yet. Reply to start the conversation.</p>
          )}
        </CardContent>
      </Card>

      {/* Reply Form */}
      {isOpen && (
        <Card>
          <CardContent className="p-4">
            <div className="flex gap-3">
              <Textarea
                placeholder="Type your reply..."
                value={reply}
                onChange={(e) => setReply(e.target.value)}
                rows={3}
                className="flex-1"
              />
              <Button
                className="self-end"
                disabled={!reply.trim() || submitting}
                onClick={handleReply}
              >
                {submitting ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
