'use client';

import { useState, useEffect, useRef } from 'react';

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
const FADE_MS  = 800;

export default function TurlarHero({ children }: { children: React.ReactNode }) {
  // bottom: always fully visible base layer
  // top: incoming slide fading in
  const [bottom, setBottom]     = useState(0);
  const [top, setTop]           = useState<number | null>(null);
  const [topVisible, setTopVisible] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const goTo = (next: number) => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setTop(next);
    setTopVisible(false);

    // One frame later → trigger CSS transition
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setTopVisible(true);
      });
    });

    // After fade completes → swap bottom, hide top layer
    timerRef.current = setTimeout(() => {
      setBottom(next);
      setTop(null);
      setTopVisible(false);
    }, FADE_MS + 50);
  };

  useEffect(() => {
    const id = setInterval(() => {
      setBottom((cur) => {
        const next = (cur + 1) % SLIDES.length;
        goTo(next);
        return cur; // bottom stays until fade done
      });
    }, INTERVAL);
    return () => { clearInterval(id); if (timerRef.current) clearTimeout(timerRef.current); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const slideBase: React.CSSProperties = {
    position: 'absolute',
    inset: 0,
    backgroundSize: 'cover',
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
      // NOT overflow:hidden — dropdown must bleed through
    }}>
      {/* Base slide — always visible */}
      <div style={{
        ...slideBase,
        backgroundImage: `${OVERLAY}, url("${SLIDES[bottom].url}")`,
        backgroundPosition: SLIDES[bottom].position,
      }} />

      {/* Incoming slide — fades in */}
      {top !== null && (
        <div style={{
          ...slideBase,
          backgroundImage: `${OVERLAY}, url("${SLIDES[top].url}")`,
          backgroundPosition: SLIDES[top].position,
          opacity: topVisible ? 1 : 0,
          transition: `opacity ${FADE_MS}ms ease`,
        }} />
      )}

      {/* Dot indicators */}
      <div style={{
        position: 'absolute',
        bottom: '16px',
        right: '32px',
        display: 'flex',
        gap: '6px',
        zIndex: 10,
      }}>
        {SLIDES.map((_, i) => {
          const active = i === (top !== null && topVisible ? top : bottom);
          return (
            <button
              key={i}
              onClick={() => goTo(i)}
              style={{
                width:  active ? '20px' : '6px',
                height: '6px',
                borderRadius: '3px',
                background: active ? '#FF5533' : 'rgba(255,255,255,0.45)',
                border: 'none',
                cursor: 'pointer',
                padding: 0,
                transition: 'width 0.3s ease, background 0.3s ease',
              }}
            />
          );
        })}
      </div>

      {/* Content */}
      <div style={{ position: 'relative', zIndex: 5, maxWidth: '860px', width: '100%', padding: '0 32px' }}>
        {children}
      </div>
    </div>
  );
}
