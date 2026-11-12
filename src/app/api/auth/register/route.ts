import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { registerSchema } from '@/lib/validation/auth';
import { checkRateLimit, getClientIp } from '@/lib/security/rate-limit';
import { checkBreachedPassword } from '@/lib/security/breach-check';
import { hashSecret } from '@/lib/security/password';
import { generateSixDigitCode, getOtpExpiryDate, hashOtpCode } from '@/lib/security/otp';
import { enqueueVerificationEmail } from '@/lib/email/mailer';

export async function POST(request: Request) {
  const clientIp = getClientIp(request.headers);
  const rl = checkRateLimit('register', clientIp);
  if (!rl.allowed) {
    return NextResponse.json(
      {
        error:
          'Our records show too many registration attempts from this connection. Please wait before trying again.',
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

  const parsed = registerSchema.safeParse(rawBody);
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = String(issue.path[0] ?? 'form');
      if (!fieldErrors[key]) {
        fieldErrors[key] = issue.message;
      }
    }
    return NextResponse.json(
      {
        error: 'Validation failed at server boundary.',
        fieldErrors,
      },
      { status: 400 }
    );
  }

  // Replace raw untrusted input strictly with parsed, normalised data.
  const data = parsed.data;

  const breach = await checkBreachedPassword(data.password);
  if (breach.breached) {
    return NextResponse.json(
      {
        error:
          'This password appeared in a known public breach corpus. Choose a less common passphrase.',
        fieldErrors: {
          password:
            'This password appeared in a public breach corpus. Pick three unrelated words instead.',
        },
      },
      { status: 400 }
    );
  }

  try {
    const existing = await prisma.customer.findUnique({
      where: { email: data.email },
      select: { id: true },
    });
    if (existing) {
      return NextResponse.json(
        {
          error: 'An account with this email address already exists.',
          fieldErrors: { email: 'An account with this email address already exists.' },
        },
        { status: 409 }
      );
    }

    const [passwordHash, claimPinHash] = await Promise.all([
      hashSecret(data.password),
      hashSecret(data.claimPin),
    ]);

    const otpCode = generateSixDigitCode();
    const codeHash = hashOtpCode(otpCode);
    const expiresAt = getOtpExpiryDate();

    const created = await prisma.$transaction(async (tx) => {
      const customer = await tx.customer.create({
        data: {
          fullName: data.fullName,
          email: data.email,
          phone: data.phone,
          docketNumber: data.docketNumber,
          claimPinHash,
          passwordHash,
          termsAccepted: true,
        },
        select: {
          id: true,
          fullName: true,
          email: true,
          docketNumber: true,
        },
      });

      await tx.verificationCode.create({
        data: {
          customerId: customer.id,
          purpose: 'email_verify',
          codeHash,
          expiresAt,
        },
      });

      return customer;
    });

    enqueueVerificationEmail({
      to: created.email,
      fullName: created.fullName,
      docketNumber: created.docketNumber,
      code: otpCode,
    });

    return NextResponse.json(
      {
        ok: true,
        accountId: created.id,
        email: created.email,
        verificationRequired: true,
      },
      {
        status: 201,
        headers: {
          'X-RateLimit-Limit': String(rl.limit),
          'X-RateLimit-Remaining': String(rl.remaining),
        },
      }
    );
  } catch {
    return NextResponse.json(
      { error: 'Unable to record account right now. Please try again shortly.' },
      { status: 500 }
    );
  }
}
