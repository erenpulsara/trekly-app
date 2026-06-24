export const dynamic = 'force-dynamic';

import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { getTour } from '@/lib/api';
import type { TourDifficulty } from '@/lib/types';

const AGENCY_URL = process.env.NEXT_PUBLIC_AGENCY_URL ?? 'https://acenta.treklyapp.com';

const DIFF_LABEL: Record<TourDifficulty, string> = {
  easy: 'Kolay', medium: 'Orta', hard: 'Zor', extreme: 'Extreme',
};

const DIFF_COLOR: Record<TourDifficulty, { bg: string; text: string }> = {
  easy:    { bg: '#E8F5E9', text: '#2E7D32' },
  medium:  { bg: '#FFF3E0', text: '#E65100' },
  hard:    { bg: '#FBE9E7', text: '#BF360C' },
  extreme: { bg: '#FFEBEE', text: '#B71C1C' },
};

const PH_GRADIENT: Record<TourDifficulty, string> = {
  easy:    'linear-gradient(135deg,#1a4d2e,#2d7a4f)',
  medium:  'linear-gradient(135deg,#4a2800,#8b5000)',
  hard:    'linear-gradient(135deg,#3d1200,#7a2800)',
  extreme: 'linear-gradient(135deg,#1a0000,#4a0808)',
};

function fmtDate(s: string) {
  return new Date(s).toLocaleDateString('tr-TR', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  });
}

export default async function TourDetailPage({ params }: { params: { id: string } }) {
  const tour = await getTour(params.id);
  if (!tour) notFound();

  const upcoming = tour.dates
    .filter((d) => new Date(d.date) >= new Date())
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const dc = DIFF_COLOR[tour.difficulty];

  return (
    <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", background: '#fff', minHeight: '100vh' }}>

      {/* Navbar */}
      <nav className="navbar">
        <Link href="/" className="logo">Trekly</Link>
        <div className="nav-links">
          <Link href="/turlar" className="nav-link">← Tüm Turlar</Link>
          <a href={AGENCY_URL} target="_blank" rel="noopener noreferrer" className="nav-cta">Acenta Ol</a>
        </div>
      </nav>

      {/* Hero photo */}
      <div style={{ position: 'relative', height: '420px', background: PH_GRADIENT[tour.difficulty] }}>
        {tour.photo_urls[0] && (
          <Image src={tour.photo_urls[0]} alt={tour.name} fill priority style={{ objectFit: 'cover', objectPosition: 'center 40%' }} />
        )}
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.55) 0%, transparent 55%)' }} />
      </div>

      {/* Extra photos strip */}
      {tour.photo_urls.length > 1 && (
        <div style={{ background: '#111', display: 'flex', gap: '3px', padding: '3px', overflowX: 'auto' }}>
          {tour.photo_urls.slice(1, 6).map((url, i) => (
            <div key={i} style={{ flexShrink: 0, position: 'relative', width: '110px', height: '65px', borderRadius: '4px', overflow: 'hidden' }}>
              <Image src={url} alt="" fill style={{ objectFit: 'cover' }} />
            </div>
          ))}
        </div>
      )}

      {/* Body */}
      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '40px 40px 80px', display: 'grid', gridTemplateColumns: '1fr 360px', gap: '48px', alignItems: 'start' }}>

        {/* Left */}
        <div>
          <span style={{ display: 'inline-block', background: dc.bg, color: dc.text, borderRadius: '6px', padding: '4px 12px', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '14px' }}>
            {DIFF_LABEL[tour.difficulty]}
          </span>

          <h1 style={{ fontSize: 'clamp(1.6rem, 3vw, 2.4rem)', fontWeight: 800, color: '#1A1A1A', letterSpacing: '-0.03em', lineHeight: 1.2, marginBottom: '10px' }}>
            {tour.name}
          </h1>

          <p style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.9rem', color: '#5A5A5A', marginBottom: '28px' }}>
            <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            {tour.location_name}
          </p>

          {/* Stats */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '32px' }}>
            {[
              { icon: '⛰', label: 'İrtifa', val: `${tour.altitude_meters.toLocaleString()}m` },
              { icon: '📏', label: 'Mesafe', val: `${Number(tour.distance_km).toFixed(1)}km` },
              { icon: '👥', label: 'Max Kişi', val: `${tour.max_participants}` },
              { icon: '⭐', label: 'Puan', val: `${tour.points} pt`, accent: true },
            ].map((s) => (
              <div key={s.label} style={{ background: '#F7F7F7', borderRadius: '10px', padding: '16px 12px', textAlign: 'center' }}>
                <div style={{ fontSize: '1.2rem', marginBottom: '4px' }}>{s.icon}</div>
                <div style={{ fontSize: '0.68rem', color: '#909090', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '4px' }}>{s.label}</div>
                <div style={{ fontSize: '1rem', fontWeight: 700, color: s.accent ? '#FF5533' : '#1A1A1A' }}>{s.val}</div>
              </div>
            ))}
          </div>

          <hr style={{ border: 'none', borderTop: '1px solid #E8E8E8', marginBottom: '28px' }} />

          {tour.description && (
            <>
              <h2 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '14px', letterSpacing: '-0.02em' }}>Tur Hakkında</h2>
              <p style={{ fontSize: '0.95rem', color: '#5A5A5A', lineHeight: 1.8, whiteSpace: 'pre-line' }}>{tour.description}</p>
            </>
          )}
        </div>

        {/* Right sidebar */}
        <div style={{ position: 'sticky', top: '80px' }}>
          <div style={{ border: '1px solid #E8E8E8', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 4px 24px rgba(0,0,0,0.09)' }}>
            <div style={{ padding: '24px', borderBottom: '1px solid #E8E8E8' }}>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '16px' }}>Yaklaşan Turlar</h3>

              {upcoming.length === 0 ? (
                <p style={{ fontSize: '0.875rem', color: '#909090', textAlign: 'center', padding: '20px 0' }}>Yaklaşan tarih yok</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {upcoming.slice(0, 6).map((d) => (
                    <div key={d.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 12px', background: '#F7F7F7', borderRadius: '10px' }}>
                      <div>
                        <div style={{ fontSize: '0.875rem', fontWeight: 600 }}>{fmtDate(d.date)}</div>
                        <div style={{ fontSize: '0.75rem', color: '#909090', marginTop: '2px' }}>
                          {d.available_slots > 0 ? `${d.available_slots} kontenjan kaldı` : 'Doldu'}
                        </div>
                      </div>
                      <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: d.available_slots > 0 ? '#22C55E' : '#EF4444', flexShrink: 0 }} />
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div style={{ padding: '20px 24px', background: '#FFF9F8' }}>
              <p style={{ fontSize: '0.82rem', color: '#5A5A5A', textAlign: 'center', lineHeight: 1.65 }}>
                Rezervasyon için <strong style={{ color: '#1A1A1A' }}>Trekly mobil uygulamasını</strong> indirin.
              </p>
              <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
                {['App Store', 'Google Play'].map((s) => (
                  <div key={s} style={{ flex: 1, padding: '9px', border: '1px solid #E8E8E8', borderRadius: '8px', textAlign: 'center', fontSize: '0.75rem', color: '#5A5A5A', fontWeight: 500, background: 'white' }}>
                    {s}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <footer className="footer">
        <span className="footer-logo">Trekly</span>
        <span className="footer-copy">© {new Date().getFullYear()} Trekly. Tüm hakları saklıdır.</span>
      </footer>
    </div>
  );
}
