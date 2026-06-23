import { cookies } from 'next/headers';
import LandingNav from './landing-nav';
import { T, type Lang } from '@/lib/i18n';

export const dynamic = 'force-dynamic';

const AGENCY_URL = process.env.NEXT_PUBLIC_AGENCY_URL ?? 'https://acenta.treklyapp.com';

export default function HomePage() {
  const lang: Lang = cookies().get('lang')?.value === 'en' ? 'en' : 'tr';
  const tx = T[lang];

  return (
    <>
      <style>{`
        .lp-hero-btn-primary {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          background: white;
          color: #1A1A1A;
          font-size: 0.95rem;
          font-weight: 700;
          padding: 16px 36px;
          border-radius: 100px;
          text-decoration: none;
          letter-spacing: 0.01em;
          transition: background 0.15s, transform 0.2s cubic-bezier(0.34,1.56,0.64,1);
          white-space: nowrap;
        }
        .lp-hero-btn-primary:hover { background: #f0f0f0; transform: translateY(-2px); }
        .lp-hero-btn-secondary {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          background: transparent;
          color: white;
          font-size: 0.95rem;
          font-weight: 600;
          padding: 16px 36px;
          border-radius: 100px;
          border: 1.5px solid rgba(255,255,255,0.5);
          text-decoration: none;
          letter-spacing: 0.01em;
          transition: border-color 0.15s, background 0.15s, transform 0.2s cubic-bezier(0.34,1.56,0.64,1);
          white-space: nowrap;
        }
        .lp-hero-btn-secondary:hover { border-color: white; background: rgba(255,255,255,0.1); transform: translateY(-2px); }
        @media (max-width: 540px) {
          .lp-hero-btns { flex-direction: column !important; align-items: center !important; }
          .lp-hero-title { font-size: 3rem !important; }
        }
      `}</style>

      <LandingNav />

      <section style={{
        position: 'relative',
        height: 'calc(100vh - 80px)',
        background: '#09091A',
        overflow: 'hidden',
      }}>
        <video
          autoPlay muted loop playsInline
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', zIndex: 0 }}
        >
          <source src="/treklyhero.mp4" type="video/mp4" />
        </video>

        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(0,0,0,0.35) 0%, rgba(0,0,0,0.15) 40%, rgba(0,0,0,0.7) 100%)', zIndex: 1 }} />

        <div style={{
          position: 'absolute',
          inset: 0,
          zIndex: 2,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
          padding: '0 32px',
        }}>
          <h1
            className="lp-hero-title"
            style={{
              fontFamily: '"Cormorant Garamond", Georgia, serif',
              fontSize: 'clamp(3.2rem, 7.5vw, 8rem)',
              fontWeight: 400,
              lineHeight: 1.06,
              color: 'white',
              margin: '0 0 20px',
              letterSpacing: '-0.02em',
            }}
          >
            {tx.hero.title1}<br />
            <em style={{ color: '#FF5533', fontStyle: 'italic' }}>{tx.hero.title2}</em>
          </h1>
          <p style={{
            fontSize: 'clamp(0.9rem, 1.2vw, 1.05rem)',
            color: 'rgba(255,255,255,0.55)',
            lineHeight: 1.85,
            maxWidth: '520px',
            margin: '0 0 48px',
          }}>
            {tx.hero.subtitle}
          </p>

          <div className="lp-hero-btns" style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <a href="/turlar" className="lp-hero-btn-primary">
              {tx.hero.exploreTours}
              <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3"/>
              </svg>
            </a>
            <a href={AGENCY_URL} target="_blank" rel="noopener noreferrer" className="lp-hero-btn-secondary">
              {tx.hero.becomeAgency}
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
