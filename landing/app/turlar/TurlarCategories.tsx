'use client';

import { useRouter, useSearchParams } from 'next/navigation';

const color = (active: boolean) => active ? '#FF5533' : '#6B7280';

const icons: Record<string, (active: boolean) => JSX.Element> = {
  all: (a) => (
    <svg width="26" height="26" viewBox="0 0 26 26" fill="none" stroke={color(a)} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="13" cy="13" r="10.5" />
      <line x1="13" y1="2.5" x2="13" y2="23.5" />
      <path d="M3 9.5 Q13 12 23 9.5" />
      <path d="M3 16.5 Q13 14 23 16.5" />
    </svg>
  ),
  trekking: (a) => (
    <svg width="26" height="26" viewBox="0 0 26 26" fill="none" stroke={color(a)} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 22 L10 8 L14 14 L18 6 L22 22" />
      <path d="M8 22 L10 16" />
      <circle cx="18" cy="4.5" r="1.8" fill={color(a)} stroke="none" />
    </svg>
  ),
  dağcılık: (a) => (
    <svg width="26" height="26" viewBox="0 0 26 26" fill="none" stroke={color(a)} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 22 L9 8 L13 14 L17 6 L24 22 Z" />
      <path d="M15 10 L17 6 L19 10" />
      <path d="M2 22 L24 22" />
    </svg>
  ),
  kano: (a) => (
    <svg width="26" height="26" viewBox="0 0 26 26" fill="none" stroke={color(a)} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 17 Q13 13 22 17" />
      <path d="M4 17 Q13 22 22 17" />
      <line x1="13" y1="5" x2="13" y2="17" />
      <line x1="9" y1="8" x2="17" y2="11" />
    </svg>
  ),
  rafting: (a) => (
    <svg width="26" height="26" viewBox="0 0 26 26" fill="none" stroke={color(a)} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 14 Q5 11 8 14 Q11 17 14 14 Q17 11 20 14 Q22 16 24 14" />
      <path d="M2 18 Q5 15 8 18 Q11 21 14 18 Q17 15 20 18 Q22 20 24 18" />
      <path d="M9 5 L9 13" strokeWidth="2" />
      <path d="M9 5 L16 8 L9 11" />
    </svg>
  ),
  bisiklet: (a) => (
    <svg width="26" height="26" viewBox="0 0 26 26" fill="none" stroke={color(a)} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="7" cy="18" r="4.5" />
      <circle cx="19" cy="18" r="4.5" />
      <path d="M7 18 L13 8 L19 18" />
      <path d="M13 8 L16 13" />
      <path d="M10 8 L16 8" />
    </svg>
  ),
  kamp: (a) => (
    <svg width="26" height="26" viewBox="0 0 26 26" fill="none" stroke={color(a)} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 22 L13 4 L24 22 Z" />
      <path d="M8 22 L13 13 L18 22" />
      <path d="M2 22 L24 22" />
      <path d="M13 22 L13 24" strokeWidth="1" />
    </svg>
  ),
  dalış: (a) => (
    <svg width="26" height="26" viewBox="0 0 26 26" fill="none" stroke={color(a)} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 10 Q5 5 10 5 Q14 5 14 9 L14 18 Q14 22 18 22 Q22 22 22 18" />
      <circle cx="20" cy="8" r="3.5" />
      <line x1="20" y1="4.5" x2="20" y2="3" />
      <path d="M3 17 Q6 14 9 17 Q12 20 15 17" />
    </svg>
  ),
  paraşüt: (a) => (
    <svg width="26" height="26" viewBox="0 0 26 26" fill="none" stroke={color(a)} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 12 Q4 3 13 3 Q22 3 22 12 Z" />
      <line x1="4" y1="12" x2="13" y2="22" />
      <line x1="22" y1="12" x2="13" y2="22" />
      <line x1="13" y1="12" x2="13" y2="22" />
      <circle cx="13" cy="23" r="1.2" fill={color(a)} stroke="none" />
    </svg>
  ),
};

