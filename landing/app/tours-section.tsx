'use client';

import { useState, useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import type { Tour, TourDifficulty } from '@/lib/types';

// ── Category config ───────────────────────────────
type Cat = TourDifficulty | 'all';

const CATEGORIES: { value: Cat; icon: string; label: string }[] = [
  { value: 'all',         icon: '🌍', label: 'Tümü' },
  { value: 'easy',        icon: '🥾', label: 'Kolay' },
  { value: 'easy_medium', icon: '🥾', label: 'Kolay-Orta' },
  { value: 'medium',      icon: '⛏️', label: 'Orta' },
  { value: 'medium_hard', icon: '⛏️', label: 'Orta-Zor' },
  { value: 'hard',        icon: '🧗', label: 'Zor' },
  { value: 'very_hard',   icon: '🧗', label: 'Çok Zor' },
  { value: 'extreme',     icon: '💀', label: 'Ekstrem' },
];

const DIFF_LABEL: Record<TourDifficulty, string> = {
  easy:        'Kolay',
  easy_medium: 'Kolay-Orta',
  medium:      'Orta',
  medium_hard: 'Orta-Zor',
  hard:        'Zor',
  very_hard:   'Çok Zor',
  extreme:     'Ekstrem',
};

const PH_CLASS: Record<TourDifficulty, string> = {
  easy:        'ph-easy',
  easy_medium: 'ph-easy',
  medium:      'ph-medium',
  medium_hard: 'ph-medium',
  hard:        'ph-hard',
  very_hard:   'ph-hard',
  extreme:     'ph-extreme',
};

// ── Helpers ───────────────────────────────────────
function nearestDate(dates: Tour['dates']) {
  const now = new Date();
  return dates
    .filter((d) => new Date(d.date) >= now)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())[0] ?? null;
}

function fmtDate(s: string) {
  return new Date(s).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' });
}

// ── Card ─────────────────────────────────────────
function TourCard({ tour, index }: { tour: Tour; index: number }) {
  const [liked, setLiked] = useState(false);
  const hasPhoto = tour.photo_urls.length > 0;
  const next = nearestDate(tour.dates);
  const spotsLeft = next?.available_slots ?? null;
  const showSpotsWarning = spotsLeft !== null && spotsLeft <= 5 && spotsLeft > 0;

  return (
    <Link
      href={`/tours/${tour.id}`}
      className="card card-enter"
      style={{ animationDelay: `${Math.min(index, 7) * 55}ms` }}
    >
      {/* Thumbnail */}
      <div className="card-thumb">
        {hasPhoto ? (
          <Image
            src={tour.photo_urls[0]}
            alt={tour.name}
            fill
            sizes="(max-width: 560px) 100vw, (max-width: 860px) 50vw, (max-width: 1200px) 33vw, 25vw"
          />
        ) : (
          <div
            className={`card-thumb ${PH_CLASS[tour.difficulty]}`}
            style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth="1.2">
              <path d="M3 17l4-8 4 4 3-6 4 10H3z" />
            </svg>
          </div>
        )}

        {/* Spots badge */}
        {showSpotsWarning && (
          <span className="card-badge-spots">Son {spotsLeft} yer</span>
        )}

        {/* Difficulty bottom-left */}
        <span className="card-badge-diff">{DIFF_LABEL[tour.difficulty]}</span>

        {/* Heart */}
        <button
          className="card-heart"
          onClick={(e) => { e.preventDefault(); setLiked((v) => !v); }}
          aria-label="Favorilere ekle"
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill={liked ? '#FF5533' : 'none'} stroke={liked ? '#FF5533' : '#333'} strokeWidth="2">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
          </svg>
        </button>
      </div>

      {/* Body */}
      <div className="card-body">
        <h3 className="card-name">{tour.name}</h3>

        <p className="card-meta">
          <span>{DIFF_LABEL[tour.difficulty]}</span>
          <span className="card-meta-dot" />
          <span>{tour.location_name}</span>
        </p>

        <div className="card-stats-row">
          {tour.altitude_meters != null && tour.altitude_meters > 0 && (
            <span className="card-stat-chip">⛰ {tour.altitude_meters.toLocaleString()}m</span>
          )}
          {tour.distance_km != null && Number(tour.distance_km) > 0 && (
            <span className="card-stat-chip">📏 {Number(tour.distance_km).toFixed(1)}km</span>
          )}
          <span className="card-stat-chip">👥 max {tour.max_participants}</span>
        </div>

        {/* Date range */}
        {tour.start_date ? (
          <p style={{ fontSize: '0.8rem', color: '#5A5A5A', margin: '4px 0 0', fontWeight: 500 }}>
            📅 {fmtDate(tour.start_date)}{tour.end_date ? ` – ${fmtDate(tour.end_date)}` : ''}
          </p>
        ) : next ? (
          <p className="card-free">{fmtDate(next.date)} — {next.available_slots} kontenjan</p>
        ) : (
          <p style={{ fontSize: '0.78rem', color: 'var(--text-3)', marginTop: '2px' }}>
            Tarih bekleniyor
          </p>
        )}

        {/* Price */}
        {tour.price != null && Number(tour.price) > 0 && (
          <p style={{ fontSize: '0.9rem', fontWeight: 700, color: '#FF5533', margin: '4px 0 0' }}>
            ₺{Number(tour.price).toLocaleString('tr-TR')}
            <span style={{ fontSize: '0.72rem', fontWeight: 400, color: '#AAAAAA', marginLeft: '3px' }}>/ kişi</span>
          </p>
        )}
      </div>
    </Link>
  );
}

// ── Main section ──────────────────────────────────
export default function ToursSection({ tours }: { tours: Tour[] }) {
  const [cat, setCat] = useState<Cat>('all');

  const filtered = useMemo(
    () => cat === 'all' ? tours : tours.filter((t) => t.difficulty === cat),
    [tours, cat],
  );

  // Only show categories that have tours
  const availableCats = useMemo(() => {
    return CATEGORIES.filter(
      (c) => c.value === 'all' || tours.some((t) => t.difficulty === c.value)
    );
  }, [tours]);

  return (
    <main id="turlar">
      {/* ── Category row ─────────────────────────── */}
      <div className="cat-row">
        {availableCats.map((c) => (
          <button
            key={c.value}
            className={`cat-item ${cat === c.value ? 'active' : ''}`}
            onClick={() => setCat(c.value)}
          >
            <span className="cat-icon">{c.icon}</span>
            <span>{c.label}</span>
          </button>
        ))}
      </div>

      {/* ── Tour grid ────────────────────────────── */}
      <div className="tour-section">
        <div className="section-row">
          <h2 className="section-title">
            {tours.length === 0
              ? 'Türkiye\'deki Popüler Aktiviteler'
              : `Türkiye'deki Popüler Aktiviteler`}
          </h2>
          {filtered.length > 0 && (
            <a href="#turlar" className="see-all">
              Tümünü gör
              <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </a>
          )}
        </div>

        <div className="tour-grid">
          {filtered.length === 0 ? (
            <div className="empty">
              {tours.length === 0
                ? 'Yakında turlar eklenecek.'
                : 'Bu kategoride tur bulunamadı.'}
            </div>
          ) : (
            filtered.map((tour, i) => <TourCard key={tour.id} tour={tour} index={i} />)
          )}
        </div>
      </div>
    </main>
  );
}
