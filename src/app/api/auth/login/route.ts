import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { loginSchema } from '@/lib/validation/auth';
import { checkRateLimit, getClientIp } from '@/lib/security/rate-limit';
import { verifySecret, DUMMY_ARGON2_HASH } from '@/lib/security/password';
import { createSession, getSessionCookieOptions } from '@/lib/security/session';

export async function POST(request: Request) {
  const clientIp = getClientIp(request.headers);
  const rl = checkRateLimit('login', clientIp);
  if (!rl.allowed) {
    return NextResponse.json(
      {
        error:
          'Our records show too many sign-in attempts from this connection. Wait a few minutes before trying again.',
      },
      {
        status: 429,
        headers: {
          'Retry-After': String(rl.retryAfterSeconds),
          'X-RateLimit-Limit': String(rl.limit),
          'X-RateLimit-Remaining': '0',
        },
      }
    );
  }

  let rawBody: unknown;
  try {
    rawBody = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON request body.' }, { status: 400 });
  }

  const parsed = loginSchema.safeParse(rawBody);
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = String(issue.path[0] ?? 'form');
      if (!fieldErrors[key]) fieldErrors[key] = issue.message;
    }
    return NextResponse.json(
      { error: 'Validation failed at server boundary.', fieldErrors },
      { status: 400 }
    );
  }

  const data = parsed.data;

  try {
    const customer = await prisma.customer.findUnique({
      where: { email: data.email },
      select: {
        id: true,
        fullName: true,
        email: true,
        passwordHash: true,
        role: true,
        emailVerified: true,
        deletedAt: true,
      },
    });

    // Enforce constant-time timing: always execute Argon2id verify even if email does not exist
    const hashToVerify = customer ? customer.passwordHash : DUMMY_ARGON2_HASH;
    const passwordMatches = await verifySecret(hashToVerify, data.password);

    if (!customer || !passwordMatches || customer.deletedAt) {
      return NextResponse.json(
        { error: 'Incorrect email or password.' },
        {
          status: 401,
          headers: {
            'X-RateLimit-Limit': String(rl.limit),
            'X-RateLimit-Remaining': String(rl.remaining),
          },
        }
      );
    }

    // Create cryptographically secure session (256-bit entropy, stored as SHA-256 hash)
    const session = await createSession(customer.id);
    const cookieOpts = getSessionCookieOptions(session.expiresAt);

    const response = NextResponse.json(
      {
        ok: true,
        accountId: customer.id,
        fullName: customer.fullName,
        email: customer.email,
        role: customer.role,
        emailVerified: customer.emailVerified,
      },
      {
        status: 200,
        headers: {
          'X-RateLimit-Limit': String(rl.limit),
          'X-RateLimit-Remaining': String(rl.remaining),
        },
      }
    );

    response.cookies.set({
      name: cookieOpts.name,
      value: session.rawToken,
      httpOnly: cookieOpts.httpOnly,
      secure: cookieOpts.secure,
      sameSite: cookieOpts.sameSite,
      path: cookieOpts.path,
      expires: cookieOpts.expires,
    });

    return response;
  } catch {
    return NextResponse.json(
      { error: 'Unable to check credentials right now.' },
      { status: 500 }
    );
  }
}
