import { cookies } from 'next/headers';
import SiteFooter from '@/app/components/SiteFooter';
import { Suspense } from 'react';
import { getPublishedTours, getCategories } from '@/lib/api';
import LandingNav from '../landing-nav';
import Image from 'next/image';
import Link from 'next/link';
import TourCardImage from '../turlar/TourCardImage';
import type { Tour } from '@/lib/types';
import { T, type Lang } from '@/lib/i18n';
import { splitCategories } from '@/lib/category-utils';
import TurlarCategories from '../turlar/TurlarCategories';
import TurlarSearchBar from '../turlar/TurlarSearchBar';
import TurlarHero from '../turlar/TurlarHero';

export const dynamic = 'force-dynamic';

const AGENCY_URL = process.env.NEXT_PUBLIC_AGENCY_URL ?? 'https://acenta.treklyapp.com';

const CATEGORY_PHOTOS: Record<string, string> = {
  'trekking':        'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80',
  'dağcılık':        'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800&q=80',
  'bisiklet':        'https://images.unsplash.com/photo-1571188654248-7a89213915f7?w=800&q=80',
  'kamp':            'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=800&q=80',
  'dalış':           'https://images.unsplash.com/photo-1682687982502-1529b3b33f85?w=800&q=80',
  'zirve tırmanışı': 'https://images.unsplash.com/photo-1522163182402-834f871fd851?w=800&q=80',
  'kaya tırmanışı':  'https://images.unsplash.com/photo-1564769662533-4f00a87b4056?w=800&q=80',
  'yelken':          'https://images.unsplash.com/photo-1500514966906-fe245eea9344?w=800&q=80',
  'aile kampı':      'https://images.unsplash.com/photo-1478131143081-80f7f84ca84d?w=800&q=80',
  'dağcılık eğitimi':'https://images.unsplash.com/photo-1508193638397-1c4234db14d8?w=800&q=80',
  'kayak':           'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=800&q=80',
  'su sporları':     'https://images.unsplash.com/photo-1530866495561-507c9faab2ed?w=800&q=80',
  '_default':        'https://images.unsplash.com/photo-1551632811-561732d1e306?w=800&q=80',
};

function getCardPhoto(tour: Tour): string {
  if (tour.photo_urls[0]) return tour.photo_urls[0];
  const firstCat = splitCategories(tour.category)[0]?.toLowerCase();
  if (firstCat && CATEGORY_PHOTOS[firstCat]) return CATEGORY_PHOTOS[firstCat];
  return CATEGORY_PHOTOS['_default'];
}

function fmtDate(s: string, locale: string) {
  return new Date(s).toLocaleDateString(locale, { day: 'numeric', month: 'short', year: 'numeric' });
}

function fmtPrice(price: number | null | undefined, free: string) {
  if (!price || price === 0) return free;
  return `₺${price.toLocaleString('tr-TR')}`;
}

