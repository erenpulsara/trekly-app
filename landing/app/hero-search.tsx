'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { TURKISH_PROVINCES } from '@/lib/provinces';

interface Props {
  initialDifficulty?: string;
}

export default function HeroSearch({ initialDifficulty = '' }: Props) {
  const [locationQuery, setLocationQuery] = useState('');
  const [locationValue, setLocationValue] = useState('');
  const [locationOpen, setLocationOpen] = useState(false);
  const [difficulty, setDifficulty] = useState(initialDifficulty);
  const locationRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const filtered = locationQuery.trim()
    ? TURKISH_PROVINCES.filter((p) =>
        p.toLocaleLowerCase('tr').includes(locationQuery.toLocaleLowerCase('tr'))
      )
    : TURKISH_PROVINCES;

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (locationRef.current && !locationRef.current.contains(e.target as Node)) {
        setLocationOpen(false);
      }
    }
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  function selectProvince(p: string) {
    setLocationValue(p);
    setLocationQuery(p);
    setLocationOpen(false);
  }

  function handleSearch() {
    const params = new URLSearchParams();
    if (difficulty) params.set('difficulty', difficulty);
    const qs = params.toString();
    window.location.href = `/${qs ? '?' + qs : ''}#turlar`;
  }

  const labelStyle: React.CSSProperties = {
    fontSize: '0.6rem',
    fontWeight: 700,
    letterSpacing: '0.13em',
    textTransform: 'uppercase',
    color: 'rgba(255,255,255,0.38)',
    margin: '0 0 8px',
  };

  const chevron = (
    <svg width="13" height="13" fill="none" stroke="rgba(255,255,255,0.28)" strokeWidth="1.5" viewBox="0 0 12 12" style={{ flexShrink: 0 }}>
      <path d="M3 4.5L6 7.5L9 4.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );

  return (
    <>
      <style>{`
        .hs-btn:hover { background: #E64420 !important; }
        .hs-drop-item:hover { background: rgba(255,255,255,0.1); }
      `}</style>

      <div style={{
        display: 'flex',
        alignItems: 'stretch',
        background: 'rgba(8, 8, 20, 0.80)',
        backdropFilter: 'blur(28px)',
        WebkitBackdropFilter: 'blur(28px)',
        border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: '16px',
        overflow: 'visible',
        maxWidth: '860px',
        boxShadow: '0 32px 80px rgba(0,0,0,0.55)',
        position: 'relative',
      }}>
        {/* Location combobox */}
        <div ref={locationRef} style={{ flex: 1, padding: '18px 28px', borderRight: '1px solid rgba(255,255,255,0.08)', position: 'relative' }}>
          <p style={labelStyle}>Nereye Gidiyorsunuz?</p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <svg width="16" height="16" fill="none" stroke="rgba(255,255,255,0.32)" strokeWidth="1.8" viewBox="0 0 24 24" style={{ flexShrink: 0 }}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
            </svg>
            <input
              type="text"
              placeholder="İl seçin veya arayın…"
              value={locationQuery}
              onChange={(e) => {
                setLocationQuery(e.target.value);
                setLocationValue('');
                setLocationOpen(true);
              }}
              onFocus={() => setLocationOpen(true)}
              style={{
                flex: 1,
                background: 'none',
                border: 'none',
                outline: 'none',
                fontSize: '0.95rem',
                color: locationValue ? 'white' : 'rgba(255,255,255,0.45)',
                fontFamily: 'inherit',
                cursor: 'text',
                minWidth: 0,
              }}
            />
            {locationQuery && (
              <button
                onClick={() => { setLocationQuery(''); setLocationValue(''); setLocationOpen(false); }}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.3)', padding: 0, display: 'flex', fontSize: '1.1rem', lineHeight: 1 }}
              >×</button>
            )}
            {!locationQuery && chevron}
          </div>

          {/* Dropdown */}
          {locationOpen && (
            <div style={{
              position: 'absolute',
              top: 'calc(100% + 8px)',
              left: 0,
              right: 0,
              background: '#0F0F28',
              border: '1px solid rgba(255,255,255,0.12)',
              borderRadius: '12px',
              overflow: 'hidden',
              zIndex: 500,
              maxHeight: '260px',
              overflowY: 'auto',
              boxShadow: '0 20px 60px rgba(0,0,0,0.7)',
            }}>
              {filtered.length === 0 ? (
                <div style={{ padding: '14px 16px', fontSize: '0.85rem', color: 'rgba(255,255,255,0.35)' }}>
                  Sonuç bulunamadı
                </div>
              ) : filtered.map((p) => (
                <button
                  key={p}
                  className="hs-drop-item"
                  onMouseDown={(e) => { e.preventDefault(); selectProvince(p); }}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    padding: '10px 16px',
                    border: 'none',
                    background: locationValue === p ? 'rgba(255,85,51,0.15)' : 'none',
                    cursor: 'pointer',
                    textAlign: 'left',
                    color: locationValue === p ? '#FF5533' : 'rgba(255,255,255,0.75)',
                    fontSize: '0.88rem',
                    fontFamily: 'inherit',
                    transition: 'background 0.1s',
                  }}
                >
                  <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24" style={{ opacity: 0.5, flexShrink: 0 }}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
                  </svg>
                  {p}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Experience type */}
        <div style={{ flex: 1, padding: '18px 28px', borderRight: '1px solid rgba(255,255,255,0.08)' }}>
          <p style={labelStyle}>Ne Tür Deneyim?</p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <svg width="16" height="16" fill="none" stroke="rgba(255,255,255,0.32)" strokeWidth="1.8" viewBox="0 0 24 24" style={{ flexShrink: 0 }}>
              <circle cx="11" cy="11" r="8"/>
              <path strokeLinecap="round" d="m21 21-4.35-4.35"/>
            </svg>
            <select
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value)}
              style={{
                background: 'none',
                border: 'none',
                outline: 'none',
                fontSize: '0.95rem',
                fontFamily: 'inherit',
                cursor: 'pointer',
                flex: 1,
                appearance: 'none',
                WebkitAppearance: 'none',
                color: difficulty ? 'white' : 'rgba(255,255,255,0.4)',
              }}
            >
              <option value="" style={{ background: '#0F0F28', color: '#888' }}>Tümü</option>
              <option value="easy"        style={{ background: '#0F0F28', color: 'white' }}>🥾 Kolay</option>
              <option value="easy_medium" style={{ background: '#0F0F28', color: 'white' }}>🥾 Kolay-Orta</option>
              <option value="medium"      style={{ background: '#0F0F28', color: 'white' }}>⛏️ Orta</option>
              <option value="medium_hard" style={{ background: '#0F0F28', color: 'white' }}>⛏️ Orta-Zor</option>
              <option value="hard"        style={{ background: '#0F0F28', color: 'white' }}>🧗 Zor</option>
              <option value="very_hard"   style={{ background: '#0F0F28', color: 'white' }}>🧗 Çok Zor</option>
              <option value="extreme"     style={{ background: '#0F0F28', color: 'white' }}>💀 Ekstrem</option>
            </select>
            {chevron}
          </div>
        </div>

        {/* Search button */}
        <div style={{ display: 'flex', alignItems: 'center', padding: '12px 16px' }}>
          <button
            className="hs-btn"
            onClick={handleSearch}
            style={{ background: '#FF5533', color: 'white', border: 'none', borderRadius: '10px', padding: '15px 30px', fontSize: '0.92rem', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '9px', fontFamily: 'inherit', whiteSpace: 'nowrap', transition: 'background 0.15s' }}
          >
            <svg width="17" height="17" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
              <circle cx="11" cy="11" r="8"/>
              <path strokeLinecap="round" d="m21 21-4.35-4.35"/>
            </svg>
            Ara
          </button>
        </div>
      </div>
    </>
  );
}
