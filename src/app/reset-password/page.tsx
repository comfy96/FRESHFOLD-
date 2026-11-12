import Link from 'next/link';

export default function ResetPasswordPage() {
  return (
    <main>
      <h1>Reset Password — Fresh Fold Laundry</h1>
      <p>Request a password reset code.</p>
      <Link href="/login">Back to login</Link>
    </main>
  );
}
