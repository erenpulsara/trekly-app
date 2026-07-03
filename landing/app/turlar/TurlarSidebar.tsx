'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import type { CategoryItem } from '@/lib/api';

const MONTHS = [
  'Ocak','Şubat','Mart','Nisan','Mayıs','Haziran',
  'Temmuz','Ağustos','Eylül','Ekim','Kasım','Aralık',
];

interface Props {
  activeCategory: string;
  activeLocation: string;
  activeMonth: string;
  activeSearch: string;
  dynamicCategories: CategoryItem[];
  locations: string[];
  basePath?: string;
}

export default function TurlarSidebar({
  activeCategory, activeLocation, activeMonth, activeSearch,
  dynamicCategories, locations, basePath = '/etkinlikler',
}: Props) {
  const router = useRouter();
  const params = useSearchParams();
  const [searchInput, setSearchInput] = useState(activeSearch);

  useEffect(() => { setSearchInput(activeSearch); }, [activeSearch]);

  function navigateTo(updates: { category?: string; location?: string; month?: string; search?: string }) {
    const q = new URLSearchParams();
    const cat    = updates.category !== undefined ? updates.category : (params.get('category')  ?? '');
    const loc    = updates.location !== undefined ? updates.location : (params.get('location')  ?? '');
    const month  = updates.month    !== undefined ? updates.month    : (params.get('month')     ?? '');
    const search = updates.search   !== undefined ? updates.search   : (params.get('search')    ?? '');
    const date   = params.get('start_date') ?? '';
    if (cat)    q.set('category',   cat);
    if (loc)    q.set('location',   loc);
    if (month)  q.set('month',      month);
    if (date)   q.set('start_date', date);
    if (search) q.set('search',     search);
    router.push(`${basePath}${q.toString() ? `?${q}` : ''}`);
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    navigateTo({ search: searchInput.trim() });
  }

  const BLOCKED = new Set(['kano', 'rafting', 'yamaç paraşütü']);
  const allCats  = dynamicCategories
    .filter(c => !BLOCKED.has(c.name.toLowerCase()))
    .map(c => ({ key: c.name, label: c.name }));

  const isAll = !activeCategory && !activeLocation && !activeMonth && !activeSearch;

  return (
    <aside className="turlar-sidebar" style={{ width: '230px', flexShrink: 0, display: 'flex', flexDirection: 'column', gap: '12px' }}>

      {/* Arama */}
      <form onSubmit={handleSearch} style={{ position: 'relative' }}>
        <input
          type="text"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          placeholder="Tur veya etiket ara..."
          style={{
            width: '100%', padding: '10px 38px 10px 14px',
            borderRadius: '12px', border: '1.5px solid #EAEAEA',
            background: 'white', fontSize: '0.82rem', color: '#1A1A1A',
            outline: 'none', boxSizing: 'border-box',
            boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
            transition: 'border-color 0.15s',
          }}
          onFocus={(e) => (e.currentTarget.style.borderColor = '#FF5533')}
          onBlur={(e) => (e.currentTarget.style.borderColor = '#EAEAEA')}
        />
        <button
          type="submit"
          style={{
            position: 'absolute', right: '8px', top: '50%', transform: 'translateY(-50%)',
            background: 'none', border: 'none', cursor: 'pointer', padding: '4px',
            color: activeSearch ? '#FF5533' : '#BBBBBB', display: 'flex', alignItems: 'center',
          }}
        >
          <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
            <circle cx="11" cy="11" r="8"/><path strokeLinecap="round" d="m21 21-4.35-4.35"/>
          </svg>
        </button>
      </form>

      {/* Tüm Turlar */}
      <button
        onClick={() => router.push(basePath)}
        style={{
          display: 'flex', alignItems: 'center', gap: '10px',
          width: '100%', padding: '13px 16px', borderRadius: '14px',
          border: isAll ? 'none' : '1.5px solid #EAEAEA',
          background: isAll ? '#FF5533' : 'white',
          color: isAll ? 'white' : '#1A1A1A',
          fontSize: '0.88rem', fontWeight: 700, cursor: 'pointer',
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

      {/* Kategori */}
      <FilterCard label="Kategori">
        {allCats.map(({ key, label }) => {
          const isActive = activeCategory === key;
          return (
            <FilterRow
              key={key}
              label={label}
              isActive={isActive}
              onClick={() => navigateTo({ category: isActive ? '' : key })}
            />
          );
        })}
      </FilterCard>

      {/* Lokasyon */}
      {locations.length > 0 && (
        <FilterCard label="Lokasyon">
          {locations.map(loc => {
            const isActive = activeLocation === loc;
            return (
              <FilterRow
                key={loc}
                label={loc}
                isActive={isActive}
                onClick={() => navigateTo({ location: isActive ? '' : loc })}
              />
            );
          })}
        </FilterCard>
      )}

      {/* Tarih */}
      <FilterCard label="Tarih">
        {MONTHS.map(month => {
          const key = month.toLowerCase();
          const isActive = activeMonth === key;
          return (
            <FilterRow
              key={key}
              label={month}
              isActive={isActive}
              onClick={() => navigateTo({ month: isActive ? '' : key })}
            />
          );
        })}
      </FilterCard>

    </aside>
  );
}

function FilterCard({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{
      background: 'white', borderRadius: '16px', padding: '16px 12px',
      boxShadow: '0 2px 12px rgba(0,0,0,0.05)', border: '1px solid #F0F0F0',
    }}>
      <p style={{
        fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.18em',
        textTransform: 'uppercase', color: '#BBBBBB', margin: '0 0 10px 4px',
      }}>
        {label}
      </p>
      <div style={{
        display: 'flex', flexDirection: 'column', gap: '1px',
        maxHeight: '320px',
        overflowY: 'auto',
        scrollbarWidth: 'thin',
        scrollbarColor: '#E0E0E0 transparent',
      }}>
        {children}
      </div>
    </div>
  );
}

function FilterRow({ label, isActive, onClick }: { label: string; isActive: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      style={{
        display: 'flex', alignItems: 'center', gap: '10px',
        padding: '7px 8px', borderRadius: '8px', border: 'none',
        background: isActive ? '#FFF4F1' : 'transparent',
        cursor: 'pointer', textAlign: 'left', width: '100%',
        transition: 'background 0.12s',
      }}
    >
      <span style={{
        width: '16px', height: '16px', borderRadius: '4px', flexShrink: 0,
        border: `2px solid ${isActive ? '#FF5533' : '#D0D0D0'}`,
        background: isActive ? '#FF5533' : 'white',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        transition: 'all 0.12s',
      }}>
        {isActive && (
          <svg width="8" height="6" viewBox="0 0 8 6" fill="none">
            <path d="M1 3L3 5L7 1" stroke="white" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        )}
      </span>
      <span style={{
        fontSize: '0.81rem',
        fontWeight: isActive ? 600 : 400,
        color: isActive ? '#FF5533' : '#4A4A4A',
        lineHeight: 1.3,
      }}>
        {label}
      </span>
    </button>
  );
}
