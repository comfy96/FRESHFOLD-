import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';
import { validateSession, revokeAllCustomerSessions, SESSION_COOKIE_NAME } from '@/lib/security/session';

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME);

    if (!sessionCookie?.value) {
      return NextResponse.json(
        { error: 'Authentication required to initiate account deletion.' },
        { status: 401 }
      );
    }

    const session = await validateSession(sessionCookie.value);
    if (!session) {
      return NextResponse.json(
        { error: 'Session expired or invalid.' },
        { status: 401 }
      );
    }

    const now = new Date();

    // Stage 1: Soft Delete & Account Lock
    await prisma.customer.update({
      where: { id: session.customerId },
      data: {
        deletedAt: now,
      },
    });

    // Revoke all active sessions across all devices immediately
    const revokedCount = await revokeAllCustomerSessions(session.customerId);

    // Build response clearing the cookie
    const response = NextResponse.json(
      {
        ok: true,
        message:
          'Your account has been locked and queued for lawful deletion under NDPA Section 34. All active sessions have been revoked.',
        customerId: session.customerId,
        deletedAt: now.toISOString(),
        sessionsRevoked: revokedCount,
        gracePeriodDays: 7,
      },
      { status: 200 }
    );

    response.cookies.set({
      name: SESSION_COOKIE_NAME,
      value: '',
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 0,
      expires: new Date(0),
    });

    return response;
  } catch {
    return NextResponse.json(
      { error: 'Unable to process account deletion request.' },
      { status: 500 }
    );
  }
}
