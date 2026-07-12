'use client';

import { useEffect, useRef, useId, useState } from 'react';

const APPLE_CLIENT_ID = 'com.treklyapp.treklyy.web';
const APPLE_REDIRECT_URI = 'https://treklyapp.com/giris';

declare global {
  interface Window {
    AppleID?: {
      auth: {
        init: (config: {
          clientId: string;
          scope: string;
          redirectURI: string;
          usePopup: boolean;
        }) => void;
      };
    };
  }
}

let scriptLoadPromise: Promise<void> | null = null;

function loadAppleScript(): Promise<void> {
  if (typeof window === 'undefined') return Promise.resolve();
  if (window.AppleID) return Promise.resolve();
  if (scriptLoadPromise) return scriptLoadPromise;

  scriptLoadPromise = new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = 'https://appleid.cdn-apple.com/appleauth/static/jsapi/appleid/1/en_US/appleid.auth.js';
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Apple script failed to load'));
    document.head.appendChild(script);
  });
  return scriptLoadPromise;
}

interface Props {
  onSuccess: (identityToken: string) => void;
  onError?: (message: string) => void;
  locale?: 'tr' | 'en';
}

// Not: Apple'ın web SDK'sı yalnızca Apple Developer'da kayıtlı gerçek domain'de
// çalışır (treklyapp.com) — localhost'ta test edilemez, yalnızca production'da.
export default function AppleSignInButton({ onSuccess, onError, locale = 'tr' }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const uid = useId();
  const idRef = `apple-btn-${uid}`;
  const [unsupportedHost, setUnsupportedHost] = useState(false);

  useEffect(() => {
    // Apple'ın web SDK'sı yalnızca Apple Developer'da kayıtlı gerçek domain'de
    // (treklyapp.com) çalışır — localhost'ta buton görünmez, kullanıcı için
    // boş bir alan yerine bunu açıkça belirten bir yer tutucu gösteriyoruz.
    if (typeof window !== 'undefined' && /localhost|127\.0\.0\.1/.test(window.location.hostname)) {
      setUnsupportedHost(true);
      return;
    }

    let cancelled = false;

    loadAppleScript()
      .then(() => {
        if (cancelled || !window.AppleID) return;
        window.AppleID.auth.init({
          clientId: APPLE_CLIENT_ID,
          scope: 'name email',
          redirectURI: APPLE_REDIRECT_URI,
          usePopup: true,
        });
      })
      .catch(() => onError?.('Apple girişi yüklenemedi.'));

    function handleSuccess(event: any) {
      const idToken = event?.detail?.authorization?.id_token;
      if (idToken) {
        onSuccess(idToken);
      } else {
        onError?.('Apple girişi başarısız oldu.');
      }
    }
    function handleFailure() {
      onError?.('Apple girişi başarısız oldu.');
    }

    document.addEventListener('AppleIDSignInOnSuccess', handleSuccess);
    document.addEventListener('AppleIDSignInOnFailure', handleFailure);

    return () => {
      cancelled = true;
      document.removeEventListener('AppleIDSignInOnSuccess', handleSuccess);
      document.removeEventListener('AppleIDSignInOnFailure', handleFailure);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (unsupportedHost) {
    return (
      <div
        style={{
          width: '100%', height: 48, borderRadius: 100,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: '#F3F4F6', color: '#9CA3AF', fontSize: '0.78rem', fontWeight: 600,
        }}
      >
        {locale === 'en' ? 'Apple sign-in only available on production' : 'Apple girişi yalnızca canlı sitede aktif'}
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      id={idRef}
      data-color="black"
      data-border="false"
      data-type="continue"
      data-mode="center-align"
      data-locale={locale === 'en' ? 'en_US' : 'tr_TR'}
      style={{ width: '100%', height: 48, borderRadius: 100, overflow: 'hidden' }}
    />
  );
}
