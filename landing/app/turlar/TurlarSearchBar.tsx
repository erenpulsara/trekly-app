'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

const CATEGORIES = [
  'trekking', 'dağcılık', 'kano', 'rafting',
  'bisiklet', 'kamp', 'dalış', 'yamaç paraşütü',
];

const MONTHS = [
  { label: 'Ocak',    value: '01' },
  { label: 'Şubat',   value: '02' },
  { label: 'Mart',    value: '03' },
  { label: 'Nisan',   value: '04' },
  { label: 'Mayıs',   value: '05' },
  { label: 'Haziran', value: '06' },
  { label: 'Temmuz',  value: '07' },
  { label: 'Ağustos', value: '08' },
  { label: 'Eylül',   value: '09' },
  { label: 'Ekim',    value: '10' },
  { label: 'Kasım',   value: '11' },
  { label: 'Aralık',  value: '12' },
];

const CURRENT_YEAR = new Date().getFullYear();

/* ── Custom Dropdown ───────────────────────────────── */
interface DropdownOption { label: string; value: string }

function CustomDropdown({
  options,
  value,
  placeholder,
  onChange,
  label,
  divider,
  columns = 1,
}: {
  options: DropdownOption[];
  value: string;
  placeholder: string;
  onChange: (v: string) => void;
  label: string;
  divider?: boolean;
  columns?: number;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const close = useCallback(() => setOpen(false), []);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) close();
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open, close]);

  const selected = options.find((o) => o.value === value);
  const displayLabel = selected ? selected.label : placeholder;
  const isGrid = columns > 1;

  return (
    <div
      ref={ref}
      style={{
        flex: '1 1 0',
        position: 'relative',
        borderRight: divider ? '1px solid rgba(255,255,255,0.12)' : 'none',
        minWidth: 0,
      }}
    >
      <button
        type="button"
        onClick={() => setOpen((p) => !p)}
        style={{
          width: '100%',
          height: '52px',
          padding: '0 18px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '2px',
          background: 'transparent',
          border: 'none',
          cursor: 'pointer',
          outline: 'none',
        }}
      >
        <span style={{
          fontSize: '0.58rem',
          fontWeight: 700,
          letterSpacing: '0.12em',
          textTransform: 'uppercase',
          color: 'rgba(255,255,255,0.45)',
        }}>
          {label}
        </span>
        <span style={{
          fontSize: '0.82rem',
          fontWeight: 500,
          color: value ? 'white' : 'rgba(255,255,255,0.38)',
          display: 'flex',
          alignItems: 'center',
          gap: '5px',
          whiteSpace: 'nowrap',
        }}>
          {displayLabel}
          <svg
            width="10" height="10" viewBox="0 0 10 10" fill="none"
            style={{ transition: 'transform 0.2s', transform: open ? 'rotate(180deg)' : 'rotate(0deg)', opacity: 0.5, flexShrink: 0 }}
          >
            <path d="M2 3.5L5 6.5L8 3.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </span>
      </button>

      {open && (
        <div style={{
          position: 'absolute',
          top: 'calc(100% + 10px)',
          left: '50%',
          transform: 'translateX(-50%)',
          background: 'rgba(255,255,255,0.97)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          border: '1px solid rgba(0,0,0,0.08)',
          borderRadius: '14px',
          boxShadow: '0 8px 32px rgba(0,0,0,0.14)',
          zIndex: 999,
          padding: '8px',
          minWidth: isGrid ? 'unset' : '160px',
        }}>
          {/* "Tümü / Tüm Aylar" — her zaman tam genişlik */}
          <DropdownItem
            label={placeholder}
            active={value === ''}
            onClick={() => { onChange(''); close(); }}
            fullWidth
          />
          <div style={{ height: '1px', background: 'rgba(0,0,0,0.07)', margin: '4px 0' }} />

          {isGrid ? (
            <div style={{
              display: 'grid',
              gridTemplateColumns: `repeat(${columns}, 1fr)`,
              gap: '2px',
            }}>
              {options.map((opt) => (
                <DropdownItem
                  key={opt.value}
                  label={opt.label}
                  active={value === opt.value}
                  onClick={() => { onChange(opt.value); close(); }}
                />
              ))}
            </div>
          ) : (
            options.map((opt) => (
              <DropdownItem
                key={opt.value}
                label={opt.label}
                active={value === opt.value}
                onClick={() => { onChange(opt.value); close(); }}
                fullWidth
              />
            ))
          )}
        </div>
      )}
    </div>
  );
}

