import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: {
    default: 'Fresh Fold Laundry — Clear Order & Payment Records',
    template: '%s — Fresh Fold Laundry',
  },
  description: 'Calm, dated laundry counts and shop payment records.',
  openGraph: {
    title: 'Fresh Fold Laundry',
    description: 'Calm, dated laundry counts and shop payment records.',
    type: 'website',
    siteName: 'Fresh Fold Laundry',
    images: [
      {
        url: '/og-freshfold.svg',
        width: 1200,
        height: 630,
        alt: 'Fresh Fold Laundry order record ledger preview',
      },
    ],
  },
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
