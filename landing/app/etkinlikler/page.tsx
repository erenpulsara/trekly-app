import { cookies } from 'next/headers';
import SiteFooter from '@/app/components/SiteFooter';
import { Suspense } from 'react';
import { getPublishedTours, getCategories } from '@/lib/api';
import LandingNav from '../landing-nav';
import Image from 'next/image';
import Link from 'next/link';
import type { Tour } from '@/lib/types';
import { T, type Lang } from '@/lib/i18n';
import { splitCategories } from '@/lib/category-utils';
import { displayCategory } from '@/lib/category-i18n';
import { REWARDS_ENABLED } from '@/lib/features';
import TurlarSidebar from '../turlar/TurlarSidebar';
import MobileFilterBar from '../turlar/MobileFilterBar';
import { formatPrice } from '@/lib/price';
import { isUpcomingTour } from '@/lib/tour-utils';

export const dynamic = 'force-dynamic';

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

function fmtPrice(price: number | null | undefined, free: string, currency?: Tour['price_currency']) {
  if (!price || price === 0) return free;
  return formatPrice(price, currency);
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
      sort:       'start_date_asc',
    }),
    getPublishedTours({}),
    getCategories(),
  ]);

  const upcomingTours = allTours.filter(isUpcomingTour);

  const monthFiltered = activeMonth && MONTH_MAP[activeMonth] !== undefined
    ? upcomingTours.filter(t => {
        if (!t.start_date) return false;
        return new Date(t.start_date).getMonth() === MONTH_MAP[activeMonth];
      })
    : upcomingTours;

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
        .etr-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 28px; }
        .turlar-sidebar { position: sticky; top: 88px; }
        @media (max-width: 1024px) {
          .etr-grid { grid-template-columns: repeat(2, 1fr) !important; }
          .etr-page-pad { padding: 40px 24px 56px !important; }
          /* "Tüm Turlar" buton satırı yalnızca masaüstünde görünsün — mobil/tablette
             filtreleme MobileFilterBar ile yapıldığı için bu buton gereksiz ve kaba duruyor */
          .etr-header-actions { display: none !important; }
        }
        @media (max-width: 768px) {
          /* Telefonda sidebar tamamen gizlenir; yerine MobileFilterBar (çip + dropdown) gelir */
          .turlar-sidebar { display: none !important; }
          .etr-page-pad { padding: 32px 20px 48px !important; }
          .footer-etr-inner { flex-direction: column !important; gap: 20px !important; align-items: flex-start !important; }
        }
        @media (max-width: 560px) {
          .etr-grid { grid-template-columns: 1fr !important; }
          .etr-page-pad { padding: 24px 16px 40px !important; }
        }
      `}</style>

      <LandingNav
        logoHref="/anasayfa"
        navLinks={[
          { label: 'Anasayfa',    href: '/anasayfa' },
          { label: 'Etkinlikler', href: '/etkinlikler', active: true },
          { label: 'Blog',        href: '/blog' },
          { label: 'Hakkımızda', href: '/hakkimizda' },
          { label: 'İletişim',   href: '/iletisim' },
        ]}
      />

      {/* Sidebar + cards */}
      <section className="etr-page-pad" style={{ background: '#FAFAFA', padding: '48px 48px 60px' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto' }}>

          {/* Header row */}
          <div style={{ marginBottom: '28px', textAlign: 'center' }}>
            <h2 style={{
              fontFamily: '"Cormorant Garamond", serif', fontSize: 'clamp(1.5rem, 2.8vw, 2.1rem)',
              fontWeight: 700, color: '#1A1A1A', margin: '0 0 16px', textTransform: 'uppercase',
              letterSpacing: '0.02em', lineHeight: 1.5,
            }}>
              {tt.allEventsTitle}
            </h2>
            <div className="etr-header-actions" style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '10px' }}>
              {(activeCategory || activeLocation || activeMonth || activeSearch) && (
                <Link href="/etkinlikler" style={{ fontSize: '0.78rem', color: '#9A9A9A', fontWeight: 600, textDecoration: 'none' }}>
                  ← {tt.clearAllFilters}
                </Link>
              )}
              <Link
                href="/etkinlikler"
                style={{
                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '7px',
                  border: '1.5px solid #FF5533', color: '#FF5533',
                  fontSize: '0.82rem', fontWeight: 700,
                  padding: '8px 18px', borderRadius: '10px',
                  textDecoration: 'none',
                  background: (activeCategory || activeLocation || activeMonth || activeSearch) ? 'transparent' : '#FF5533',
                  transition: 'background 0.15s, color 0.15s',
                }}
              >
                <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
                  <rect x="3" y="3" width="7" height="7" rx="1.5"/>
                  <rect x="14" y="3" width="7" height="7" rx="1.5"/>
                  <rect x="3" y="14" width="7" height="7" rx="1.5"/>
                  <rect x="14" y="14" width="7" height="7" rx="1.5"/>
                </svg>
                <span style={{ color: (activeCategory || activeLocation || activeMonth || activeSearch) ? '#FF5533' : 'white' }}>
                  {tt.allToursBtn}
                </span>
              </Link>
            </div>
          </div>

          {/* Telefon: kompakt filtre barı (çip + dropdown) — tablet/masaüstünde gizli */}
          <Suspense>
            <MobileFilterBar
              basePath="/etkinlikler"
              activeCategory={activeCategory}
              activeLocation={activeLocation}
              activeMonth={activeMonth}
              activeSearch={activeSearch}
              dynamicCategories={categories}
              locations={allLocations}
              lang={lang}
            />
          </Suspense>

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
                lang={lang}
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
                      const cats = splitCategories(tour.category);
                      return (
                        <Link key={tour.id} href={`/tours/${tour.slug ?? tour.id}`} className="etr-card">
                          <div style={{ position: 'relative', height: '230px', overflow: 'hidden', background: '#D8D8D8', flexShrink: 0 }}>
                            <Image
                              src={photo}
                              alt={tour.name}
                              fill
                              priority={idx < 3}
                              className="etr-thumb"
                              sizes="(max-width: 560px) 100vw, (max-width: 1024px) 50vw, 33vw"
                              style={{ objectFit: 'cover' }}
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
                                    {displayCategory(cat, lang)}
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
                                <InfoRow icon="💰" label={tt.price} value={fmtPrice(tour.price, tt.free, tour.price_currency)} orange />
                              )}
                              {REWARDS_ENABLED && tour.points > 0 && (
                                <InfoRow icon="⭐" label="Kazanılacak XP" value={`${tour.points} XP`} orange />
                              )}
                            </div>

                            <div style={{ marginTop: 'auto', paddingTop: '10px' }}>
                              <div style={{ height: '1px', background: '#F0F0F0', marginBottom: '10px' }} />
                              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                                <span className="etr-detail-btn">{tt.detailBtn}</span>
                              </div>
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
                        Tümünü Listele
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
