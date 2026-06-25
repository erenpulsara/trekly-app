import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Trekly — Doğa Turları',
  description: "Türkiye'nin en kapsamlı outdoor aktivite pazaryeri ile hayalindeki maceraya bir adım at.",
  icons: {
    icon: '/icon.png',
    apple: '/icon.png',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="tr">
      <body>{children}</body>
    </html>
  );
}
