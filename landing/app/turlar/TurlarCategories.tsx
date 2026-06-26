'use client';

import { useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import type { CategoryItem } from '@/lib/api';

// Fallback photos for well-known categories (when no image_url in DB)
const FALLBACK_PHOTOS: Record<string, string> = {
  'trekking':                  'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&q=75',
  'dağcılık':                  'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=600&q=75',
  'kano':                      'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=600&q=75',
  'rafting':                   'https://images.unsplash.com/photo-1530866495561-507c9faab2ed?w=600&q=75',
  'bisiklet':                  'https://images.unsplash.com/photo-1571188654248-7a89213915f7?w=600&q=75',
  'kamp':                      'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=600&q=75',
  'dalış':                     'https://images.unsplash.com/photo-1682687982502-1529b3b33f85?w=600&q=75',
  'yamaç paraşütü':            'https://images.unsplash.com/photo-1503220317375-aaad61436b1b?w=600&q=75',
  'kültür turları':            'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=600&q=75',
  'gastronomi / organizasyon': 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=600&q=75',
  'gastronomi':                'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=600&q=75',
  'transfer hizmeti':          'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=600&q=75',
  'gemi ve tekne turları':     'https://images.unsplash.com/photo-1505118380757-91f5f5632de0?w=600&q=75',
  'doğa macera turları':       'https://images.unsplash.com/photo-1551632811-561732d1e306?w=600&q=75',
  'deniz macera turları':      'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&q=75',
  'hava macera turları':       'https://images.unsplash.com/photo-1501854140801-50d01698950b?w=600&q=75',
  'kış turizm turları':        'https://images.unsplash.com/photo-1519904981063-b0cf448d479e?w=600&q=75',
  'wellness spa / sağlık':     'https://images.unsplash.com/photo-1540555700478-4be0bf42b3ef?w=600&q=75',
  'tema / aksiyon turları':    'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=600&q=75',
};

const DEFAULT_PHOTO = 'https://images.unsplash.com/photo-1551632811-561732d1e306?w=600&q=75';

const STATIC_CATEGORIES = [
  { key: 'trekking',       label: 'Trekking'        },
  { key: 'dağcılık',       label: 'Dağcılık'        },
  { key: 'kano',           label: 'Kano'             },
  { key: 'rafting',        label: 'Rafting'          },
  { key: 'bisiklet',       label: 'Bisiklet'         },
  { key: 'kamp',           label: 'Kamp'             },
  { key: 'dalış',          label: 'Dalış'            },
  { key: 'yamaç paraşütü', label: 'Yamaç Paraşütü'  },
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
    if (isFirstRender.current) { isFirstRender.current = false; return; }
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

  function getPhoto(name: string, image_url?: string | null): string {
    if (image_url) return image_url;
    return FALLBACK_PHOTOS[name.toLowerCase()] ?? DEFAULT_PHOTO;
  }

  const staticKeys = new Set(STATIC_CATEGORIES.map(s => s.key.toLowerCase()));
  const extraItems = (dynamicCategories ?? []).filter(c => !staticKeys.has(c.name.toLowerCase()));

  const allCategories: { key: string; label: string; photo: string }[] = [
    ...STATIC_CATEGORIES.map(c => {
      const dbMatch = (dynamicCategories ?? []).find(d => d.name.toLowerCase() === c.key.toLowerCase());
      return { key: c.key, label: c.label, photo: getPhoto(c.key, dbMatch?.image_url) };
    }),
    ...extraItems.map(c => ({ key: c.name, label: c.name, photo: getPhoto(c.name, c.image_url) })),
  ];

  return (
    <>
      <style>{`
        .cat-photo-card {
          position: relative;
          border-radius: 14px;
          overflow: hidden;
          cursor: pointer;
          transition: transform 0.25s cubic-bezier(0.34,1.4,0.64,1), box-shadow 0.25s ease;
          flex-shrink: 0;
          border: 2.5px solid transparent;
        }
        .cat-photo-card:hover { transform: translateY(-4px); box-shadow: 0 12px 32px rgba(0,0,0,0.18); }
        .cat-photo-card.active { border-color: #FF5533; box-shadow: 0 0 0 3px rgba(255,85,51,0.18); }
        .cat-photo-img { transition: transform 0.45s cubic-bezier(0.4,0,0.2,1); }
        .cat-photo-card:hover .cat-photo-img { transform: scale(1.08); }
      `}</style>
      <div style={{ display: 'flex', gap: '12px', alignItems: 'center', padding: '20px 0', flexWrap: 'wrap', justifyContent: 'center' }}>
        {allCategories.map(({ key, label, photo }) => {
          const isActive = activeCategory === key;
          return (
            <button
              key={key}
              onClick={() => navigate(key)}
              className={`cat-photo-card${isActive ? ' active' : ''}`}
              style={{ width: '130px', height: '88px' }}
            >
              <Image
                src={photo}
                alt={label}
                fill
                sizes="130px"
                className="cat-photo-img"
                style={{ objectFit: 'cover' }}
              />
              {/* Dark overlay */}
              <div style={{
                position: 'absolute', inset: 0,
                background: isActive
                  ? 'linear-gradient(to top, rgba(255,85,51,0.75) 0%, rgba(0,0,0,0.25) 100%)'
                  : 'linear-gradient(to top, rgba(0,0,0,0.65) 0%, rgba(0,0,0,0.1) 100%)',
              }} />
              <span style={{
                position: 'absolute', bottom: '8px', left: '8px', right: '8px',
                color: 'white', fontSize: '0.62rem', fontWeight: 700,
                textTransform: 'uppercase', letterSpacing: '0.04em',
                lineHeight: 1.2, textAlign: 'left',
                textShadow: '0 1px 3px rgba(0,0,0,0.5)',
              }}>
                {label}
              </span>
            </button>
          );
        })}
      </div>
    </>
  );
}
