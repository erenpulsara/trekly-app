import type { Metadata } from 'next';
import { Space_Grotesk } from 'next/font/google';
import { UserAuthProvider } from './UserAuthContext';
import './globals.css';

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-space',
  display: 'swap',
});

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
    <html lang="tr" className={spaceGrotesk.variable}>
      <body>
        <UserAuthProvider>{children}</UserAuthProvider>
      </body>
    </html>
  );
}
