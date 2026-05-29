import { db } from '@/lib/db';
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
      },
    });

    if (!ticket) {
      return NextResponse.json(
        { error: 'Ticket not found' },
        { status: 404 }
      );
    }

    const parsedTicket = {
      ...ticket,
      messages: JSON.parse(ticket.messages || '[]'),
    };

    return NextResponse.json({ ticket: parsedTicket });
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
    const { message, isAdmin, status } = body;

    const ticket = await db.ticket.findUnique({ where: { id } });
    if (!ticket) {
      return NextResponse.json(
        { error: 'Ticket not found' },
        { status: 404 }
      );
    }

    const updateData: Record<string, unknown> = {};

    // Add message to messages array
    if (message) {
      const messages = JSON.parse(ticket.messages || '[]');
      messages.push({
        id: Date.now().toString(),
        sender: isAdmin ? 'admin' : 'user',
        message,
        timestamp: new Date().toISOString(),
        isAdmin: !!isAdmin,
      });
      updateData.messages = JSON.stringify(messages);

      // Auto-update status based on who is replying
      if (isAdmin && ticket.status === 'open') {
        updateData.status = 'pending';
      }
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
      updateData.status = status;
    }

    const updatedTicket = await db.ticket.update({
      where: { id },
      data: updateData,
    });

    const parsedTicket = {
      ...updatedTicket,
      messages: JSON.parse(updatedTicket.messages || '[]'),
    };

    return NextResponse.json({ ticket: parsedTicket });
  } catch (error) {
    console.error('Ticket update error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
