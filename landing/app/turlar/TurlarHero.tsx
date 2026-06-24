'use client';

import { useState, useEffect, useRef } from 'react';

const SLIDES = [
  { url: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1600&q=80', position: 'center 40%' },
  { url: 'https://images.unsplash.com/photo-1682687982502-1529b3b33f85?w=1600&q=80', position: 'center 50%' },
  { url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1600&q=80', position: 'center 35%' },
  { url: 'https://images.unsplash.com/photo-1530866495561-507c9faab2ed?w=1600&q=80', position: 'center 50%' },
];

const OVERLAY = 'linear-gradient(rgba(0,0,0,0.32) 0%, rgba(0,0,0,0.52) 60%, rgba(0,0,0,0.70) 100%)';

export default function TurlarHero({ children }: { children: React.ReactNode }) {
  const [current, setCurrent] = useState(0);
  const [prev, setPrev] = useState<number | null>(null);
  const nextRef = useRef(0);

  useEffect(() => {
    const id = setInterval(() => {
      const next = (nextRef.current + 1) % SLIDES.length;
      nextRef.current = next;
      setPrev(nextRef.current === 0 ? SLIDES.length - 1 : nextRef.current - 1);
      setCurrent(next);
      const t = setTimeout(() => setPrev(null), 900);
      return () => clearTimeout(t);
    }, 5000);
    return () => clearInterval(id);
  }, []);

  const goTo = (i: number) => {
    setPrev(current);
    nextRef.current = i;
    setCurrent(i);
    setTimeout(() => setPrev(null), 900);
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
    }}>
      {/* Prev slide fading out */}
      {prev !== null && (
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: `${OVERLAY}, url("${SLIDES[prev].url}")`,
          backgroundSize: 'cover',
          backgroundPosition: SLIDES[prev].position,
          opacity: 0,
          transition: 'opacity 0.9s ease',
        }} />
      )}

      {/* Current slide */}
      <div style={{
        position: 'absolute', inset: 0,
        backgroundImage: `${OVERLAY}, url("${SLIDES[current].url}")`,
        backgroundSize: 'cover',
        backgroundPosition: SLIDES[current].position,
        opacity: 1,
        transition: 'opacity 0.9s ease',
      }} />

      {/* Dots */}
      <div style={{ position: 'absolute', bottom: 16, right: 32, display: 'flex', gap: 6, zIndex: 10 }}>
        {SLIDES.map((_, i) => (
          <button key={i} onClick={() => goTo(i)} style={{
            width: i === current ? 20 : 6,
            height: 6,
            borderRadius: 3,
            background: i === current ? '#FF5533' : 'rgba(255,255,255,0.45)',
            border: 'none',
            cursor: 'pointer',
            padding: 0,
            transition: 'width 0.3s, background 0.3s',
          }} />
        ))}
      </div>

      {/* Content */}
      <div style={{ position: 'relative', zIndex: 5, maxWidth: '860px', width: '100%', padding: '0 32px' }}>
        {children}
      </div>
    </div>
  );
}
