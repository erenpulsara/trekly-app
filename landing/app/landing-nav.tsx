'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { type Lang, getLangClient, setLangCookie, T } from '@/lib/i18n';

export default function LandingNav() {
  const [lang, setLangState] = useState<Lang>('tr');

  useEffect(() => {
    setLangState(getLangClient());
  }, []);

  const switchLang = (l: Lang) => {
    setLangCookie(l);
    window.location.reload();
  };

  const nav = T[lang].nav;

  return (
    <nav style={{
      position: 'sticky',
      top: 0,
      zIndex: 200,
      background: 'rgba(255,255,255,0.96)',
      backdropFilter: 'blur(16px)',
      WebkitBackdropFilter: 'blur(16px)',
      borderBottom: '1px solid rgba(0,0,0,0.08)',
      height: '80px',
      display: 'flex',
      alignItems: 'center',
      padding: '0 48px',
      justifyContent: 'space-between',
    }}>
      <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none' }}>
        <Image src="/logo.png" alt="Trekly" width={60} height={60} style={{ objectFit: 'contain' }} />
        <span style={{
          fontFamily: '"Montserrat", sans-serif',
          fontWeight: 900,
          fontSize: '1.55rem',
          color: '#ff751f',
          letterSpacing: '-0.02em',
          lineHeight: 1,
        }}>Trekly</span>
      </Link>

      <div style={{ display: 'flex', alignItems: 'center', gap: '2px', background: 'rgba(0,0,0,0.05)', borderRadius: '8px', padding: '3px' }}>
        {(['tr', 'en'] as const).map((l) => (
          <button
            key={l}
            onClick={() => switchLang(l)}
            style={{
              background: lang === l ? 'white' : 'transparent',
              border: 'none',
              borderRadius: '6px',
              padding: '5px 12px',
              fontSize: '0.78rem',
              fontWeight: 700,
              color: lang === l ? '#1A1A1A' : 'rgba(0,0,0,0.38)',
              cursor: 'pointer',
              fontFamily: 'inherit',
              letterSpacing: '0.04em',
              boxShadow: lang === l ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
              transition: 'all 0.15s',
            }}
          >
            {l.toUpperCase()}
          </button>
        ))}
      </div>
    </nav>
  );
}
