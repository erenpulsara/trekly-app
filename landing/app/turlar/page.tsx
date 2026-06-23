import { cookies } from 'next/headers';
import { Suspense } from 'react';
import { getPublishedTours } from '@/lib/api';
import LandingNav from '../landing-nav';
import Image from 'next/image';
import Link from 'next/link';
import type { Tour } from '@/lib/types';
import { T, type Lang } from '@/lib/i18n';
import TurlarSearchBar from './TurlarSearchBar';
import TurlarCategories from './TurlarCategories';

export const dynamic = 'force-dynamic';

const AGENCY_URL = process.env.NEXT_PUBLIC_AGENCY_URL ?? 'https://acenta.treklyapp.com';

const CATEGORY_PHOTOS: Record<string, string> = {
  'trekking':          'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80',
  'dağcılık':          'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800&q=80',
  'kano':              'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800&q=80',
  'rafting':           'https://images.unsplash.com/photo-1530866495561-507c9faab2ed?w=800&q=80',
  'bisiklet':          'https://images.unsplash.com/photo-1571188654248-7a89213915f7?w=800&q=80',
  'kamp':              'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=800&q=80',
  'dalış':             'https://images.unsplash.com/photo-1682687982502-1529b3b33f85?w=800&q=80',
  'yamaç paraşütü':    'https://images.unsplash.com/photo-1503220317375-aaad61436b1b?w=800&q=80',
  '_default':          'https://images.unsplash.com/photo-1551632811-561732d1e306?w=800&q=80',
};

function getCardPhoto(tour: Tour): string {
  if (tour.photo_urls[0]) return tour.photo_urls[0];
  if (tour.category && CATEGORY_PHOTOS[tour.category]) return CATEGORY_PHOTOS[tour.category];
  return CATEGORY_PHOTOS['_default'];
}

function fmtDate(s: string, locale: string) {
  return new Date(s).toLocaleDateString(locale, { day: 'numeric', month: 'short', year: 'numeric' });
}

function fmtPrice(price: number | null | undefined, free: string, perPerson: string) {
  if (!price || price === 0) return free;
  return `₺${price.toLocaleString('tr-TR')} ${perPerson}`;
}

