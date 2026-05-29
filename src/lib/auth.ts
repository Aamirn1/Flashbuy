import jwt from 'jsonwebtoken';
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

const JWT_SECRET = process.env.JWT_SECRET || 'flashbuy-jwt-secret-change-in-production-2024';
const JWT_EXPIRES_IN = '7d';

export interface JWTPayload {
  userId: string;
  email: string;
  role: string;
}

/**
 * Generate a JWT token for a user
 */
export function generateToken(payload: JWTPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

/**
 * Verify and decode a JWT token
 */
export function verifyToken(token: string): JWTPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JWTPayload;
  } catch {
    return null;
  }
}

/**
 * Get the auth token from request cookies
 */
export function getTokenFromRequest(request: NextRequest): string | null {
  const token = request.cookies.get('flashbuy-token')?.value;
  return token || null;
}

/**
 * Set the auth token as an httpOnly cookie on the response
 */
export function setAuthCookie(response: NextResponse, token: string): void {
  response.cookies.set('flashbuy-token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 7, // 7 days
  });
}

/**
 * Clear the auth cookie
 */
export function clearAuthCookie(response: NextResponse): void {
  response.cookies.set('flashbuy-token', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
  });
}

/**
 * Get authenticated user from request, returns null if not authenticated
 */
export async function getAuthUser(request: NextRequest) {
  const token = getTokenFromRequest(request);
  if (!token) return null;

  const payload = verifyToken(token);
  if (!payload) return null;

  const user = await db.user.findUnique({
    where: { id: payload.userId, deletedAt: null },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      isBanned: true,
      isVerified: true,
      balance: true,
      welcomeBonus: true,
      welcomeBonusUnlocked: true,
      referralCode: true,
      walletAddress: true,
      phone: true,
      country: true,
      avatar: true,
      referredBy: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  if (!user || user.isBanned) return null;

  return user;
}

/**
 * Require authentication - returns user or error response
 */
export async function requireAuth(request: NextRequest) {
  const user = await getAuthUser(request);
  if (!user) {
    return { user: null, error: NextResponse.json({ error: 'Authentication required' }, { status: 401 }) };
  }
  return { user, error: null };
}

/**
 * Require admin role - returns user or error response
 */
export async function requireAdmin(request: NextRequest) {
  const authResult = await requireAuth(request);
  if (authResult.error) return authResult;

  if (authResult.user!.role !== 'admin') {
    return {
      user: null,
      error: NextResponse.json({ error: 'Admin access required' }, { status: 403 }),
    };
  }

  return authResult;
}
