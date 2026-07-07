'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import SiteFooter from '@/app/components/SiteFooter';
import LandingNav from '../landing-nav';
import { forgotPassword, resetPassword, UserApiError } from '@/lib/user-api';

type Step = 'email' | 'reset';

function SifremiUnuttumForm() {
  const router = useRouter();

  const [step, setStep] = useState<Step>('email');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSendCode(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await forgotPassword(email.trim().toLowerCase());
      setStep('reset');
    } catch {
      // Güvenlik gereği e-postanın kayıtlı olup olmadığını belli etmiyoruz —
      // backend de aynı sebeple her durumda başarılı cevap döner
      setStep('reset');
    } finally {
      setLoading(false);
    }
  }

  async function handleReset(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (newPassword.length < 6) { setError('Şifre en az 6 karakter olmalı.'); return; }
    if (newPassword !== confirmPassword) { setError('Şifreler eşleşmiyor.'); return; }
    setLoading(true);
    try {
      await resetPassword(email.trim().toLowerCase(), code.trim(), newPassword);
      alert('Şifreniz başarıyla güncellendi. Giriş yapabilirsiniz.');
      router.push('/giris');
    } catch (err) {
      setError(
        err instanceof UserApiError ? err.message : 'Geçersiz veya süresi dolmuş kod.',
      );
    } finally {
      setLoading(false);
    }
  }

  if (step === 'email') {
    return (
      <form onSubmit={handleSendCode} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
        <p style={{ fontSize: '0.85rem', color: '#6B7280', margin: 0, lineHeight: 1.6 }}>
          Hesabına kayıtlı e-posta adresini gir, sana 6 haneli bir sıfırlama kodu gönderelim.
        </p>
        <div>
          <label style={labelStyle}>E-posta</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="ornek@mail.com"
            style={inputStyle}
          />
        </div>
        {error && (
          <p style={{ fontSize: '0.82rem', color: '#DC2626', background: '#FEF2F2', padding: '10px 14px', borderRadius: '10px', margin: 0 }}>
            {error}
          </p>
        )}
        <button type="submit" disabled={loading} style={submitStyle(loading)}>
          {loading ? 'Gönderiliyor...' : 'Kod Gönder'}
        </button>
        <p style={{ fontSize: '0.85rem', color: '#6B7280', textAlign: 'center', margin: 0 }}>
          <Link href="/giris" style={{ color: '#FF5533', fontWeight: 700, textDecoration: 'none' }}>
            ← Girişe Dön
          </Link>
        </p>
      </form>
    );
  }

  return (
    <form onSubmit={handleReset} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <p style={{ fontSize: '0.85rem', color: '#6B7280', margin: 0, lineHeight: 1.6 }}>
        <strong>{email}</strong> adresine bir kod gönderdik (e-posta kayıtlıysa).
        Gelen 6 haneli kodu ve yeni şifreni gir.
      </p>
      <div>
        <label style={labelStyle}>Doğrulama Kodu</label>
        <input
          required
          inputMode="numeric"
          maxLength={6}
          value={code}
          onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
          placeholder="6 haneli kod"
          style={{ ...inputStyle, letterSpacing: '0.3em', fontWeight: 700 }}
        />
      </div>
      <div>
        <label style={labelStyle}>Yeni Şifre</label>
        <input
          type="password"
          required
          minLength={6}
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          placeholder="En az 6 karakter"
          style={inputStyle}
        />
      </div>
      <div>
        <label style={labelStyle}>Yeni Şifre (Tekrar)</label>
        <input
          type="password"
          required
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          placeholder="Şifreni tekrar gir"
          style={inputStyle}
        />
      </div>
      {error && (
        <p style={{ fontSize: '0.82rem', color: '#DC2626', background: '#FEF2F2', padding: '10px 14px', borderRadius: '10px', margin: 0 }}>
          {error}
        </p>
      )}
      <button type="submit" disabled={loading} style={submitStyle(loading)}>
        {loading ? 'Güncelleniyor...' : 'Şifreyi Güncelle'}
      </button>
      <button
        type="button"
        onClick={() => { setStep('email'); setError(null); }}
        style={{
          background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit',
          fontSize: '0.85rem', color: '#6B7280', padding: 0,
        }}
      >
        Kodu almadın mı? <span style={{ color: '#FF5533', fontWeight: 700 }}>Tekrar Gönder</span>
      </button>
    </form>
  );
}

export default function SifremiUnuttumPage() {
  return (
    <>
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
      <main className="auth-main" style={{ minHeight: '70vh', background: '#FAFAFA', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '60px 20px' }}>
        <div className="auth-card" style={{ width: '100%', maxWidth: '420px', background: 'white', border: '1px solid #EAEAEA', borderRadius: '20px', padding: '40px 36px' }}>
          <p style={{ fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.28em', textTransform: 'uppercase', color: '#FF5533', margin: '0 0 10px' }}>
            Trekly Üyelik
          </p>
          <h1 style={{
            fontFamily: '"Cormorant Garamond", serif', fontSize: '1.9rem', fontWeight: 400,
            color: '#0D0D1A', margin: '0 0 28px',
          }}>
            Şifremi Unuttum
          </h1>
          <SifremiUnuttumForm />
        </div>
      </main>

      <SiteFooter />
    </>
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

function submitStyle(loading: boolean): React.CSSProperties {
  return {
    background: '#FF5533', color: 'white', border: 'none', borderRadius: '10px',
    padding: '14px 24px', fontSize: '0.95rem', fontWeight: 700,
    cursor: loading ? 'default' : 'pointer', opacity: loading ? 0.7 : 1,
    letterSpacing: '0.01em', marginTop: '4px', fontFamily: 'inherit',
  };
}
