import Link from 'next/link';
import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { validateSession, SESSION_COOKIE_NAME } from '@/lib/security/session';
import { prisma } from '@/lib/prisma';
import styles from '../orders/orders.module.css';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Staff Administration — Fresh Fold Laundry',
  robots: {
    index: false,
    follow: false,
  },
};

export default async function AdminPage() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME);

  if (!sessionCookie?.value) {
    redirect('/auth?mode=login&from=/admin');
  }

  const session = await validateSession(sessionCookie.value);
  if (!session) {
    redirect('/auth?mode=login&from=/admin');
  }

  // Enforce Role-Based Access Control (RBAC): Only 'admin' role permitted
  if (session.role !== 'admin') {
    return (
      <main className={styles.viewport}>
        <div className={styles.shell}>
          <nav className={styles.navBar}>
            <Link href="/" className={styles.brandLink}>
              Fresh Fold Laundry
            </Link>
            <Link href="/orders" className={styles.logoutButton}>
              Back to My Docket
            </Link>
          </nav>

          <section
            style={{
              backgroundColor: 'var(--color-surface-container-low)',
              border: '1px solid var(--color-error)',
              borderRadius: '0.75rem',
              padding: '2rem 1.5rem',
              textAlign: 'center',
              boxShadow: 'var(--shadow-medium)',
            }}
            aria-labelledby="refusal-heading"
          >
            <svg
              width="48"
              height="48"
              viewBox="0 0 24 24"
              fill="none"
              stroke="var(--color-error)"
              strokeWidth="2"
              aria-hidden="true"
              style={{ margin: '0 auto 1rem' }}
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="15" y1="9" x2="9" y2="15" />
              <line x1="9" y1="9" x2="15" y2="15" />
            </svg>
            <h1
              id="refusal-heading"
              style={{
                fontSize: '20px',
                fontWeight: 700,
                color: 'var(--color-error)',
                marginBottom: '0.5rem',
              }}
            >
              403 Forbidden: Staff Authorization Required
            </h1>
            <p
              style={{
                fontSize: '14px',
                color: 'var(--color-on-surface-variant)',
                lineHeight: 1.5,
                maxWidth: '24rem',
                margin: '0 auto 1.5rem',
              }}
            >
              Our records show your account (<strong>{session.fullName}</strong>, Docket #{session.docketNumber})
              holds the role <code>customer</code>. The administration console is strictly restricted to Fresh Fold staff and branch managers.
            </p>
            <div
              style={{
                fontSize: '12px',
                color: 'var(--color-outline)',
                fontFamily: 'monospace',
                background: 'var(--color-surface-container)',
                padding: '0.5rem 1rem',
                borderRadius: '0.375rem',
                display: 'inline-block',
              }}
            >
              RBAC Check: Required &apos;admin&apos; | Present &apos;{session.role}&apos; | Blocked
            </div>
          </section>
        </div>
      </main>
    );
  }

  // If user IS an admin, render the staff console:
  const totalCustomers = await prisma.customer.count();
  const totalRequests = await prisma.pickupRequest.count();

  return (
    <main className={styles.viewport}>
      <div className={styles.shell}>
        <nav className={styles.navBar}>
          <Link href="/" className={styles.brandLink}>
            Fresh Fold Staff Console
          </Link>
          <Link href="/orders" className={styles.logoutButton}>
            View Public Docket
          </Link>
        </nav>

        <section className={styles.card}>
          <h1 className={styles.heading}>Branch Administration</h1>
          <p className={styles.subtext}>
            Staff manager: <strong>{session.fullName}</strong> ({session.email})
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '1rem' }}>
            <div style={{ background: 'var(--color-surface)', padding: '1rem', borderRadius: '0.5rem' }}>
              <div style={{ fontSize: '11px', color: 'var(--color-on-surface-variant)' }}>REGISTERED CUSTOMERS</div>
              <div style={{ fontSize: '24px', fontWeight: 700, color: 'var(--color-primary)' }}>{totalCustomers}</div>
            </div>
            <div style={{ background: 'var(--color-surface)', padding: '1rem', borderRadius: '0.5rem' }}>
              <div style={{ fontSize: '11px', color: 'var(--color-on-surface-variant)' }}>TOTAL PICKUP REQUESTS</div>
              <div style={{ fontSize: '24px', fontWeight: 700, color: 'var(--color-primary)' }}>{totalRequests}</div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
