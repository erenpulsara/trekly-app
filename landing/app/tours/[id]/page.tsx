export const dynamic = 'force-dynamic';

import type { ReactNode } from 'react';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { getTour } from '@/lib/api';
import type { TourDifficulty } from '@/lib/types';
import BookingForm from './BookingForm';

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
    day: 'numeric', month: 'long', year: 'numeric',
  });
}

function DetailSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div style={{ marginBottom: '28px' }}>
      <h2 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '12px', letterSpacing: '-0.02em', color: '#1A1A1A' }}>{title}</h2>
      <hr style={{ border: 'none', borderTop: '1px solid #F0F0F0', marginBottom: '14px' }} />
      {children}
    </div>
  );
}

function SidebarRow({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '7px 0', borderBottom: '1px solid #F5F5F5' }}>
      <span style={{ fontSize: '0.75rem', color: '#AAAAAA', fontWeight: 600 }}>{label}</span>
      <span style={{ fontSize: '0.82rem', color: '#1A1A1A', fontWeight: 500 }}>{value}</span>
    </div>
  );
}

export default async function TourDetailPage({ params }: { params: { id: string } }) {
  const tour = await getTour(params.id);
  if (!tour) notFound();

  const remaining = Math.max(0, tour.max_participants - (tour.booking_count ?? 0));
  const isFull = remaining === 0;

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
              (tour.altitude_meters != null && tour.altitude_meters > 0)
                ? { icon: '⛰', label: 'İrtifa', val: `${tour.altitude_meters.toLocaleString()}m` }
                : null,
              (tour.distance_km != null && Number(tour.distance_km) > 0)
                ? { icon: '📏', label: 'Mesafe', val: `${Number(tour.distance_km).toFixed(1)}km` }
                : null,
              { icon: '👥', label: 'Max Kişi', val: `${tour.max_participants}` },
              { icon: '⭐', label: 'Puan', val: `${tour.points} pt`, accent: true },
            ].filter(Boolean).map((s) => (
              <div key={s!.label} style={{ background: '#F7F7F7', borderRadius: '10px', padding: '16px 12px', textAlign: 'center' }}>
                <div style={{ fontSize: '1.2rem', marginBottom: '4px' }}>{s!.icon}</div>
                <div style={{ fontSize: '0.68rem', color: '#909090', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '4px' }}>{s!.label}</div>
                <div style={{ fontSize: '1rem', fontWeight: 700, color: s!.accent ? '#FF5533' : '#1A1A1A' }}>{s!.val}</div>
              </div>
            ))}
          </div>

          <hr style={{ border: 'none', borderTop: '1px solid #E8E8E8', marginBottom: '28px' }} />

          {tour.description && (
            <DetailSection title="Tur Hakkında">
              <p style={{ fontSize: '0.95rem', color: '#5A5A5A', lineHeight: 1.8, whiteSpace: 'pre-line', margin: 0 }}>{tour.description}</p>
            </DetailSection>
          )}

          {tour.program && (
            <DetailSection title="Program">
              <p style={{ fontSize: '0.92rem', color: '#5A5A5A', lineHeight: 1.8, whiteSpace: 'pre-line', margin: 0 }}>{tour.program}</p>
            </DetailSection>
          )}

          {tour.meeting_points && (
            <DetailSection title="Buluşma Noktaları">
              <p style={{ fontSize: '0.92rem', color: '#5A5A5A', lineHeight: 1.75, whiteSpace: 'pre-line', margin: 0 }}>{tour.meeting_points}</p>
            </DetailSection>
          )}

          {tour.accommodation && (
            <DetailSection title="Konaklama">
              <p style={{ fontSize: '0.92rem', color: '#5A5A5A', lineHeight: 1.75, whiteSpace: 'pre-line', margin: 0 }}>{tour.accommodation}</p>
            </DetailSection>
          )}

          {tour.transportation && (
            <DetailSection title="Ulaşım">
              <p style={{ fontSize: '0.92rem', color: '#5A5A5A', lineHeight: 1.75, whiteSpace: 'pre-line', margin: 0 }}>{tour.transportation}</p>
            </DetailSection>
          )}

          {tour.important_notes && (
            <DetailSection title="Önemli Notlar">
              <p style={{ fontSize: '0.92rem', color: '#5A5A5A', lineHeight: 1.75, whiteSpace: 'pre-line', margin: 0 }}>{tour.important_notes}</p>
            </DetailSection>
          )}
        </div>

        {/* Right sidebar */}
        <div style={{ position: 'sticky', top: '80px', display: 'flex', flexDirection: 'column', gap: '16px' }}>

          {/* Fiyat + Kapasite */}
          <div style={{ border: '1px solid #E8E8E8', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 4px 24px rgba(0,0,0,0.09)' }}>
            <div style={{ padding: '24px' }}>

              {/* Fiyat */}
              {tour.price != null && tour.price > 0 && (
                <div style={{ marginBottom: '20px' }}>
                  <span style={{ fontSize: '0.7rem', color: '#AAAAAA', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 700 }}>Fiyat</span>
                  <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#FF5533', letterSpacing: '-0.03em', lineHeight: 1.1 }}>
                    ₺{Number(tour.price).toLocaleString('tr-TR')}
                    <span style={{ fontSize: '0.82rem', fontWeight: 500, color: '#AAAAAA', marginLeft: '4px' }}>/ kişi</span>
                  </div>
                </div>
              )}

              {/* Tarih aralığı */}
              {(tour.start_date || tour.end_date) && (
                <div style={{ background: '#F7F7F7', borderRadius: '10px', padding: '14px 16px', marginBottom: '16px' }}>
                  <span style={{ fontSize: '0.65rem', color: '#AAAAAA', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 700, display: 'block', marginBottom: '6px' }}>Tarih</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                    {tour.start_date && (
                      <span style={{ fontSize: '0.9rem', fontWeight: 700, color: '#1A1A1A' }}>{fmtDate(tour.start_date)}</span>
                    )}
                    {tour.start_date && tour.end_date && (
                      <span style={{ color: '#AAAAAA', fontSize: '0.85rem' }}>→</span>
                    )}
                    {tour.end_date && (
                      <span style={{ fontSize: '0.9rem', fontWeight: 700, color: '#1A1A1A' }}>{fmtDate(tour.end_date)}</span>
                    )}
                  </div>
                </div>
              )}

              {/* Kapasite */}
              <div style={{ background: isFull ? '#FFF0F0' : '#F0FFF4', borderRadius: '10px', padding: '14px 16px', marginBottom: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ fontSize: '0.65rem', color: '#AAAAAA', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 700 }}>Kontenjan</span>
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, color: isFull ? '#EF4444' : '#16A34A' }}>
                    {isFull ? 'Doldu' : `${remaining} yer kaldı`}
                  </span>
                </div>
                {/* Progress bar */}
                <div style={{ height: '6px', background: '#E8E8E8', borderRadius: '3px', overflow: 'hidden' }}>
                  <div style={{
                    height: '100%',
                    borderRadius: '3px',
                    background: isFull ? '#EF4444' : remaining <= 3 ? '#F97316' : '#22C55E',
                    width: `${Math.min(100, ((tour.max_participants - remaining) / tour.max_participants) * 100)}%`,
                    transition: 'width 0.4s ease',
                  }} />
                </div>
                <div style={{ fontSize: '0.72rem', color: '#AAAAAA', marginTop: '6px' }}>
                  {tour.max_participants - remaining} / {tour.max_participants} kişi
                </div>
              </div>

              {/* Booking form */}
              <BookingForm
                tourId={tour.id}
                maxParticipants={tour.max_participants}
                isFull={isFull}
                price={tour.price}
              />
            </div>
          </div>

          {/* Rehber bilgisi */}
          {(tour.guide_name || tour.tursab_no || tour.contact_phone) && (
            <div style={{ border: '1px solid #E8E8E8', borderRadius: '16px', padding: '20px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
              <h3 style={{ fontSize: '0.85rem', fontWeight: 700, color: '#1A1A1A', marginBottom: '14px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Rehber Bilgisi</h3>
              {tour.guide_name && <SidebarRow label="Rehber" value={tour.guide_name} />}
              {tour.tursab_no && <SidebarRow label="TURSAB No" value={tour.tursab_no} />}
              {tour.contact_phone && <SidebarRow label="İletişim" value={tour.contact_phone} />}
              {tour.target_location && <SidebarRow label="Hedef" value={tour.target_location} />}
            </div>
          )}
        </div>
      </div>

      <footer className="footer">
        <span className="footer-logo">Trekly</span>
        <span className="footer-copy">© {new Date().getFullYear()} Trekly. Tüm hakları saklıdır.</span>
      </footer>
    </div>
  );
}