export default async function AnasayfaPage() {
  const lang: Lang = cookies().get('lang')?.value === 'en' ? 'en' : 'tr';
  const tx = T[lang];
  const tt = tx.tours;
  const tp = tx.principles;

  const [allTours, categories] = await Promise.all([
    getPublishedTours({ sort: 'start_date_asc' }),
    getCategories(),
  ]);

  const displayed = allTours.slice(0, 12);

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
          transition: transform 0.28s cubic-bezier(0.34, 1.4, 0.64, 1), box-shadow 0.28s ease;
          display: flex;
          flex-direction: column;
          will-change: transform;
          backface-visibility: hidden;
        }
        .tr-card:hover { transform: translateY(-5px); box-shadow: 0 16px 48px rgba(0,0,0,0.13); }
        .tr-thumb { transition: transform 0.55s cubic-bezier(0.4, 0, 0.2, 1); will-change: transform; }
        .tr-card:hover .tr-thumb { transform: scale(1.07); }
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
        .detail-btn:hover { background: #FF5533; color: white; }
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
        @media (max-width: 1200px) { .tr-grid { grid-template-columns: repeat(3, 1fr) !important; } }
        @media (max-width: 960px) {
          .tr-grid { grid-template-columns: repeat(2, 1fr) !important; }
          .principles-grid { grid-template-columns: 1fr !important; }
          .tr-page-pad { padding: 40px 24px 56px !important; }
          .tr-cat-pad { padding-left: 24px !important; padding-right: 24px !important; }
          .tr-principles-pad { padding: 40px 24px 48px !important; }
          .footer-inner { flex-direction: column !important; gap: 20px !important; align-items: flex-start !important; }
        }
        @media (max-width: 560px) {
          .tr-grid { grid-template-columns: 1fr !important; }
          .tr-page-pad { padding: 32px 16px 48px !important; }
          .tr-cat-pad { padding-left: 16px !important; padding-right: 16px !important; }
          .tr-principles-pad { padding: 32px 16px 40px !important; }
        }
        .footer-social { color: rgba(255,255,255,0.45); text-decoration: none; font-size: 0.8rem; font-weight: 600; transition: color 0.15s; }
        .footer-social:hover { color: white; }
      `}</style>

      <LandingNav
        logoHref="/anasayfa"
        navLinks={[
          { label: 'Anasayfa',    href: '/anasayfa', active: true },
          { label: 'Etkinlikler', href: '/etkinlikler' },
          { label: 'Blog',        href: '/blog' },
          { label: 'Hakkımızda', href: '/hakkimizda' },
          { label: 'İletişim',   href: '/iletisim' },
        ]}
      />

      {/* Hero */}
      <TurlarHero>
        <p style={{
          fontFamily: '"Cormorant Garamond", serif',
          fontSize: 'clamp(1.8rem, 3vw, 2.8rem)',
          fontWeight: 700,
          fontStyle: 'italic',
          color: '#FF5533',
          letterSpacing: '-0.01em',
          margin: '0 0 20px',
          textAlign: 'center',
          width: '100%',
          textTransform: 'uppercase',
          textShadow: '0 2px 12px rgba(0,0,0,0.45)',
        }}>
          Sıradaki Maceranı Keşfet
        </p>
        <Suspense>
          <TurlarSearchBar
            basePath="/etkinlikler"
            labels={{
              searchDate:     tt.searchDate,
              searchLocation: tt.searchLocation,
              searchCategory: tt.searchCategory,
              searchBtn:      tt.searchBtn,
              allCategories:  tt.allCategories,
            }}
            categories={categories}
          />
        </Suspense>
      </TurlarHero>

      {/* Category row */}
      <div id="cat-section" className="tr-cat-pad" style={{ background: 'white', borderBottom: '1px solid #EAEAEA', padding: '0 48px' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
          <Suspense>
            <TurlarCategories activeCategory="" dynamicCategories={categories} basePath="/etkinlikler" />
          </Suspense>
        </div>
      </div>

      {/* Tour grid — no sidebar */}
      <section className="tr-page-pad" style={{ background: '#FAFAFA', padding: '48px 48px 60px' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto' }}>

          <div style={{ marginBottom: '32px', textAlign: 'center' }}>
            <h2 style={{
              fontFamily: '"Cormorant Garamond", serif', fontSize: 'clamp(1.5rem, 2.8vw, 2.1rem)',
              fontWeight: 700, color: '#1A1A1A', margin: '0 0 8px', textTransform: 'uppercase',
              letterSpacing: '0.02em', lineHeight: 1.4,
            }}>
              {tt.upcomingTitle}
            </h2>
          </div>

          {displayed.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '80px 0' }}>
              <p style={{ fontSize: '1.1rem', color: '#9A9A9A', marginBottom: '16px' }}>{tt.empty}</p>
              <Link href="/anasayfa" style={{ fontSize: '0.9rem', color: '#FF5533', textDecoration: 'none', fontWeight: 600 }}>
                {tt.seeAllLink}
              </Link>
            </div>
          ) : (
            <>
              <div className="tr-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '28px' }}>
                {displayed.map((tour, idx) => {
                  const photo = getCardPhoto(tour);
                  const cats = splitCategories(tour.category);
                  return (
                    <Link key={tour.id} href={`/tours/${tour.id}`} className="tr-card">
                      <div style={{ position: 'relative', height: '230px', overflow: 'hidden', background: '#D8D8D8', flexShrink: 0 }}>
                        <TourCardImage
                          src={photo}
                          fallbackSrc={
                            (cats[0] && CATEGORY_PHOTOS[cats[0].toLowerCase()])
                              ? CATEGORY_PHOTOS[cats[0].toLowerCase()]
                              : CATEGORY_PHOTOS['_default']
                          }
                          alt={tour.name}
                          className="tr-thumb"
                        />
                        {cats.length > 0 && (
                          <div style={{ position: 'absolute', top: '12px', left: '12px', display: 'flex', gap: '6px', flexWrap: 'wrap', maxWidth: 'calc(100% - 24px)' }}>
                            {cats.map((cat) => (
                              <span key={cat} style={{
                                background: '#FF5533', color: 'white',
                                fontSize: '0.62rem', fontWeight: 700,
                                padding: '3px 9px', borderRadius: '6px',
                                letterSpacing: '0.04em', textTransform: 'uppercase',
                              }}>
                                {cat}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>

                      <div style={{ padding: '18px 18px 20px', flex: 1, display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        <h3 style={{
                          fontSize: '0.98rem', fontWeight: 700, color: '#1A1A1A', margin: 0,
                          lineHeight: 1.4, overflow: 'hidden', display: '-webkit-box',
                          WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
                        } as React.CSSProperties}>
                          {tour.name}
                        </h3>

                        <div style={{ height: '1px', background: '#F0F0F0' }} />

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '7px' }}>
                          {tour.altitude_meters != null && (
                            <InfoRow icon="⛰️" label={tt.altitude} value={`${tour.altitude_meters.toLocaleString()}m`} />
                          )}
                          <InfoRow icon="📍" label={tt.location} value={tour.location_name} />
                          {tour.distance_km != null && (
                            <InfoRow icon="📏" label={tt.distance} value={`${Number(tour.distance_km).toFixed(1)} km`} />
                          )}
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
                          {tour.max_participants != null && (
                            <InfoRow icon="👥" label={tt.quota} value={String(tour.max_participants)} />
                          )}
                          {tour.price !== undefined && tour.price !== null && (
                            <InfoRow icon="💰" label={tt.price} value={fmtPrice(tour.price, tt.free)} orange />
                          )}
                        </div>

                        <div style={{ height: '1px', background: '#F0F0F0', marginTop: '2px' }} />
                        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                          <span className="detail-btn">{tt.detailBtn}</span>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>

              {allTours.length > 12 && (
                <div style={{ textAlign: 'center', marginTop: '48px' }}>
                  <Link href="/etkinlikler" className="tr-all-btn">
                    Tüm Etkinlikleri Gör
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
      <section className="tr-principles-pad" style={{ background: '#F7F7F7', padding: '48px 48px 56px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <p style={{ fontSize: '0.62rem', fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#FF5533', margin: '0 0 8px', textAlign: 'center' }}>
            {tp.title}
          </p>
          <div className="principles-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginTop: '24px' }}>
            {tp.items.map((item) => (
              <div key={item.title} style={{ background: 'white', borderRadius: '14px', padding: '22px 22px', boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }}>
                <div style={{ marginBottom: '14px', transform: 'scale(0.82)', transformOrigin: 'left center' }}>{PRINCIPLE_ICONS[item.icon]}</div>
                <h3 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#1A1A1A', margin: '0 0 8px' }}>{item.title}</h3>
                <p style={{ fontSize: '0.8rem', color: '#6A6A6A', margin: 0, lineHeight: 1.6 }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <SiteFooter />
    </>
  );
}

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
        <span style={{ display: 'block', fontSize: '0.58rem', fontWeight: 700, color: '#AAAAAA', letterSpacing: '0.06em', textTransform: 'uppercase', lineHeight: 1 }}>{label}</span>
        <span style={{ display: 'block', fontSize: '0.76rem', fontWeight: orange ? 700 : 500, color: orange ? '#FF5533' : '#1A1A1A', lineHeight: 1.3 }}>{value}</span>
      </div>
    </div>
  );
}
