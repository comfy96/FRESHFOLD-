import { NextResponse } from 'next/server';
import { getDb, PickupRequestRow } from '@/lib/db';

export async function GET() {
  try {
    const db = getDb();
    const rows = db
      .prepare('SELECT id, customer_name, phone, item_count, service_mode, notes, created_at FROM pickup_requests ORDER BY id DESC LIMIT 20')
      .all() as unknown as PickupRequestRow[];
    console.log(`[GET /api/pickup-requests] 200 OK rows=${rows.length}`);
    return NextResponse.json({ ok: true, rows }, { status: 200 });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Database read failed';
    console.error(`[GET /api/pickup-requests] 500 ERROR: ${message}`);
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const customerName = String(body.customerName ?? '').trim();
    const phone = String(body.phone ?? '').trim();
    const itemCount = Number(body.itemCount ?? 0);
    const serviceMode = String(body.serviceMode ?? 'collect').trim();
    const notes = String(body.notes ?? '').trim();

    if (!customerName || !phone || !Number.isFinite(itemCount) || itemCount < 1) {
      console.warn('[POST /api/pickup-requests] 400 Bad Request invalid payload');
      return NextResponse.json(
        { ok: false, error: 'Please provide name, phone, and item count.' },
        { status: 400 }
      );
    }

    const db = getDb();
    const stmt = db.prepare(
      'INSERT INTO pickup_requests (customer_name, phone, item_count, service_mode, notes) VALUES (?, ?, ?, ?, ?)'
    );
    const result = stmt.run(customerName, phone, itemCount, serviceMode, notes);
    const rowId = Number(result.lastInsertRowid);
    const createdRow = db
      .prepare('SELECT id, customer_name, phone, item_count, service_mode, notes, created_at FROM pickup_requests WHERE id = ?')
      .get(rowId) as unknown as PickupRequestRow;

    console.log(
      `[POST /api/pickup-requests] 201 Created row_id=${rowId} customer="${customerName}" items=${itemCount} created_at=${createdRow.created_at}`
    );

    return NextResponse.json({ ok: true, record: createdRow }, { status: 201 });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Database write failed';
    console.error(`[POST /api/pickup-requests] 500 Database Error: ${message}`);
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}

