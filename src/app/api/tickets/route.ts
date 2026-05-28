import { db } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const status = searchParams.get('status');

    if (!userId) {
      return NextResponse.json(
        { error: 'userId is required' },
        { status: 400 }
      );
    }

    const where: Record<string, unknown> = { userId };
    if (status) {
      where.status = status;
    }

    const tickets = await db.ticket.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ tickets });
  } catch (error) {
    console.error('Tickets list error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, subject, category, description, screenshot } = body;

    if (!userId || !subject || !category || !description) {
      return NextResponse.json(
        { error: 'userId, subject, category, and description are required' },
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
        messages: JSON.stringify([]),
      },
    });

    return NextResponse.json({ ticket }, { status: 201 });
  } catch (error) {
    console.error('Ticket creation error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
