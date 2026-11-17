import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { revokeSession, SESSION_COOKIE_NAME } from '@/lib/security/session';

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME);
    const rawToken = sessionCookie?.value;

    let revoked = false;
    if (rawToken) {
      revoked = await revokeSession(rawToken);
    }

    const response = NextResponse.json(
      {
        ok: true,
        message: 'Our records show you have been logged out safely.',
        serverRevoked: revoked,
      },
      { status: 200 }
    );

    // Clear the session cookie from the browser
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
      {
        error: 'Unable to revoke session on server. Please check your connection.',
        ok: false,
      },
      { status: 500 }
    );
  }
}
