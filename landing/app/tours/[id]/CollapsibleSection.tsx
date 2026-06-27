'use client';

import { useState } from 'react';

interface Props {
  title: string;
  content: string;
}

export default function CollapsibleSection({ title, content }: Props) {
  const [open, setOpen] = useState(false);

  // 5-6 satır yaklaşık 120px (1.8 line-height × 0.95rem × 6 satır)
  const COLLAPSED_HEIGHT = 130;

  return (
    <div style={{ marginBottom: '28px' }}>
      {/* Header — tıklanabilir */}
      <button
        onClick={() => setOpen((v) => !v)}
        style={{
          width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          background: 'none', border: 'none', padding: '0 0 12px', cursor: 'pointer',
        }}
      >
        <h2 style={{ fontSize: '1.1rem', fontWeight: 800, letterSpacing: '-0.02em', color: '#1A1A1A', margin: 0 }}>
          {title}
        </h2>
        <span style={{
          width: '28px', height: '28px', borderRadius: '50%', background: '#F5F5F5',
          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
          transition: 'transform 0.2s', transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
        }}>
          <svg width="14" height="14" fill="none" stroke="#555" strokeWidth="2.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </span>
      </button>

      <hr style={{ border: 'none', borderTop: '1px solid #F0F0F0', marginBottom: '14px' }} />

      {/* İçerik */}
      <div style={{
        position: 'relative',
        maxHeight: open ? 'none' : `${COLLAPSED_HEIGHT}px`,
        overflow: 'hidden',
        transition: 'max-height 0.3s ease',
      }}>
        <p style={{ fontSize: '0.95rem', color: '#5A5A5A', lineHeight: 1.8, whiteSpace: 'pre-line', margin: 0 }}>
          {content}
        </p>

        {/* Fade overlay when collapsed */}
        {!open && (
          <div style={{
            position: 'absolute', bottom: 0, left: 0, right: 0, height: '60px',
            background: 'linear-gradient(to bottom, transparent, white)',
            pointerEvents: 'none',
          }} />
        )}
      </div>

      {/* Expand / Collapse button */}
      <button
        onClick={() => setOpen((v) => !v)}
        style={{
          marginTop: '10px', background: 'none', border: 'none', padding: '4px 0',
          fontSize: '0.85rem', fontWeight: 700, color: '#FF5533', cursor: 'pointer',
          display: 'flex', alignItems: 'center', gap: '4px',
        }}
      >
        {open ? 'Daha Az Göster' : 'Devamını Gör'}
        <svg
          width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"
          style={{ transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>
    </div>
  );
}
