'use client';

import { useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { IconAll, IconInfo, ICON_MAP, CATEGORY_ICON_MAP, autoMatchIcon } from '@/lib/category-icons';
import type { CategoryItem } from '@/lib/api';

const CA = '#FF5533';
const CD = '#6B7280';
const sz = 26;

const fallbackIcon = (a: boolean) => <IconInfo color={a ? CA : CD} size={sz} />;

function SvgIcon({ svg, active }: { svg: string; active: boolean }) {
  return (
    <span
      style={{ display: 'inline-flex', width: sz, height: sz, alignItems: 'center', justifyContent: 'center', opacity: active ? 1 : 0.55 }}
      className="[&>svg]:w-full [&>svg]:h-full"
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );
}

// Sabit 8 kategori — her zaman gösterilir
const STATIC_CATEGORIES = [
  { key: 'trekking',        label: 'Trekking'       },
  { key: 'dağcılık',        label: 'Dağcılık'       },
  { key: 'kano',            label: 'Kano'            },
  { key: 'rafting',         label: 'Rafting'         },
  { key: 'bisiklet',        label: 'Bisiklet'        },
  { key: 'kamp',            label: 'Kamp'            },
  { key: 'dalış',           label: 'Dalış'           },
  { key: 'yamaç paraşütü',  label: 'Yamaç Paraşütü'  },
];

interface Props {
  activeCategory: string;
  dynamicCategories?: CategoryItem[];
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

  // DB'den gelen, statik listede OLMAYAN kategoriler
  const staticKeys = new Set(STATIC_CATEGORIES.map(s => s.key.toLowerCase()));
  const extraItems = (dynamicCategories ?? []).filter(
    c => !staticKeys.has(c.name.toLowerCase())
  );

  // İkon çözümleme: icon_key → CATEGORY_ICON_MAP → ICON_MAP[name] → autoMatchIcon → icon_svg → fallback
  function resolveIcon(name: string, icon_key: string | null | undefined, icon_svg?: string | null) {
    const ik = icon_key?.toLowerCase() ?? '';
    if (ik && CATEGORY_ICON_MAP[ik]) return (a: boolean) => CATEGORY_ICON_MAP[ik]({ color: a ? CA : CD, size: sz });
    const nk = name.toLowerCase();
    if (ICON_MAP[nk]) return ICON_MAP[nk];
    if (CATEGORY_ICON_MAP[nk]) return (a: boolean) => CATEGORY_ICON_MAP[nk]({ color: a ? CA : CD, size: sz });
    const auto = autoMatchIcon(name);
    if (auto) return (a: boolean) => auto({ color: a ? CA : CD, size: sz });
    if (icon_svg) return (a: boolean) => <SvgIcon svg={icon_svg} active={a} />;
    return fallbackIcon;
  }

  const allCategories: { key: string; label: string; iconFn: (a: boolean) => JSX.Element }[] = [
    { key: '', label: 'Tümü', iconFn: (a) => <IconAll color={a ? CA : CD} size={sz} /> },
    ...STATIC_CATEGORIES.map(c => ({
      key: c.key,
      label: c.label,
      iconFn: ICON_MAP[c.key] ?? fallbackIcon,
    })),
    ...extraItems.map(c => ({
      key: c.name,
      label: c.name,
      iconFn: resolveIcon(c.name, c.icon_key, c.icon_svg),
    })),
  ];

  return (
    <div style={{ overflowX: 'auto', scrollbarWidth: 'none', msOverflowStyle: 'none' as const }}>
      <style>{`.cat-scroll::-webkit-scrollbar{display:none}`}</style>
      <div className="cat-scroll" style={{ display: 'flex', gap: '8px', justifyContent: 'center', flexWrap: 'wrap', padding: '12px 0' }}>
        {allCategories.map(({ key, label, iconFn }) => {
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
              {iconFn(isActive)}
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
