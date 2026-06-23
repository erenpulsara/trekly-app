'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import type { Tour } from '@/lib/types';

interface Props {
  tours: Tour[];
}

export default function SearchBar({ tours }: Props) {
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const wrapRef = useRef<HTMLDivElement>(null);

  const filtered = query.trim()
    ? tours.filter(
        (t) =>
          t.name.toLowerCase().includes(query.toLowerCase()) ||
          t.location_name.toLowerCase().includes(query.toLowerCase()),
      )
    : tours;

  // Close dropdown on outside click
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  function pick(tour: Tour) {
    setQuery(tour.name);
    setOpen(false);
    router.push(`/tours/${tour.id}`);
  }

  return (
    <div ref={wrapRef} style={{ position: 'relative', maxWidth: '580px', width: '100%', marginTop: '28px' }}>
      {/* Search pill */}
      <div className="search-bar" style={{ maxWidth: '100%' }}>
        <div className="search-field" style={{ borderRight: 'none', flex: 1 }}>
          <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24" style={{ color: '#9A9A9A', flexShrink: 0 }}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <input
            type="text"
            placeholder="Nereye gitmek istersiniz?"
            className="search-input"
            value={query}
            onChange={(e) => { setQuery(e.target.value); setOpen(true); }}
            onFocus={() => setOpen(true)}
            autoComplete="off"
          />
          {query && (
            <button
              onClick={() => { setQuery(''); setOpen(true); }}
              style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#9A9A9A', padding: '0 4px', flexShrink: 0, fontSize: '1rem', lineHeight: 1 }}
            >
              ×
            </button>
          )}
        </div>
        <button
          type="button"
          className="search-btn"
          onClick={() => {
            setOpen(false);
            document.getElementById('turlar')?.scrollIntoView({ behavior: 'smooth' });
          }}
        >
          <svg width="17" height="17" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
            <circle cx="11" cy="11" r="8" />
            <path strokeLinecap="round" d="m21 21-4.35-4.35" />
          </svg>
          Macera Bul
        </button>
      </div>

      {/* Dropdown */}
      {open && filtered.length > 0 && (
        <div style={{
          position: 'absolute',
          top: 'calc(100% + 8px)',
          left: 0,
          right: 0,
          background: 'white',
          borderRadius: '16px',
          boxShadow: '0 8px 40px rgba(0,0,0,0.18)',
          overflow: 'hidden',
          zIndex: 200,
          maxHeight: '360px',
          overflowY: 'auto',
        }}>
          {!query && (
            <div style={{ padding: '12px 16px 6px', fontSize: '0.72rem', fontWeight: 700, color: '#909090', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
              Tüm Turlar
            </div>
          )}
          {filtered.map((tour) => (
            <button
              key={tour.id}
              onClick={() => pick(tour)}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '12px 16px',
                border: 'none',
                background: 'none',
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'background 0.1s',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = '#F7F7F7')}
              onMouseLeave={(e) => (e.currentTarget.style.background = 'none')}
            >
              {/* Icon */}
              <div style={{
                width: '38px',
                height: '38px',
                borderRadius: '10px',
                background: '#F0F0F0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}>
                <svg width="16" height="16" fill="none" stroke="#555" strokeWidth="1.8" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              {/* Text */}
              <div>
                <div style={{ fontSize: '0.9rem', fontWeight: 600, color: '#1A1A1A' }}>{tour.name}</div>
                <div style={{ fontSize: '0.78rem', color: '#5A5A5A', marginTop: '1px' }}>{tour.location_name}</div>
              </div>
            </button>
          ))}
        </div>
      )}

      {open && filtered.length === 0 && query && (
        <div style={{
          position: 'absolute',
          top: 'calc(100% + 8px)',
          left: 0,
          right: 0,
          background: 'white',
          borderRadius: '16px',
          boxShadow: '0 8px 40px rgba(0,0,0,0.18)',
          padding: '24px 16px',
          textAlign: 'center',
          zIndex: 200,
          fontSize: '0.875rem',
          color: '#909090',
        }}>
          "{query}" için sonuç bulunamadı.
        </div>
      )}
    </div>
  );
}
