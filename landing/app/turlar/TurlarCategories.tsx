'use client';

import { useRouter } from 'next/navigation';

const CATEGORY_ICONS = [
  { key: '', label: 'Tümü', icon: '🗺️' },
  { key: 'trekking', label: 'Trekking', icon: '🥾' },
  { key: 'dağcılık', label: 'Dağcılık', icon: '⛰️' },
  { key: 'kano', label: 'Kano', icon: '🚣' },
  { key: 'rafting', label: 'Rafting', icon: '🌊' },
  { key: 'bisiklet', label: 'Bisiklet', icon: '🚵' },
  { key: 'kamp', label: 'Kamp', icon: '⛺' },
  { key: 'dalış', label: 'Dalış', icon: '🤿' },
  { key: 'yamaç paraşütü', label: 'Yamaç Paraşütü', icon: '🪂' },
];

interface Props {
  activeCategory: string;
}

export default function TurlarCategories({ activeCategory }: Props) {
  const router = useRouter();

  return (
    <div style={{
      overflowX: 'auto',
      scrollbarWidth: 'none',
      msOverflowStyle: 'none',
      padding: '4px 0',
    }}>
      <style>{`.cat-scroll::-webkit-scrollbar { display: none; }`}</style>
      <div className="cat-scroll" style={{
        display: 'flex',
        gap: '10px',
        minWidth: 'max-content',
        padding: '4px 2px',
      }}>
        {CATEGORY_ICONS.map(({ key, label, icon }) => {
          const isActive = activeCategory === key;
          return (
            <button
              key={key || '__all__'}
              onClick={() => router.push(key ? `/turlar?category=${encodeURIComponent(key)}` : '/turlar')}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '6px',
                padding: '12px 16px',
                borderRadius: '14px',
                border: isActive ? '2px solid #FF5533' : '2px solid #E8E8E8',
                background: isActive ? '#FFF4F1' : 'white',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                minWidth: '72px',
              }}
            >
              <span style={{ fontSize: '1.5rem', lineHeight: 1 }}>{icon}</span>
              <span style={{
                fontSize: '0.7rem',
                fontWeight: isActive ? 700 : 500,
                color: isActive ? '#FF5533' : '#555',
                whiteSpace: 'nowrap',
                letterSpacing: '0.01em',
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