function DropdownItem({
  label, active, onClick, fullWidth,
}: {
  label: string; active: boolean; onClick: () => void; fullWidth?: boolean;
}) {
  const [hover, setHover] = useState(false);
  return (
    <button
      type="button"
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: fullWidth ? 'space-between' : 'center',
        width: fullWidth ? '100%' : 'auto',
        padding: fullWidth ? '8px 12px' : '7px 14px',
        borderRadius: '8px',
        background: active ? 'rgba(255,85,51,0.10)' : hover ? 'rgba(0,0,0,0.04)' : 'transparent',
        border: active ? '1px solid rgba(255,85,51,0.25)' : '1px solid transparent',
        cursor: 'pointer',
        color: active ? '#FF5533' : '#3A3A3A',
        fontSize: '0.8rem',
        fontWeight: active ? 600 : 400,
        textAlign: 'center',
        transition: 'background 0.12s, color 0.12s, border-color 0.12s',
        whiteSpace: 'nowrap',
        letterSpacing: '0.01em',
      }}
    >
      {label}
      {active && fullWidth && (
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <path d="M2.5 7L5.5 10L11.5 4" stroke="#FF5533" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      )}
    </button>
  );
}

/* ── Props ─────────────────────────────────────────── */
interface Props {
  labels: {
    searchDate: string;
    searchLocation: string;
    searchCategory: string;
    searchBtn: string;
    allCategories: string;
  };
}

/* ── Main Component ─────────────────────────────────── */
export default function TurlarSearchBar({ labels }: Props) {
  const router = useRouter();
  const params = useSearchParams();

  const [month, setMonth] = useState('');
  const [location, setLocation] = useState('');
  const [category, setCategory] = useState('');

  useEffect(() => {
    const d = params.get('start_date') ?? '';
    setMonth(d ? d.slice(5, 7) : '');
    setLocation(params.get('location') ?? '');
    setCategory(params.get('category') ?? '');
  }, [params]);

  function monthToDate(m: string) {
    return m ? `${CURRENT_YEAR}-${m}-01` : '';
  }

  function buildQuery(overrides: { month?: string; location?: string; category?: string }) {
    const q = new URLSearchParams();
    const m = overrides.month    !== undefined ? overrides.month    : month;
    const l = overrides.location !== undefined ? overrides.location : location;
    const c = overrides.category !== undefined ? overrides.category : category;
    const d = monthToDate(m);
    if (d) q.set('start_date', d);
    if (l.trim()) q.set('location', l.trim());
    if (c) q.set('category', c);
    return `/turlar${q.toString() ? `?${q}` : ''}`;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    router.push(buildQuery({}));
  }

  function handleCategoryChange(val: string) {
    setCategory(val);
    router.push(buildQuery({ category: val }));
  }

  function handleMonthChange(val: string) {
    setMonth(val);
    router.push(buildQuery({ month: val }));
  }

  const categoryOptions: DropdownOption[] = CATEGORIES.map((c) => ({
    value: c,
    label: c.charAt(0).toUpperCase() + c.slice(1),
  }));

  return (
    <form
      onSubmit={handleSubmit}
      style={{
        display: 'flex',
        alignItems: 'center',
        background: 'rgba(255,255,255,0.10)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        border: '1px solid rgba(255,255,255,0.16)',
        borderRadius: '100px',
        overflow: 'visible',
        boxShadow: '0 4px 24px rgba(0,0,0,0.2)',
        height: '52px',
      }}
    >
      {/* Month */}
      <CustomDropdown
        label={labels.searchDate}
        options={MONTHS}
        value={month}
        placeholder="Tüm Aylar"
        onChange={handleMonthChange}
        divider
        columns={3}
      />

      {/* Location */}
      <div style={{
        flex: '1 1 0',
        padding: '0 18px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '2px',
        minWidth: 0,
        height: '52px',
        borderRight: '1px solid rgba(255,255,255,0.12)',
      }}>
        <label style={{
          fontSize: '0.58rem',
          fontWeight: 700,
          letterSpacing: '0.12em',
          textTransform: 'uppercase',
          color: 'rgba(255,255,255,0.45)',
          textAlign: 'center',
          width: '100%',
        }}>
          {labels.searchLocation}
        </label>
        <input
          type="text"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          placeholder="İstanbul, Rize..."
          style={{
            border: 'none',
            outline: 'none',
            fontSize: '0.82rem',
            fontWeight: 500,
            color: 'white',
            background: 'transparent',
            width: '100%',
            cursor: 'text',
            textAlign: 'center',
          }}
        />
      </div>

      {/* Category */}
      <CustomDropdown
        label={labels.searchCategory}
        options={categoryOptions}
        value={category}
        placeholder={labels.allCategories}
        onChange={handleCategoryChange}
        divider
        columns={2}
      />

      {/* Submit */}
      <div style={{ padding: '5px', flexShrink: 0 }}>
        <button
          type="submit"
          style={{
            background: '#FF5533',
            color: 'white',
            border: 'none',
            borderRadius: '100px',
            padding: '10px 22px',
            fontSize: '0.82rem',
            fontWeight: 700,
            cursor: 'pointer',
            whiteSpace: 'nowrap',
            transition: 'background 0.15s',
            letterSpacing: '0.02em',
            height: '42px',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.background = '#E64420')}
          onMouseLeave={(e) => (e.currentTarget.style.background = '#FF5533')}
        >
          {labels.searchBtn}
        </button>
      </div>
    </form>
  );
}
