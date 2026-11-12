import Link from 'next/link';
import type { Metadata } from 'next';
import PickupForm from './PickupForm';
import styles from './pickup.module.css';

export const metadata: Metadata = {
  title: 'Record Pickup Request',
  description: 'Calm, dated laundry counts and shop payment records.',
  robots: {
    index: false,
    follow: false,
  },
};

export default function PickupPage() {
  return (
    <main className={styles.viewport}>
      <div className={styles.shell}>
        <nav className={styles.navBar}>
          <Link href="/" className={styles.brandLink}>
            Fresh Fold Laundry
          </Link>
        </nav>

        <section className={styles.card} aria-labelledby="pickup-heading">
          <h1 id="pickup-heading" className={styles.heading}>
            Record a pickup or drop-off
          </h1>
          <p className={styles.subtext}>
            Enter your details so our shop record matches your garment count.
          </p>
          <PickupForm />
        </section>
      </div>
    </main>
  );
}

