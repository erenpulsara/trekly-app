import type { Metadata } from 'next';
import { Space_Grotesk } from 'next/font/google';
import { cookies } from 'next/headers';
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
  // html lang aktif dile göre ayarlanır — CSS text-transform:uppercase browser
  // tarafından dile göre uygulanır (Türkçe'de küçük "i" → noktalı "İ" olur).
  // lang="tr" sabit kalsaydı, EN modda "diving" gibi kelimeler CSS ile büyütülünce
  // yanlışlıkla "DİVİNG" (noktalı İ) olurdu; doğrusu "DIVING" (noktasız I).
  const lang = cookies().get('lang')?.value === 'en' ? 'en' : 'tr';
  return (
    <html lang={lang} className={spaceGrotesk.variable}>
      <body>
        <UserAuthProvider>{children}</UserAuthProvider>
      </body>
    </html>
  );
}
