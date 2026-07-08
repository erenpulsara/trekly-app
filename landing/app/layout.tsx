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

const SITE_TITLE = 'Trekly - Outdoor Hub Türkiye';
const SITE_DESCRIPTION = "Türkiye'nin en kapsamlı outdoor sporları ekosistemi";

export const metadata: Metadata = {
  metadataBase: new URL('https://treklyapp.com'),
  title: SITE_TITLE,
  description: SITE_DESCRIPTION,
  icons: {
    icon: '/icon.png',
    apple: '/icon.png',
  },
  openGraph: {
    type: 'website',
    siteName: 'Trekly',
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    url: 'https://treklyapp.com',
    locale: 'tr_TR',
    images: [{ url: '/icon.png' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    images: ['/icon.png'],
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
