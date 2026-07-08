'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Image from 'next/image';

const SLIDES = [
  { url: '/hero/IMG_2278.jpg',   position: 'center 55%' }, // 3
  { url: '/hero/IMG_2280.jpg',   position: 'center 40%' }, // 4
  { url: '/hero/IMG_2282.jpg',   position: 'center 45%' }, // 5
  { url: '/hero/IMG_2285.jpg',   position: 'center 55%' }, // 6
  { url: '/hero/pexels-hero.jpg', position: 'center 70%' }, // 7
  { url: '/hero/IMG_2281.jpg',   position: 'center 62%' }, // 1
  { url: '/hero/IMG_2279.jpg',   position: 'center 38%' }, // 2
];

const INTERVAL = 5000;
const FADE_MS  = 1000;

export default function TurlarHero({ children }: { children: React.ReactNode }) {
  const [current, setCurrent] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const startTimer = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setCurrent(c => (c + 1) % SLIDES.length);
    }, INTERVAL);
  }, []);

  useEffect(() => {
    startTimer();
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [startTimer]);

  const goTo = (i: number) => {
    setCurrent(i);
    startTimer();
  };

  return (
    <>
    <style>{`
      .th-outer { position: relative; height: 65vh; min-height: 540px; display: flex; flex-direction: column; align-items: center; justify-content: flex-end; padding-bottom: 40px; }
      @media (max-width: 768px) { .th-outer { min-height: 420px !important; padding-bottom: 24px !important; } }
      @media (max-width: 480px) { .th-outer { min-height: 340px !important; height: 58vh !important; padding-bottom: 16px !important; } }
    `}</style>
    <div className="th-outer">
      {/* Background layer — overflow:hidden sadece buraya uygulanıyor,
          üst container'dan kaldırıldı ki dropdownlar kırpılmasın */}
      <div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
        {SLIDES.map((slide, i) => (
          <div
            key={i}
            aria-hidden={i !== current}
            style={{
              position: 'absolute',
              inset: 0,
              opacity: i === current ? 1 : 0,
              transition: `opacity ${FADE_MS}ms cubic-bezier(0.4, 0, 0.2, 1)`,
              willChange: 'opacity',
              zIndex: i === current ? 1 : 0,
            }}
          >
            <Image
              src={slide.url}
              alt=""
              fill
              priority={i === 0}
              sizes="100vw"
              quality={85}
              style={{
                objectFit: 'cover',
                objectPosition: slide.position,
              }}
            />
            <div style={{
              position: 'absolute',
              inset: 0,
              background: 'linear-gradient(rgba(0,0,0,0.08) 0%, rgba(0,0,0,0.28) 55%, rgba(0,0,0,0.50) 100%)',
            }} />
          </div>
        ))}
      </div>

      {/* Dot nav */}
      <div style={{
        position: 'absolute',
        bottom: 40,
        right: 32,
        display: 'flex',
        gap: 6,
        zIndex: 10,
      }}>
        {SLIDES.map((_, i) => (
          <button
            key={i}
            onClick={() => goTo(i)}
            aria-label={`Slayt ${i + 1}`}
            style={{
              width: i === current ? 22 : 7,
              height: 7,
              borderRadius: 4,
              background: i === current ? '#FF5533' : 'rgba(255,255,255,0.45)',
              border: 'none',
              cursor: 'pointer',
              padding: 0,
              transition: 'width 0.35s cubic-bezier(0.4,0,0.2,1), background 0.25s',
            }}
          />
        ))}
      </div>

      {/* Content */}
      <div style={{
        position: 'relative',
        zIndex: 5,
        maxWidth: '860px',
        width: '100%',
        padding: '0 32px',
      }}>
        {children}
      </div>
    </div>
    </>
  );
}
