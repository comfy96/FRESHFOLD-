import { NextResponse } from 'next/server';
import { resetRequestSchema } from '@/lib/validation/auth';
import { checkRateLimit, getClientIp } from '@/lib/security/rate-limit';

export async function POST(request: Request) {
  const clientIp = getClientIp(request.headers);
  const rl = checkRateLimit('reset', clientIp);
  if (!rl.allowed) {
    return NextResponse.json(
      {
        error:
          'Our records show too many password reset requests from this connection. Please wait before trying again.',
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

  const parsed = resetRequestSchema.safeParse(rawBody);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? 'Enter a valid email address.' },
      { status: 400 }
    );
  }

  return NextResponse.json(
    {
      ok: true,
      message:
        'If an account exists for that email address, our records show a reset notice has been queued.',
    },
    {
      status: 200,
      headers: {
        'X-RateLimit-Limit': String(rl.limit),
        'X-RateLimit-Remaining': String(rl.remaining),
      },
    }
  );
}
