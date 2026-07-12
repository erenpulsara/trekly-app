'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import SiteFooter from '@/app/components/SiteFooter';
import LandingNav from '../landing-nav';
import GoogleSignInButton from '@/app/components/GoogleSignInButton';
import AppleSignInButton from '@/app/components/AppleSignInButton';
import { useUserAuth } from '../UserAuthContext';
import { UserApiError } from '@/lib/user-api';
import { T, type Lang, getLangClient } from '@/lib/i18n';

function GirisForm() {
  const router = useRouter();
  const params = useSearchParams();
  const { login, loginWithGoogle, loginWithApple } = useUserAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [lang, setLang] = useState<Lang>('tr');
  useEffect(() => { setLang(getLangClient()); }, []);
  const ta = T[lang].auth;

  async function handleGoogleSuccess(idToken: string) {
    setError(null);
    try {
      await loginWithGoogle(idToken);
      const returnTo = params.get('returnTo');
      router.push(returnTo || '/anasayfa');
    } catch {
      setError(ta.googleLoginFailed);
    }
  }

  async function handleAppleSuccess(identityToken: string) {
    setError(null);
    try {
      await loginWithApple(identityToken);
      const returnTo = params.get('returnTo');
      router.push(returnTo || '/anasayfa');
    } catch {
      setError(ta.appleLoginFailed);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await login(email.trim(), password);
      const returnTo = params.get('returnTo');
      router.push(returnTo || '/anasayfa');
    } catch (err) {
      setError(
        err instanceof UserApiError
          ? (err.status === 401 ? ta.loginError : err.message)
          : ta.loginFailed,
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
      <div>
        <label style={labelStyle}>{ta.email}</label>
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="ornek@mail.com"
          style={inputStyle}
        />
      </div>
      <div>
        <label style={labelStyle}>{ta.password}</label>
        <input
          type="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
          style={inputStyle}
        />
        <div style={{ textAlign: 'right', marginTop: '8px' }}>
          <Link href="/sifremi-unuttum" style={{ fontSize: '0.78rem', color: '#FF5533', fontWeight: 600, textDecoration: 'none' }}>
            {ta.forgotPassword}
          </Link>
        </div>
      </div>
      {error && (
        <p style={{ fontSize: '0.82rem', color: '#DC2626', background: '#FEF2F2', padding: '10px 14px', borderRadius: '10px', margin: 0 }}>
          {error}
        </p>
      )}
      <button
        type="submit"
        disabled={loading}
        style={{
          background: '#FF5533', color: 'white', border: 'none', borderRadius: '10px',
          padding: '14px 24px', fontSize: '0.95rem', fontWeight: 700, cursor: loading ? 'default' : 'pointer',
          opacity: loading ? 0.7 : 1, letterSpacing: '0.01em', marginTop: '4px',
        }}
      >
        {loading ? ta.loggingIn : ta.loginBtn}
      </button>

      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', margin: '4px 0' }}>
        <div style={{ flex: 1, height: '1px', background: '#E5E7EB' }} />
        <span style={{ fontSize: '0.75rem', color: '#9CA3AF', fontWeight: 600 }}>{ta.orDivider}</span>
        <div style={{ flex: 1, height: '1px', background: '#E5E7EB' }} />
      </div>

      <GoogleSignInButton onSuccess={handleGoogleSuccess} onError={setError} locale={lang} />

      <AppleSignInButton onSuccess={handleAppleSuccess} onError={setError} locale={lang} />

      <p style={{ fontSize: '0.85rem', color: '#6B7280', textAlign: 'center', margin: 0 }}>
        {ta.noAccount}{' '}
        <Link href="/kayit-ol" style={{ color: '#FF5533', fontWeight: 700, textDecoration: 'none' }}>
          {ta.signUpLink}
        </Link>
      </p>
    </form>
  );
}

export default function GirisPage() {
  const [lang, setLang] = useState<Lang>('tr');
  useEffect(() => { setLang(getLangClient()); }, []);
  const ta = T[lang].auth;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <LandingNav navLinks={[
        { label: 'Anasayfa',    href: '/anasayfa' },
        { label: 'Etkinlikler', href: '/etkinlikler' },
        { label: 'Blog',        href: '/blog' },
        { label: 'Hakkımızda', href: '/hakkimizda' },
        { label: 'İletişim',   href: '/iletisim' },
      ]} />

      <style>{`
        @media (max-width: 480px) {
          .auth-card { padding: 28px 20px !important; }
          .auth-main { padding: 32px 16px !important; }
        }
      `}</style>
      <main className="auth-main" style={{ flex: 1, background: '#FAFAFA', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '60px 20px' }}>
        <div className="auth-card" style={{ width: '100%', maxWidth: '420px', background: 'white', border: '1px solid #EAEAEA', borderRadius: '20px', padding: '40px 36px' }}>
          <p style={{ fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.28em', textTransform: 'uppercase', color: '#FF5533', margin: '0 0 10px' }}>
            {ta.membership}
          </p>
          <h1 style={{
            fontFamily: '"Cormorant Garamond", serif', fontSize: '1.9rem', fontWeight: 400,
            color: '#0D0D1A', margin: '0 0 28px',
          }}>
            {ta.loginTitle}
          </h1>
          <Suspense>
            <GirisForm />
          </Suspense>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}

const labelStyle: React.CSSProperties = {
  display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#374151', marginBottom: '8px',
};

const inputStyle: React.CSSProperties = {
  width: '100%', padding: '12px 14px', fontSize: '0.9rem', color: '#1A1A1A',
  background: 'white', border: '1px solid #D1D5DB', borderRadius: '10px',
  outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit',
};
