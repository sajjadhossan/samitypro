import { SignJWT, jwtVerify } from 'jose';
import bcrypt from 'bcryptjs';
import { cookies } from 'next/headers';
import { executeNeonQuery, isNeonConfigured } from './neon';
import { UserRole } from '@/types';

const JWT_SECRET = process.env.JWT_SECRET || 'samitypro_jwt_fallback_secret_production_ready_2026';
const encodedSecret = new TextEncoder().encode(JWT_SECRET);
export const AUTH_COOKIE_NAME = 'samity_token';

export interface AuthUserPayload {
  userId: string;
  tenantId: string | null;
  name: string;
  phone: string;
  email: string | null;
  role: UserRole;
  status: string;
}

/**
 * Hash a plain password using bcrypt
 */
export async function hashPassword(plainPassword: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(plainPassword, salt);
}

/**
 * Compare plain password with bcrypt hash
 */
export async function comparePassword(plainPassword: string, hash: string): Promise<boolean> {
  return bcrypt.compare(plainPassword, hash);
}

/**
 * Create a signed JWT token valid for 7 days
 */
export async function createAuthToken(user: AuthUserPayload): Promise<string> {
  return new SignJWT({
    userId: user.userId,
    tenantId: user.tenantId,
    name: user.name,
    phone: user.phone,
    email: user.email,
    role: user.role,
    status: user.status,
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(encodedSecret);
}

/**
 * Verify and decode a JWT token
 */
export async function verifyAuthToken(token: string): Promise<AuthUserPayload | null> {
  try {
    const { payload } = await jwtVerify(token, encodedSecret);
    return {
      userId: payload.userId as string,
      tenantId: (payload.tenantId as string) || null,
      name: payload.name as string,
      phone: payload.phone as string,
      email: (payload.email as string) || null,
      role: payload.role as UserRole,
      status: (payload.status as string) || 'ACTIVE',
    };
  } catch {
    return null;
  }
}

/**
 * Set the authentication cookie on the response
 */
export async function setAuthCookie(token: string): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(AUTH_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 7, // 7 days
  });
}

/**
 * Remove the authentication cookie
 */
export async function clearAuthCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(AUTH_COOKIE_NAME, '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
  });
}

/**
 * Retrieve current user session from cookies
 */
export async function getSessionUser(): Promise<AuthUserPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;
  if (!token) return null;
  return verifyAuthToken(token);
}

/**
 * Helper to normalize phone numbers (e.g. "+8801711..." -> "01711...")
 */
export function normalizePhone(rawPhone: string): string {
  let p = rawPhone.replace(/\s+/g, '').replace(/-/g, '');
  if (p.startsWith('+88')) {
    p = p.substring(3);
  } else if (p.startsWith('88')) {
    p = p.substring(2);
  }
  return p;
}