export default async function TurlarPage({
  searchParams,
}: {
  searchParams?: {
    category?: string;
    location?: string;
    start_date?: string;
    showAll?: string;
  };
}) {
  const lang: Lang = cookies().get('lang')?.value === 'en' ? 'en' : 'tr';
  const tx = T[lang];
  const tt = tx.tours;
  const tp = tx.principles;

  const activeCategory = searchParams?.category ?? '';
  const activeLocation = searchParams?.location ?? '';
  const activeDate     = searchParams?.start_date ?? '';
  const showAll        = searchParams?.showAll === 'true';

  const allTours = await getPublishedTours({
    category:   activeCategory || undefined,
    location:   activeLocation || undefined,
    start_date: activeDate || undefined,
  });

  const displayed = showAll ? allTours : allTours.slice(0, 9);

  return (
    <>
      <style>{`
        .tr-card {
          border-radius: 16px;
          overflow: hidden;
          background: white;
          box-shadow: 0 2px 16px rgba(0,0,0,0.07);
          text-decoration: none;
          color: inherit;
          transition: transform 0.22s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.22s;
          display: flex;
          flex-direction: column;
        }
        .tr-card:hover {
          transform: translateY(-6px);
          box-shadow: 0 20px 56px rgba(0,0,0,0.14);
        }
        .tr-thumb { transition: transform 0.5s ease; }
        .tr-card:hover .tr-thumb { transform: scale(1.06); }
        .detail-btn {
          display: inline-block;
          border: 1.5px solid #FF5533;
          color: #FF5533;
          font-size: 0.78rem;
          font-weight: 700;
          padding: 7px 16px;
          border-radius: 8px;
          text-decoration: none;
          transition: background 0.15s, color 0.15s;
        }
        .detail-btn:hover {
          background: #FF5533;
          color: white;
        }
        .tr-all-btn {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          background: #FF5533;
          color: white;
          font-size: 0.9rem;
          font-weight: 700;
          padding: 14px 40px;
          border-radius: 100px;
          text-decoration: none;
          letter-spacing: 0.02em;
          transition: background 0.15s, transform 0.2s cubic-bezier(0.34,1.56,0.64,1);
        }
        .tr-all-btn:hover { background: #E64420; transform: translateY(-2px); }
        @media (max-width: 960px) {
          .tr-grid { grid-template-columns: repeat(2, 1fr) !important; }
          .principles-grid { grid-template-columns: 1fr !important; }
          .tr-page-pad { padding: 48px 24px !important; }
          .searchbar-wrap { padding: 0 24px !important; }
          .footer-inner { flex-direction: column !important; gap: 20px !important; align-items: flex-start !important; }
        }
        @media (max-width: 560px) {
          .tr-grid { grid-template-columns: 1fr !important; }
        }
        .footer-social {
          color: rgba(255,255,255,0.45);
          text-decoration: none;
          font-size: 0.8rem;
          font-weight: 600;
          transition: color 0.15s;
        }
        .footer-social:hover { color: white; }
      `}</style>

      <LandingNav />

      {/* Hero bar */}
      <div style={{
        backgroundImage: 'linear-gradient(rgba(0,0,0,0.62) 0%, rgba(0,0,0,0.75) 100%), url("https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1600&q=80")',
        backgroundSize: 'cover',
        backgroundPosition: 'center 40%',
        paddingTop: '88px',
        paddingBottom: '32px',
      }}>
        <div className="searchbar-wrap" style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 48px' }}>
          <p style={{ fontSize: '0.62rem', fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#FF5533', margin: '0 0 10px' }}>
            {tt.eyebrow}
          </p>
          <h1 style={{
            fontFamily: '"Cormorant Garamond", serif',
            fontSize: 'clamp(1.8rem, 3vw, 2.6rem)',
            fontWeight: 400,
            color: 'white',
            letterSpacing: '-0.02em',
            margin: '0 0 28px',
          }}>
            {tt.heading}
          </h1>
          <Suspense>
            <TurlarSearchBar labels={{
              searchDate:     tt.searchDate,
              searchLocation: tt.searchLocation,
              searchCategory: tt.searchCategory,
              searchBtn:      tt.searchBtn,
              allCategories:  tt.allCategories,
            }} />
          </Suspense>
        </div>
      </div>

      {/* Category row */}
      <div style={{ background: 'white', borderBottom: '1px solid #EAEAEA', padding: '20px 48px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <Suspense>
            <TurlarCategories activeCategory={activeCategory} />
          </Suspense>
        </div>
      </div>

      {/* Tour grid */}
      <section className="tr-page-pad" style={{ background: '#FAFAFA', padding: '56px 48px 80px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '28px', flexWrap: 'wrap', gap: '12px' }}>
            <h2 style={{ fontFamily: '"Cormorant Garamond", serif', fontSize: 'clamp(1.4rem, 2.5vw, 1.9rem)', fontWeight: 400, color: '#1A1A1A', margin: 0 }}>
              {tt.upcomingTitle}
            </h2>
            <p style={{ fontSize: '0.82rem', color: '#9A9A9A', margin: 0 }}>
              {tt.found(allTours.length)}
            </p>
          </div>

          {displayed.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '80px 0' }}>
              <p style={{ fontSize: '1.1rem', color: '#9A9A9A', marginBottom: '16px' }}>{tt.empty}</p>
              <Link href="/turlar" style={{ fontSize: '0.9rem', color: '#FF5533', textDecoration: 'none', fontWeight: 600 }}>
                {tt.seeAllLink}
              </Link>
            </div>
          ) : (
            <>
              <div className="tr-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px' }}>
                {displayed.map((tour) => {
                  const photo = getCardPhoto(tour);
                  return (
                    <Link key={tour.id} href={`/tours/${tour.id}`} className="tr-card">
                      {/* Photo */}
                      <div style={{ position: 'relative', height: '220px', overflow: 'hidden', background: '#C8C8C8', flexShrink: 0 }}>
                        <Image
                          src={photo}
                          alt={tour.name}
                          fill
                          className="tr-thumb"
                          sizes="(max-width: 960px) 50vw, 33vw"
                          style={{ objectFit: 'cover' }}
                        />
                        {tour.category && (
                          <span style={{
                            position: 'absolute',
                            top: '12px',
                            left: '12px',
                            background: '#FF5533',
                            color: 'white',
                            fontSize: '0.65rem',
                            fontWeight: 700,
                            padding: '3px 10px',
                            borderRadius: '6px',
                            letterSpacing: '0.04em',
                            textTransform: 'uppercase',
                          }}>
                            {tour.category}
                          </span>
                        )}
                      </div>

                      {/* Content */}
                      <div style={{ padding: '16px 18px 18px', flex: 1, display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        <h3 style={{
                          fontSize: '0.95rem',
                          fontWeight: 700,
                          color: '#1A1A1A',
                          margin: 0,
                          lineHeight: 1.35,
                          overflow: 'hidden',
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                        } as React.CSSProperties}>
                          {tour.name}
                        </h3>

                        <div style={{ height: '1px', background: '#F0F0F0' }} />

                        {/* Info grid */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px 12px' }}>
                          <InfoRow icon="⛰️" label={tt.altitude} value={`${tour.altitude_meters.toLocaleString()}m`} />
                          <InfoRow icon="📍" label={tt.location} value={tour.location_name} />
                          <InfoRow icon="📏" label={tt.distance} value={`${Number(tour.distance_km).toFixed(1)} km`} />
                          {(tour.start_date || tour.end_date) && (
                            <InfoRow
                              icon="📅"
                              label={tt.dateRange}
                              value={[
                                tour.start_date ? fmtDate(tour.start_date, tt.locale) : null,
                                tour.end_date   ? fmtDate(tour.end_date,   tt.locale) : null,
                              ].filter(Boolean).join(' – ')}
                            />
                          )}
                          <InfoRow icon="👥" label={tt.quota} value={String(tour.max_participants)} />
                          {tour.price !== undefined && tour.price !== null && (
                            <InfoRow icon="💰" label={tt.price} value={fmtPrice(tour.price, tt.free, tt.perPerson)} orange />
                          )}
                        </div>

                        <div style={{ height: '1px', background: '#F0F0F0' }} />

                        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                          <span className="detail-btn">{tt.detailBtn}</span>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>

              {!showAll && allTours.length > 9 && (
                <div style={{ textAlign: 'center', marginTop: '48px' }}>
                  <Link href={`/turlar?showAll=true${activeCategory ? `&category=${encodeURIComponent(activeCategory)}` : ''}${activeLocation ? `&location=${encodeURIComponent(activeLocation)}` : ''}${activeDate ? `&start_date=${activeDate}` : ''}`} className="tr-all-btn">
                    {tt.seeAllBtn(allTours.length)}
                    <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3"/>
                    </svg>
                  </Link>
                </div>
              )}
            </>
          )}
        </div>
      </section>

      {/* Principles */}
      <section style={{ background: '#F7F7F7', padding: '72px 48px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <p style={{ fontSize: '0.62rem', fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#FF5533', margin: '0 0 10px', textAlign: 'center' }}>
            {tp.title}
          </p>
          <div className="principles-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px', marginTop: '32px' }}>
            {tp.items.map((item) => (
              <div key={item.title} style={{
                background: 'white',
                borderRadius: '16px',
                padding: '32px 28px',
                boxShadow: '0 2px 16px rgba(0,0,0,0.06)',
              }}>
                <div style={{ marginBottom: '20px' }}>{PRINCIPLE_ICONS[item.icon]}</div>
                <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#1A1A1A', margin: '0 0 10px' }}>{item.title}</h3>
                <p style={{ fontSize: '0.85rem', color: '#6A6A6A', margin: 0, lineHeight: 1.6 }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ background: '#1A1A1A', padding: '40px 48px' }}>
        <div className="footer-inner" style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '24px', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Image src="/logo.png" alt="Trekly" width={22} height={22} style={{ objectFit: 'contain' }} />
            <span style={{ fontSize: '1rem', fontWeight: 800, color: '#FF5533', letterSpacing: '-0.04em' }}>Trekly</span>
          </div>

          <div style={{ display: 'flex', gap: '24px', alignItems: 'center', flexWrap: 'wrap' }}>
            <Link href="/privacy"    style={footerLink}>{tx.footer.privacy}</Link>
            <Link href="/terms"      style={footerLink}>{tx.footer.terms}</Link>
            <Link href="/hakkimizda" style={footerLink}>{tx.footer.about}</Link>
            <a href={AGENCY_URL} target="_blank" rel="noopener noreferrer" style={footerLink}>{tx.footer.agency}</a>
          </div>

          <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
            <a href="#" aria-label="Instagram" className="footer-social">Instagram</a>
            <a href="#" aria-label="YouTube" className="footer-social">YouTube</a>
            <a href="#" style={{ background: '#FF5533', color: 'white', fontSize: '0.72rem', fontWeight: 700, padding: '6px 14px', borderRadius: '8px', textDecoration: 'none', whiteSpace: 'nowrap' }}>
              {tx.footer.appStore}
            </a>
            <a href="#" style={{ background: 'rgba(255,255,255,0.1)', color: 'white', fontSize: '0.72rem', fontWeight: 700, padding: '6px 14px', borderRadius: '8px', textDecoration: 'none', whiteSpace: 'nowrap', border: '1px solid rgba(255,255,255,0.15)' }}>
              {tx.footer.googlePlay}
            </a>
          </div>
        </div>
        <p style={{ textAlign: 'center', fontSize: '0.72rem', color: 'rgba(255,255,255,0.2)', margin: '28px 0 0' }}>
          © {new Date().getFullYear()} Trekly
        </p>
      </footer>
    </>
  );
}

const footerLink: React.CSSProperties = {
  fontSize: '0.8rem',
  color: 'rgba(255,255,255,0.38)',
  textDecoration: 'none',
};

const PRINCIPLE_ICONS: Record<string, JSX.Element> = {
  curated: (
    <svg width="40" height="40" viewBox="0 0 40 40" fill="none" stroke="#FF5533" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 4 L23.5 14.5 L35 14.5 L25.5 21 L29 31.5 L20 25 L11 31.5 L14.5 21 L5 14.5 L16.5 14.5 Z" />
      <path d="M14 36 L26 36" strokeWidth="1.2" stroke="#FF5533" strokeOpacity="0.4" />
      <line x1="20" y1="31.5" x2="20" y2="36" strokeWidth="1.2" stroke="#FF5533" strokeOpacity="0.4" />
    </svg>
  ),
  compass: (
    <svg width="40" height="40" viewBox="0 0 40 40" fill="none" stroke="#FF5533" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="20" cy="20" r="15.5" />
      <circle cx="20" cy="20" r="2" fill="#FF5533" stroke="none" />
      <polygon points="20,8 22.5,20 20,18 17.5,20" fill="#FF5533" stroke="none" />
      <polygon points="20,32 17.5,20 20,22 22.5,20" fill="#FF5533" fillOpacity="0.3" stroke="none" />
      <line x1="20" y1="5" x2="20" y2="7" strokeWidth="1.2" />
      <line x1="20" y1="33" x2="20" y2="35" strokeWidth="1.2" />
      <line x1="5" y1="20" x2="7" y2="20" strokeWidth="1.2" />
      <line x1="33" y1="20" x2="35" y2="20" strokeWidth="1.2" />
    </svg>
  ),
  shield: (
    <svg width="40" height="40" viewBox="0 0 40 40" fill="none" stroke="#FF5533" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 4 L33 9 L33 20 C33 27.5 27 33.5 20 36 C13 33.5 7 27.5 7 20 L7 9 Z" />
      <path d="M14 20 L18 24 L26 16" strokeWidth="2" />
    </svg>
  ),
};

function InfoRow({ icon, label, value, orange }: { icon: string; label: string; value: string; orange?: boolean }) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '5px' }}>
      <span style={{ fontSize: '0.75rem', flexShrink: 0, marginTop: '1px' }}>{icon}</span>
      <div>
        <span style={{ display: 'block', fontSize: '0.6rem', fontWeight: 700, color: '#AAAAAA', letterSpacing: '0.06em', textTransform: 'uppercase', lineHeight: 1 }}>{label}</span>
        <span style={{ display: 'block', fontSize: '0.78rem', fontWeight: orange ? 700 : 500, color: orange ? '#FF5533' : '#1A1A1A', lineHeight: 1.3 }}>{value}</span>
      </div>
    </div>
  );
}
