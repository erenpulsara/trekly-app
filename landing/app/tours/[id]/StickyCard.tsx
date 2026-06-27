'use client';
import { useEffect, useRef, type ReactNode } from 'react';

const TOP_OFFSET = 88;

export default function StickyCard({ children }: { children: ReactNode }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    const card = cardRef.current;
    if (!container || !card) return;

    const update = () => {
      const cRect = container.getBoundingClientRect();
      const cardH = card.offsetHeight;

      if (cRect.top > TOP_OFFSET) {
        // Above sticky zone — natural flow
        card.style.position = 'relative';
        card.style.top = '0';
        card.style.bottom = '';
        card.style.left = '';
        card.style.width = '';
      } else if (cRect.bottom < TOP_OFFSET + cardH) {
        // Below sticky zone — pin to container bottom
        card.style.position = 'absolute';
        card.style.top = 'auto';
        card.style.bottom = '0';
        card.style.left = '0';
        card.style.width = '100%';
      } else {
        // In sticky zone — fix to viewport
        card.style.position = 'fixed';
        card.style.top = `${TOP_OFFSET}px`;
        card.style.bottom = '';
        card.style.left = `${cRect.left}px`;
        card.style.width = `${container.offsetWidth}px`;
      }
    };

    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    update();
    return () => {
      window.removeEventListener('scroll', update);
      window.removeEventListener('resize', update);
    };
  }, []);

  return (
    <div ref={containerRef} style={{ position: 'relative', height: '100%' }}>
      <div ref={cardRef}>
        {children}
      </div>
    </div>
  );
}
