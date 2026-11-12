import Link from 'next/link';
import type { Metadata } from 'next';
import styles from './page.module.css';

export const metadata: Metadata = {
  title: 'Fresh Fold Laundry — Clear Order & Payment Records',
  description: 'Calm, dated laundry counts and shop payment records.',
  keywords: [
    'Fresh Fold Laundry',
    'neighbourhood laundry Nigeria',
    'laundry order tracking',
    'dated laundry receipt',
  ],
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    title: 'Fresh Fold Laundry — Clear Order & Payment Records',
    description: 'Calm, dated laundry counts and shop payment records.',
    type: 'website',
    siteName: 'Fresh Fold Laundry',
    images: ['/og-freshfold.svg'],
  },
};

export default function HomePage() {
  return (
    <main className={styles.viewport}>
      <section className={styles.ledgerShell} aria-labelledby="scaffold-title">
        <header className={styles.brandBar}>
          <Link
            href="/"
            className={styles.logoLink}
            aria-label="Fresh Fold Laundry home"
          >
            <svg
              width="40"
              height="40"
              viewBox="0 0 64 64"
              aria-hidden="true"
            >
              <rect width="64" height="64" rx="14" fill="var(--color-primary)" />
              <path
                d="M18 18h28v10H28v6h14v9H28v9H18V18z"
                fill="var(--color-on-primary)"
              />
              <path d="M40 42l8 8v-8h-8z" fill="var(--color-primary-containr)" />
            </svg>
          </Link>
        </header>

        <h1 id="scaffold-title" className={styles.heroHeadline}>
          Our records show every garment counted
        </h1>

        <p className={styles.summary}>
          See your own wash status, item counts at collection and ironing, and
          dated payment records without calling the shop.
        </p>

        <div className={styles.actions}>
          <Link href="/orders" className={styles.primaryBtn}>
            Check my order record
          </Link>
          <Link href="/pickup" className={styles.secondaryLink}>
            Need a pickup or drop-off? Record it here
          </Link>
        </div>
      </section>
    </main>
  );
}
