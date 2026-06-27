import { cookies } from 'next/headers';
import { Suspense } from 'react';
import { getPublishedTours, getCategories } from '@/lib/api';
import LandingNav from '../landing-nav';
import Image from 'next/image';
import Link from 'next/link';
import type { Tour } from '@/lib/types';
import { T, type Lang } from '@/lib/i18n';
import TurlarSearchBar from './TurlarSearchBar';
import TurlarCategories from './TurlarCategories';
import TurlarSidebar from './TurlarSidebar';
import TurlarHero from './TurlarHero';

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
    month?: string;
    showAll?: string;
    search?: string;
  };
}) {
  const lang: Lang = cookies().get('lang')?.value === 'en' ? 'en' : 'tr';
  const tx = T[lang];
  const tt = tx.tours;
  const tp = tx.principles;

  const activeCategory = searchParams?.category ?? '';
  const activeLocation = searchParams?.location ?? '';
  const activeDate     = searchParams?.start_date ?? '';
  const activeMonth    = searchParams?.month ?? '';
  const activeSearch   = searchParams?.search ?? '';
  const showAll        = searchParams?.showAll === 'true';

  const MONTH_MAP: Record<string, number> = {
    'ocak': 0, 'şubat': 1, 'mart': 2, 'nisan': 3, 'mayıs': 4, 'haziran': 5,
    'temmuz': 6, 'ağustos': 7, 'eylül': 8, 'ekim': 9, 'kasım': 10, 'aralık': 11,
  };

  // Fetch all tours for location list (no category/location filter to get full list)
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

  // Derive unique sorted locations from all published tours
  const allLocations = [...new Set(
    allToursForLocations.map(t => t.location_name).filter((l): l is string => Boolean(l))
  )].sort((a, b) => a.localeCompare(b, 'tr'));

  // Apply month filter client-side after backend fetch
  const monthFiltered = activeMonth && MONTH_MAP[activeMonth] !== undefined
    ? allTours.filter(t => {
        if (!t.start_date) return false;
        return new Date(t.start_date).getMonth() === MONTH_MAP[activeMonth];
      })
    : allTours;

  const displayed = showAll ? monthFiltered : monthFiltered.slice(0, 9);

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
        .tr-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 16px 48px rgba(0,0,0,0.13);
        }
        .tr-thumb {
          transition: transform 0.55s cubic-bezier(0.4, 0, 0.2, 1);
          will-change: transform;
        }
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
          .turlar-sidebar { display: none !important; }
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

      <LandingNav
        logoHref="/turlar"
        navLinks={[
          { label: 'Hakkımızda', href: '/hakkimizda' },
          { label: 'Etkinlikler', href: '/turlar' },
          { label: 'Blog', href: '/blog' },
          { label: 'İletişim', href: '/iletisim' },
        ]}
      />

      {/* Hero — slideshow */}
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

      {/* Category row — hero altında, beyaz bant */}
      <div id="cat-section" style={{ background: 'white', borderBottom: '1px solid #EAEAEA', padding: '0 48px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <Suspense>
            <TurlarCategories activeCategory={activeCategory} dynamicCategories={categories} />
          </Suspense>
        </div>
      </div>

      {/* Tour grid */}
      <section className="tr-page-pad" style={{ background: '#FAFAFA', padding: '56px 48px 48px 24px' }}>
        <div style={{ display: 'flex', gap: '28px', alignItems: 'flex-start' }}>

          {/* Sidebar */}
          <Suspense fallback={null}>
            <TurlarSidebar
              activeCategory={activeCategory}
              activeLocation={activeLocation}
              activeMonth={activeMonth}
              activeSearch={activeSearch}
              dynamicCategories={categories}
              locations={allLocations}
            />
          </Suspense>

          {/* Main content — centered within remaining space */}
          <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ maxWidth: '980px', margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '28px', flexWrap: 'wrap', gap: '12px' }}>
            <h2 style={{ fontFamily: '"Cormorant Garamond", serif', fontSize: 'clamp(1.4rem, 2.5vw, 1.9rem)', fontWeight: 400, color: '#1A1A1A', margin: 0 }}>
              {tt.upcomingTitle}
            </h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              {(activeCategory || activeLocation || activeMonth) && (
                <Link
                  href="/turlar"
                  style={{ fontSize: '0.78rem', color: '#FF5533', fontWeight: 700, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px' }}
                >
                  ← Tüm Turlar
                </Link>
              )}
              <p style={{ fontSize: '0.82rem', color: '#9A9A9A', margin: 0 }}>
                {tt.found(monthFiltered.length)}
              </p>
            </div>
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
                {displayed.map((tour, idx) => {
                  const photo = getCardPhoto(tour);
                  return (
                    <Link key={tour.id} href={`/tours/${tour.id}`} className="tr-card">
                      {/* Photo */}
                      <div style={{ position: 'relative', height: '220px', overflow: 'hidden', background: '#D8D8D8', flexShrink: 0 }}>
                        <Image
                          src={photo}
                          alt={tour.name}
                          fill
                          priority={idx < 3}
                          className="tr-thumb"
                          sizes="(max-width: 560px) 100vw, (max-width: 960px) 50vw, 33vw"
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

              {!showAll && monthFiltered.length > 9 && (
                <div style={{ textAlign: 'center', marginTop: '48px' }}>
                  <Link href={`/turlar?showAll=true${activeCategory ? `&category=${encodeURIComponent(activeCategory)}` : ''}${activeLocation ? `&location=${encodeURIComponent(activeLocation)}` : ''}${activeDate ? `&start_date=${activeDate}` : ''}${activeMonth ? `&month=${encodeURIComponent(activeMonth)}` : ''}`} className="tr-all-btn">
                    {tt.seeAllBtn(monthFiltered.length)}
                    <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3"/>
                    </svg>
                  </Link>
                </div>
              )}
            </>
          )}
          </div>{/* end maxWidth centering wrapper */}
          </div>{/* end main content */}
        </div>
      </section>

      {/* Principles */}
      <section style={{ background: '#F7F7F7', padding: '48px 48px 56px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <p style={{ fontSize: '0.62rem', fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#FF5533', margin: '0 0 8px', textAlign: 'center' }}>
            {tp.title}
          </p>
          <div className="principles-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginTop: '24px' }}>
            {tp.items.map((item) => (
              <div key={item.title} style={{
                background: 'white',
                borderRadius: '14px',
                padding: '22px 22px',
                boxShadow: '0 2px 12px rgba(0,0,0,0.05)',
              }}>
                <div style={{ marginBottom: '14px', transform: 'scale(0.82)', transformOrigin: 'left center' }}>{PRINCIPLE_ICONS[item.icon]}</div>
                <h3 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#1A1A1A', margin: '0 0 8px' }}>{item.title}</h3>
                <p style={{ fontSize: '0.8rem', color: '#6A6A6A', margin: 0, lineHeight: 1.6 }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ background: '#1A1A1A', padding: '12px 48px' }}>
        <div className="footer-inner" style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '24px', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '24px', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Image src="/logo.png" alt="Trekly" width={22} height={22} style={{ objectFit: 'contain' }} />
              <span style={{ fontSize: '1rem', fontWeight: 800, color: '#FF5533', letterSpacing: '-0.04em' }}>Trekly</span>
            </div>
            <div style={{ width: '1px', height: '16px', background: 'rgba(255,255,255,0.12)' }} />
            <Link href="/privacy"    style={footerLink}>{tx.footer.privacy}</Link>
            <Link href="/terms"      style={footerLink}>{tx.footer.terms}</Link>
            <Link href="/hakkimizda" style={footerLink}>{tx.footer.about}</Link>
            <a href={AGENCY_URL} target="_blank" rel="noopener noreferrer" style={footerLink}>{tx.footer.agency}</a>
          </div>

          <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>

            {/* Instagram */}
            <a href="#" aria-label="Instagram" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '36px', height: '36px', borderRadius: '9px', background: 'radial-gradient(circle at 30% 107%, #fdf497 0%, #fdf497 5%, #fd5949 45%, #d6249f 60%, #285AEB 90%)', textDecoration: 'none', flexShrink: 0 }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
                <circle cx="12" cy="12" r="4.5"/>
                <circle cx="17.5" cy="6.5" r="1" fill="white" stroke="none"/>
              </svg>
            </a>

            {/* YouTube */}
            <a href="#" aria-label="YouTube" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '36px', height: '36px', borderRadius: '9px', background: '#FF0000', textDecoration: 'none', flexShrink: 0 }}>
              <svg width="20" height="14" viewBox="0 0 24 17" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M23.495 2.656A3.011 3.011 0 0 0 21.38.528C19.505 0 12 0 12 0S4.495 0 2.62.528A3.011 3.011 0 0 0 .505 2.656C0 4.545 0 8.5 0 8.5s0 3.955.505 5.844a3.011 3.011 0 0 0 2.115 2.128C4.495 17 12 17 12 17s7.505 0 9.38-.528a3.011 3.011 0 0 0 2.115-2.128C24 12.455 24 8.5 24 8.5s0-3.955-.505-5.844z" fill="white"/>
                <path d="M9.545 12.023V4.977L15.818 8.5l-6.273 3.523z" fill="#FF0000"/>
              </svg>
            </a>

            {/* App Store Badge */}
            <a href="#" aria-label="App Store" style={{ display: 'inline-flex', alignItems: 'center', gap: '7px', background: '#000', border: '1px solid rgba(255,255,255,0.18)', borderRadius: '9px', padding: '5px 11px', textDecoration: 'none' }}>
              <svg width="16" height="19" viewBox="0 0 20 24" fill="white" xmlns="http://www.w3.org/2000/svg">
                <path d="M16.462 12.707c-.028-3.175 2.597-4.72 2.715-4.793-1.482-2.165-3.784-2.46-4.6-2.493-1.953-.198-3.815 1.153-4.804 1.153-.99 0-2.514-1.126-4.133-1.095-2.121.032-4.08 1.237-5.17 3.126C-1.684 12.558.73 18.965 2.83 22.398c1.05 1.503 2.29 3.188 3.91 3.128 1.576-.063 2.168-1.006 4.07-1.006 1.9 0 2.45 1.006 4.12.974 1.694-.028 2.762-1.523 3.803-3.034a13.46 13.46 0 001.73-3.514c-.04-.016-3.977-1.523-4.001-6.24zM13.28 3.612C14.15 2.556 14.743 1.1 14.58 0c-1.273.05-2.823.85-3.734 1.88-.818.924-1.534 2.404-1.34 3.82 1.42.11 2.874-.718 3.773-2.09z"/>
              </svg>
              <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.2 }}>
                <span style={{ fontSize: '0.5rem', color: 'rgba(255,255,255,0.7)', fontWeight: 400, letterSpacing: '0.02em' }}>Download on the</span>
                <span style={{ fontSize: '0.78rem', color: 'white', fontWeight: 600, letterSpacing: '-0.01em' }}>App Store</span>
              </div>
            </a>

            {/* Google Play Badge */}
            <a href="#" aria-label="Google Play" style={{ display: 'inline-flex', alignItems: 'center', gap: '7px', background: '#000', border: '1px solid rgba(255,255,255,0.18)', borderRadius: '9px', padding: '5px 11px', textDecoration: 'none' }}>
              <svg width="16" height="18" viewBox="0 0 20 22" xmlns="http://www.w3.org/2000/svg">
                <path d="M.414.75C.155.99 0 1.393 0 1.924v18.152c0 .531.155.934.42 1.168l.062.057 10.17-10.17v-.238L.476.693.414.75z" fill="url(#gp_a)"/>
                <path d="M14.038 14.526l-3.386-3.395v-.238l3.387-3.387.077.044 4.01 2.278c1.145.65 1.145 1.716 0 2.367l-4.01 2.278-.078.053z" fill="url(#gp_b)"/>
                <path d="M14.116 14.473L10.652 11 .414 21.244c.378.4.999.45 1.703.05l12-6.82" fill="url(#gp_c)"/>
                <path d="M14.116 7.527L2.117.707C1.413.302.792.357.414.757L10.652 11l3.464-3.473z" fill="url(#gp_d)"/>
                <defs>
                  <linearGradient id="gp_a" x1="9.81" y1="1.809" x2="-4.638" y2="16.257" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#00A0FF"/>
                    <stop offset=".007" stopColor="#00A1FF"/>
                    <stop offset=".26" stopColor="#00BEFF"/>
                    <stop offset=".512" stopColor="#00D2FF"/>
                    <stop offset=".76" stopColor="#00DFFF"/>
                    <stop offset="1" stopColor="#00E3FF"/>
                  </linearGradient>
                  <linearGradient id="gp_b" x1="20.318" y1="11" x2="-.033" y2="11" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#FFE000"/>
                    <stop offset=".409" stopColor="#FFBD00"/>
                    <stop offset=".775" stopColor="orange"/>
                    <stop offset="1" stopColor="#FF9C00"/>
                  </linearGradient>
                  <linearGradient id="gp_c" x1="12.072" y1="13.002" x2="-8.036" y2="33.11" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#FF3A44"/>
                    <stop offset="1" stopColor="#C31162"/>
                  </linearGradient>
                  <linearGradient id="gp_d" x1="-1.934" y1="-7.697" x2="7.515" y2="1.751" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#32A071"/>
                    <stop offset=".069" stopColor="#2DA771"/>
                    <stop offset=".476" stopColor="#15CF74"/>
                    <stop offset=".801" stopColor="#06E775"/>
                    <stop offset="1" stopColor="#00F076"/>
                  </linearGradient>
                </defs>
              </svg>
              <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.2 }}>
                <span style={{ fontSize: '0.5rem', color: 'rgba(255,255,255,0.7)', fontWeight: 400, letterSpacing: '0.02em' }}>Get it on</span>
                <span style={{ fontSize: '0.78rem', color: 'white', fontWeight: 600, letterSpacing: '-0.01em' }}>Google Play</span>
              </div>
            </a>
          </div>
        </div>
        <p style={{ textAlign: 'center', fontSize: '0.72rem', color: 'rgba(255,255,255,0.2)', margin: '8px 0 0' }}>
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
