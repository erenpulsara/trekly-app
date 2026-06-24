'use client';

import { useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { IconAll, IconInfo, ICON_MAP } from '@/lib/category-icons';

const CA = '#FF5533';
const CD = '#6B7280';
const sz = 26;

const fallbackIcon = (a: boolean) => <IconInfo color={a ? CA : CD} size={sz} />;

// Sabit 8 kategori — her zaman gösterilir
const STATIC_CATEGORIES = [
  { key: 'trekking',        label: 'Trekking' },
  { key: 'dağcılık',        label: 'Dağcılık' },
  { key: 'kano',            label: 'Kano' },
  { key: 'rafting',         label: 'Rafting' },
  { key: 'bisiklet',        label: 'Bisiklet' },
  { key: 'kamp',            label: 'Kamp' },
  { key: 'dalış',           label: 'Dalış' },
  { key: 'yamaç paraşütü',  label: 'Yamaç Paraşütü' },
];

interface Props {
  activeCategory: string;
  dynamicCategories?: string[];
}

export default function TurlarCategories({ activeCategory, dynamicCategories }: Props) {
  const router = useRouter();
  const params = useSearchParams();
  const isFirstRender = useRef(true);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    document.getElementById('cat-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, [params]);

  function navigate(categoryKey: string) {
    const q = new URLSearchParams();
    if (categoryKey) q.set('category', categoryKey);
    const date = params.get('start_date');
    const loc  = params.get('location');
    if (date) q.set('start_date', date);
    if (loc)  q.set('location', loc);
    router.push(`/turlar${q.toString() ? `?${q}` : ''}`);
  }

  // Statikte olmayan DB kategorilerini sona ekle
  const staticKeys = new Set(STATIC_CATEGORIES.map(s => s.key));
  const extraKeys = (dynamicCategories ?? []).filter(k => !staticKeys.has(k) && !staticKeys.has(k.toLowerCase()));

  const allCategories = [
    { key: '', label: 'Tümü' },
    ...STATIC_CATEGORIES,
    ...extraKeys.map(k => ({ key: k, label: k })),
  ];

  return (
    <div style={{ overflowX: 'auto', scrollbarWidth: 'none', msOverflowStyle: 'none' as const }}>
      <style>{`.cat-scroll::-webkit-scrollbar{display:none}`}</style>
      <div className="cat-scroll" style={{ display: 'flex', gap: '8px', justifyContent: 'center', flexWrap: 'wrap', padding: '12px 0' }}>
        {allCategories.map(({ key, label }) => {
          const isActive = activeCategory === key;
          const renderIcon = key === ''
            ? (a: boolean) => <IconAll color={a ? CA : CD} size={sz} />
            : (ICON_MAP[key] ?? ICON_MAP[key.toLowerCase()] ?? fallbackIcon);
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
              {renderIcon(isActive)}
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
