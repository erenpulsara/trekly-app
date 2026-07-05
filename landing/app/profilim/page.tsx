'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import SiteFooter from '@/app/components/SiteFooter';
import LandingNav from '../landing-nav';
import { useUserAuth } from '../UserAuthContext';
import { fetchMe, WebUser } from '@/lib/user-api';
import { getFavorites } from '@/lib/favorites-api';

export default function ProfilimPage() {
  const router = useRouter();
  const { user, isLoading, logout } = useUserAuth();
  const [profile, setProfile] = useState<WebUser | null>(null);
  const [favCount, setFavCount] = useState<number | null>(null);

  useEffect(() => {
    if (isLoading) return;
    if (!user) {
      router.push('/giris?returnTo=/profilim');
      return;
    }
    setProfile(user);
    // Refresh from the API (points may have changed)
    fetchMe().then((fresh) => { if (fresh) setProfile(fresh); });
    getFavorites().then((favs) => setFavCount(favs.length)).catch(() => {});
  }, [user, isLoading, router]);

  const display = profile ?? user;

  return (
    <>
      <LandingNav navLinks={[
        { label: 'Anasayfa',    href: '/anasayfa' },
        { label: 'Etkinlikler', href: '/etkinlikler' },
        { label: 'Blog',        href: '/blog' },
        { label: 'Hakkımızda', href: '/hakkimizda' },
        { label: 'İletişim',   href: '/iletisim' },
      ]} />

      <main style={{ minHeight: '70vh', background: '#FAFAFA', padding: '48px 20px 64px' }}>
        <div style={{ maxWidth: '560px', margin: '0 auto' }}>
          {isLoading || !display ? (
            <p style={{ color: '#9A9A9A', fontSize: '0.9rem', textAlign: 'center' }}>Yükleniyor...</p>
          ) : (
            <>
              {/* Profile card */}
              <div style={{
                background: 'white', border: '1px solid #EAEAEA', borderRadius: '20px',
                padding: '36px 32px', textAlign: 'center', marginBottom: '16px',
              }}>
                <div style={{
                  width: '84px', height: '84px', borderRadius: '50%', background: '#FF5533',
                  color: 'white', fontSize: '2rem', fontWeight: 800,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  margin: '0 auto 16px', border: '4px solid #FFF3EE',
                }}>
                  {display.name.charAt(0).toUpperCase()}
                </div>
                <h1 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#1A1A1A', margin: '0 0 4px' }}>
                  {display.name} {display.surname}
                </h1>
                <p style={{ fontSize: '0.88rem', color: '#9A9A9A', margin: 0 }}>{display.email}</p>

                <div style={{
                  display: 'inline-flex', alignItems: 'center', gap: '8px',
                  background: '#FFF3EE', borderRadius: '100px', padding: '8px 20px', marginTop: '18px',
                }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="#FF5533">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                  </svg>
                  <span style={{ fontSize: '0.95rem', fontWeight: 800, color: '#FF5533' }}>
                    {display.total_points} XP
                  </span>
                </div>
              </div>

              {/* Menu */}
              <div style={{
                background: 'white', border: '1px solid #EAEAEA', borderRadius: '20px',
                overflow: 'hidden', marginBottom: '16px',
              }}>
                <Link href="/favorilerim" style={menuRowStyle}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#FF5533" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                  </svg>
                  <span style={{ flex: 1, fontWeight: 600, color: '#1A1A1A' }}>Favorilerim</span>
                  {favCount !== null && (
                    <span style={{ fontSize: '0.78rem', color: '#9A9A9A', fontWeight: 600 }}>{favCount} tur</span>
                  )}
                  <ChevronRight />
                </Link>
                <div style={{ height: '1px', background: '#F3F3F3' }} />
                <Link href="/etkinlikler" style={menuRowStyle}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#FF5533" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10"/><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"/>
                  </svg>
                  <span style={{ flex: 1, fontWeight: 600, color: '#1A1A1A' }}>Turları Keşfet</span>
                  <ChevronRight />
                </Link>
              </div>

              {/* Logout */}
              <button
                onClick={() => { logout(); router.push('/anasayfa'); }}
                style={{
                  width: '100%', background: '#FFF5F5', border: '1.5px solid #FEE2E2',
                  borderRadius: '14px', padding: '14px', fontSize: '0.92rem', fontWeight: 700,
                  color: '#DC2626', cursor: 'pointer', fontFamily: 'inherit',
                }}
              >
                Çıkış Yap
              </button>
            </>
          )}
        </div>
      </main>

      <SiteFooter />
    </>
  );
}

const menuRowStyle: React.CSSProperties = {
  display: 'flex', alignItems: 'center', gap: '14px',
  padding: '16px 20px', textDecoration: 'none', color: 'inherit',
};

function ChevronRight() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#D1D5DB" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="9 18 15 12 9 6" />
    </svg>
  );
}
