'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { type Lang, getLangClient, setLangCookie, T } from '@/lib/i18n';

interface NavLink {
  label: string;
  href: string;
  active?: boolean;
}

export default function LandingNav({
  logoHref = '/',
  navLinks,
}: {
  logoHref?: string;
  navLinks?: NavLink[];
}) {
  const [lang, setLangState] = useState<Lang>('tr');

  useEffect(() => {
    setLangState(getLangClient());
  }, []);

  const switchLang = (l: Lang) => {
    setLangCookie(l);
    window.location.reload();
  };

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
      <Link href={logoHref} style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none' }}>
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

      <div style={{ display: 'flex', alignItems: 'center', gap: '28px' }}>
        {navLinks && navLinks.length > 0 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                style={{
                  fontSize: '0.85rem',
                  fontWeight: 500,
                  color: link.active ? '#FF5533' : 'rgba(0,0,0,0.45)',
                  textDecoration: 'none',
                  transition: 'color 0.15s',
                }}
              >
                {link.label}
              </Link>
            ))}
          </div>
        )}

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
      </div>
    </nav>
  );
}
