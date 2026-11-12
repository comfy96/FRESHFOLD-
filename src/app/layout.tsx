import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Fresh Fold Laundry',
  description: 'Calm, dated laundry item counts and payment records.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

