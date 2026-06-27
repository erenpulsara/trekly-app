export const dynamic = 'force-dynamic';

import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { getTour, getPublishedTours } from '@/lib/api';
import type { Tour, TourDifficulty } from '@/lib/types';
import BookingForm from './BookingForm';
import CollapsibleSection from './CollapsibleSection';
import PhotoGallery from './PhotoGallery';
import StickyCard from './StickyCard';

const AGENCY_URL = process.env.NEXT_PUBLIC_AGENCY_URL ?? 'https://acenta.treklyapp.com';

// ── Constants (must be before component functions that reference them) ────────

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

// ── Helpers ───────────────────────────────────────────────────────────────────

function fmtDate(s: string) {
  return new Date(s).toLocaleDateString('tr-TR', {
    day: 'numeric', month: 'long', year: 'numeric',
  });
}

function scoreRelated(current: Tour, candidate: Tour): number {
  let score = 0;
  if (candidate.category && current.category && candidate.category === current.category) score += 4;
  const overlap = (current.tags ?? []).filter((t) => (candidate.tags ?? []).includes(t)).length;
  score += overlap * 2;
  if (candidate.difficulty === current.difficulty) score += 1;
  if (candidate.location_name === current.location_name) score += 1;
  return score;
}

// ── Server-component UI helpers ───────────────────────────────────────────────

function InfoRow({ icon, label, value, href }: { icon: React.ReactNode; label: string; value: string; href?: string }) {
  const val = href ? (
    <a href={href} target="_blank" rel="noopener noreferrer" style={{ color: '#FF5533', fontWeight: 700, fontSize: '0.95rem', textDecoration: 'none' }}>{value}</a>
  ) : (
    <span style={{ color: '#FF5533', fontWeight: 700, fontSize: '0.95rem' }}>{value}</span>
  );
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '12px 0', borderBottom: '1px solid #F0F0F0' }}>
      <div style={{ width: '36px', height: '36px', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#555' }}>
        {icon}
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: '0.65rem', color: '#AAAAAA', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '2px' }}>{label}</div>
        {val}
      </div>
    </div>
  );
}

