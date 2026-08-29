import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Luckyverse Racing Predictor',
  description: 'Premium virtual horse racing predictor — place your bets and watch the race live.',
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
  },
  themeColor: '#0f172a',
  openGraph: {
    title: 'Luckyverse Racing Predictor',
    description: 'Premium virtual horse racing predictor',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className="dark">
      <body className={`${inter.className} antialiased`}>{children}</body>
    </html>
  );
}
