'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

const CATEGORIES = [
  'trekking', 'dağcılık', 'kano', 'rafting',
  'bisiklet', 'kamp', 'dalış', 'yamaç paraşütü',
];

interface Props {
  labels: {
    searchDate: string;
    searchLocation: string;
    searchCategory: string;
    searchBtn: string;
    allCategories: string;
  };
}

export default function TurlarSearchBar({ labels }: Props) {
  const router = useRouter();
  const params = useSearchParams();

  const [date, setDate] = useState('');
  const [location, setLocation] = useState('');
  const [category, setCategory] = useState('');

  useEffect(() => {
    setDate(params.get('start_date') ?? '');
    setLocation(params.get('location') ?? '');
    setCategory(params.get('category') ?? '');
  }, [params]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const q = new URLSearchParams();
    if (date) q.set('start_date', date);
    if (location.trim()) q.set('location', location.trim());
    if (category) q.set('category', category);
    router.push(`/turlar${q.toString() ? `?${q}` : ''}`);
  }

  return (
    <div style={{
      background: 'white',
      boxShadow: '0 4px 32px rgba(0,0,0,0.10)',
      borderRadius: '16px',
      padding: '12px 16px',
      maxWidth: '900px',
      margin: '0 auto',
    }}>
      <form onSubmit={handleSubmit} style={{
        display: 'flex',
        gap: '0',
        alignItems: 'stretch',
        flexWrap: 'wrap',
      }}>
        {/* Date */}
        <div style={{ flex: '1 1 160px', borderRight: '1px solid #EAEAEA', padding: '8px 16px' }}>
          <label style={{ display: 'block', fontSize: '0.68rem', fontWeight: 700, color: '#1A1A1A', letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: '4px' }}>
            {labels.searchDate}
          </label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            style={{
              border: 'none', outline: 'none', fontSize: '0.88rem',
              color: date ? '#1A1A1A' : '#9A9A9A', background: 'transparent',
              width: '100%', cursor: 'pointer',
            }}
          />
        </div>

        {/* Location */}
        <div style={{ flex: '1 1 180px', borderRight: '1px solid #EAEAEA', padding: '8px 16px' }}>
          <label style={{ display: 'block', fontSize: '0.68rem', fontWeight: 700, color: '#1A1A1A', letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: '4px' }}>
            {labels.searchLocation}
          </label>
          <input
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="İstanbul, Rize..."
            style={{
              border: 'none', outline: 'none', fontSize: '0.88rem',
              color: '#1A1A1A', background: 'transparent', width: '100%',
            }}
          />
        </div>

        {/* Category */}
        <div style={{ flex: '1 1 180px', padding: '8px 16px' }}>
          <label style={{ display: 'block', fontSize: '0.68rem', fontWeight: 700, color: '#1A1A1A', letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: '4px' }}>
            {labels.searchCategory}
          </label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            style={{
              border: 'none', outline: 'none', fontSize: '0.88rem',
              color: category ? '#1A1A1A' : '#9A9A9A', background: 'transparent',
              width: '100%', cursor: 'pointer', appearance: 'none',
            }}
          >
            <option value="">{labels.allCategories}</option>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>
            ))}
          </select>
        </div>

        {/* Submit */}
        <div style={{ padding: '4px 0 4px 12px', display: 'flex', alignItems: 'center' }}>
          <button type="submit" style={{
            background: '#FF5533',
            color: 'white',
            border: 'none',
            borderRadius: '12px',
            padding: '12px 24px',
            fontSize: '0.88rem',
            fontWeight: 700,
            cursor: 'pointer',
            whiteSpace: 'nowrap',
            transition: 'background 0.15s',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.background = '#E64420')}
          onMouseLeave={(e) => (e.currentTarget.style.background = '#FF5533')}
          >
            {labels.searchBtn}
          </button>
        </div>
      </form>
    </div>
  );
}
