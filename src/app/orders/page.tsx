import Link from 'next/link';
import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { getDb, PickupRequestRow } from '@/lib/db';
import { formatRecordDate } from '@/lib/formatRecordDate';
import { validateSession, SESSION_COOKIE_NAME } from '@/lib/security/session';
import LogoutButton from './LogoutButton';
import styles from './orders.module.css';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Shop Records — Fresh Fold Laundry',
  description: 'Verified, dated customer laundry intake and processing records.',
  robots: {
    index: false,
    follow: false,
  },
};

interface OrdersPageProps {
  searchParams: Promise<{ gating?: string }>;
}

export default async function OrdersPage({ searchParams }: OrdersPageProps) {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME);

  if (!sessionCookie?.value) {
    redirect('/auth?mode=login&from=/orders');
  }

  const session = await validateSession(sessionCookie.value);
  if (!session) {
    redirect('/auth?mode=login&from=/orders');
  }

  const params = await searchParams;
  const isHardGating = params.gating === 'hard';

  // Read customer-scoped pickup rows from SQLite
  let rows: PickupRequestRow[] = [];
  let dbError: string | null = null;

  try {
    const db = getDb();
    // Scope strictly to authenticated customer to prevent data leakage across customers
    rows = db
      .prepare(
        'SELECT id, customer_name, phone, item_count, service_mode, notes, created_at FROM pickup_requests WHERE customer_name = ? OR customer_id = ? OR docket_number = ? ORDER BY id DESC LIMIT 10'
      )
      .all(session.fullName, session.customerId, session.docketNumber) as unknown as PickupRequestRow[];
  } catch (err) {
    dbError = err instanceof Error ? err.message : 'Unable to read customer records.';
  }

  return (
    <main className={styles.viewport}>
      <div className={styles.shell}>
        <nav className={styles.navBar}>
          <Link href="/" className={styles.brandLink}>
            Fresh Fold Laundry
          </Link>
          <LogoutButton />
        </nav>

        {/* User Identity Banner */}
        <div className={styles.userGreeting}>
          <div>
            <div className={styles.userName}>
              {session.fullName} {session.role === 'admin' ? '(Staff Admin)' : ''}
            </div>
            <div className={styles.userDocket}>
              Docket #{session.docketNumber} · {session.email}
            </div>
          </div>
          <div>
            {session.emailVerified ? (
              <span
                style={{
                  fontSize: '11px',
                  fontWeight: 600,
                  color: '#005320',
                  background: '#7FFC97',
                  padding: '2px 8px',
                  borderRadius: '12px',
                }}
              >
                Verified
              </span>
            ) : (
              <span
                style={{
                  fontSize: '11px',
                  fontWeight: 600,
                  color: '#854D0E',
                  background: '#FEF08A',
                  padding: '2px 8px',
                  borderRadius: '12px',
                }}
              >
                Unverified
              </span>
            )}
          </div>
        </div>

        {/* Hard Gating Refusal (when gating=hard and unverified) */}
        {!session.emailVerified && isHardGating && (
          <section className={styles.hardGateCard} aria-labelledby="hard-gate-heading">
            <svg
              width="36"
              height="36"
              viewBox="0 0 24 24"
              fill="none"
              stroke="var(--color-error)"
              strokeWidth="2"
              aria-hidden="true"
              style={{ margin: '0 auto' }}
            >
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
            <h2 id="hard-gate-heading" className={styles.hardGateTitle}>
              Verification Required
            </h2>
            <p className={styles.hardGateText}>
              Under strict security gating, access to your laundry intake ledger is blocked
              until your email address (<strong>{session.email}</strong>) has been verified with
              the 6-digit code sent to your inbox.
            </p>
            <Link href={`/auth?mode=verify&email=${encodeURIComponent(session.email)}`} className={styles.verifyLink}>
              Enter 6-Digit Verification Code
            </Link>
          </section>
        )}

        {/* Soft Gating Banner (default production mode for Amaka Obi on flaky 2G) */}
        {!session.emailVerified && !isHardGating && (
          <aside className={styles.softGateBanner} role="status">
            <div className={styles.softGateIcon}>
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
                <path
                  d="M10 2L1 18H19L10 2Z"
                  fill="#CA8A04"
                />
                <path
                  d="M10 8V12M10 15H10.01"
                  stroke="#FFFFFF"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            </div>
            <div>
              <div className={styles.softGateTitle}>Notice: Email Verification Pending</div>
              <div className={styles.softGateBody}>
                We sent a 6-digit confirmation code to <strong>{session.email}</strong>. You have
                full access to view your laundry items below, but digital receipt PDF delivery is
                paused until verified.{' '}
                <Link
                  href={`/auth?mode=verify&email=${encodeURIComponent(session.email)}`}
                  style={{ color: 'var(--color-primary)', fontWeight: 600 }}
                >
                  Confirm code now &rarr;
                </Link>
              </div>
            </div>
          </aside>
        )}

        {/* Customer Ledger Records (shown in soft gating or when fully verified) */}
        {(!isHardGating || session.emailVerified) && (
          <section className={styles.card} aria-labelledby="orders-heading">
            <h1 id="orders-heading" className={styles.heading}>
              Our records show
            </h1>
            <p className={styles.subtext}>
              Dated intake records logged for Docket #{session.docketNumber}.
            </p>

            {dbError ? (
              <p className={styles.rowMeta}>Records unavailable: {dbError}</p>
            ) : rows.length === 0 ? (
              <p className={styles.rowMeta}>No pickup records logged yet for your account.</p>
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
        )}
      </div>
    </main>
  );
}
