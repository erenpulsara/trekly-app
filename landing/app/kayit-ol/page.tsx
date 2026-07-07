'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import SiteFooter from '@/app/components/SiteFooter';
import LandingNav from '../landing-nav';
import { useUserAuth } from '../UserAuthContext';
import { UserApiError } from '@/lib/user-api';

function KayitForm() {
  const router = useRouter();
  const params = useSearchParams();
  const { register } = useUserAuth();

  const [name, setName] = useState('');
  const [surname, setSurname] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await register(name.trim(), surname.trim(), email.trim(), password, phone.trim() || undefined);
      const returnTo = params.get('returnTo');
      router.push(returnTo || '/anasayfa');
    } catch (err) {
      setError(
        err instanceof UserApiError
          ? (err.status === 409 ? 'Bu e-posta ile zaten bir hesap var.' : err.message)
          : 'Kayıt oluşturulamadı. Lütfen tekrar deneyin.',
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div className="auth-name-row" style={{ display: 'flex', gap: '12px' }}>
        <div style={{ flex: 1 }}>
          <label style={labelStyle}>Ad</label>
          <input required value={name} onChange={(e) => setName(e.target.value)} placeholder="Adınız" style={inputStyle} />
        </div>
        <div style={{ flex: 1 }}>
          <label style={labelStyle}>Soyad</label>
          <input required value={surname} onChange={(e) => setSurname(e.target.value)} placeholder="Soyadınız" style={inputStyle} />
        </div>
      </div>
      <div>
        <label style={labelStyle}>E-posta</label>
        <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="ornek@mail.com" style={inputStyle} />
      </div>
      <div>
        <label style={labelStyle}>Telefon <span style={{ fontWeight: 400, color: '#9CA3AF' }}>(isteğe bağlı)</span></label>
        <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="05XX XXX XX XX" style={inputStyle} />
      </div>
      <div>
        <label style={labelStyle}>Şifre</label>
        <input type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="En az 6 karakter" style={inputStyle} />
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
        {loading ? 'Hesap oluşturuluyor...' : 'Üye Ol'}
      </button>
      <p style={{ fontSize: '0.85rem', color: '#6B7280', textAlign: 'center', margin: 0 }}>
        Zaten hesabın var mı?{' '}
        <Link href="/giris" style={{ color: '#FF5533', fontWeight: 700, textDecoration: 'none' }}>
          Giriş Yap
        </Link>
      </p>
    </form>
  );
}

export default function KayitOlPage() {
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
          .auth-name-row { flex-direction: column !important; }
        }
      `}</style>
      <main className="auth-main" style={{ minHeight: '70vh', background: '#FAFAFA', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '60px 20px' }}>
        <div className="auth-card" style={{ width: '100%', maxWidth: '440px', background: 'white', border: '1px solid #EAEAEA', borderRadius: '20px', padding: '40px 36px' }}>
          <p style={{ fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.28em', textTransform: 'uppercase', color: '#FF5533', margin: '0 0 10px' }}>
            Trekly Üyelik
          </p>
          <h1 style={{
            fontFamily: '"Cormorant Garamond", serif', fontSize: '1.9rem', fontWeight: 400,
            color: '#0D0D1A', margin: '0 0 28px',
          }}>
            Üye Ol
          </h1>
          <Suspense>
            <KayitForm />
          </Suspense>
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
