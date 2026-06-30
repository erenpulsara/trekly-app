'use client';
import { useState } from 'react';

interface TabItem {
  label: string;
  content: string | null | undefined;
  link?: { url: string; label: string } | null;
}

export default function TourTabs({ tabs }: { tabs: TabItem[] }) {
  const visible = tabs.filter((t) => t.content);
  const [active, setActive] = useState(0);

  if (visible.length === 0) return null;

  return (
    <div style={{ marginTop: '8px' }}>
      {/* Tab bar */}
      <div style={{
        display: 'flex',
        borderBottom: '2px solid #F0F0F0',
        marginBottom: '24px',
        overflowX: 'auto',
        scrollbarWidth: 'none',
      }}>
        {visible.map((tab, i) => (
          <button
            key={tab.label}
            onClick={() => setActive(i)}
            style={{
              padding: '11px 18px',
              fontSize: '0.85rem',
              fontWeight: active === i ? 700 : 500,
              color: active === i ? '#FF5533' : '#6A6A6A',
              background: 'none',
              border: 'none',
              borderBottom: `2.5px solid ${active === i ? '#FF5533' : 'transparent'}`,
              marginBottom: '-2px',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              transition: 'color 0.15s, border-color 0.15s',
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <p style={{
        fontSize: '0.95rem',
        color: '#5A5A5A',
        lineHeight: 1.85,
        whiteSpace: 'pre-line',
        margin: 0,
      }}>
        {visible[active].content}
      </p>
      {visible[active].link && (
        <a
          href={visible[active].link!.url}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: 'inline-flex', alignItems: 'center', gap: '6px',
            marginTop: '14px',
            fontSize: '0.85rem', fontWeight: 600, color: '#FF5533',
            textDecoration: 'none',
            background: '#FFF4F1', border: '1px solid rgba(255,85,51,0.2)',
            padding: '7px 14px', borderRadius: '10px',
          }}
        >
          <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
          {visible[active].link!.label}
        </a>
      )}
    </div>
  );
}
