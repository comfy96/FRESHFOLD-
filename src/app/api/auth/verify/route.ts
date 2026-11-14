import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyCodeSchema } from '@/lib/validation/auth';
import { checkRateLimit, getClientIp } from '@/lib/security/rate-limit';
import { OTP_MAX_ATTEMPTS, verifyOtpHash } from '@/lib/security/otp';

export async function POST(request: Request) {
  const clientIp = getClientIp(request.headers);
  const rl = checkRateLimit('verify', clientIp);
  if (!rl.allowed) {
    return NextResponse.json(
      { error: 'Too many verification attempts. Wait before trying again.' },
      { status: 429, headers: { 'Retry-After': String(rl.retryAfterSeconds) } }
    );
  }

  let rawBody: unknown;
  try {
    rawBody = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON request body.' }, { status: 400 });
  }

  const parsed = verifyCodeSchema.safeParse(rawBody);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? 'Invalid verification input.' },
      { status: 400 }
    );
  }

  const data = parsed.data;

  try {
    const customer = await prisma.customer.findUnique({
      where: { email: data.email },
      select: { id: true, emailVerified: true },
    });
    if (!customer) {
      return NextResponse.json(
        { error: 'Verification code could not be matched.' },
        { status: 400 }
      );
    }

    const latest = await prisma.verificationCode.findFirst({
      where: { customerId: customer.id, purpose: 'email_verify' },
      orderBy: { id: 'desc' },
    });

    if (!latest) {
      return NextResponse.json(
        { error: 'No active verification code was found for this email.' },
        { status: 400 }
      );
    }

    if (latest.usedAt !== null) {
      return NextResponse.json(
        { error: 'This verification code has already been used.' },
        { status: 400 }
      );
    }

    if (latest.expiresAt.getTime() < Date.now()) {
      return NextResponse.json(
        { error: 'This verification code has expired. Request a new code.' },
        { status: 400 }
      );
    }

    if (latest.attempts >= OTP_MAX_ATTEMPTS) {
      return NextResponse.json(
        { error: 'Too many incorrect code attempts. Request a new verification code.' },
        { status: 429 }
      );
    }

    if (!verifyOtpHash(data.code, latest.codeHash)) {
      await prisma.verificationCode.update({
        where: { id: latest.id },
        data: { attempts: { increment: 1 } },
      });
      return NextResponse.json(
        { error: 'The 6-digit verification code did not match our records.' },
        { status: 400 }
      );
    }

    const now = new Date();
    await prisma.$transaction([
      prisma.verificationCode.update({
        where: { id: latest.id },
        data: { usedAt: now },
      }),
      prisma.customer.update({
        where: { id: customer.id },
        data: { emailVerified: true, verifiedAt: now },
      }),
    ]);

    return NextResponse.json({
      ok: true,
      emailVerified: true,
      message: 'Our records show your email address is now verified.',
    });
  } catch {
    return NextResponse.json(
      { error: 'Unable to verify code right now.' },
      { status: 500 }
    );
  }
}
