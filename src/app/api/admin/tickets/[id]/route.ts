import { db } from '@/lib/db';
import { requireAdmin } from '@/lib/auth';
import { serializeData } from '@/lib/utils';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { user: adminUser, error: authError } = await requireAdmin(request);
  if (authError) return authError;

  try {
    const { id } = await params;
    const ticket = await db.ticket.findUnique({
      where: { id },
      include: {
        user: { select: { id: true, name: true, email: true, avatar: true } },
        messages: { orderBy: { createdAt: 'asc' } },
      },
    });

    if (!ticket) return NextResponse.json({ error: 'Ticket not found' }, { status: 404 });

    const parsedTicket = {
      ...ticket,
      messages: ticket.messages.map((msg) => ({
        id: msg.id,
        sender: msg.sender,
        message: msg.message,
        timestamp: msg.createdAt.toISOString(),
        isAdmin: msg.sender === 'admin' || msg.sender === 'support',
      })),
    };

    return NextResponse.json({ ticket: serializeData(parsedTicket) });
  } catch (error) {
    console.error('Admin ticket detail error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { user: adminUser, error: authError } = await requireAdmin(request);
  if (authError) return authError;

  try {
    const { id } = await params;
    const body = await request.json();
    const { message, status } = body;

    const ticket = await db.ticket.findUnique({ where: { id } });
    if (!ticket) return NextResponse.json({ error: 'Ticket not found' }, { status: 404 });

    // Add admin reply
    if (message) {
      await db.ticketMessage.create({
        data: { ticketId: id, sender: 'admin', message },
      });
    }

    // Update status
    if (status) {
      const validStatuses = ['open', 'pending', 'solved', 'closed'];
      if (!validStatuses.includes(status)) {
        return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
      }
      await db.ticket.update({ where: { id }, data: { status } });
    }

    // Re-fetch
    const updatedTicket = await db.ticket.findUnique({
      where: { id },
      include: {
        user: { select: { id: true, name: true, email: true } },
        messages: { orderBy: { createdAt: 'asc' } },
      },
    });

    const parsedTicket = {
      ...updatedTicket,
      messages: updatedTicket?.messages.map((msg) => ({
        id: msg.id,
        sender: msg.sender,
        message: msg.message,
        timestamp: msg.createdAt.toISOString(),
        isAdmin: msg.sender === 'admin' || msg.sender === 'support',
      })) || [],
    };

    return NextResponse.json({ ticket: serializeData(parsedTicket) });
  } catch (error) {
    console.error('Admin ticket update error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