const STATIC_CATEGORIES = [
  { key: 'trekking',        label: 'Trekking',        iconKey: 'trekking' },
  { key: 'dağcılık',        label: 'Dağcılık',        iconKey: 'dağcılık' },
  { key: 'kano',            label: 'Kano',            iconKey: 'kano' },
  { key: 'rafting',         label: 'Rafting',         iconKey: 'rafting' },
  { key: 'bisiklet',        label: 'Bisiklet',        iconKey: 'bisiklet' },
  { key: 'kamp',            label: 'Kamp',            iconKey: 'kamp' },
  { key: 'dalış',           label: 'Dalış',           iconKey: 'dalış' },
  { key: 'yamaç paraşütü',  label: 'Yamaç Paraşütü', iconKey: 'paraşüt' },
];

// Bilinmeyen kategoriler için generic ikon
const genericIcon = (a: boolean) => (
  <svg width="26" height="26" viewBox="0 0 26 26" fill="none" stroke={color(a)} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="13" cy="13" r="9" />
    <path d="M13 8 L13 13 L16 16" />
  </svg>
);

interface Props {
  activeCategory: string;
  dynamicCategories?: string[];
}

export default function TurlarCategories({ activeCategory, dynamicCategories }: Props) {
  const router = useRouter();
  const params = useSearchParams();

  function navigate(categoryKey: string) {
    const q = new URLSearchParams();
    if (categoryKey) q.set('category', categoryKey);
    const date = params.get('start_date');
    const loc  = params.get('location');
    if (date) q.set('start_date', date);
    if (loc)  q.set('location', loc);
    router.push(`/turlar${q.toString() ? `?${q}` : ''}`);
  }

  // Backend boş gelirse tüm statik listeyi göster
  const hasDynamic = dynamicCategories && dynamicCategories.length > 0;

  const extraKeys = hasDynamic
    ? dynamicCategories.filter((k) => !STATIC_CATEGORIES.some((s) => s.key === k))
    : [];

  const allCategories = [
    { key: '', label: 'Tümü', iconKey: 'all' },
    ...(hasDynamic
      ? STATIC_CATEGORIES.filter((s) => dynamicCategories.includes(s.key))
      : STATIC_CATEGORIES),
    ...extraKeys.map((k) => ({
      key: k,
      label: k.charAt(0).toUpperCase() + k.slice(1),
      iconKey: '__generic__',
    })),
  ];

  return (
    <div style={{ overflowX: 'auto', scrollbarWidth: 'none', msOverflowStyle: 'none' as const }}>
      <style>{`.cat-scroll::-webkit-scrollbar{display:none}`}</style>
      <div className="cat-scroll" style={{ display: 'flex', gap: '8px', justifyContent: 'center', flexWrap: 'wrap', padding: '12px 0' }}>
        {allCategories.map(({ key, label, iconKey }) => {
          const isActive = activeCategory === key;
          return (
            <button
              key={key || '__all__'}
              onClick={() => navigate(key)}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '6px',
                padding: '10px 16px',
                borderRadius: '12px',
                border: isActive ? '1.5px solid #FF5533' : '1.5px solid #E5E7EB',
                background: isActive ? '#FFF4F1' : 'white',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                minWidth: '72px',
                boxShadow: isActive ? '0 2px 8px rgba(255,85,51,0.12)' : 'none',
              }}
            >
              {iconKey === '__generic__' ? genericIcon(isActive) : icons[iconKey]?.(isActive)}
              <span style={{
                fontSize: '0.65rem',
                fontWeight: isActive ? 700 : 500,
                color: isActive ? '#FF5533' : '#6B7280',
                whiteSpace: 'nowrap',
                letterSpacing: '0.02em',
                textTransform: 'uppercase',
              }}>
                {label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
