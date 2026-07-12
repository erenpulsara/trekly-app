'use client';

import { useEffect, useState } from 'react';

const APPLE_CLIENT_ID = 'com.treklyapp.treklyy.web';
// Masaüstünde popup akışı redirectURI'ye hiç gitmiyor (postMessage ile döner),
// ama Apple yine de geçerli/kayıtlı bir Return URL bekliyor — mevcut /giris
// yeterli. Mobilde ise gerçek bir sunucu callback'ine ihtiyacımız var.
const POPUP_REDIRECT_URI = 'https://www.treklyapp.com/giris';
const REDIRECT_FLOW_URI = 'https://www.treklyapp.com/api/auth/apple-callback';

declare global {
  interface Window {
    AppleID?: {
      auth: {
        init: (config: {
          clientId: string;
          scope: string;
          redirectURI: string;
          usePopup: boolean;
          state?: string;
        }) => void;
        signIn: () => Promise<{
          authorization: { code: string; id_token: string; state?: string };
          user?: { email: string; name: { firstName: string; lastName: string } };
        }>;
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

function isMobileBrowser(): boolean {
  if (typeof navigator === 'undefined') return false;
  return /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent);
}

let configured = false;
async function ensureConfigured() {
  await loadAppleScript();
  if (!window.AppleID) throw new Error('AppleID SDK not available');
  if (!configured) {
    window.AppleID.auth.init({
      clientId: APPLE_CLIENT_ID,
      scope: 'name email',
      redirectURI: POPUP_REDIRECT_URI,
      usePopup: true,
    });
    configured = true;
  }
}

// Mobilde Apple'ın kendi JS SDK'sının usePopup:false modunu KULLANMIYORUZ —
// bu, gerçek cihazlarda (Safari/iOS) "0.0.0.0" gibi anlamsız bir adrese
// yönlendirmeyle sonuçlanan, kaynağı belirsiz bir davranışa yol açıyordu.
// Bunun yerine standart OAuth 2.0 / OpenID Connect authorize URL'ini
// kendimiz oluşturup Safari'yi doğrudan oraya yönlendiriyoruz — Apple'ın
// SDK'sının iç mantığına hiç bağımlı değil, tamamen kontrolümüzde.
function buildAppleAuthorizeUrl(): string {
  const params = new URLSearchParams({
    response_type: 'code id_token',
    response_mode: 'form_post',
    client_id: APPLE_CLIENT_ID,
    redirect_uri: REDIRECT_FLOW_URI,
    scope: 'name email',
    state: window.location.pathname,
  });
  return `https://appleid.apple.com/auth/authorize?${params.toString()}`;
}

interface Props {
  onSuccess: (identityToken: string) => void;
  onError?: (message: string) => void;
  locale?: 'tr' | 'en';
}

// Not: Apple'ın web SDK'sı yalnızca Apple Developer'da kayıtlı gerçek domain'de
// çalışır (treklyapp.com / www.treklyapp.com) — localhost'ta test edilemez.
//
// Masaüstünde popup akışı (usePopup:true) sorunsuz — sonuç postMessage ile
// doğrudan bu sayfaya döner. Mobil tarayıcılarda ise popup/opener iletişimi
// güvenilir değil (kullanıcı Apple'da "Giriş Yap"a basıyor ama sonuç hiç
// dönmüyor) — o yüzden mobilde tam sayfa YÖNLENDİRME akışına geçiyoruz:
// Apple, /api/auth/apple-callback'e POST eder, o da id_token'ı query param
// olarak bu sayfaya geri yönlendirir (bkz. handleAppleRedirectResult hook'u).
export default function AppleSignInButton({ onSuccess, onError, locale = 'tr' }: Props) {
  const [unsupportedHost] = useState(
    () => typeof window !== 'undefined' && /localhost|127\.0\.0\.1/.test(window.location.hostname),
  );
  const [loading, setLoading] = useState(false);
  const mobile = isMobileBrowser();

  // Mobil yönlendirme akışından dönüşte URL'deki token'ı işle.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const idToken = params.get('apple_id_token');
    const hasError = params.get('apple_error');
    if (idToken) {
      onSuccess(idToken);
      const url = new URL(window.location.href);
      url.searchParams.delete('apple_id_token');
      window.history.replaceState({}, '', url.toString());
    } else if (hasError) {
      onError?.('Apple girişi başarısız oldu.');
      const url = new URL(window.location.href);
      url.searchParams.delete('apple_error');
      window.history.replaceState({}, '', url.toString());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handlePress() {
    if (mobile) {
      // Apple'ın kendi SDK'sını hiç devreye sokmadan, doğrudan standart OAuth
      // authorize URL'ine yönlendiriyoruz — bkz. buildAppleAuthorizeUrl yorumu.
      window.location.href = buildAppleAuthorizeUrl();
      return;
    }
    setLoading(true);
    try {
      await ensureConfigured();
      const result = await window.AppleID!.auth.signIn();
      if (result?.authorization?.id_token) {
        onSuccess(result.authorization.id_token);
      } else {
        onError?.('Apple girişi başarısız oldu.');
      }
    } catch (err: any) {
      // Kullanıcı popup'ı kapattıysa Apple "popup_closed_by_user" benzeri bir
      // hata fırlatır — bunu sessizce yok sayıyoruz.
      if (err?.error === 'popup_closed_by_user' || err?.error === 'user_cancelled_authorize') {
        // vazgeçildi, hata gösterme
      } else {
        onError?.('Apple girişi başarısız oldu.');
      }
    } finally {
      setLoading(false);
    }
  }

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
    <button
      type="button"
      onClick={handlePress}
      disabled={loading}
      style={{
        width: '100%', height: 48, borderRadius: 100, border: 'none',
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
        background: '#000000', color: '#FFFFFF', fontSize: '0.95rem', fontWeight: 600,
        cursor: loading ? 'default' : 'pointer', opacity: loading ? 0.7 : 1,
        fontFamily: 'inherit',
      }}
    >
      <svg width="17" height="17" viewBox="0 0 17 17" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path
          fill="#FFFFFF"
          d="M13.94 5.61c-.09.07-1.64.94-1.64 2.88 0 2.24 1.97 3.03 2.03 3.05-.01.05-.31 1.08-1.04 2.13-.65.92-1.32 1.84-2.36 1.84s-1.31-.6-2.5-.6c-1.16 0-1.58.62-2.52.62s-1.6-.85-2.35-1.9c-.87-1.21-1.57-3.08-1.57-4.85 0-2.85 1.85-4.36 3.68-4.36 1.02 0 1.86.66 2.5.66.61 0 1.55-.7 2.7-.7.44 0 2 .04 3.03 1.53zM10.9 3.2c.48-.57.82-1.36.82-2.15 0-.11-.01-.22-.03-.31-.78.03-1.71.52-2.27 1.17-.44.5-.85 1.29-.85 2.09 0 .12.02.24.03.28.05.01.13.02.21.02.7 0 1.58-.47 2.09-1.1z"
        />
      </svg>
      {locale === 'en' ? 'Continue with Apple' : 'Apple ile devam edin'}
    </button>
  );
}
