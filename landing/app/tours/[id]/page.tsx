export const dynamic = 'force-dynamic';

import { notFound } from 'next/navigation';
import SiteFooter from '@/app/components/SiteFooter';
import Link from 'next/link';
import Image from 'next/image';
import { getTour, getPublishedTours } from '@/lib/api';
import { splitCategories } from '@/lib/category-utils';
import type { Tour, TourDifficulty } from '@/lib/types';
import PhotoGallery from './PhotoGallery';
import StickyCard from './StickyCard';
import TourTabs from './TourTabs';
import TourRightCard from './TourRightCard';
import TourActions from './TourActions';

const AGENCY_URL = process.env.NEXT_PUBLIC_AGENCY_URL ?? 'https://acenta.treklyapp.com';

const DIFF_LABEL: Record<TourDifficulty, string> = {
  easy:        'Kolay',
  easy_medium: 'Kolay-Orta',
  medium:      'Orta',
  medium_hard: 'Orta-Zor',
  hard:        'Zor',
  very_hard:   'Çok Zor',
  extreme:     'Ekstrem',
};

const DIFF_COLOR: Record<TourDifficulty, { bg: string; text: string }> = {
  easy:        { bg: '#E8F5E9', text: '#2E7D32' },
  easy_medium: { bg: '#F1F8E9', text: '#558B2F' },
  medium:      { bg: '#FFF3E0', text: '#E65100' },
  medium_hard: { bg: '#FFF8E1', text: '#F57F17' },
  hard:        { bg: '#FBE9E7', text: '#BF360C' },
  very_hard:   { bg: '#FCE4EC', text: '#880E4F' },
  extreme:     { bg: '#FFEBEE', text: '#B71C1C' },
};

const PH_GRADIENT: Record<TourDifficulty, string> = {
  easy:        'linear-gradient(135deg,#1a4d2e,#2d7a4f)',
  easy_medium: 'linear-gradient(135deg,#2d5a1f,#4a8a3f)',
  medium:      'linear-gradient(135deg,#4a2800,#8b5000)',
  medium_hard: 'linear-gradient(135deg,#5a3000,#9a6000)',
  hard:        'linear-gradient(135deg,#3d1200,#7a2800)',
  very_hard:   'linear-gradient(135deg,#2d0030,#600060)',
  extreme:     'linear-gradient(135deg,#1a0000,#4a0808)',
};

function scoreRelated(current: Tour, candidate: Tour): number {
  let score = 0;
  if (candidate.category && current.category && candidate.category === current.category) score += 4;
  const overlap = (current.tags ?? []).filter((t) => (candidate.tags ?? []).includes(t)).length;
  score += overlap * 2;
  if (candidate.difficulty === current.difficulty) score += 1;
  if (candidate.location_name === current.location_name) score += 1;
  return score;
}

