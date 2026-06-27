'use client';

import { useState } from 'react';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8080';

interface Props {
  tourId: string;
  maxParticipants: number;
  isFull: boolean;
  price: number | null | undefined;
}

type Step = 'form' | 'success';

export default function BookingForm({ tourId, maxParticipants, isFull, price }: Props) {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<Step>('form');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [participantCount, setParticipantCount] = useState(1);
  const [notes, setNotes] = useState('');

  const total = price != null && price > 0 ? Number(price) * participantCount : null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/tours/${tourId}/web-booking`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          full_name: fullName.trim(),
          email: email.trim(),
          phone: phone.trim(),
          participant_count: participantCount,
          notes: notes.trim() || undefined,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message ?? 'Rezervasyon oluşturulamadı');
      }
      setStep('success');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Bir hata oluştu');
    } finally {
      setLoading(false);
    }
  }

  if (isFull) {
    return (
      <div style={{
        background: '#FFF0F0', borderRadius: '12px', padding: '20px',
        textAlign: 'center', border: '1px solid #FED7D7',
      }}>
        <div style={{ fontSize: '1.5rem', marginBottom: '8px' }}>😔</div>
        <p style={{ fontWeight: 700, color: '#C53030', margin: 0 }}>Kontenjan Doldu</p>
        <p style={{ fontSize: '0.8rem', color: '#9B2C2C', margin: '4px 0 0' }}>
          Bu tur için yer kalmadı.
        </p>
      </div>
    );
  }

  if (step === 'success') {
    return (
      <div style={{
        background: '#F0FFF4', borderRadius: '12px', padding: '28px 20px',
        textAlign: 'center', border: '1px solid #9AE6B4',
      }}>
        <div style={{ fontSize: '2rem', marginBottom: '10px' }}>✅</div>
        <p style={{ fontWeight: 800, color: '#276749', fontSize: '1.05rem', margin: '0 0 8px' }}>
          Rezervasyonunuz Alındı!
        </p>
        <p style={{ fontSize: '0.82rem', color: '#276749', margin: 0, lineHeight: 1.6 }}>
          En kısa sürede <strong>{email}</strong> adresinize onay e-postası göndereceğiz.
        </p>
      </div>
    );
  }

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '9px 12px', borderRadius: '8px',
    border: '1.5px solid #E8E8E8', fontSize: '0.85rem', color: '#1A1A1A',
    outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit',
    background: '#FAFAFA',
  };

  const labelStyle: React.CSSProperties = {
    display: 'block', fontSize: '0.72rem', fontWeight: 700,
    color: '#555', marginBottom: '5px', textTransform: 'uppercase', letterSpacing: '0.06em',
  };

  return (
    <div>
      {/* Ana CTA butonu */}
      <button
        onClick={() => setOpen((v) => !v)}
        style={{
          width: '100%', padding: '14px', borderRadius: '12px',
          background: open ? '#E8E8E8' : '#FF5533',
          color: open ? '#1A1A1A' : 'white',
          fontWeight: 800, fontSize: '0.95rem',
          border: 'none', cursor: 'pointer',
          transition: 'all 0.2s',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
        }}
      >
        {open ? (
          <>
            <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
            </svg>
            Formu Kapat
          </>
        ) : (
          <>
            Maceraya Katıl
            <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </>
        )}
      </button>

      {/* Dropdown form */}
      {open && (
        <div style={{
          marginTop: '16px',
          borderTop: '1px solid #F0F0F0',
          paddingTop: '16px',
        }}>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div>
              <label style={labelStyle}>Ad Soyad *</label>
              <input
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Adınız ve soyadınız"
                style={inputStyle}
              />
            </div>

            <div>
              <label style={labelStyle}>E-posta *</label>
              <input
                required
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="ornek@email.com"
                style={inputStyle}
              />
            </div>

            <div>
              <label style={labelStyle}>Telefon *</label>
              <input
                required
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="05XX XXX XX XX"
                style={inputStyle}
              />
            </div>

            <div>
              <label style={labelStyle}>Katılımcı Sayısı</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <button
                  type="button"
                  onClick={() => setParticipantCount((v) => Math.max(1, v - 1))}
                  style={{
                    width: '32px', height: '32px', borderRadius: '8px',
                    border: '1.5px solid #E8E8E8', background: 'white',
                    fontSize: '1.1rem', cursor: 'pointer', display: 'flex',
                    alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                  }}
                >−</button>
                <span style={{ fontWeight: 700, fontSize: '1rem', minWidth: '20px', textAlign: 'center' }}>
                  {participantCount}
                </span>
                <button
                  type="button"
                  onClick={() => setParticipantCount((v) => Math.min(maxParticipants, v + 1))}
                  style={{
                    width: '32px', height: '32px', borderRadius: '8px',
                    border: '1.5px solid #E8E8E8', background: 'white',
                    fontSize: '1.1rem', cursor: 'pointer', display: 'flex',
                    alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                  }}
                >+</button>
                <span style={{ fontSize: '0.75rem', color: '#AAAAAA' }}>maks. {maxParticipants}</span>
              </div>
            </div>

            {total != null && (
              <div style={{
                background: '#FFF8F7', borderRadius: '8px', padding: '10px 14px',
                border: '1px solid rgba(255,85,51,0.2)',
              }}>
                <span style={{ fontSize: '0.72rem', color: '#AAAAAA', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Toplam Tutar</span>
                <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#FF5533', lineHeight: 1.2 }}>
                  ₺{total.toLocaleString('tr-TR')}
                </div>
              </div>
            )}

            <div>
              <label style={labelStyle}>Notlar <span style={{ textTransform: 'none', fontWeight: 400, color: '#AAAAAA' }}>(isteğe bağlı)</span></label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Özel isteğiniz varsa yazabilirsiniz..."
                rows={2}
                style={{ ...inputStyle, resize: 'none' }}
              />
            </div>

            {error && (
              <p style={{ fontSize: '0.8rem', color: '#C53030', background: '#FFF0F0', borderRadius: '8px', padding: '8px 12px', margin: 0 }}>
                ⚠️ {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%', padding: '12px', borderRadius: '10px',
                background: loading ? '#FFBFB5' : '#FF5533',
                color: 'white', fontWeight: 700, fontSize: '0.9rem',
                border: 'none', cursor: loading ? 'not-allowed' : 'pointer',
                transition: 'background 0.2s',
              }}
            >
              {loading ? 'Gönderiliyor...' : 'Rezervasyon Gönder'}
            </button>

            <p style={{ fontSize: '0.72rem', color: '#AAAAAA', textAlign: 'center', margin: 0 }}>
              Rezervasyonunuz alındıktan sonra acenta sizi onay için arayacaktır.
            </p>
          </form>
        </div>
      )}
    </div>
  );
}
