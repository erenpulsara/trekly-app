'use client';

import { useState } from 'react';
import LandingNav from '../landing-nav';
import Link from 'next/link';

const KONU_OPTIONS = [
  'Acenteyim, iş ortağı olmak istiyorum',
  'Tur hakkında bilgi almak istiyorum',
  'Teknik destek',
  'Basın & medya',
  'Diğer',
];

export default function IletisimPage() {
  const [form, setForm] = useState({ name: '', email: '', konu: '', message: '' });
  const [sent, setSent] = useState(false);

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const subject = encodeURIComponent(form.konu || 'İletişim Formu');
    const body = encodeURIComponent(`Ad Soyad: ${form.name}\nMail: ${form.email}\nKonu: ${form.konu}\n\n${form.message}`);
    window.location.href = `mailto:hello@treklyapp.com?subject=${subject}&body=${body}`;
    setSent(true);
  };

  return (
    <>
      <style>{`
        .il-outer { padding: 72px 48px 80px; }
        .il-grid  { max-width: 1060px; margin: 0 auto; display: grid; grid-template-columns: 1fr 1fr; gap: 80px; align-items: start; }
        .il-title { white-space: nowrap; }
        .il-footer { padding: 24px 48px; }
        @media (max-width: 768px) {
          .il-outer  { padding: 40px 20px 60px !important; }
          .il-grid   { grid-template-columns: 1fr !important; gap: 40px !important; }
          .il-title  { white-space: normal !important; font-size: 1.8rem !important; }
          .il-footer { padding: 20px 20px !important; }
        }
      `}</style>

      <LandingNav navLinks={[
        { label: 'Hakkımızda', href: '/hakkimizda' },
        { label: 'Etkinlikler', href: '/turlar' },
        { label: 'Blog', href: '/blog' },
        { label: 'İletişim', href: '/iletisim', active: true },
      ]} />

      <main style={{ minHeight: '100vh', background: '#FAFAFA' }}>
        <div className="il-outer" style={{ background: 'white', borderBottom: '1px solid #EAEAEA' }}>
          <div className="il-grid">

            {/* Left */}
            <div>
              <p style={{ fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.28em', textTransform: 'uppercase', color: '#FF5533', margin: '0 0 20px' }}>
                İletişim
              </p>
              <h1 className="il-title" style={{
                fontFamily: '"Cormorant Garamond", serif',
                fontSize: 'clamp(1.8rem, 3.2vw, 2.8rem)',
                fontWeight: 400,
                color: '#0D0D1A',
                lineHeight: 1.15,
                letterSpacing: '-0.02em',
                margin: '0 0 32px',
              }}>
                Doğayı Keşfetmenin En{' '}
                <em style={{ color: '#FF5533', fontStyle: 'italic' }}>Düzenli</em>{' '}
                Yolu
              </h1>

              <p style={{ fontSize: '1rem', lineHeight: 1.85, color: '#4A4A4A', margin: '0 0 18px' }}>
                Trekly; doğa tutkunlarını, Türkiye&apos;nin nitelikli outdoor deneyimleriyle buluşturan yeni nesil bir dijital platformdur.
              </p>

              <p style={{ fontSize: '1rem', lineHeight: 1.85, color: '#4A4A4A', margin: '0 0 40px' }}>
                Amacımız; yürüyüşten kampçılığa, bisiklet rotalarından su sporlarına kadar{' '}
                <strong style={{ color: '#1A1A1A', fontWeight: 700 }}>tüm doğa faaliyetlerini</strong>,
                {' '}herkes için düzenli ve kolayca filtrelenebilir{' '}
                <strong style={{ color: '#1A1A1A', fontWeight: 700 }}>tek bir vitrinde</strong> toplamak.
              </p>

              <div style={{ height: '1px', background: '#EAEAEA', margin: '0 0 32px' }} />

              <p style={{ fontSize: '0.9rem', color: '#6B7280', lineHeight: 1.7, margin: '0 0 14px' }}>
                Soru ve görüşleriniz için iletişim adresimiz:
              </p>
              <a
                href="mailto:hello@treklyapp.com"
                style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', fontSize: '1rem', fontWeight: 600, color: '#FF5533', textDecoration: 'none' }}
              >
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="4" width="20" height="16" rx="2"/>
                  <path d="M2 7l10 7 10-7"/>
                </svg>
                hello@treklyapp.com
              </a>
            </div>

            {/* Right – Form */}
            <div style={{
              background: '#FAFAFA',
              border: '1px solid #EAEAEA',
              borderRadius: '20px',
              padding: '40px 36px',
            }}>
              {sent ? (
                <div style={{ textAlign: 'center', padding: '40px 0' }}>
                  <div style={{ fontSize: '2rem', marginBottom: '16px' }}>✓</div>
                  <p style={{ fontWeight: 700, color: '#1A1A1A', margin: '0 0 8px' }}>Teşekkürler!</p>
                  <p style={{ fontSize: '0.9rem', color: '#6B7280' }}>Mesajınız iletildi, en kısa sürede geri döneceğiz.</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  <div>
                    <label style={labelStyle}>Ad Soyad</label>
                    <input
                      type="text"
                      required
                      placeholder="Adınız ve soyadınız"
                      value={form.name}
                      onChange={e => set('name', e.target.value)}
                      style={inputStyle}
                    />
                  </div>
                  <div>
                    <label style={labelStyle}>Mail Adresiniz</label>
                    <input
                      type="email"
                      required
                      placeholder="ornek@mail.com"
                      value={form.email}
                      onChange={e => set('email', e.target.value)}
                      style={inputStyle}
                    />
                  </div>
                  <div>
                    <label style={labelStyle}>Konu</label>
                    <select
                      value={form.konu}
                      onChange={e => set('konu', e.target.value)}
                      style={{ ...inputStyle, appearance: 'none', backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%236B7280' d='M6 8L1 3h10z'/%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 14px center', cursor: 'pointer' }}
                    >
                      <option value="">Konu seçiniz</option>
                      {KONU_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={labelStyle}>Mesajınız</label>
                    <textarea
                      required
                      rows={5}
                      placeholder="Mesajınızı buraya yazın..."
                      value={form.message}
                      onChange={e => set('message', e.target.value)}
                      style={{ ...inputStyle, resize: 'vertical', minHeight: '120px' }}
                    />
                  </div>
                  <button
                    type="submit"
                    style={{
                      background: '#FF5533',
                      color: 'white',
                      border: 'none',
                      borderRadius: '10px',
                      padding: '14px 24px',
                      fontSize: '0.95rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      letterSpacing: '0.01em',
                      transition: 'background 0.2s',
                    }}
                    onMouseEnter={e => (e.currentTarget.style.background = '#E8421E')}
                    onMouseLeave={e => (e.currentTarget.style.background = '#FF5533')}
                  >
                    Gönder
                  </button>
                </form>
              )}
            </div>

          </div>
        </div>
      </main>

      <footer className="il-footer" style={{ background: '#1A1A1A', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.3)' }}>© {new Date().getFullYear()} Trekly</span>
        <Link href="/turlar" style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.45)', textDecoration: 'none' }}>Turları Keşfet →</Link>
      </footer>
    </>
  );
}

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: '0.8rem',
  fontWeight: 600,
  color: '#374151',
  marginBottom: '8px',
  letterSpacing: '0.01em',
};

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '12px 14px',
  fontSize: '0.9rem',
  color: '#1A1A1A',
  background: 'white',
  border: '1px solid #D1D5DB',
  borderRadius: '10px',
  outline: 'none',
  boxSizing: 'border-box',
  fontFamily: 'inherit',
};
