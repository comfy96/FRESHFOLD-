import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

// Task 03 intentional stage: client-side validation only, NO server-side validation or hashing yet.
// Task 04 closes this hole with Zod boundary schemas, Argon2id/bcrypt, rate limiting, and verification.
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const db = getDb();

    const stmt = db.prepare(
      'INSERT INTO customer_accounts (full_name, email, phone, docket_number, claim_pin, password, terms_accepted) VALUES (?, ?, ?, ?, ?, ?, ?)'
    );

    const result = stmt.run(
      String(body.fullName ?? ''),
      String(body.email ?? ''),
      String(body.phone ?? ''),
      Number(body.docketNumber ?? 0),
      String(body.claimPin ?? ''),
      String(body.password ?? ''),
      body.termsAccepted ? 1 : 0
    );

    const rowId = Number(result.lastInsertRowid);
    console.log(
      `[POST /api/auth/register] 201 Created account_id=${rowId} email="${String(body.email ?? '')}"`
    );

    return NextResponse.json(
      {
        ok: true,
        accountId: rowId,
        received: body,
      },
      { status: 201 }
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Registration error';
    console.error(`[POST /api/auth/register] 500 ERROR: ${message}`);
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
