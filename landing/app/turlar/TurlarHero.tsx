'use client';

import { useState, useEffect } from 'react';

const SLIDES = [
  {
    url: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1600&q=80',
    position: 'center 40%',
  },
  {
    url: 'https://images.unsplash.com/photo-1682687982502-1529b3b33f85?w=1600&q=80',
    position: 'center 50%',
  },
  {
    url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1600&q=80',
    position: 'center 35%',
  },
  {
    url: 'https://images.unsplash.com/photo-1530866495561-507c9faab2ed?w=1600&q=80',
    position: 'center 50%',
  },
];

const OVERLAY = 'linear-gradient(rgba(0,0,0,0.32) 0%, rgba(0,0,0,0.52) 60%, rgba(0,0,0,0.70) 100%)';
const INTERVAL = 5000;

export default function TurlarHero({ children }: { children: React.ReactNode }) {
  const [current, setCurrent] = useState(0);
  const [prev, setPrev] = useState<number | null>(null);
  const [fading, setFading] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setFading(true);
      setPrev(current);
      const next = (current + 1) % SLIDES.length;
      setTimeout(() => {
        setCurrent(next);
        setFading(false);
        setPrev(null);
      }, 700);
    }, INTERVAL);
    return () => clearInterval(timer);
  }, [current]);

  const baseStyle: React.CSSProperties = {
    position: 'absolute',
    inset: 0,
    backgroundSize: 'cover',
    transition: 'opacity 0.7s ease',
  };

  return (
    <div style={{
      position: 'relative',
      minHeight: '526px',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'flex-end',
      paddingBottom: '40px',
      overflow: 'hidden',
    }}>
      {/* Previous slide (fading out) */}
      {prev !== null && (
        <div style={{
          ...baseStyle,
          backgroundImage: `${OVERLAY}, url("${SLIDES[prev].url}")`,
          backgroundPosition: SLIDES[prev].position,
          opacity: fading ? 0 : 1,
        }} />
      )}

      {/* Current slide */}
      <div style={{
        ...baseStyle,
        backgroundImage: `${OVERLAY}, url("${SLIDES[current].url}")`,
        backgroundPosition: SLIDES[current].position,
        opacity: 1,
      }} />

      {/* Dot indicators */}
      <div style={{
        position: 'absolute',
        bottom: '16px',
        right: '32px',
        display: 'flex',
        gap: '6px',
        zIndex: 10,
      }}>
        {SLIDES.map((_, i) => (
          <button
            key={i}
            onClick={() => {
              setFading(true);
              setPrev(current);
              setTimeout(() => {
                setCurrent(i);
                setFading(false);
                setPrev(null);
              }, 700);
            }}
            style={{
              width: i === current ? '20px' : '6px',
              height: '6px',
              borderRadius: '3px',
              background: i === current ? '#FF5533' : 'rgba(255,255,255,0.45)',
              border: 'none',
              cursor: 'pointer',
              padding: 0,
              transition: 'width 0.3s ease, background 0.3s ease',
            }}
          />
        ))}
      </div>

      {/* Content (search bar etc.) */}
      <div style={{ position: 'relative', zIndex: 5, maxWidth: '860px', width: '100%', padding: '0 32px' }}>
        {children}
      </div>
    </div>
  );
}
