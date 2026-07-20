'use client';

import { useState, useEffect } from 'react';
import { REWARDS_ENABLED } from '@/lib/features';
import { T, type Lang, getLangClient } from '@/lib/i18n';
import { formatPrice as fmtPrice, type Currency } from '@/lib/price';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8080';

function fmtDate(s: string, locale = 'tr-TR') {
  const d = new Date(s.includes('T') ? s : s + 'T00:00:00');
  const date = d.toLocaleDateString(locale, { day: 'numeric', month: 'long', year: 'numeric' });
  const weekday = d.toLocaleDateString(locale, { weekday: 'long' });
  return `${date} ${weekday}`;
}

interface TourData {
  id: string;
  organizer?: string | null;
  agency_name?: string | null;
  difficulty?: string | null;
  difficulty_label?: string | null;
  points?: number | null;
  tursab_no?: string | null;
  guide_name?: string | null;
  guide_instagram?: string | null;
  max_participants: number;
  booking_count?: number | null;
  start_date?: string | null;
  end_date?: string | null;
  meeting_points?: string | null;
  target_location?: string | null;
  contact_phone?: string | null;
  price?: number | null;
  price_currency?: 'TRY' | 'USD' | 'EUR' | null;
}

interface Props {
  tour: TourData;
  isFull: boolean;
  remaining: number;
}

function InfoRow({ icon, label, value, href }: { icon: React.ReactNode; label: string; value: string; href?: string }) {
  const val = href ? (
    <a href={href} target="_blank" rel="noopener noreferrer" style={{ color: '#FF5533', fontWeight: 700, fontSize: '0.92rem', textDecoration: 'none' }}>{value}</a>
  ) : (
    <span style={{ color: '#FF5533', fontWeight: 700, fontSize: '0.92rem' }}>{value}</span>
  );
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '11px 0', borderBottom: '1px solid #F5F5F5' }}>
      <div style={{ width: '32px', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#999' }}>{icon}</div>
      <div style={{ flex: 1, minWidth: 0, overflowWrap: 'break-word', wordBreak: 'break-word' }}>
        <div style={{ fontSize: '0.6rem', color: '#BBBBBB', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '2px' }}>{label}</div>
        {val}
      </div>
    </div>
  );
}

const iconOrganizer = <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.6" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>;
const iconGuide = <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.6" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>;
const iconCap = <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.6" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>;
const iconDifficulty = <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.6" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 20h18M6 20V10m6 10V4m6 16v-7" /></svg>;
const iconXp = <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.6" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" /></svg>;
const iconCal = <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.6" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>;
const iconPin = <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.6" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>;
const iconPhone = <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.6" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.948V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>;
const iconClock = <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.6" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;

