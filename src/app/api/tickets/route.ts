import { db } from '@/lib/db';
import { requireAuth } from '@/lib/auth';
import { serializeData } from '@/lib/utils';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const { user: authUser, error: authError } = await requireAuth(request);
  if (authError) return authError;

  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const userId = authUser.id;

    const where: Record<string, unknown> = { userId };
    if (status) {
      where.status = status;
    }

    const tickets = await db.ticket.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ tickets: serializeData(tickets) });
  } catch (error) {
    console.error('Tickets list error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const { user: authUser, error: authError } = await requireAuth(request);
  if (authError) return authError;

  try {
    const body = await request.json();
    const { subject, category, description, screenshot } = body;
    const userId = authUser.id;

    if (!subject || !category || !description) {
      return NextResponse.json(
        { error: 'subject, category, and description are required' },
        { status: 400 }
      );
    }

    const ticket = await db.ticket.create({
      data: {
        userId,
        subject,
        category,
        description,
        screenshot: screenshot || null,
        status: 'open',
        priority: 'medium',
      },
    });

    return NextResponse.json({ ticket: serializeData(ticket) }, { status: 201 });
  } catch (error) {
    console.error('Ticket creation error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
