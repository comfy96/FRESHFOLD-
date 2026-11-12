import Link from 'next/link';
import type { Metadata } from 'next';
import AuthForm from './AuthForm';
import styles from './auth.module.css';

export const metadata: Metadata = {
  title: 'Account Access',
  description: 'Calm, dated laundry counts and shop payment records.',
  robots: {
    index: false,
    follow: false,
  },
};

export default async function AuthPage({
  searchParams,
}: {
  searchParams: Promise<{ mode?: string }>;
}) {
  const params = await searchParams;
  const raw = params.mode;
  const initialMode =
    raw === 'login' || raw === 'reset' ? raw : 'signup';

  return (
    <main className={styles.viewport}>
      <div className={styles.shell}>
        <nav className={styles.navBar}>
          <Link href="/" className={styles.logoLink}>
            Fresh Fold Laundry
          </Link>
        </nav>

        <section className={styles.card}>
          <AuthForm initialMode={initialMode} />
        </section>
      </div>
    </main>
  );
}
