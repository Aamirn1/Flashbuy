import { db } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { generateToken, setAuthCookie } from '@/lib/auth';

const SALT_ROUNDS = 12;
const WELCOME_BONUS_AMOUNT = 500;

function generateSecureReferralCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Removed I,O,0,1 to avoid confusion
  const array = new Uint8Array(8);
  crypto.randomFillSync(array);
  let code = '';
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(array[i] % chars.length);
  }
  return code;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, password, country, phone, referralCode: usedReferralCode } = body;

    // Validate input
    if (!name || !email || !password) {
      return NextResponse.json(
        { error: 'Name, email, and password are required' },
        { status: 400 }
      );
    }

    // Normalize email
    const normalizedEmail = email.toLowerCase().trim();

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(normalizedEmail)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Validate password strength
    if (password.length < 8) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters long' },
        { status: 400 }
      );
    }

    // Check for existing user
    const existingUser = await db.user.findUnique({ where: { email: normalizedEmail } });
    if (existingUser) {
      // Generic message to prevent account enumeration
      return NextResponse.json(
        { error: 'Registration failed. Please try again.' },
        { status: 400 }
      );
    }

    // Hash password with bcrypt
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

    // Generate unique referral code with collision retry
    let referralCode = generateSecureReferralCode();
    let attempts = 0;
    while (attempts < 5) {
      const existing = await db.user.findUnique({ where: { referralCode } });
      if (!existing) break;
      referralCode = generateSecureReferralCode();
      attempts++;
    }

    // Check referral code validity
    let referredBy: string | null = null;
    if (usedReferralCode) {
      const referrer = await db.user.findUnique({ where: { referralCode: usedReferralCode } });
      if (referrer) {
        referredBy = referrer.id;
      }
    }

    // Create user
    const user = await db.user.create({
      data: {
        name: name.trim(),
        email: normalizedEmail,
        password: hashedPassword,
        country: country?.trim() || null,
        phone: phone?.trim() || null,
        referralCode,
        referredBy,
        welcomeBonus: WELCOME_BONUS_AMOUNT,
        welcomeBonusUnlocked: false,
      },
    });

    // Create referral record if applicable
    if (referredBy) {
      await db.referral.create({
        data: {
          referrerId: referredBy,
          referredId: user.id,
          commission: 0,
          status: 'active',
        },
      });
    }

    // Generate JWT token
    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    // Return user without password
    const { password: _, ...userWithoutPassword } = user;

    const response = NextResponse.json({ user: userWithoutPassword }, { status: 201 });
    setAuthCookie(response, token);

    return response;
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
