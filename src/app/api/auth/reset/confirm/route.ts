import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { hashSecret } from '@/lib/security/password';
import { revokeAllCustomerSessions } from '@/lib/security/session';
import { checkBreachedPassword } from '@/lib/security/breach-check';

const resetConfirmSchema = z.object({
  email: z.string().trim().toLowerCase().email(),
  newPassword: z.string().transform((v) => v.trim()).pipe(z.string().min(10).max(128)),
});

export async function POST(request: Request) {
  try {
    const rawBody = await request.json();
    const parsed = resetConfirmSchema.safeParse(rawBody);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Password must be at least 10 characters.' },
        { status: 400 }
      );
    }

    const { email, newPassword } = parsed.data;

    // Check breached password corpus
    const breach = await checkBreachedPassword(newPassword);
    if (breach.breached) {
      return NextResponse.json(
        {
          error:
            'This password has appeared in an open data breach. Choose a stronger, unique passphrase.',
        },
        { status: 400 }
      );
    }

    const customer = await prisma.customer.findUnique({
      where: { email },
      select: { id: true, email: true },
    });

    if (!customer) {
      // Don't leak existence, return 200 generic success
      return NextResponse.json(
        { ok: true, message: 'Password updated successfully.' },
        { status: 200 }
      );
    }

    // Hash new password using Argon2id (64 MiB, t=3, p=1)
    const newHash = await hashSecret(newPassword);
    await prisma.customer.update({
      where: { id: customer.id },
      data: { passwordHash: newHash },
    });

    // CRITICAL SECURITY ENFORCEMENT: Wipe ALL active sessions across all devices
    const revokedCount = await revokeAllCustomerSessions(customer.id);

    return NextResponse.json(
      {
        ok: true,
        message: 'Password updated successfully and all active sessions revoked across all devices.',
        sessionsRevoked: revokedCount,
      },
      { status: 200 }
    );
  } catch {
    return NextResponse.json(
      { error: 'Unable to reset password right now.' },
      { status: 500 }
    );
  }
}
