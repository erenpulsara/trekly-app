import { cookies } from 'next/headers';
import LandingNav from './landing-nav';
import HeroButtons from './HeroButtons';
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
          background: transparent;
          color: rgba(255,255,255,0.85);
          font-size: 0.95rem;
          font-weight: 600;
          padding: 16px 36px;
          border-radius: 100px;
          border: 1.5px solid rgba(255,255,255,0.3);
          text-decoration: none;
          letter-spacing: 0.01em;
          transition: border-color 0.15s, color 0.15s, transform 0.2s cubic-bezier(0.34,1.56,0.64,1);
          white-space: nowrap;
          backdrop-filter: blur(4px);
        }
        .lp-hero-btn-primary:hover { border-color: rgba(255,255,255,0.7); color: white; transform: translateY(-2px); }
        .lp-hero-btn-secondary {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          background: transparent;
          color: rgba(255,255,255,0.85);
          font-size: 0.95rem;
          font-weight: 600;
          padding: 16px 36px;
          border-radius: 100px;
          border: 1.5px solid rgba(255,255,255,0.3);
          text-decoration: none;
          letter-spacing: 0.01em;
          transition: border-color 0.15s, color 0.15s, transform 0.2s cubic-bezier(0.34,1.56,0.64,1);
          white-space: nowrap;
          backdrop-filter: blur(4px);
        }
        .lp-hero-btn-secondary:hover { border-color: rgba(255,255,255,0.7); color: white; transform: translateY(-2px); }
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
          alignItems: 'flex-start',
          justifyContent: 'center',
          textAlign: 'left',
          padding: '0 80px',
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
            <em style={{ color: '#FF5533', fontStyle: 'italic' }}>{tx.hero.title2}</em><br />
            {tx.hero.title3}
          </h1>
          <p style={{
            fontSize: 'clamp(0.9rem, 1.2vw, 1.05rem)',
            color: 'rgba(255,255,255,0.55)',
            lineHeight: 1.85,
            whiteSpace: 'nowrap',
            margin: '0 0 48px',
          }}>
            {tx.hero.subtitle}
          </p>

          <HeroButtons
            exploreTours={tx.hero.exploreTours}
            becomeAgency={tx.hero.becomeAgency}
            agencyUrl={AGENCY_URL}
          />
        </div>
      </section>
    </>
  );
}
