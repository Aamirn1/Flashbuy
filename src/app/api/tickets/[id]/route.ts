import { db } from '@/lib/db';
import { serializeData } from '@/lib/utils';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const ticket = await db.ticket.findUnique({
      where: { id },
      include: {
        user: {
          select: { id: true, name: true, email: true, avatar: true },
        },
        messages: {
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    if (!ticket) {
      return NextResponse.json(
        { error: 'Ticket not found' },
        { status: 404 }
      );
    }

    // Transform messages to match frontend TicketMessage type
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
    console.error('Ticket detail error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { message, sender, status } = body;

    const ticket = await db.ticket.findUnique({ where: { id } });
    if (!ticket) {
      return NextResponse.json(
        { error: 'Ticket not found' },
        { status: 404 }
      );
    }

    // Add message if provided
    if (message) {
      await db.ticketMessage.create({
        data: {
          ticketId: id,
          sender: sender || 'customer',
          message,
        },
      });
    }

    // Update status if provided
    if (status) {
      const validStatuses = ['open', 'pending', 'solved', 'closed'];
      if (!validStatuses.includes(status)) {
        return NextResponse.json(
          { error: 'Invalid status' },
          { status: 400 }
        );
      }
      await db.ticket.update({
        where: { id },
        data: { status },
      });
    }

    // Re-fetch with messages
    const updatedTicket = await db.ticket.findUnique({
      where: { id },
      include: {
        messages: {
          orderBy: { createdAt: 'asc' },
        },
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
    console.error('Ticket update error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
