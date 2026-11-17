import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { validateSession, SESSION_COOKIE_NAME } from '@/lib/security/session';

export async function GET() {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME);

    if (!sessionCookie?.value) {
      return NextResponse.json(
        { error: 'No active session found.' },
        { status: 401 }
      );
    }

    const session = await validateSession(sessionCookie.value);
    if (!session) {
      return NextResponse.json(
        { error: 'Session expired, revoked, or account locked.' },
        { status: 401 }
      );
    }

    return NextResponse.json({
      ok: true,
      user: {
        id: session.customerId,
        fullName: session.fullName,
        email: session.email,
        phone: session.phone,
        docketNumber: session.docketNumber,
        role: session.role,
        emailVerified: session.emailVerified,
      },
      expiresAt: session.expiresAt.toISOString(),
    });
  } catch {
    return NextResponse.json(
      { error: 'Unable to check session right now.' },
      { status: 500 }
    );
  }
}