export default function TourRightCard({ tour, isFull, remaining }: Props) {
  const [showForm, setShowForm] = useState(false);
  const [lang, setLang] = useState<Lang>('tr');
  useEffect(() => { setLang(getLangClient()); }, []);
  const tt = T[lang].td;
  const cur: Currency = (tour.price_currency as Currency) ?? 'TRY';

  /* ── form state ── */
  const [step, setStep]   = useState<'form' | 'success'>('form');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fullName, setFullName]     = useState('');
  const [email, setEmail]           = useState('');
  const [phone, setPhone]           = useState('');
  const [count, setCount]           = useState(1);
  const [notes, setNotes]           = useState('');

  const hasPrice = tour.price != null && tour.price > 0;
  const totalPrice = hasPrice ? (tour.price as number) * count : null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/tours/${tour.id}/web-booking`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          full_name: fullName.trim(),
          email: email.trim(),
          phone: phone.trim(),
          participant_count: count,
          notes: notes.trim() || undefined,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message ?? tt.bookingFailed);
      }
      setStep('success');
    } catch (err) {
      setError(err instanceof Error ? err.message : tt.errorOccurred);
    } finally {
      setLoading(false);
    }
  }

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '9px 12px', borderRadius: '8px',
    border: '1.5px solid #E8E8E8', fontSize: '0.85rem', color: '#1A1A1A',
    outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit', background: '#FAFAFA',
  };
  const labelStyle: React.CSSProperties = {
    display: 'block', fontSize: '0.68rem', fontWeight: 700,
    color: '#666', marginBottom: '5px', textTransform: 'uppercase', letterSpacing: '0.06em',
  };

  const organizer = tour.organizer || tour.agency_name;

  return (
    <div style={{ border: '1px solid #E8E8E8', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 4px 24px rgba(0,0,0,0.09)' }}>

      {/* ── Maceraya Katıl / Geri header ── */}
      {!isFull && step !== 'success' && (
        <button
          onClick={() => setShowForm((v) => !v)}
          style={{
            width: '100%', padding: '15px 20px',
            background: showForm ? '#F5F5F5' : '#FF5533',
            color: showForm ? '#1A1A1A' : 'white',
            border: 'none', cursor: 'pointer',
            fontWeight: 800, fontSize: '0.95rem',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
            transition: 'background 0.2s, color 0.2s',
          }}
        >
          {showForm ? (
            <>
              <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7"/>
              </svg>
              {tt.tourDetails}
            </>
          ) : (
            <>
              {tt.joinAdventure}
              <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3"/>
              </svg>
            </>
          )}
        </button>
      )}

      {/* ── Kontenjan doldu ── */}
      {isFull && (
        <div style={{ padding: '20px', background: '#FFF0F0', textAlign: 'center', borderBottom: '1px solid #FED7D7' }}>
          <div style={{ fontSize: '1.4rem', marginBottom: '6px' }}>😔</div>
          <p style={{ fontWeight: 700, color: '#C53030', margin: '0 0 4px' }}>{tt.quotaFull}</p>
          <p style={{ fontSize: '0.78rem', color: '#9B2C2C', margin: 0 }}>{tt.noSpots}</p>
        </div>
      )}

      {/* ── Success ── */}
      {step === 'success' && (
        <div style={{ padding: '32px 20px', background: '#F0FFF4', textAlign: 'center', borderBottom: '1px solid #9AE6B4' }}>
          <div style={{ fontSize: '2rem', marginBottom: '10px' }}>✅</div>
          <p style={{ fontWeight: 800, color: '#276749', fontSize: '1.05rem', margin: '0 0 8px' }}>{tt.bookingReceived}</p>
          <p style={{ fontSize: '0.82rem', color: '#276749', margin: 0, lineHeight: 1.6 }}>
            {tt.successA} <strong>{email}</strong> {tt.successB}
          </p>
        </div>
      )}

      {/* ════ FORM VIEW ════ */}
      {showForm && step === 'form' && (
        <div style={{ padding: '20px' }}>
          {/* Price summary in form */}
          {hasPrice && (
            <div style={{ background: '#FFF8F7', borderRadius: '10px', padding: '14px 16px', border: '1px solid rgba(255,85,51,0.15)', marginBottom: '20px' }}>
              <div style={{ marginBottom: '8px' }}>
                <span style={{ fontSize: '0.68rem', fontWeight: 700, color: '#AAAAAA', textTransform: 'uppercase', letterSpacing: '0.1em' }}>{tt.tourPrice}</span>
              </div>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#FF5533', lineHeight: 1 }}>
                {fmtPrice(tour.price as number, cur)}
              </div>
              {count > 1 && totalPrice != null && (
                <div style={{ fontSize: '0.78rem', color: '#888', marginTop: '4px' }}>
                  {tt.total}: {fmtPrice(totalPrice, cur)} ({count} {tt.people.toLowerCase()})
                </div>
              )}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div>
              <label style={labelStyle}>{tt.fullName} *</label>
              <input required value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder={tt.fullNamePh} style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>{tt.email} *</label>
              <input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="ornek@email.com" style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>{tt.phone} *</label>
              <input required type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="05XX XXX XX XX" style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>{tt.participantCount}</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <button type="button" onClick={() => setCount((v) => Math.max(1, v - 1))}
                  style={{ width: '32px', height: '32px', borderRadius: '8px', border: '1.5px solid #E8E8E8', background: 'white', fontSize: '1.1rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>−</button>
                <span style={{ fontWeight: 700, fontSize: '1rem', minWidth: '20px', textAlign: 'center' }}>{count}</span>
                <button type="button" onClick={() => setCount((v) => Math.min(tour.max_participants, v + 1))}
                  style={{ width: '32px', height: '32px', borderRadius: '8px', border: '1.5px solid #E8E8E8', background: 'white', fontSize: '1.1rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>+</button>
                <span style={{ fontSize: '0.72rem', color: '#AAAAAA' }}>{tt.maxShort} {tour.max_participants}</span>
              </div>
            </div>
            <div>
              <label style={labelStyle}>{tt.notes} <span style={{ textTransform: 'none', fontWeight: 400, color: '#AAAAAA' }}>{tt.optional}</span></label>
              <textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder={tt.notesPh} rows={2} style={{ ...inputStyle, resize: 'none' }} />
            </div>
            {error && (
              <p style={{ fontSize: '0.8rem', color: '#C53030', background: '#FFF0F0', borderRadius: '8px', padding: '8px 12px', margin: 0 }}>⚠️ {error}</p>
            )}
            <button type="submit" disabled={loading} style={{
              width: '100%', padding: '13px', borderRadius: '10px',
              background: loading ? '#FFBFB5' : '#FF5533',
              color: 'white', fontWeight: 700, fontSize: '0.9rem',
              border: 'none', cursor: loading ? 'not-allowed' : 'pointer',
            }}>
              {loading ? tt.sending : tt.sendBooking}
            </button>
            <p style={{ fontSize: '0.7rem', color: '#AAAAAA', textAlign: 'center', margin: 0 }}>
              Rezervasyonunuz alındıktan sonra acenta sizi onay için arayacaktır.
            </p>
          </form>
        </div>
      )}

      {/* ════ DETAILS VIEW ════ */}
      {!showForm && step !== 'success' && (
        <div style={{ padding: '0 20px' }}>

          {/* TURSAB verification badge */}
          {tour.tursab_no && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: '10px',
              background: '#F0FDF4', borderRadius: '10px', padding: '10px 14px',
              margin: '16px 0', border: '1px solid #86EFAC',
            }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#16A34A', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <svg width="16" height="16" fill="none" stroke="white" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/>
                </svg>
              </div>
              <div>
                <div style={{ fontSize: '0.58rem', fontWeight: 700, color: '#15803D', letterSpacing: '0.1em', textTransform: 'uppercase' }}>{tt.tursabApproved}</div>
                <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#166534' }}>#{tour.tursab_no}</div>
              </div>
            </div>
          )}

          {organizer && <InfoRow icon={iconOrganizer} label={tt.organizer} value={organizer} />}
          {tour.guide_name && <InfoRow icon={iconGuide} label={tt.guide} value={tour.guide_name} href={tour.guide_instagram ?? undefined} />}
          {tour.difficulty_label && <InfoRow icon={iconDifficulty} label={tt.difficulty} value={tour.difficulty_label} />}
          {REWARDS_ENABLED && tour.points != null && tour.points > 0 && (
            <InfoRow icon={iconXp} label={tt.pointsEarn} value={`${tour.points} XP`} />
          )}
          <InfoRow icon={iconCap} label={tt.capacity} value={`${tour.max_participants} ${tt.people}`} />
          {tour.start_date && <InfoRow icon={iconCal} label={tt.startDate} value={fmtDate(tour.start_date, lang === 'en' ? 'en-US' : 'tr-TR')} />}
          {tour.end_date   && <InfoRow icon={iconCal} label={tt.endDate}     value={fmtDate(tour.end_date, lang === 'en' ? 'en-US' : 'tr-TR')} />}
          {tour.meeting_points  && <InfoRow icon={iconPin}   label={tt.meetingPoint} value={tour.meeting_points} />}
          {tour.target_location && <InfoRow icon={iconPin}   label={tt.targetLocation}  value={tour.target_location} />}
          {tour.contact_phone   && <InfoRow icon={iconPhone} label={tt.contactNo} value={tour.contact_phone} href={`tel:${tour.contact_phone}`} />}

          {/* Price */}
          {hasPrice && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '11px 0', borderBottom: '1px solid #F5F5F5' }}>
              <div style={{ width: '32px', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#999' }}>
                <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.6" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"/>
                </svg>
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '0.6rem', color: '#BBBBBB', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '4px' }}>Ücret</div>
                <span style={{ color: '#FF5533', fontWeight: 700, fontSize: '1.05rem' }}>
                  {fmtPrice(tour.price as number, cur)}
                </span>
              </div>
            </div>
          )}

          {/* Kontenjan bar */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '11px 0 16px' }}>
            <div style={{ width: '32px', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#999' }}>{iconClock}</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '0.6rem', color: '#BBBBBB', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '6px' }}>{tt.quota}</div>
              <div style={{ height: '5px', background: '#E8E8E8', borderRadius: '3px', overflow: 'hidden', marginBottom: '5px' }}>
                <div style={{
                  height: '100%', borderRadius: '3px',
                  background: isFull ? '#EF4444' : '#FF5533',
                  width: `${Math.min(100, ((tour.max_participants - remaining) / tour.max_participants) * 100)}%`,
                }} />
              </div>
              <span style={{ color: isFull ? '#EF4444' : '#FF5533', fontWeight: 700, fontSize: '0.88rem' }}>
                {isFull ? tt.full : tt.spotsLeft(remaining)}
              </span>
              <span style={{ fontSize: '0.7rem', color: '#AAAAAA', marginLeft: '6px' }}>
                ({tour.max_participants - remaining}/{tour.max_participants})
              </span>
            </div>
          </div>

        </div>
      )}
    </div>
  );
}
