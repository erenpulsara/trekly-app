'use client';

// Telefon görünümünde (≤768px) sidebar yerine gösterilen kompakt filtre barı —
// mobil uygulamadaki ExploreScreen dropdown filtrelerinin web karşılığı.
// Tablet ve masaüstünde tamamen gizlidir; orada TurlarSidebar kullanılır.

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import type { CategoryItem } from '@/lib/api';
import { getLangClient, type Lang, T } from '@/lib/i18n';
import { displayCategory, monthNames } from '@/lib/category-i18n';

// Filtre key'i her zaman Türkçe kalır (URL & backend uyumu); yalnızca ETİKET çevrilir.
const MONTHS_TR = [
  'Ocak','Şubat','Mart','Nisan','Mayıs','Haziran',
  'Temmuz','Ağustos','Eylül','Ekim','Kasım','Aralık',
];

type DropdownKey = 'category' | 'location' | 'month' | null;

interface Props {
  activeCategory: string;
  activeLocation: string;
  activeMonth: string;
  activeSearch: string;
  dynamicCategories: CategoryItem[];
  locations: string[];
  basePath?: string;
  lang?: Lang;
}

export default function MobileFilterBar({
  activeCategory, activeLocation, activeMonth, activeSearch,
  dynamicCategories, locations, basePath = '/etkinlikler', lang: langProp,
}: Props) {
  const router = useRouter();
  const params = useSearchParams();
  const [openDropdown, setOpenDropdown] = useState<DropdownKey>(null);
  const [searchInput, setSearchInput] = useState(activeSearch);
  const [lang, setLang] = useState<Lang>(langProp ?? 'tr');

  useEffect(() => { setSearchInput(activeSearch); }, [activeSearch]);
  useEffect(() => { if (!langProp) setLang(getLangClient()); }, [langProp]);
  // Filtre değişince (yeni sayfa render'ı) açık panel kapansın
  useEffect(() => { setOpenDropdown(null); }, [activeCategory, activeLocation, activeMonth]);

  const tt = T[lang].tours;
  const monthLabels = monthNames(lang);

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
  const allCats = dynamicCategories
    .filter(c => !BLOCKED.has(c.name.toLowerCase()))
    .map(c => ({ key: c.name, label: displayCategory(c.name, lang) }));

  const activeMonthIdx = activeMonth
    ? MONTHS_TR.findIndex(m => m.toLowerCase() === activeMonth)
    : -1;
  const activeMonthLabel = activeMonthIdx >= 0 ? monthLabels[activeMonthIdx] : '';

  const chips: { key: Exclude<DropdownKey, null>; placeholder: string; value: string }[] = [
    { key: 'category', placeholder: tt.searchCategory, value: activeCategory ? displayCategory(activeCategory, lang) : '' },
    { key: 'location', placeholder: tt.searchLocation, value: activeLocation },
    { key: 'month',    placeholder: tt.searchDate,     value: activeMonthLabel },
  ];

  const renderOptions = () => {
    if (openDropdown === 'category') {
      return allCats.map(({ key, label }) => renderOption(label, activeCategory === key, () =>
        navigateTo({ category: activeCategory === key ? '' : key })));
    }
    if (openDropdown === 'location') {
      return locations.map(loc => renderOption(loc, activeLocation === loc, () =>
        navigateTo({ location: activeLocation === loc ? '' : loc })));
    }
    if (openDropdown === 'month') {
      return MONTHS_TR.map((monthTr, i) => {
        const key = monthTr.toLowerCase();
        return renderOption(monthLabels[i], activeMonth === key, () =>
          navigateTo({ month: activeMonth === key ? '' : key }));
      });
    }
    return null;
  };

  const renderOption = (label: string, isActive: boolean, onClick: () => void) => (
    <button
      key={label}
      onClick={onClick}
      style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        width: '100%', padding: '11px 14px', border: 'none', borderRadius: '10px',
        background: isActive ? '#FFF4F1' : 'transparent',
        fontSize: '0.86rem', fontWeight: isActive ? 700 : 500,
        color: isActive ? '#FF5533' : '#3A3A3A',
        cursor: 'pointer', textAlign: 'left', fontFamily: 'inherit',
      }}
    >
      {label}
      {isActive && (
        <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
      )}
    </button>
  );

  return (
    <div className="mob-filterbar">
      <style>{`
        .mob-filterbar { display: none; }
        @media (max-width: 768px) {
          .mob-filterbar { display: block; margin-bottom: 20px; }
        }
        .mob-chip-row {
          display: flex; gap: 8px; overflow-x: auto; padding-bottom: 4px;
          scrollbar-width: none; -webkit-overflow-scrolling: touch;
        }
        .mob-chip-row::-webkit-scrollbar { display: none; }
      `}</style>

      {/* Arama */}
      <form onSubmit={handleSearch} style={{ position: 'relative', marginBottom: '10px' }}>
        <input
          type="text"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          placeholder={tt.searchPlaceholder}
          style={{
            width: '100%', padding: '11px 40px 11px 14px',
            borderRadius: '12px', border: '1.5px solid #EAEAEA',
            background: 'white', fontSize: '0.86rem', color: '#1A1A1A',
            outline: 'none', boxSizing: 'border-box',
          }}
        />
        <button
          type="submit"
          aria-label="Ara"
          style={{
            position: 'absolute', right: '8px', top: '50%', transform: 'translateY(-50%)',
            background: 'none', border: 'none', cursor: 'pointer', padding: '6px',
            color: activeSearch ? '#FF5533' : '#BBBBBB', display: 'flex', alignItems: 'center',
          }}
        >
          <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
            <circle cx="11" cy="11" r="8"/><path strokeLinecap="round" d="m21 21-4.35-4.35"/>
          </svg>
        </button>
      </form>

      {/* Filtre çipleri — yatay kaydırmalı, doğal genişlik */}
      <div className="mob-chip-row">
        {chips.map(({ key, placeholder, value }) => {
          const isOpen = openDropdown === key;
          const hasValue = !!value;
          return (
            <button
              key={key}
              onClick={() => setOpenDropdown(isOpen ? null : key)}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: '6px', flexShrink: 0,
                padding: '9px 14px', borderRadius: '100px',
                border: `1.5px solid ${hasValue || isOpen ? '#FF5533' : '#E5E5E5'}`,
                background: hasValue ? '#FF5533' : 'white',
                color: hasValue ? 'white' : (isOpen ? '#FF5533' : '#3A3A3A'),
                fontSize: '0.82rem', fontWeight: 700, cursor: 'pointer',
                fontFamily: 'inherit', whiteSpace: 'nowrap',
                transition: 'all 0.15s',
              }}
            >
              {value || placeholder}
              <svg
                width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"
                style={{ transform: isOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.15s' }}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          );
        })}

        {(activeCategory || activeLocation || activeMonth || activeSearch) && (
          <button
            onClick={() => router.push(basePath)}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: '5px', flexShrink: 0,
              padding: '9px 14px', borderRadius: '100px',
              border: '1.5px solid #E5E5E5', background: 'white',
              color: '#9A9A9A', fontSize: '0.82rem', fontWeight: 700,
              cursor: 'pointer', fontFamily: 'inherit', whiteSpace: 'nowrap',
            }}
          >
            <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
            {tt.clearFilters}
          </button>
        )}
      </div>

      {/* Açılır seçenek paneli */}
      {openDropdown && (
        <div style={{
          marginTop: '10px', background: 'white', border: '1px solid #EAEAEA',
          borderRadius: '14px', padding: '8px',
          maxHeight: '260px', overflowY: 'auto',
          boxShadow: '0 8px 24px rgba(0,0,0,0.08)',
        }}>
          {renderOptions()}
        </div>
      )}
    </div>
  );
}
