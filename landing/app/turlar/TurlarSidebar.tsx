'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import type { CategoryItem } from '@/lib/api';

const STATIC_CATEGORIES = [
  { key: 'trekking',       label: 'Trekking'       },
  { key: 'dağcılık',       label: 'Dağcılık'       },
  { key: 'kano',           label: 'Kano'            },
  { key: 'rafting',        label: 'Rafting'         },
  { key: 'bisiklet',       label: 'Bisiklet'        },
  { key: 'kamp',           label: 'Kamp'            },
  { key: 'dalış',          label: 'Dalış'           },
  { key: 'yamaç paraşütü', label: 'Yamaç Paraşütü' },
];

interface Props {
  activeCategory: string;
  dynamicCategories: CategoryItem[];
}

export default function TurlarSidebar({ activeCategory, dynamicCategories }: Props) {
  const router = useRouter();
  const params = useSearchParams();

  function navigate(key: string) {
    const q = new URLSearchParams();
    if (key) q.set('category', key);
    const date = params.get('start_date');
    const loc  = params.get('location');
    if (date) q.set('start_date', date);
    if (loc)  q.set('location',  loc);
    router.push(`/turlar${q.toString() ? `?${q}` : ''}`);
  }

  const staticKeys = new Set(STATIC_CATEGORIES.map(s => s.key.toLowerCase()));
  const extraCats  = dynamicCategories.filter(c => !staticKeys.has(c.name.toLowerCase()));
  const allCats    = [
    ...STATIC_CATEGORIES,
    ...extraCats.map(c => ({ key: c.name, label: c.name })),
  ];

  const isAll = activeCategory === '';

  return (
    <aside style={{ width: '220px', flexShrink: 0 }}>
      {/* Tüm Turlar */}
      <button
        onClick={() => navigate('')}
        style={{
          display: 'flex', alignItems: 'center', gap: '10px',
          width: '100%', padding: '13px 16px', borderRadius: '14px',
          border: isAll ? 'none' : '1.5px solid #EAEAEA',
          background: isAll ? '#FF5533' : 'white',
          color: isAll ? 'white' : '#1A1A1A',
          fontSize: '0.88rem', fontWeight: 700, cursor: 'pointer',
          marginBottom: '14px',
          boxShadow: isAll ? '0 4px 16px rgba(255,85,51,0.3)' : '0 2px 10px rgba(0,0,0,0.06)',
          transition: 'all 0.18s ease', textAlign: 'left',
        }}
      >
        <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
          <rect x="3" y="3" width="7" height="7" rx="1.5"/>
          <rect x="14" y="3" width="7" height="7" rx="1.5"/>
          <rect x="3" y="14" width="7" height="7" rx="1.5"/>
          <rect x="14" y="14" width="7" height="7" rx="1.5"/>
        </svg>
        Tüm Turlar
      </button>

      {/* Category list */}
      <div style={{
        background: 'white', borderRadius: '16px', padding: '18px 14px',
        boxShadow: '0 2px 12px rgba(0,0,0,0.05)', border: '1px solid #F0F0F0',
      }}>
        <p style={{
          fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.18em',
          textTransform: 'uppercase', color: '#BBBBBB', margin: '0 0 12px 4px',
        }}>
          Kategori
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
          {allCats.map(({ key, label }) => {
            const isActive = activeCategory === key;
            return (
              <button
                key={key}
                onClick={() => navigate(isActive ? '' : key)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '10px',
                  padding: '8px 8px', borderRadius: '9px', border: 'none',
                  background: isActive ? '#FFF4F1' : 'transparent',
                  cursor: 'pointer', textAlign: 'left', width: '100%',
                  transition: 'background 0.12s',
                }}
              >
                <span style={{
                  width: '17px', height: '17px', borderRadius: '4px', flexShrink: 0,
                  border: `2px solid ${isActive ? '#FF5533' : '#D8D8D8'}`,
                  background: isActive ? '#FF5533' : 'white',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  transition: 'all 0.12s',
                }}>
                  {isActive && (
                    <svg width="9" height="7" viewBox="0 0 9 7" fill="none">
                      <path d="M1 3.5L3.5 6L8 1" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  )}
                </span>
                <span style={{
                  fontSize: '0.82rem',
                  fontWeight: isActive ? 600 : 400,
                  color: isActive ? '#FF5533' : '#4A4A4A',
                }}>
                  {label}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </aside>
  );
}
