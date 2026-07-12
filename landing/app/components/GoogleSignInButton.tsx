'use client';

import { useEffect, useRef, useId } from 'react';

const GOOGLE_CLIENT_ID =
  process.env.NEXT_PUBLIC_GOOGLE_WEB_CLIENT_ID ??
  '835377577547-bnnjpakff03a0fbprgb48dp9j27o5eg2.apps.googleusercontent.com';

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: {
            client_id: string;
            callback: (response: { credential: string }) => void;
          }) => void;
          renderButton: (el: HTMLElement, options: Record<string, unknown>) => void;
        };
      };
    };
  }
}

let scriptLoadPromise: Promise<void> | null = null;

function loadGoogleScript(): Promise<void> {
  if (typeof window === 'undefined') return Promise.resolve();
  if (window.google?.accounts?.id) return Promise.resolve();
  if (scriptLoadPromise) return scriptLoadPromise;

  scriptLoadPromise = new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Google script failed to load'));
    document.head.appendChild(script);
  });
  return scriptLoadPromise;
}

interface Props {
  onSuccess: (idToken: string) => void;
  onError?: (message: string) => void;
  locale?: 'tr' | 'en';
}

// Google Identity Services'ın kendi çizdiği buton — metin/renk Google tarafından
// yönetilir, locale'e göre "Google ile devam et" / "Continue with Google" olur.
export default function GoogleSignInButton({ onSuccess, onError, locale = 'tr' }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const uid = useId();

  useEffect(() => {
    let cancelled = false;

    loadGoogleScript()
      .then(() => {
        if (cancelled || !containerRef.current || !window.google) return;
        window.google.accounts.id.initialize({
          client_id: GOOGLE_CLIENT_ID,
          callback: (response) => {
            if (response.credential) {
              onSuccess(response.credential);
            } else {
              onError?.('Google girişi başarısız oldu.');
            }
          },
        });
        window.google.accounts.id.renderButton(containerRef.current, {
          type: 'standard',
          theme: 'outline',
          size: 'large',
          text: 'continue_with',
          shape: 'pill',
          width: 360,
          locale: locale === 'en' ? 'en' : 'tr',
        });
      })
      .catch(() => onError?.('Google girişi yüklenemedi.'));

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [locale]);

  return <div ref={containerRef} id={`google-btn-${uid}`} style={{ display: 'flex', justifyContent: 'center', width: '100%' }} />;
}
