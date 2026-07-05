'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import type { CategoryItem } from '@/lib/api';

// Fallback photos for well-known categories (when no image_url in DB)
export const FALLBACK_PHOTOS: Record<string, string> = {
  'trekking':            'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&q=75',
  'dağcılık':            'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=600&q=75',
  'bisiklet':            'https://images.unsplash.com/photo-1571188654248-7a89213915f7?w=600&q=75',
  'kamp':                'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=600&q=75',
  'dalış':               'https://images.unsplash.com/photo-1682687982502-1529b3b33f85?w=600&q=75',
  'zirve tırmanışı':     'https://images.unsplash.com/photo-1522163182402-834f871fd851?w=600&q=75',
  'kaya tırmanışı':      'https://images.unsplash.com/photo-1564769662533-4f00a87b4056?w=600&q=75',
  'yelken':              'https://images.unsplash.com/photo-1500514966906-fe245eea9344?w=600&q=75',
  'aile kampı':          'https://images.unsplash.com/photo-1478131143081-80f7f84ca84d?w=600&q=75',
  'dağcılık eğitimi':    'https://images.unsplash.com/photo-1508193638397-1c4234db14d8?w=600&q=75',
  'kayak':               'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=600&q=75',
  'su sporları':         'https://images.unsplash.com/photo-1530866495561-507c9faab2ed?w=600&q=75',
  'kültür turları':      'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=600&q=75',
  'gastronomi':          'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=600&q=75',
  'gastronomi / organizasyon': 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=600&q=75',
  'transfer hizmeti':    'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=600&q=75',
  'gemi ve tekne turları': 'https://images.unsplash.com/photo-1505118380757-91f5f5632de0?w=600&q=75',
  'doğa macera turları': 'https://images.unsplash.com/photo-1551632811-561732d1e306?w=600&q=75',
  'deniz macera turları': 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&q=75',
  'hava macera turları': 'https://images.unsplash.com/photo-1501854140801-50d01698950b?w=600&q=75',
  'kış turizm turları':  'https://images.unsplash.com/photo-1519904981063-b0cf448d479e?w=600&q=75',
  'wellness spa / sağlık': 'https://images.unsplash.com/photo-1540555700478-4be0bf42b3ef?w=600&q=75',
  'tema / aksiyon turları': 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=600&q=75',
};

export const DEFAULT_PHOTO = 'https://images.unsplash.com/photo-1551632811-561732d1e306?w=600&q=75';

interface Props {
  activeCategory: string;
  dynamicCategories?: CategoryItem[];
  basePath?: string;
}

export default function TurlarCategories({ activeCategory, dynamicCategories, basePath = '/anasayfa' }: Props) {
  const router = useRouter();
  const params = useSearchParams();

  function navigate(categoryKey: string) {
    const q = new URLSearchParams();
    if (categoryKey) q.set('category', categoryKey);
    const date = params.get('start_date');
    const loc  = params.get('location');
    if (date) q.set('start_date', date);
    if (loc)  q.set('location', loc);
    router.push(`${basePath}${q.toString() ? `?${q}` : ''}`);
  }

  function getPhoto(name: string, image_url?: string | null): string {
    if (image_url) return image_url;
    return FALLBACK_PHOTOS[name.toLowerCase()] ?? DEFAULT_PHOTO;
  }

  const BLOCKED = new Set(['kano', 'rafting', 'yamaç paraşütü']);

  // Categories are now fully admin-managed in the DB (see /admin/kategoriler) —
  // no more hard-coded static list, everything comes from dynamicCategories.
  const allCategories: { key: string; label: string; photo: string }[] = (dynamicCategories ?? [])
    .filter((c) => !BLOCKED.has(c.name.toLowerCase()))
    .map((c) => ({ key: c.name, label: c.name, photo: getPhoto(c.name, c.image_url) }));

  // Inverted pyramid: top row gets ceil(n/2), bottom row gets floor(n/2) centered under top
  const topCount  = Math.ceil(allCategories.length / 2);
  const topRow    = allCategories.slice(0, topCount);
  const bottomRow = allCategories.slice(topCount);

  const renderCard = ({ key, label, photo }: { key: string; label: string; photo: string }) => {
    const isActive = activeCategory === key;
    return (
      <button
        key={key}
        onClick={() => navigate(key)}
        className={`cat-photo-card${isActive ? ' active' : ''}`}
        style={{ width: '130px', height: '88px', flexShrink: 0 }}
      >
        <Image
          src={photo}
          alt={label}
          fill
          sizes="130px"
          className="cat-photo-img"
          style={{ objectFit: 'cover' }}
        />
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
  };

  return (
    <>
      <style>{`
        .cat-photo-card {
          position: relative;
          border-radius: 14px;
          overflow: hidden;
          cursor: pointer;
          transition: transform 0.25s cubic-bezier(0.34,1.4,0.64,1), box-shadow 0.25s ease;
          border: 2.5px solid transparent;
        }
        .cat-photo-card:hover { transform: translateY(-4px); box-shadow: 0 12px 32px rgba(0,0,0,0.18); }
        .cat-photo-card.active { border-color: #FF5533; box-shadow: 0 0 0 3px rgba(255,85,51,0.18); }
        .cat-photo-img { transition: transform 0.45s cubic-bezier(0.4,0,0.2,1); }
        .cat-photo-card:hover .cat-photo-img { transform: scale(1.08); }
      `}</style>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', padding: '20px 0', alignItems: 'center' }}>
        {/* Top row — wider */}
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
          {topRow.map(renderCard)}
        </div>
        {/* Bottom row — centered under top (inverted pyramid) */}
        {bottomRow.length > 0 && (
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
            {bottomRow.map(renderCard)}
          </div>
        )}
      </div>
    </>
  );
}
