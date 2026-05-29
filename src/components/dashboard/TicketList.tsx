'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useStore } from '@/lib/store';
import type { Ticket } from '@/lib/types';
import { TICKET_CATEGORIES } from '@/lib/constants';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Plus, Ticket as TicketIcon, Eye, RefreshCw } from 'lucide-react';

const GLASS_STATUS_COLORS: Record<string, string> = {
  open: 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30',
  pending: 'bg-amber-500/20 text-amber-400 border border-amber-500/30',
  solved: 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30',
  closed: 'bg-slate-500/20 text-slate-400 border border-slate-500/30',
};

export function TicketList() {
  const { navigate } = useStore();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [createOpen, setCreateOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    subject: '',
    category: '',
    description: '',
    screenshotUrl: '',
  });

  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/tickets');
      if (res.ok) {
        const data = await res.json();
        setTickets(data.tickets || []);
      }
    } catch {
      // handle error
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTicket = async () => {
    if (!form.subject || !form.category || !form.description) return;
    setSubmitting(true);
    try {
      const res = await fetch('/api/tickets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        setCreateOpen(false);
        setForm({ subject: '', category: '', description: '', screenshotUrl: '' });
        fetchTickets();
      }
    } catch {
      // handle error
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });

  const getStatusLabel = (status: string) => status.charAt(0).toUpperCase() + status.slice(1);

  const getCategoryLabel = (value: string) => {
    const cat = TICKET_CATEGORIES.find((c) => c.value === value);
    return cat ? cat.label : value;
  };

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
        className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
      >
        <div>
          <h2 className="text-2xl font-bold text-gradient-cyan">Support Tickets</h2>
          <p className="text-muted-foreground">Get help with your orders and account</p>
        </div>
        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogTrigger asChild>
            <button className="flex items-center gap-2 rounded-xl px-4 py-2.5 bg-emerald-500/15 text-emerald-400 font-semibold text-sm border border-emerald-500/30 hover:bg-emerald-500/25 transition-all glow-cyan">
              <Plus className="h-4 w-4" /> Create Ticket
            </button>
          </DialogTrigger>
          <DialogContent className="glass-strong border-emerald-500/20">
            <DialogHeader>
              <DialogTitle className="text-gradient-cyan">Create Support Ticket</DialogTitle>
              <DialogDescription className="text-muted-foreground">Describe your issue and we&apos;ll get back to you</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="ticket-subject" className="text-foreground">Subject</Label>
                <Input
                  id="ticket-subject"
                  placeholder="Brief description of your issue"
                  value={form.subject}
                  onChange={(e) => setForm({ ...form, subject: e.target.value })}
                  className="glass-input"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="ticket-category" className="text-foreground">Category</Label>
                <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
                  <SelectTrigger id="ticket-category" className="glass-input">
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent className="glass-strong border-emerald-500/20">
                    {TICKET_CATEGORIES.map((cat) => (
                      <SelectItem key={cat.value} value={cat.value}>
                        {cat.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="ticket-desc" className="text-foreground">Description</Label>
                <Textarea
                  id="ticket-desc"
                  placeholder="Describe your issue in detail..."
                  rows={4}
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="glass-input"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="ticket-screenshot" className="text-foreground">Screenshot URL (optional)</Label>
                <Input
                  id="ticket-screenshot"
                  placeholder="https://example.com/screenshot.png"
                  value={form.screenshotUrl}
                  onChange={(e) => setForm({ ...form, screenshotUrl: e.target.value })}
                  className="glass-input"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="ghost" className="text-muted-foreground" onClick={() => setCreateOpen(false)}>Cancel</Button>
              <Button
                className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/30"
                onClick={handleCreateTicket}
                disabled={submitting || !form.subject || !form.category || !form.description}
              >
                {submitting ? <RefreshCw className="h-4 w-4 animate-spin mr-2" /> : null}
                Submit Ticket
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="glass-card rounded-xl overflow-hidden"
      >
        {tickets.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
            <TicketIcon className="h-12 w-12 mb-4 opacity-50" />
            <p className="text-lg font-medium">No support tickets</p>
            <p className="text-sm">Create a ticket if you need help with anything.</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="border-emerald-500/10 hover:bg-transparent">
                <TableHead className="text-muted-foreground">Subject</TableHead>
                <TableHead className="text-muted-foreground">Category</TableHead>
                <TableHead className="text-muted-foreground">Status</TableHead>
                <TableHead className="text-muted-foreground">Date</TableHead>
                <TableHead className="text-right text-muted-foreground">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tickets.map((ticket) => (
                <TableRow
                  key={ticket.id}
                  className="cursor-pointer border-emerald-500/5 hover:bg-emerald-500/5 transition-colors"
                  onClick={() => navigate('ticket-detail', ticket.id)}
                >
                  <TableCell className="font-medium text-foreground">{ticket.subject}</TableCell>
                  <TableCell>
                    <Badge className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs">
                      {getCategoryLabel(ticket.category)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge className={`${GLASS_STATUS_COLORS[ticket.status] || ''} text-xs`}>
                      {getStatusLabel(ticket.status)}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">{formatDate(ticket.createdAt)}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" className="text-emerald-400 hover:bg-emerald-500/10" onClick={(e) => { e.stopPropagation(); navigate('ticket-detail', ticket.id); }}>
                      <Eye className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </motion.div>
    </div>
  );
}
