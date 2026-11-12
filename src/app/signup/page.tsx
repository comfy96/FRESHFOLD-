import Link from 'next/link';

export default function SignupPage() {
  return (
    <main>
      <h1>Sign Up — Fresh Fold Laundry</h1>
      <p>Create your customer ledger account.</p>
      <Link href="/login">Already registered? Log in</Link>
    </main>
  );
}