function RelatedTourCard({ tour }: { tour: Tour }) {
  const dc = DIFF_COLOR[tour.difficulty] ?? DIFF_COLOR.easy;
  const photos = tour.photo_urls ?? [];
  const isFull = tour.max_participants <= (tour.booking_count ?? 0);

  return (
    <Link href={`/tours/${tour.id}`} className="related-card" style={{ textDecoration: 'none', color: 'inherit', display: 'block', borderRadius: '14px', border: '1px solid #EFEFEF', overflow: 'hidden', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
      {/* Photo */}
      <div style={{ position: 'relative', height: '180px', background: PH_GRADIENT[tour.difficulty] ?? PH_GRADIENT.easy, overflow: 'hidden' }}>
        {photos[0] && (
          <Image src={photos[0]} alt={tour.name} fill style={{ objectFit: 'cover' }} sizes="300px" />
        )}
        <span style={{ position: 'absolute', top: '10px', left: '10px', background: dc.bg, color: dc.text, borderRadius: '6px', padding: '3px 10px', fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          {DIFF_LABEL[tour.difficulty]}
        </span>
        {isFull && (
          <span style={{ position: 'absolute', top: '10px', right: '10px', background: 'rgba(239,68,68,0.9)', color: 'white', borderRadius: '6px', padding: '3px 10px', fontSize: '0.7rem', fontWeight: 700 }}>
            Doldu
          </span>
        )}
      </div>

      {/* Content */}
      <div style={{ padding: '14px 16px 16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem', color: '#9A9A9A', marginBottom: '6px' }}>
          <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          {tour.location_name}
        </div>
        <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#1A1A1A', lineHeight: 1.3, marginBottom: '10px', overflow: 'hidden', maxHeight: '2.6rem' }}>
          {tour.name}
        </h3>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          {tour.price != null && tour.price > 0 ? (
            <span style={{ color: '#FF5533', fontWeight: 800, fontSize: '0.95rem' }}>
              ₺{Number(tour.price).toLocaleString('tr-TR')}
              <span style={{ fontSize: '0.72rem', fontWeight: 500, color: '#AAAAAA' }}> / kişi</span>
            </span>
          ) : <span />}
          {tour.start_date && (
            <span style={{ fontSize: '0.72rem', color: '#AAAAAA' }}>
              {new Date(tour.start_date).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' })}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default async function TourDetailPage({ params }: { params: { id: string } }) {
  const [tour, allTours] = await Promise.all([
    getTour(params.id),
    getPublishedTours(),
  ]);
  if (!tour) notFound();

  const relatedTours = allTours
    .filter((t) => t.id !== tour.id)
    .map((t) => ({ tour: t, score: scoreRelated(tour, t) }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 4)
    .map((x) => x.tour);

  const remaining = Math.max(0, tour.max_participants - (tour.booking_count ?? 0));
  const isFull = remaining === 0;
  const dc = DIFF_COLOR[tour.difficulty];

  const statCards: { icon: string; label: string; val: string; bg: string; color: string }[] = [];
  if (tour.altitude_meters != null && tour.altitude_meters > 0) {
    statCards.push({ icon: '⛰', label: 'İrtifa', val: `${tour.altitude_meters.toLocaleString()}m`, bg: '#F7F7F7', color: '#1A1A1A' });
  }
  if (tour.distance_km != null && Number(tour.distance_km) > 0) {
    statCards.push({ icon: '📏', label: 'Mesafe', val: `${Number(tour.distance_km).toFixed(1)}km`, bg: '#F7F7F7', color: '#1A1A1A' });
  }
  statCards.push({ icon: '👥', label: 'Max Kişi', val: `${tour.max_participants}`, bg: '#F7F7F7', color: '#1A1A1A' });
  statCards.push({ icon: '⭐', label: 'Puan', val: `${tour.points} pt`, bg: '#F7F7F7', color: '#FF5533' });
  statCards.push({ icon: '⚡', label: 'Zorluk', val: DIFF_LABEL[tour.difficulty], bg: dc.bg, color: dc.text });

  return (
    <div style={{ background: '#fff', minHeight: '100vh' }}>

      {/* Navbar */}
      <nav className="navbar">
        <Link href="/" className="logo">Trekly</Link>
        <div className="nav-links">
          <Link href="/turlar" className="nav-link">← Tüm Turlar</Link>
          <a href={AGENCY_URL} target="_blank" rel="noopener noreferrer" className="nav-cta">Acenta Ol</a>
        </div>
      </nav>

      {/* ── 2-column layout ── */}
      <div style={{ maxWidth: '1100px', margin: '24px auto 0', padding: '0 40px 80px', display: 'grid', gridTemplateColumns: '1fr 340px', gap: '40px' }}>

        {/* Left column */}
        <div style={{ alignSelf: 'start' }}>
          <PhotoGallery
            photos={tour.photo_urls ?? []}
            tourName={tour.name}
            gradient={PH_GRADIENT[tour.difficulty]}
            height={400}
          />

          <h1 style={{ fontSize: 'clamp(1.4rem, 2.5vw, 2.2rem)', fontWeight: 800, color: '#1A1A1A', letterSpacing: '-0.03em', lineHeight: 1.2, marginBottom: '8px', marginTop: '28px' }}>
            {tour.name}
          </h1>
          <p style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.9rem', color: '#5A5A5A', marginBottom: '28px' }}>
            <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            {tour.location_name}
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(88px, 1fr))', gap: '12px', marginBottom: '32px' }}>
            {statCards.map((s) => (
              <div key={s.label} style={{ background: s.bg, borderRadius: '10px', padding: '16px 12px', textAlign: 'center' }}>
                <div style={{ fontSize: '1.2rem', marginBottom: '4px' }}>{s.icon}</div>
                <div style={{ fontSize: '0.68rem', color: '#909090', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '4px' }}>{s.label}</div>
                <div style={{ fontSize: '1rem', fontWeight: 700, color: s.color }}>{s.val}</div>
              </div>
            ))}
          </div>

          <hr style={{ border: 'none', borderTop: '1px solid #E8E8E8', marginBottom: '28px' }} />

          {tour.description && <CollapsibleSection title="Tur Hakkında" content={tour.description} />}
          {tour.program && <CollapsibleSection title="Program" content={tour.program} />}
          {tour.meeting_points && <CollapsibleSection title="Buluşma Noktaları" content={tour.meeting_points} />}
          {tour.accommodation && <CollapsibleSection title="Konaklama" content={tour.accommodation} />}
          {tour.transportation && <CollapsibleSection title="Ulaşım" content={tour.transportation} />}
          {tour.important_notes && <CollapsibleSection title="Önemli Notlar" content={tour.important_notes} />}
        </div>

        {/* Right column */}
        <StickyCard>
          <div style={{ border: '1px solid #E8E8E8', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 4px 24px rgba(0,0,0,0.09)', padding: '0 20px' }}>

              {(tour.organizer || (tour as any).agency_name) && (
                <InfoRow
                  icon={<svg width="28" height="28" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>}
                  label="Düzenleyen"
                  value={tour.organizer || (tour as any).agency_name}
                />
              )}
              {tour.tursab_no && (
                <InfoRow
                  icon={<svg width="28" height="28" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0" /></svg>}
                  label="TURSAB"
                  value={tour.tursab_no}
                />
              )}
              {tour.guide_name && (
                <InfoRow
                  icon={<svg width="28" height="28" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>}
                  label="Rehber"
                  value={tour.guide_name}
                  href={(tour as any).guide_instagram || undefined}
                />
              )}
              <InfoRow
                icon={<svg width="28" height="28" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>}
                label="Kapasite"
                value={`${tour.max_participants} Kişi`}
              />
              {tour.start_date && (
                <InfoRow
                  icon={<svg width="28" height="28" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>}
                  label="Başlangıç Tarihi"
                  value={fmtDate(tour.start_date)}
                />
              )}
              {tour.end_date && (
                <InfoRow
                  icon={<svg width="28" height="28" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>}
                  label="Bitiş Tarihi"
                  value={fmtDate(tour.end_date)}
                />
              )}
              {tour.meeting_points && (
                <InfoRow
                  icon={<svg width="28" height="28" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>}
                  label="Buluşma Noktası"
                  value={tour.meeting_points}
                />
              )}
              {tour.target_location && (
                <InfoRow
                  icon={<svg width="28" height="28" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>}
                  label="Hedef Lokasyon"
                  value={tour.target_location}
                />
              )}
              {tour.contact_phone && (
                <InfoRow
                  icon={<svg width="28" height="28" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.948V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>}
                  label="İrtibat No"
                  value={tour.contact_phone}
                  href={`tel:${tour.contact_phone}`}
                />
              )}
              {tour.price != null && tour.price > 0 && (
                <InfoRow
                  icon={<svg width="28" height="28" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>}
                  label="Ücret"
                  value={`₺${Number(tour.price).toLocaleString('tr-TR')} / kişi`}
                />
              )}

              {/* Kontenjan bar */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '12px 0', borderBottom: '1px solid #F0F0F0' }}>
                <div style={{ width: '36px', height: '36px', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#555' }}>
                  <svg width="28" height="28" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '0.65rem', color: '#AAAAAA', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '5px' }}>Kontenjan</div>
                  <div style={{ height: '5px', background: '#E8E8E8', borderRadius: '3px', overflow: 'hidden', marginBottom: '5px' }}>
                    <div style={{ height: '100%', borderRadius: '3px', background: isFull ? '#EF4444' : '#FF5533', width: `${Math.min(100, ((tour.max_participants - remaining) / tour.max_participants) * 100)}%` }} />
                  </div>
                  <span style={{ color: isFull ? '#EF4444' : '#FF5533', fontWeight: 700, fontSize: '0.9rem' }}>
                    {isFull ? 'Doldu' : `${remaining} yer kaldı`}
                  </span>
                  <span style={{ fontSize: '0.72rem', color: '#AAAAAA', marginLeft: '6px' }}>({tour.max_participants - remaining}/{tour.max_participants})</span>
                </div>
              </div>

              <div style={{ padding: '16px 0' }}>
                <BookingForm
                  tourId={tour.id}
                  maxParticipants={tour.max_participants}
                  isFull={isFull}
                  price={tour.price}
                />
              </div>
            </div>
        </StickyCard>
      </div>

      {/* İlginizi Çekebilir */}
      {relatedTours.length > 0 && (
        <section style={{ background: '#FAFAFA', padding: '56px 0' }}>
          <style>{`
            .related-card { transition: transform 0.18s ease, box-shadow 0.18s ease; }
            .related-card:hover { transform: translateY(-4px); box-shadow: 0 10px 28px rgba(0,0,0,0.13) !important; }
          `}</style>
          <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '0 40px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '28px' }}>
              <div>
                <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#1A1A1A', letterSpacing: '-0.02em', margin: 0 }}>
                  İlginizi Çekebilir
                </h2>
                <p style={{ fontSize: '0.85rem', color: '#9A9A9A', marginTop: '4px', marginBottom: 0 }}>
                  Benzer turlar ve öneriler
                </p>
              </div>
              <Link href="/turlar" style={{ fontSize: '0.85rem', fontWeight: 700, color: '#FF5533', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px' }}>
                Tüm Turlar
                <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '20px' }}>
              {relatedTours.map((t) => (
                <RelatedTourCard key={t.id} tour={t} />
              ))}
            </div>
          </div>
        </section>
      )}

      <footer className="footer">
        <span className="footer-logo">Trekly</span>
        <span className="footer-copy">© {new Date().getFullYear()} Trekly. Tüm hakları saklıdır.</span>
      </footer>
    </div>
  );
}
