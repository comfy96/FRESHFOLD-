import Link from 'next/link';

export default function LoginPage() {
  return (
    <main>
      <h1>Log In — Fresh Fold Laundry</h1>
      <p>Check your dated laundry counts and payment records.</p>
      <Link href="/reset-password">Forgot password?</Link>
    </main>
  );
}
