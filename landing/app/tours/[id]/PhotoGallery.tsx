'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';

interface Props {
  photos: string[];
  tourName: string;
  gradient: string;
  overlayTitle?: string;
  overlayCategory?: string;
}

export default function PhotoGallery({ photos, tourName, gradient, overlayTitle, overlayCategory }: Props) {
  const [lightbox, setLightbox] = useState<number | null>(null);

  const close = useCallback(() => setLightbox(null), []);
  const prev = useCallback(() => setLightbox((i) => (i != null && i > 0 ? i - 1 : i)), []);
  const next = useCallback(
    () => setLightbox((i) => (i != null && i < photos.length - 1 ? i + 1 : i)),
    [photos.length],
  );

  useEffect(() => {
    if (lightbox === null) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close();
      else if (e.key === 'ArrowLeft') prev();
      else if (e.key === 'ArrowRight') next();
    };
    window.addEventListener('keydown', handler);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', handler);
      document.body.style.overflow = '';
    };
  }, [lightbox, close, prev, next]);

  const TitleOverlay = () => (
    (overlayTitle || overlayCategory) ? (
      <div style={{
        position: 'absolute',
        bottom: 0, left: 0, right: 0,
        background: 'linear-gradient(to top, rgba(0,0,0,0.82) 0%, rgba(0,0,0,0.38) 55%, transparent 100%)',
        padding: '56px 18px 18px',
        pointerEvents: 'none',
      }}>
        {overlayCategory && (
          <div style={{
            display: 'inline-block',
            background: 'rgba(255,255,255,0.16)',
            color: 'rgba(255,255,255,0.92)',
            fontSize: '0.58rem',
            fontWeight: 700,
            padding: '3px 9px',
            borderRadius: '5px',
            marginBottom: '7px',
            textTransform: 'uppercase',
            letterSpacing: '0.09em',
            border: '1px solid rgba(255,255,255,0.22)',
          }}>
            {overlayCategory}
          </div>
        )}
        {overlayTitle && (
          <div style={{
            color: 'white',
            fontSize: 'clamp(0.95rem, 1.6vw, 1.3rem)',
            fontWeight: 800,
            lineHeight: 1.2,
            letterSpacing: '-0.02em',
            textShadow: '0 1px 6px rgba(0,0,0,0.5)',
          }}>
            {overlayTitle}
          </div>
        )}
      </div>
    ) : null
  );

  if (photos.length === 0) {
    return (
      <div style={{
        height: '420px', borderRadius: '16px', background: gradient,
        position: 'relative', overflow: 'hidden',
      }}>
        <TitleOverlay />
      </div>
    );
  }

  const smallPhotos = photos.slice(1, 5);
  const extraCount = photos.length - 5;
  const hasSmalls = smallPhotos.length > 0;

  return (
    <>
      <div className="gallery-inner" style={{
        display: 'grid',
        gridTemplateColumns: hasSmalls ? '3fr 2fr' : '1fr',
        gap: '6px',
        borderRadius: '16px',
        overflow: 'hidden',
      }}>
        {/* Main photo */}
        <div
          role="button"
          tabIndex={0}
          onClick={() => setLightbox(0)}
          onKeyDown={(e) => e.key === 'Enter' && setLightbox(0)}
          style={{
            position: 'relative',
            background: gradient,
            cursor: 'zoom-in',
            outline: 'none',
            overflow: 'hidden',
            /* when no smalls, give it a 16:9 aspect */
            ...(hasSmalls ? { minHeight: '280px' } : { aspectRatio: '16/9' }),
          }}
        >
          <Image
            src={photos[0]}
            alt={tourName}
            fill
            priority
            style={{ objectFit: 'cover', objectPosition: 'center 40%' }}
          />
          <div className="gallery-hover-overlay" />
          <TitleOverlay />
        </div>

        {/* Small square photos */}
        {hasSmalls && (
          <div className="gallery-smalls" style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '6px',
          }}>
            {smallPhotos.map((url, idx) => {
              const photoIndex = idx + 1;
              const showCountOverlay = idx === 3 && extraCount > 0;
              return (
                <div
                  key={url}
                  role="button"
                  tabIndex={0}
                  onClick={() => setLightbox(photoIndex)}
                  onKeyDown={(e) => e.key === 'Enter' && setLightbox(photoIndex)}
                  style={{
                    position: 'relative',
                    aspectRatio: '1',
                    background: '#D8D8D8',
                    cursor: 'zoom-in',
                    outline: 'none',
                    overflow: 'hidden',
                  }}
                >
                  <Image src={url} alt="" fill style={{ objectFit: 'cover' }} />
                  {showCountOverlay ? (
                    <div
                      style={{
                        position: 'absolute', inset: 0,
                        background: 'rgba(0,0,0,0.5)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        cursor: 'zoom-in',
                      }}
                      onClick={() => setLightbox(photoIndex)}
                    >
                      <span style={{ color: 'white', fontWeight: 800, fontSize: '1.5rem' }}>
                        +{extraCount}
                      </span>
                    </div>
                  ) : (
                    <div className="gallery-hover-overlay" />
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Lightbox */}
      {lightbox !== null && (
        <div
          onClick={close}
          style={{
            position: 'fixed', inset: 0, zIndex: 9999,
            background: 'rgba(0,0,0,0.93)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              position: 'relative',
              width: 'min(90vw, 960px)',
              height: 'min(85vh, 640px)',
              userSelect: 'none',
            }}
          >
            <Image
              src={photos[lightbox]}
              alt={`${tourName} - ${lightbox + 1}`}
              fill
              priority
              style={{ objectFit: 'contain' }}
            />
          </div>

          <button
            onClick={close}
            style={{
              position: 'fixed', top: '18px', right: '20px',
              background: 'rgba(255,255,255,0.15)', border: 'none', borderRadius: '50%',
              width: '44px', height: '44px', display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', color: 'white',
            }}
          >
            <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {lightbox > 0 && (
            <button
              onClick={(e) => { e.stopPropagation(); prev(); }}
              style={{
                position: 'fixed', left: '16px', top: '50%', transform: 'translateY(-50%)',
                background: 'rgba(255,255,255,0.15)', border: 'none', borderRadius: '50%',
                width: '50px', height: '50px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', color: 'white',
              }}
            >
              <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
          )}

          {lightbox < photos.length - 1 && (
            <button
              onClick={(e) => { e.stopPropagation(); next(); }}
              style={{
                position: 'fixed', right: '16px', top: '50%', transform: 'translateY(-50%)',
                background: 'rgba(255,255,255,0.15)', border: 'none', borderRadius: '50%',
                width: '50px', height: '50px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', color: 'white',
              }}
            >
              <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          )}

          <div style={{
            position: 'fixed', bottom: '22px', left: '50%', transform: 'translateX(-50%)',
            background: 'rgba(0,0,0,0.55)', color: 'white', borderRadius: '20px',
            padding: '6px 18px', fontSize: '0.85rem', fontWeight: 600,
          }}>
            {lightbox + 1} / {photos.length}
          </div>
        </div>
      )}

      <style>{`
        .gallery-hover-overlay {
          position: absolute; inset: 0;
          background: rgba(0,0,0,0);
          transition: background 0.18s;
        }
        .gallery-hover-overlay:hover,
        [role="button"]:hover .gallery-hover-overlay {
          background: rgba(0,0,0,0.14);
        }
        @media (max-width: 640px) {
          .gallery-inner { grid-template-columns: 1fr !important; }
          .gallery-smalls { display: none !important; }
        }
      `}</style>
    </>
  );
}
