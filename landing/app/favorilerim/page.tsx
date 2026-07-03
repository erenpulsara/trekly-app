'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import SiteFooter from '@/app/components/SiteFooter';
import LandingNav from '../landing-nav';
import { useUserAuth } from '../UserAuthContext';
import { getFavorites } from '@/lib/favorites-api';
import { splitCategories } from '@/lib/category-utils';
import type { Tour } from '@/lib/types';

const PH_GRADIENT = 'linear-gradient(135deg,#1a4d2e,#2d7a4f)';

export default function FavorilerimPage() {
  const { user, isLoading: authLoading } = useUserAuth();
  const [tours, setTours] = useState<Tour[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      setLoading(false);
      return;
    }
    getFavorites()
      .then(setTours)
      .finally(() => setLoading(false));
  }, [user, authLoading]);

  return (
    <>
      <LandingNav navLinks={[
        { label: 'Anasayfa',    href: '/anasayfa' },
        { label: 'Etkinlikler', href: '/etkinlikler' },
        { label: 'Blog',        href: '/blog' },
        { label: 'Hakkımızda', href: '/hakkimizda' },
        { label: 'İletişim',   href: '/iletisim' },
      ]} />

      <main style={{ minHeight: '70vh', background: '#FAFAFA', padding: '48px 48px 64px' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
          <h1 style={{
            fontFamily: '"Cormorant Garamond", serif', fontSize: 'clamp(1.5rem, 2.5vw, 2rem)',
            fontWeight: 400, color: '#1A1A1A', margin: '0 0 8px',
          }}>
            Favorilerim
          </h1>
          <p style={{ fontSize: '0.85rem', color: '#9A9A9A', margin: '0 0 32px' }}>
            Favorilerine eklediğin turlar burada listelenir.
          </p>

          {authLoading || loading ? (
            <p style={{ color: '#9A9A9A', fontSize: '0.9rem' }}>Yükleniyor...</p>
          ) : !user ? (
            <div style={{ textAlign: 'center', padding: '60px 0' }}>
              <p style={{ fontSize: '1rem', color: '#4A4A4A', marginBottom: '16px' }}>
                Favorilerini görmek için giriş yapmalısın.
              </p>
              <Link
                href="/giris?returnTo=/favorilerim"
                style={{
                  display: 'inline-block', background: '#FF5533', color: 'white',
                  fontSize: '0.85rem', fontWeight: 700, padding: '12px 28px',
                  borderRadius: '10px', textDecoration: 'none',
                }}
              >
                Giriş Yap
              </Link>
            </div>
          ) : tours.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 0' }}>
              <p style={{ fontSize: '1rem', color: '#9A9A9A' }}>Henüz favori tur eklemedin.</p>
              <Link href="/etkinlikler" style={{ fontSize: '0.85rem', color: '#FF5533', fontWeight: 600, textDecoration: 'none' }}>
                Turlara göz at →
              </Link>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
              {tours.map((tour) => (
                <Link
                  key={tour.id}
                  href={`/tours/${tour.id}`}
                  style={{
                    borderRadius: '16px', overflow: 'hidden', background: 'white',
                    boxShadow: '0 2px 16px rgba(0,0,0,0.07)', textDecoration: 'none', color: 'inherit',
                    display: 'flex', flexDirection: 'column',
                  }}
                >
                  <div style={{ position: 'relative', height: '180px', background: PH_GRADIENT }}>
                    {tour.photo_urls[0] && (
                      <Image src={tour.photo_urls[0]} alt={tour.name} fill style={{ objectFit: 'cover' }} sizes="320px" />
                    )}
                  </div>
                  <div style={{ padding: '16px' }}>
                    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '8px' }}>
                      {splitCategories(tour.category).map((cat) => (
                        <span key={cat} style={{
                          background: '#FFF4F1', color: '#FF5533', fontSize: '0.62rem', fontWeight: 700,
                          padding: '3px 9px', borderRadius: '6px', textTransform: 'uppercase', letterSpacing: '0.04em',
                        }}>
                          {cat}
                        </span>
                      ))}
                    </div>
                    <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#1A1A1A', margin: '0 0 6px', lineHeight: 1.3 }}>
                      {tour.name}
                    </h3>
                    <p style={{ fontSize: '0.78rem', color: '#9A9A9A', margin: 0 }}>{tour.location_name}</p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>

      <SiteFooter />
    </>
  );
}
