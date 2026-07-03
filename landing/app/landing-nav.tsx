'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState, useEffect, useRef } from 'react';
import { type Lang, getLangClient, setLangCookie } from '@/lib/i18n';
import { useUserAuth } from './UserAuthContext';

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
  const [menuOpen, setMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const { user, isLoading, logout } = useUserAuth();

  useEffect(() => {
    setLangState(getLangClient());
  }, []);

  // close menu on route change
  useEffect(() => {
    setMenuOpen(false);
  }, [logoHref]);

  useEffect(() => {
    if (!userMenuOpen) return;
    function handler(e: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [userMenuOpen]);

  const switchLang = (l: Lang) => {
    setLangCookie(l);
    window.location.reload();
  };

  return (
    <>
      <style>{`
        .ln-nav { position: sticky; top: 0; z-index: 200; background: rgba(255,255,255,0.96); backdrop-filter: blur(16px); -webkit-backdrop-filter: blur(16px); border-bottom: 1px solid rgba(0,0,0,0.08); height: 80px; display: flex; align-items: center; padding: 0 48px; justify-content: space-between; }
        .ln-links { display: flex; align-items: center; gap: 24px; }
        .ln-hamburger { display: none; background: none; border: none; cursor: pointer; padding: 8px; border-radius: 8px; color: #1A1A1A; }
        .ln-mobile-menu { display: none; position: fixed; inset: 0; top: 80px; background: rgba(255,255,255,0.98); backdrop-filter: blur(20px); z-index: 199; flex-direction: column; padding: 24px 24px; gap: 4px; }
        .ln-mobile-menu.open { display: flex; }
        .ln-mobile-link { font-size: 1.1rem; font-weight: 600; color: rgba(0,0,0,0.7); text-decoration: none; padding: 14px 0; border-bottom: 1px solid rgba(0,0,0,0.06); display: block; }
        .ln-mobile-link:last-child { border-bottom: none; }
        .ln-mobile-link:hover { color: #FF5533; }
        @media (max-width: 768px) {
          .ln-nav { padding: 0 20px !important; }
          .ln-links { display: none !important; }
          .ln-hamburger { display: flex !important; align-items: center; justify-content: center; }
        }
      `}</style>

      <nav className="ln-nav">
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
          {/* Desktop nav links */}
          {navLinks && navLinks.length > 0 && (
            <div className="ln-links">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  style={{
                    fontSize: '0.85rem',
                    fontWeight: link.active ? 700 : 500,
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

          {/* User auth */}
          {!isLoading && (
            <div ref={userMenuRef} style={{ position: 'relative' }}>
              {user ? (
                <>
                  <button
                    onClick={() => setUserMenuOpen((v) => !v)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '8px',
                      background: 'rgba(255,85,51,0.08)', border: 'none', borderRadius: '20px',
                      padding: '6px 14px 6px 6px', cursor: 'pointer', fontFamily: 'inherit',
                    }}
                  >
                    <span style={{
                      width: '26px', height: '26px', borderRadius: '50%', background: '#FF5533',
                      color: 'white', fontSize: '0.72rem', fontWeight: 800,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      {user.name.charAt(0).toUpperCase()}
                    </span>
                    <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#1A1A1A' }}>
                      {user.name}
                    </span>
                  </button>
                  {userMenuOpen && (
                    <div style={{
                      position: 'absolute', top: 'calc(100% + 10px)', right: 0,
                      background: 'white', border: '1px solid #EAEAEA', borderRadius: '14px',
                      boxShadow: '0 8px 32px rgba(0,0,0,0.14)', minWidth: '200px', overflow: 'hidden', zIndex: 300,
                    }}>
                      <div style={{ padding: '14px 16px', borderBottom: '1px solid #F0F0F0' }}>
                        <p style={{ margin: 0, fontSize: '0.85rem', fontWeight: 700, color: '#1A1A1A' }}>
                          {user.name} {user.surname}
                        </p>
                        <p style={{ margin: '2px 0 0', fontSize: '0.75rem', color: '#9A9A9A' }}>{user.email}</p>
                      </div>
                      <Link
                        href="/favorilerim"
                        onClick={() => setUserMenuOpen(false)}
                        style={{ display: 'block', padding: '11px 16px', fontSize: '0.82rem', fontWeight: 600, color: '#3A3A3A', textDecoration: 'none' }}
                      >
                        Favorilerim
                      </Link>
                      <button
                        onClick={() => { logout(); setUserMenuOpen(false); }}
                        style={{
                          display: 'block', width: '100%', textAlign: 'left', padding: '11px 16px',
                          fontSize: '0.82rem', fontWeight: 600, color: '#DC2626', background: 'none',
                          border: 'none', borderTop: '1px solid #F0F0F0', cursor: 'pointer', fontFamily: 'inherit',
                        }}
                      >
                        Çıkış Yap
                      </button>
                    </div>
                  )}
                </>
              ) : (
                <Link
                  href="/giris"
                  style={{
                    fontSize: '0.82rem', fontWeight: 700, color: '#FF5533',
                    textDecoration: 'none', padding: '7px 16px', borderRadius: '20px',
                    border: '1.5px solid rgba(255,85,51,0.3)',
                  }}
                >
                  Giriş Yap
                </Link>
              )}
            </div>
          )}

          {/* Lang switcher */}
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

          {/* Hamburger — mobile only */}
          {navLinks && navLinks.length > 0 && (
            <button
              className="ln-hamburger"
              onClick={() => setMenuOpen((v) => !v)}
              aria-label="Menü"
            >
              {menuOpen ? (
                <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          )}
        </div>
      </nav>

      {/* Mobile dropdown menu */}
      {navLinks && navLinks.length > 0 && (
        <div className={`ln-mobile-menu${menuOpen ? ' open' : ''}`}>
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="ln-mobile-link"
              onClick={() => setMenuOpen(false)}
              style={{ color: link.active ? '#FF5533' : undefined }}
            >
              {link.label}
            </Link>
          ))}
        </div>
      )}
    </>
  );
}
