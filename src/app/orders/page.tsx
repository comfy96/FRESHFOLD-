import Link from 'next/link';
import type { Metadata } from 'next';
import { getDb, PickupRequestRow } from '@/lib/db';
import { formatRecordDate } from '@/lib/formatRecordDate';
import styles from './orders.module.css';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Shop Records',
  description: 'Calm, dated laundry counts and shop payment records.',
  robots: {
    index: false,
    follow: false,
  },
};

export default function OrdersPage() {
  let rows: PickupRequestRow[] = [];
  let dbError: string | null = null;

  try {
    const db = getDb();
    rows = db
      .prepare('SELECT id, customer_name, phone, item_count, service_mode, notes, created_at FROM pickup_requests ORDER BY id DESC LIMIT 10')
      .all() as unknown as PickupRequestRow[];
  } catch (err) {
    dbError = err instanceof Error ? err.message : 'Unable to read shop records.';
  }

  return (
    <main className={styles.viewport}>
      <div className={styles.shell}>
        <nav className={styles.navBar}>
          <Link href="/" className={styles.brandLink}>
            Fresh Fold Laundry
          </Link>
        </nav>

        <section className={styles.card} aria-labelledby="orders-heading">
          <h1 id="orders-heading" className={styles.heading}>
            Our records show
          </h1>
          <p className={styles.subtext}>
            Dated intake records logged in the shop database.
          </p>

          {dbError ? (
            <p className={styles.rowMeta}>Records unavailable: {dbError}</p>
          ) : rows.length === 0 ? (
            <p className={styles.rowMeta}>No pickup records logged yet.</p>
          ) : (
            rows.map((row) => (
              <div key={row.id} className={styles.row}>
                <div className={styles.rowTitle}>
                  #{row.id} — {row.customer_name} ({row.item_count} items, {row.service_mode})
                </div>
                <div className={styles.rowMeta}>
                  Logged {formatRecordDate(row.created_at)}
                  {row.notes ? ` · ${row.notes}` : ''}
                </div>
              </div>
            ))
          )}
        </section>
      </div>
    </main>
  );
}
