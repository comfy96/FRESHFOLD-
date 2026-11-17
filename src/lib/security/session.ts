import crypto from 'crypto';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';

export const SESSION_COOKIE_NAME = 'freshfold_session';
export const SESSION_DURATION_DAYS = 7;
export const SESSION_DURATION_MS = SESSION_DURATION_DAYS * 24 * 60 * 60 * 1000;

export interface SessionWithCustomer {
  sessionId: number;
  customerId: number;
  fullName: string;
  email: string;
  phone: string;
  docketNumber: number;
  role: string;
  emailVerified: boolean;
  deletedAt: Date | null;
  expiresAt: Date;
}

/** Hash a raw session token with SHA-256 for secure database lookup. */
export function hashSessionToken(rawToken: string): string {
  return crypto.createHash('sha256').update(rawToken.trim()).digest('hex');
}

/** Generate a 256-bit cryptographically secure random session token. */
export function generateSessionToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

/** Create a new session in the database and return the raw unhashed token for the cookie. */
export async function createSession(customerId: number): Promise<{
  rawToken: string;
  tokenHash: string;
  expiresAt: Date;
}> {
  const rawToken = generateSessionToken();
  const tokenHash = hashSessionToken(rawToken);
  const expiresAt = new Date(Date.now() + SESSION_DURATION_MS);

  await prisma.session.create({
    data: {
      customerId,
      tokenHash,
      expiresAt,
    },
  });

  return { rawToken, tokenHash, expiresAt };
}

/** Validate a raw session token against the database. Returns null if invalid or expired. */
export async function validateSession(rawToken: string): Promise<SessionWithCustomer | null> {
  if (!rawToken || typeof rawToken !== 'string') return null;

  const tokenHash = hashSessionToken(rawToken);
  const session = await prisma.session.findUnique({
    where: { tokenHash },
    include: {
      customer: {
        select: {
          id: true,
          fullName: true,
          email: true,
          phone: true,
          docketNumber: true,
          role: true,
          emailVerified: true,
          deletedAt: true,
        },
      },
    },
  });

  if (!session) return null;

  // Check if expired or revoked
  if (session.expiresAt.getTime() < Date.now() || session.revokedAt !== null) {
    return null;
  }

  // Check if account is deleted or locked
  if (session.customer.deletedAt !== null) {
    return null;
  }

  return {
    sessionId: session.id,
    customerId: session.customer.id,
    fullName: session.customer.fullName,
    email: session.customer.email,
    phone: session.customer.phone,
    docketNumber: session.customer.docketNumber,
    role: session.customer.role,
    emailVerified: session.customer.emailVerified,
    deletedAt: session.customer.deletedAt,
    expiresAt: session.expiresAt,
  };
}

/** Invalidate a specific session by token on logout. */
export async function revokeSession(rawToken: string): Promise<boolean> {
  if (!rawToken) return false;
  const tokenHash = hashSessionToken(rawToken);
  try {
    const deleted = await prisma.session.deleteMany({
      where: { tokenHash },
    });
    return deleted.count > 0;
  } catch {
    return false;
  }
}

/** Invalidate all sessions for a customer (used on password reset or account deletion). */
export async function revokeAllCustomerSessions(customerId: number): Promise<number> {
  const result = await prisma.session.deleteMany({
    where: { customerId },
  });
  return result.count;
}

/** Standard secure cookie options for session token. */
export function getSessionCookieOptions(expiresAt: Date) {
  return {
    name: SESSION_COOKIE_NAME,
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    path: '/',
    expires: expiresAt,
  };
}

