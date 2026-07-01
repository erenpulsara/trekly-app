import { cookies } from 'next/headers';
import SiteFooter from '@/app/components/SiteFooter';
import { Suspense } from 'react';
import { getPublishedTours, getCategories } from '@/lib/api';
import LandingNav from '../landing-nav';
import Image from 'next/image';
import Link from 'next/link';
import type { Tour } from '@/lib/types';
import { T, type Lang } from '@/lib/i18n';
import TurlarSearchBar from '../turlar/TurlarSearchBar';
import TurlarCategories from '../turlar/TurlarCategories';
import TurlarHero from '../turlar/TurlarHero';
import TurlarSidebar from '../turlar/TurlarSidebar';

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

export default async function EtkinliklerPage({
  searchParams,
}: {
  searchParams?: {
    category?: string;
    location?: string;
    start_date?: string;
    month?: string;
    search?: string;
    showAll?: string;
  };
}) {
  const lang: Lang = cookies().get('lang')?.value === 'en' ? 'en' : 'tr';
  const tx = T[lang];
  const tt = tx.tours;

  const activeCategory = searchParams?.category ?? '';
  const activeLocation = searchParams?.location ?? '';
  const activeDate     = searchParams?.start_date ?? '';
  const activeMonth    = searchParams?.month ?? '';
  const activeSearch   = searchParams?.search ?? '';
  const showAll        = searchParams?.showAll === '1';

  const MONTH_MAP: Record<string, number> = {
    'ocak': 0, 'şubat': 1, 'mart': 2, 'nisan': 3, 'mayıs': 4, 'haziran': 5,
    'temmuz': 6, 'ağustos': 7, 'eylül': 8, 'ekim': 9, 'kasım': 10, 'aralık': 11,
  };

  const [allTours, allToursForLocations, categories] = await Promise.all([
    getPublishedTours({
      category:   activeCategory || undefined,
      location:   activeLocation || undefined,
      start_date: activeDate || undefined,
      search:     activeSearch || undefined,
    }),
    getPublishedTours({}),
    getCategories(),
  ]);

  const monthFiltered = activeMonth && MONTH_MAP[activeMonth] !== undefined
    ? allTours.filter(t => {
        if (!t.start_date) return false;
        return new Date(t.start_date).getMonth() === MONTH_MAP[activeMonth];
      })
    : allTours;

  const displayed = showAll ? monthFiltered : monthFiltered.slice(0, 9);
  const allLocations = [...new Set(
    allToursForLocations.map(t => t.location_name).filter(Boolean)
  )].sort() as string[];

  return (
    <>
      <style>{`
        .etr-card {
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
        .etr-card:hover { transform: translateY(-5px); box-shadow: 0 16px 48px rgba(0,0,0,0.13); }
        .etr-thumb { transition: transform 0.55s cubic-bezier(0.4, 0, 0.2, 1); will-change: transform; }
        .etr-card:hover .etr-thumb { transform: scale(1.07); }
        .etr-detail-btn {
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
        .etr-detail-btn:hover { background: #FF5533; color: white; }
        .etr-showall-btn {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: #FF5533;
          color: white;
          font-size: 0.88rem;
          font-weight: 700;
          padding: 13px 36px;
          border-radius: 100px;
          text-decoration: none;
          letter-spacing: 0.02em;
          transition: background 0.15s, transform 0.2s cubic-bezier(0.34,1.56,0.64,1);
        }
        .etr-showall-btn:hover { background: #E64420; transform: translateY(-2px); }
        .etr-sidebar-wrap { display: flex; gap: 28px; align-items: flex-start; }
        .etr-main { flex: 1; min-width: 0; }
        .etr-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; }
        .turlar-sidebar { position: sticky; top: 88px; }
        @media (max-width: 1024px) {
          .etr-grid { grid-template-columns: repeat(2, 1fr) !important; }
          .etr-page-pad { padding: 40px 24px 56px !important; }
          .etr-cat-pad { padding-left: 24px !important; padding-right: 24px !important; }
        }
        @media (max-width: 768px) {
          .etr-sidebar-wrap { flex-direction: column !important; }
          .turlar-sidebar { width: 100% !important; position: static !important; }
          .etr-page-pad { padding: 32px 20px 48px !important; }
          .etr-cat-pad { padding-left: 20px !important; padding-right: 20px !important; }
          .footer-etr-inner { flex-direction: column !important; gap: 20px !important; align-items: flex-start !important; }
        }
        @media (max-width: 560px) {
          .etr-grid { grid-template-columns: 1fr !important; }
          .etr-page-pad { padding: 24px 16px 40px !important; }
          .etr-cat-pad { padding-left: 16px !important; padding-right: 16px !important; }
        }
      `}</style>

      <LandingNav
        logoHref="/turlar"
        navLinks={[
          { label: 'Anasayfa',    href: '/turlar' },
          { label: 'Etkinlikler', href: '/etkinlikler', active: true },
          { label: 'Blog',        href: '/blog' },
          { label: 'Hakkımızda', href: '/hakkimizda' },
          { label: 'İletişim',   href: '/iletisim' },
        ]}
      />

      {/* Hero */}
      <TurlarHero>
        <p style={{
          fontFamily: '"Cormorant Garamond", serif',
          fontSize: 'clamp(1.3rem, 2.2vw, 1.9rem)',
          fontWeight: 400,
          fontStyle: 'italic',
          color: 'rgba(255,255,255,0.88)',
          letterSpacing: '-0.01em',
          margin: '0 0 14px',
          textAlign: 'left',
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
      <div id="cat-section" className="etr-cat-pad" style={{ background: 'white', borderBottom: '1px solid #EAEAEA', padding: '0 48px' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
          <Suspense>
            <TurlarCategories
              activeCategory={activeCategory}
              dynamicCategories={categories}
              basePath="/etkinlikler"
            />
          </Suspense>
        </div>
      </div>

      {/* Sidebar + cards */}
      <section className="etr-page-pad" style={{ background: '#FAFAFA', padding: '48px 48px 60px' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto' }}>

          {/* Header row */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '28px', flexWrap: 'wrap', gap: '12px' }}>
            <div>
              <h2 style={{ fontFamily: '"Cormorant Garamond", serif', fontSize: 'clamp(1.4rem, 2.5vw, 1.9rem)', fontWeight: 400, color: '#1A1A1A', margin: '0 0 4px' }}>
                {tt.upcomingTitle}
              </h2>
              <p style={{ fontSize: '0.8rem', color: '#9A9A9A', margin: 0 }}>
                {tt.found(monthFiltered.length)}
              </p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              {(activeCategory || activeLocation || activeMonth || activeSearch) && (
                <Link href="/etkinlikler" style={{ fontSize: '0.78rem', color: '#9A9A9A', fontWeight: 600, textDecoration: 'none' }}>
                  ← Filtreleri Temizle
                </Link>
              )}
              <Link
                href="/etkinlikler"
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: '7px',
                  border: '1.5px solid #1A1A1A', color: '#1A1A1A',
                  fontSize: '0.82rem', fontWeight: 700,
                  padding: '8px 18px', borderRadius: '10px',
                  textDecoration: 'none',
                  background: (activeCategory || activeLocation || activeMonth || activeSearch) ? 'transparent' : '#1A1A1A',
                  transition: 'background 0.15s, color 0.15s',
                }}
              >
                <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
                  <rect x="3" y="3" width="7" height="7" rx="1.5"/>
                  <rect x="14" y="3" width="7" height="7" rx="1.5"/>
                  <rect x="3" y="14" width="7" height="7" rx="1.5"/>
                  <rect x="14" y="14" width="7" height="7" rx="1.5"/>
                </svg>
                <span style={{ color: (activeCategory || activeLocation || activeMonth || activeSearch) ? '#1A1A1A' : 'white' }}>
                  Tüm Turlar
                </span>
              </Link>
            </div>
          </div>

          {/* Sidebar + grid */}
          <div className="etr-sidebar-wrap">
            <Suspense>
              <TurlarSidebar
                basePath="/etkinlikler"
                activeCategory={activeCategory}
                activeLocation={activeLocation}
                activeMonth={activeMonth}
                activeSearch={activeSearch}
                dynamicCategories={categories}
                locations={allLocations}
              />
            </Suspense>

            <div className="etr-main">
              {displayed.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '80px 0' }}>
                  <p style={{ fontSize: '1.1rem', color: '#9A9A9A', marginBottom: '16px' }}>{tt.empty}</p>
                  <Link href="/etkinlikler" style={{ fontSize: '0.9rem', color: '#FF5533', textDecoration: 'none', fontWeight: 600 }}>
                    {tt.seeAllLink}
                  </Link>
                </div>
              ) : (
                <>
                  <div className="etr-grid">
                    {displayed.map((tour, idx) => {
                      const photo = getCardPhoto(tour);
                      return (
                        <Link key={tour.id} href={`/tours/${tour.id}`} className="etr-card">
                          <div style={{ position: 'relative', height: '200px', overflow: 'hidden', background: '#D8D8D8', flexShrink: 0 }}>
                            <Image
                              src={photo}
                              alt={tour.name}
                              fill
                              priority={idx < 3}
                              className="etr-thumb"
                              sizes="(max-width: 560px) 100vw, (max-width: 1024px) 50vw, 33vw"
                              style={{ objectFit: 'cover' }}
                            />
                            {tour.category && (
                              <span style={{
                                position: 'absolute', top: '12px', left: '12px',
                                background: '#FF5533', color: 'white',
                                fontSize: '0.62rem', fontWeight: 700,
                                padding: '3px 9px', borderRadius: '6px',
                                letterSpacing: '0.04em', textTransform: 'uppercase',
                              }}>
                                {tour.category}
                              </span>
                            )}
                          </div>

                          <div style={{ padding: '14px 16px 16px', flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            <h3 style={{
                              fontSize: '0.9rem', fontWeight: 700, color: '#1A1A1A', margin: 0,
                              lineHeight: 1.35, overflow: 'hidden', display: '-webkit-box',
                              WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
                            } as React.CSSProperties}>
                              {tour.name}
                            </h3>

                            <div style={{ height: '1px', background: '#F0F0F0' }} />

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                              <InfoRow icon="📍" label={tt.location} value={tour.location_name} />
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
                              {tour.price !== undefined && tour.price !== null && (
                                <InfoRow icon="💰" label={tt.price} value={fmtPrice(tour.price, tt.free, tt.perPerson)} orange />
                              )}
                            </div>

                            <div style={{ height: '1px', background: '#F0F0F0' }} />
                            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                              <span className="etr-detail-btn">{tt.detailBtn}</span>
                            </div>
                          </div>
                        </Link>
                      );
                    })}
                  </div>

                  {!showAll && monthFiltered.length > 9 && (
                    <div style={{ textAlign: 'center', marginTop: '40px' }}>
                      <Link
                        href={buildShowAllHref(activeCategory, activeLocation, activeMonth, activeSearch, activeDate)}
                        className="etr-showall-btn"
                      >
                        Tümünü Listele ({monthFiltered.length})
                        <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3"/>
                        </svg>
                      </Link>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <SiteFooter />
    </>
  );
}

function buildShowAllHref(cat: string, loc: string, month: string, search: string, date: string) {
  const q = new URLSearchParams();
  if (cat)    q.set('category',   cat);
  if (loc)    q.set('location',   loc);
  if (month)  q.set('month',      month);
  if (date)   q.set('start_date', date);
  if (search) q.set('search',     search);
  q.set('showAll', '1');
  return `/etkinlikler?${q}`;
}

const footerLink: React.CSSProperties = {
  fontSize: '0.8rem',
  color: 'rgba(255,255,255,0.38)',
  textDecoration: 'none',
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
