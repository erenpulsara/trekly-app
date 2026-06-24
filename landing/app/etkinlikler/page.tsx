import LandingNav from '../landing-nav';
import Link from 'next/link';

export default function EtkinliklerPage() {
  return (
    <>
      <LandingNav navLinks={[
        { label: 'Hakkımızda', href: '/hakkimizda' },
        { label: 'Etkinlikler', href: '/turlar' },
        { label: 'Blog', href: '/blog' },
        { label: 'İletişim', href: '/iletisim' },
      ]} />

      <main style={{ minHeight: '100vh', background: '#FAFAFA', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '80px 48px' }}>
        <div style={{ textAlign: 'center', maxWidth: '520px' }}>
          <p style={{ fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.28em', textTransform: 'uppercase', color: '#FF5533', margin: '0 0 20px' }}>
            Etkinlikler
          </p>
          <h1 style={{
            fontFamily: '"Cormorant Garamond", serif',
            fontSize: 'clamp(2rem, 5vw, 3.2rem)',
            fontWeight: 400,
            color: '#0D0D1A',
            lineHeight: 1.15,
            letterSpacing: '-0.02em',
            margin: '0 0 24px',
          }}>
            Yakında Burada
          </h1>
          <p style={{ fontSize: '1rem', lineHeight: 1.8, color: '#6B7280', margin: '0 0 40px' }}>
            Etkinlikler sayfası çok yakında yayında. Doğa etkinliklerini, kampları ve özel organizasyonları burada bulabileceksiniz.
          </p>
          <Link href="/turlar" style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            background: '#FF5533',
            color: 'white',
            fontSize: '0.9rem',
            fontWeight: 700,
            padding: '13px 28px',
            borderRadius: '100px',
            textDecoration: 'none',
            letterSpacing: '0.01em',
          }}>
            Turları Keşfet
            <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3"/>
            </svg>
          </Link>
        </div>
      </main>

      <footer style={{ background: '#1A1A1A', color: 'white', padding: '24px 48px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.3)' }}>© {new Date().getFullYear()} Trekly</span>
        <Link href="/turlar" style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.45)', textDecoration: 'none' }}>Turları Keşfet →</Link>
      </footer>
    </>
  );
}
