'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Image from 'next/image';

const SLIDES = [
  { url: '/hero/IMG_2281.jpg',   position: 'center 55%' }, // windsurfing - su seviyesi
  { url: '/hero/IMG_2279.jpg',   position: 'center 35%' }, // kite surf plajı - uçurtmalar gökyüzünde
  { url: '/hero/IMG_2278.jpg',   position: 'center 55%' }, // gece kamp ateşi - ateş + yıldızlar
  { url: '/hero/IMG_2280.jpg',   position: 'center 38%' }, // Kapadokya koşu - balonlar görünsün
  { url: '/hero/IMG_2282.jpg',   position: 'center 42%' }, // karlı zirveler trekking
  { url: '/hero/IMG_2285.jpg',   position: 'center 52%' }, // dağ zirvesi yürüyüşü
  { url: '/hero/pexels-hero.jpg', position: 'center 72%' }, // bisikletçiler alt kesimde - aşağı kaydır
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
    <div style={{
      position: 'relative',
      minHeight: '526px',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'flex-end',
      paddingBottom: '40px',
    }}>
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
              background: 'linear-gradient(rgba(0,0,0,0.28) 0%, rgba(0,0,0,0.48) 55%, rgba(0,0,0,0.68) 100%)',
            }} />
          </div>
        ))}
      </div>

      {/* Dot nav */}
      <div style={{
        position: 'absolute',
        bottom: 18,
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
  );
}