function RelatedTourCard({ tour }: { tour: Tour }) {
  const dc = DIFF_COLOR[tour.difficulty] ?? DIFF_COLOR.easy;
  const photos = tour.photo_urls ?? [];
  const isFull = tour.max_participants <= (tour.booking_count ?? 0);

  return (
    <Link href={`/tours/${tour.id}`} className="related-card" style={{ textDecoration: 'none', color: 'inherit', display: 'block', borderRadius: '16px', border: '1px solid #EFEFEF', overflow: 'hidden', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
      <div style={{ position: 'relative', height: '200px', background: PH_GRADIENT[tour.difficulty] ?? PH_GRADIENT.easy, overflow: 'hidden' }}>
        {photos[0] && (
          <Image src={photos[0]} alt={tour.name} fill style={{ objectFit: 'cover' }} sizes="320px" />
        )}
        <span style={{ position: 'absolute', top: '10px', left: '10px', background: dc.bg, color: dc.text, borderRadius: '6px', padding: '3px 10px', fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          {DIFF_LABEL[tour.difficulty]}
        </span>
        {isFull && (
          <span style={{ position: 'absolute', top: '10px', right: '10px', background: 'rgba(239,68,68,0.9)', color: 'white', borderRadius: '6px', padding: '3px 10px', fontSize: '0.68rem', fontWeight: 700 }}>
            Doldu
          </span>
        )}
        {splitCategories(tour.category).length > 0 && (
          <div style={{ position: 'absolute', bottom: '10px', left: '10px', display: 'flex', gap: '5px', flexWrap: 'wrap', maxWidth: 'calc(100% - 20px)' }}>
            {splitCategories(tour.category).map((cat) => (
              <span key={cat} style={{ background: 'rgba(0,0,0,0.55)', color: 'white', borderRadius: '6px', padding: '3px 10px', fontSize: '0.65rem', fontWeight: 600, backdropFilter: 'blur(4px)' }}>
                {cat}
              </span>
            ))}
          </div>
        )}
      </div>
      <div style={{ padding: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem', color: '#9A9A9A', marginBottom: '6px' }}>
          <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          {tour.location_name}
        </div>
        <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#1A1A1A', lineHeight: 1.3, margin: '0 0 10px', overflow: 'hidden', maxHeight: '2.6rem' }}>
          {tour.name}
        </h3>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          {tour.price != null && tour.price > 0 ? (
            <span style={{ color: '#FF5533', fontWeight: 800, fontSize: '0.95rem' }}>
              ₺{Number(tour.price).toLocaleString('tr-TR')}
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

  return (
    <div style={{ background: '#fff', minHeight: '100vh' }}>
      <style>{`
        .td-grid { display: grid; grid-template-columns: 1fr 340px; gap: 40px; max-width: 1100px; margin: 24px auto 0; padding: 0 40px 80px; }
        @media (max-width: 768px) {
          .td-grid { grid-template-columns: 1fr !important; padding: 0 16px 60px !important; gap: 24px !important; }
          .navbar { padding: 0 16px !important; }
          .td-related-pad { padding: 40px 16px !important; }
        }
        .related-card { transition: transform 0.18s ease, box-shadow 0.18s ease; }
        .related-card:hover { transform: translateY(-4px); box-shadow: 0 10px 28px rgba(0,0,0,0.13) !important; }
      `}</style>

      {/* Navbar */}
      <nav className="navbar">
        <Link href="/anasayfa" className="logo">Trekly</Link>
        <div className="nav-links">
          <Link href="/etkinlikler" className="nav-link">← Etkinlikler</Link>
          <a href={AGENCY_URL} target="_blank" rel="noopener noreferrer" className="nav-cta">Acenta Ol</a>
        </div>
      </nav>

      {/* 2-column layout */}
      <div className="td-grid">

        {/* ── Left column ── */}
        <div style={{ alignSelf: 'start' }}>

          {/* Başlık */}
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px', margin: '0 0 16px' }}>
            <h1 style={{
              fontSize: 'clamp(1.4rem, 2.6vw, 2rem)',
              fontWeight: 800, color: '#1A1A1A',
              letterSpacing: '-0.03em', lineHeight: 1.2,
              margin: 0,
            }}>
              {tour.name}
            </h1>
            <TourActions tourId={tour.id} tourName={tour.name} />
          </div>

          {/* Galeri */}
          <PhotoGallery
            photos={tour.photo_urls ?? []}
            tourName={tour.name}
            gradient={PH_GRADIENT[tour.difficulty]}
            height={420}
          />

          {/* Rozetler — galeri altında */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: '14px 0 24px', flexWrap: 'wrap' }}>
            {splitCategories(tour.category).map((cat) => (
              <span key={cat} style={{
                background: '#FFF4F1', color: '#FF5533',
                fontSize: '0.66rem', fontWeight: 700,
                padding: '4px 12px', borderRadius: '20px',
                textTransform: 'uppercase', letterSpacing: '0.06em',
                border: '1px solid rgba(255,85,51,0.25)',
              }}>
                {cat}
              </span>
            ))}
            <span style={{
              background: dc.bg, color: dc.text,
              fontSize: '0.66rem', fontWeight: 700,
              padding: '4px 12px', borderRadius: '20px',
              textTransform: 'uppercase', letterSpacing: '0.06em',
            }}>
              {DIFF_LABEL[tour.difficulty]}
            </span>
            {tour.location_name && (
              <span style={{
                display: 'inline-flex', alignItems: 'center', gap: '4px',
                background: '#F0F9FF', color: '#0369A1',
                fontSize: '0.66rem', fontWeight: 700,
                padding: '4px 12px', borderRadius: '20px',
                textTransform: 'uppercase', letterSpacing: '0.06em',
                border: '1px solid rgba(3,105,161,0.2)',
              }}>
                <svg width="10" height="10" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
                </svg>
                {tour.location_name}
              </span>
            )}
          </div>

          {/* Tab sections */}
          <TourTabs tabs={[
            { label: 'Tur Programı',  content: tour.program },
            {
              label: 'Konaklama',
              content: tour.accommodation,
              link: tour.accommodation_url
                ? { url: tour.accommodation_url, label: 'Oteli Görüntüle' }
                : null,
            },
            { label: 'Ulaşım',        content: tour.transportation },
            { label: 'Önemli Notlar', content: tour.important_notes },
          ]} />
        </div>

        {/* ── Right column ── */}
        <StickyCard>
          <TourRightCard
            tour={{
              id: tour.id,
              organizer: tour.organizer,
              agency_name: (tour as any).agency_name,
              difficulty_label: DIFF_LABEL[tour.difficulty],
              tursab_no: tour.tursab_no,
              guide_name: tour.guide_name,
              guide_instagram: (tour as any).guide_instagram,
              max_participants: tour.max_participants,
              booking_count: tour.booking_count,
              start_date: tour.start_date,
              end_date: tour.end_date,
              meeting_points: tour.meeting_points,
              target_location: tour.target_location,
              contact_phone: tour.contact_phone,
              price: tour.price,
              price_currency: tour.price_currency,
            }}
            isFull={isFull}
            remaining={remaining}
          />
        </StickyCard>
      </div>

      {/* İlginizi Çekebilir */}
      {relatedTours.length > 0 && (
        <section style={{ background: '#FAFAFA', padding: '56px 0' }}>
          <div className="td-related-pad" style={{ maxWidth: '1100px', margin: '0 auto', padding: '0 40px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '28px' }}>
              <div>
                <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#1A1A1A', letterSpacing: '-0.02em', margin: 0 }}>
                  İlginizi Çekebilir
                </h2>
                <p style={{ fontSize: '0.85rem', color: '#9A9A9A', marginTop: '4px', marginBottom: 0 }}>
                  Benzer turlar ve öneriler
                </p>
              </div>
              <Link href="/etkinlikler" style={{ fontSize: '0.85rem', fontWeight: 700, color: '#FF5533', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px' }}>
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

      <SiteFooter />
    </div>
  );
}
