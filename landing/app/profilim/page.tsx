'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import SiteFooter from '@/app/components/SiteFooter';
import LandingNav from '../landing-nav';
import { useUserAuth } from '../UserAuthContext';
import {
  fetchMe,
  updateProfile,
  fetchMyPoints,
  fetchMyWebBookings,
  deleteMyAccount,
  WebUser,
  PointsLogEntry,
  UserWebBooking,
} from '@/lib/user-api';
import { getFavorites } from '@/lib/favorites-api';
import { getUserLevel, getLevelProgress, getPointsToNextLevel } from '@/lib/levels';
import { REWARDS_ENABLED } from '@/lib/features';

const STATUS_LABEL: Record<string, string> = {
  pending: 'Bekliyor',
  confirmed: 'Onaylandı',
  completed: 'Tamamlandı',
  cancelled: 'İptal',
};

const STATUS_STYLE: Record<string, { bg: string; text: string }> = {
  pending:   { bg: '#FEF3C7', text: '#92400E' },
  confirmed: { bg: '#D1FAE5', text: '#065F46' },
  completed: { bg: '#E0E7FF', text: '#3730A3' },
  cancelled: { bg: '#FEE2E2', text: '#991B1B' },
};

function fmtDate(s: string) {
  const d = new Date(s.includes('T') ? s : s + 'T00:00:00');
  return d.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' });
}

export default function ProfilimPage() {
  const router = useRouter();
  const { user, isLoading, logout, refreshUser } = useUserAuth();

  const [profile, setProfile] = useState<WebUser | null>(null);
  const [favCount, setFavCount] = useState<number | null>(null);
  const [bookings, setBookings] = useState<UserWebBooking[]>([]);
  const [points, setPoints] = useState<PointsLogEntry[]>([]);
  const [dataLoading, setDataLoading] = useState(true);

  // Edit form
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState('');
  const [surname, setSurname] = useState('');
  const [phone, setPhone] = useState('');
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (isLoading) return;
    if (!user) {
      router.push('/giris?returnTo=/profilim');
      return;
    }
    setProfile(user);
    Promise.all([
      fetchMe(),
      getFavorites().catch(() => []),
      fetchMyWebBookings(),
      fetchMyPoints(),
    ]).then(([fresh, favs, wb, pts]) => {
      if (fresh) setProfile(fresh);
      setFavCount(favs.length);
      setBookings(wb);
      setPoints(pts);
    }).finally(() => setDataLoading(false));
  }, [user, isLoading, router]);

  function startEdit() {
    if (!profile) return;
    setName(profile.name);
    setSurname(profile.surname);
    setPhone(profile.phone ?? '');
    setSaveMsg(null);
    setEditing(true);
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setSaveMsg(null);
    try {
      const updated = await updateProfile({
        name: name.trim(),
        surname: surname.trim(),
        phone: phone.trim(),
      });
      setProfile(updated);
      refreshUser();
      setEditing(false);
      setSaveMsg({ ok: true, text: 'Profiliniz güncellendi.' });
    } catch {
      setSaveMsg({ ok: false, text: 'Güncelleme başarısız oldu. Lütfen tekrar deneyin.' });
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    const first = window.confirm('Hesabınızı silmek istediğinize emin misiniz? Bu işlem geri alınamaz.');
    if (!first) return;
    const second = window.confirm('Tüm verileriniz (favoriler, puanlar) kalıcı olarak silinecek. Onaylıyor musunuz?');
    if (!second) return;
    setDeleting(true);
    try {
      await deleteMyAccount();
      logout();
      router.push('/anasayfa');
    } catch {
      setDeleting(false);
      alert('Hesap silinemedi. Lütfen tekrar deneyin.');
    }
  }

  const display = profile ?? user;
  const totalPoints = display?.total_points ?? 0;
  const levelInfo = getUserLevel(totalPoints);
  const progress = getLevelProgress(totalPoints);
  const toNext = getPointsToNextLevel(totalPoints);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <LandingNav navLinks={[
        { label: 'Anasayfa',    href: '/anasayfa' },
        { label: 'Etkinlikler', href: '/etkinlikler' },
        { label: 'Blog',        href: '/blog' },
        { label: 'Hakkımızda', href: '/hakkimizda' },
        { label: 'İletişim',   href: '/iletisim' },
      ]} />

      <main style={{ flex: 1, background: '#FAFAFA', padding: '48px 20px 64px' }}>
        <div style={{ maxWidth: '640px', margin: '0 auto' }}>
          {isLoading || !display ? (
            <p style={{ color: '#9A9A9A', fontSize: '0.9rem', textAlign: 'center' }}>Yükleniyor...</p>
          ) : (
            <>
              {/* ── Hero card: avatar + level + progress + stats ── */}
              <div style={{
                background: 'white', border: '1px solid #EAEAEA', borderRadius: '20px',
                padding: '36px 32px', textAlign: 'center', marginBottom: '16px',
              }}>
                <div style={{ position: 'relative', display: 'inline-block', marginBottom: '14px' }}>
                  <div style={{
                    width: '92px', height: '92px', borderRadius: '50%', background: '#FF5533',
                    color: 'white', fontSize: '2.2rem', fontWeight: 800,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    border: '4px solid #FFF3EE',
                  }}>
                    {display.name.charAt(0).toUpperCase()}
                  </div>
                  {REWARDS_ENABLED && (
                    <span style={{
                      position: 'absolute', bottom: '-6px', left: '50%', transform: 'translateX(-50%)',
                      background: '#1A1A1A', color: 'white', fontSize: '0.62rem', fontWeight: 700,
                      padding: '3px 10px', borderRadius: '10px', whiteSpace: 'nowrap',
                    }}>
                      LVL {levelInfo.level}
                    </span>
                  )}
                </div>

                <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#1A1A1A', margin: '0 0 4px' }}>
                  {display.name} {display.surname}
                </h1>
                <p style={{ fontSize: '0.85rem', color: '#9A9A9A', margin: REWARDS_ENABLED ? '0 0 6px' : '0 0 12px' }}>{display.email}</p>
                {REWARDS_ENABLED && (
                  <>
                    <p style={{ fontSize: '0.85rem', color: '#FF5533', fontWeight: 700, margin: '0 0 20px' }}>
                      Seviye {levelInfo.level} — {levelInfo.title}
                    </p>

                    {/* Progress bar */}
                    <div style={{ maxWidth: '360px', margin: '0 auto' }}>
                      <div style={{ height: '8px', background: '#E5E7EB', borderRadius: '4px', overflow: 'hidden', marginBottom: '8px' }}>
                        <div style={{ height: '100%', width: `${Math.round(progress * 100)}%`, background: '#FF5533', borderRadius: '4px' }} />
                      </div>
                      <p style={{ fontSize: '0.68rem', color: '#9CA3AF', fontWeight: 600, letterSpacing: '0.05em', margin: 0 }}>
                        SONRAKİ SEVİYE: {toNext > 0 ? `${toNext} XP` : 'MAX'}
                      </p>
                    </div>
                  </>
                )}

                {/* Stats */}
                <div style={{
                  display: 'flex', borderTop: '1px solid #F3F3F3', marginTop: '24px', paddingTop: '20px',
                }}>
                  <StatItem label="Etkinlik" value={String(points.length)} />
                  {REWARDS_ENABLED && (
                    <>
                      <div style={{ width: '1px', background: '#F3F3F3' }} />
                      <StatItem label="Toplam XP" value={totalPoints.toLocaleString('tr-TR')} />
                    </>
                  )}
                  <div style={{ width: '1px', background: '#F3F3F3' }} />
                  <StatItem label="Favori" value={favCount !== null ? String(favCount) : '—'} />
                </div>
              </div>

              {/* ── Profil Bilgileri (editable) ── */}
              <div style={{
                background: 'white', border: '1px solid #EAEAEA', borderRadius: '20px',
                padding: '24px 28px', marginBottom: '16px',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                  <h2 style={sectionTitleStyle}>Profil Bilgileri</h2>
                  {!editing && (
                    <button onClick={startEdit} style={editBtnStyle}>Düzenle</button>
                  )}
                </div>

                {saveMsg && (
                  <p style={{
                    fontSize: '0.8rem', padding: '10px 14px', borderRadius: '10px', margin: '0 0 14px',
                    background: saveMsg.ok ? '#F0FDF4' : '#FEF2F2',
                    color: saveMsg.ok ? '#15803D' : '#DC2626',
                  }}>
                    {saveMsg.text}
                  </p>
                )}

                {editing ? (
                  <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                    <div style={{ display: 'flex', gap: '12px' }}>
                      <div style={{ flex: 1 }}>
                        <label style={labelStyle}>Ad</label>
                        <input required value={name} onChange={(e) => setName(e.target.value)} style={inputStyle} />
                      </div>
                      <div style={{ flex: 1 }}>
                        <label style={labelStyle}>Soyad</label>
                        <input required value={surname} onChange={(e) => setSurname(e.target.value)} style={inputStyle} />
                      </div>
                    </div>
                    <div>
                      <label style={labelStyle}>Telefon</label>
                      <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="05XX XXX XX XX" style={inputStyle} />
                    </div>
                    <div>
                      <label style={labelStyle}>E-posta</label>
                      <input value={display.email} disabled style={{ ...inputStyle, background: '#F9FAFB', color: '#9CA3AF' }} />
                      <p style={{ fontSize: '0.72rem', color: '#B0B0B0', margin: '5px 0 0' }}>E-posta adresi değiştirilemez.</p>
                    </div>
                    <div style={{ display: 'flex', gap: '10px', marginTop: '4px' }}>
                      <button
                        type="button"
                        onClick={() => setEditing(false)}
                        style={{
                          flex: 1, padding: '11px', borderRadius: '10px', border: '1.5px solid #E5E7EB',
                          background: 'white', fontSize: '0.85rem', fontWeight: 700, color: '#6B7280',
                          cursor: 'pointer', fontFamily: 'inherit',
                        }}
                      >
                        İptal
                      </button>
                      <button
                        type="submit"
                        disabled={saving}
                        style={{
                          flex: 2, padding: '11px', borderRadius: '10px', border: 'none',
                          background: '#FF5533', fontSize: '0.85rem', fontWeight: 700, color: 'white',
                          cursor: saving ? 'default' : 'pointer', opacity: saving ? 0.7 : 1, fontFamily: 'inherit',
                        }}
                      >
                        {saving ? 'Kaydediliyor...' : 'Kaydet'}
                      </button>
                    </div>
                  </form>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <InfoLine label="Ad Soyad" value={`${display.name} ${display.surname}`} />
                    <InfoLine label="E-posta" value={display.email} />
                    <InfoLine label="Telefon" value={display.phone || '—'} />
                  </div>
                )}
              </div>

              {/* ── Rezervasyonlarım ── */}
              <div style={{
                background: 'white', border: '1px solid #EAEAEA', borderRadius: '20px',
                padding: '24px 28px', marginBottom: '16px',
              }}>
                <h2 style={{ ...sectionTitleStyle, marginBottom: '16px' }}>Rezervasyonlarım</h2>
                {dataLoading ? (
                  <p style={emptyTextStyle}>Yükleniyor...</p>
                ) : bookings.length === 0 ? (
                  <p style={emptyTextStyle}>
                    Henüz rezervasyonunuz yok.{' '}
                    <Link href="/etkinlikler" style={{ color: '#FF5533', fontWeight: 600, textDecoration: 'none' }}>
                      Turlara göz at →
                    </Link>
                  </p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {bookings.map((b) => {
                      const st = STATUS_STYLE[b.status] ?? STATUS_STYLE.pending;
                      return (
                        <Link
                          key={b.id}
                          href={b.tour ? `/tours/${b.tour.id}` : '#'}
                          style={{
                            display: 'flex', alignItems: 'center', gap: '12px',
                            border: '1px solid #F0F0F0', borderRadius: '12px', padding: '12px 14px',
                            textDecoration: 'none', color: 'inherit',
                          }}
                        >
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <p style={{
                              margin: 0, fontSize: '0.88rem', fontWeight: 700, color: '#1A1A1A',
                              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                            }}>
                              {b.tour?.name ?? 'Tur'}
                            </p>
                            <p style={{ margin: '3px 0 0', fontSize: '0.75rem', color: '#9A9A9A' }}>
                              {b.tour?.start_date ? fmtDate(b.tour.start_date) : fmtDate(b.created_at)} · {b.participant_count} kişi
                            </p>
                          </div>
                          <span style={{
                            fontSize: '0.7rem', fontWeight: 700, padding: '4px 10px', borderRadius: '8px',
                            background: st.bg, color: st.text, flexShrink: 0,
                          }}>
                            {STATUS_LABEL[b.status] ?? b.status}
                          </span>
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* ── Katıldığım Turlar ── */}
              {REWARDS_ENABLED && (
              <div style={{
                background: 'white', border: '1px solid #EAEAEA', borderRadius: '20px',
                padding: '24px 28px', marginBottom: '16px',
              }}>
                <h2 style={{ ...sectionTitleStyle, marginBottom: '16px' }}>Katıldığım Turlar</h2>
                {dataLoading ? (
                  <p style={emptyTextStyle}>Yükleniyor...</p>
                ) : points.length === 0 ? (
                  <p style={emptyTextStyle}>Henüz tamamlanan turunuz yok. Katıldığınız turlar burada listelenir.</p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {points.map((p) => (
                      <div
                        key={p.id}
                        style={{
                          display: 'flex', alignItems: 'center', gap: '12px',
                          border: '1px solid #F0F0F0', borderRadius: '12px', padding: '12px 14px',
                        }}
                      >
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p style={{
                            margin: 0, fontSize: '0.88rem', fontWeight: 700, color: '#1A1A1A',
                            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                          }}>
                            {p.tour?.name ?? 'Tur'}
                          </p>
                          <p style={{ margin: '3px 0 0', fontSize: '0.75rem', color: '#9A9A9A' }}>
                            {fmtDate(p.awarded_at)}
                          </p>
                        </div>
                        <span style={{ fontSize: '0.8rem', fontWeight: 800, color: '#FF5533', flexShrink: 0 }}>
                          +{p.points_earned} XP
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              )}

              {/* ── Quick links ── */}
              <div style={{
                background: 'white', border: '1px solid #EAEAEA', borderRadius: '20px',
                overflow: 'hidden', marginBottom: '16px',
              }}>
                <Link href="/favorilerim" style={menuRowStyle}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#FF5533" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                  </svg>
                  <span style={{ flex: 1, fontWeight: 600, color: '#1A1A1A' }}>Favorilerim</span>
                  {favCount !== null && (
                    <span style={{ fontSize: '0.78rem', color: '#9A9A9A', fontWeight: 600 }}>{favCount} tur</span>
                  )}
                  <ChevronRight />
                </Link>
                {REWARDS_ENABLED && (
                  <>
                    <div style={{ height: '1px', background: '#F3F3F3' }} />
                    <Link href="/liderlik" style={menuRowStyle}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#FF5533" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/>
                      </svg>
                      <span style={{ flex: 1, fontWeight: 600, color: '#1A1A1A' }}>Liderlik Tablosu</span>
                      <ChevronRight />
                    </Link>
                  </>
                )}
                <div style={{ height: '1px', background: '#F3F3F3' }} />
                <Link href="/etkinlikler" style={menuRowStyle}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#FF5533" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10"/><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"/>
                  </svg>
                  <span style={{ flex: 1, fontWeight: 600, color: '#1A1A1A' }}>Turları Keşfet</span>
                  <ChevronRight />
                </Link>
              </div>

              {/* ── Logout + Delete ── */}
              <button
                onClick={() => { logout(); router.push('/anasayfa'); }}
                style={{
                  width: '100%', background: '#FFF5F5', border: '1.5px solid #FEE2E2',
                  borderRadius: '14px', padding: '14px', fontSize: '0.92rem', fontWeight: 700,
                  color: '#DC2626', cursor: 'pointer', fontFamily: 'inherit', marginBottom: '10px',
                }}
              >
                Çıkış Yap
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                style={{
                  width: '100%', background: 'transparent', border: 'none',
                  padding: '10px', fontSize: '0.78rem', fontWeight: 600,
                  color: '#B0B0B0', cursor: 'pointer', fontFamily: 'inherit',
                  textDecoration: 'underline',
                }}
              >
                {deleting ? 'Hesap siliniyor...' : 'Hesabımı kalıcı olarak sil'}
              </button>
            </>
          )}
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}

const sectionTitleStyle: React.CSSProperties = {
  fontSize: '1rem', fontWeight: 800, color: '#1A1A1A', margin: 0,
};

const editBtnStyle: React.CSSProperties = {
  background: '#FFF4F1', border: '1px solid rgba(255,85,51,0.25)', borderRadius: '10px',
  padding: '7px 16px', fontSize: '0.78rem', fontWeight: 700, color: '#FF5533',
  cursor: 'pointer', fontFamily: 'inherit',
};

const labelStyle: React.CSSProperties = {
  display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#6B7280', marginBottom: '6px',
};

const inputStyle: React.CSSProperties = {
  width: '100%', padding: '11px 13px', fontSize: '0.88rem', color: '#1A1A1A',
  background: 'white', border: '1px solid #D1D5DB', borderRadius: '10px',
  outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit',
};

const emptyTextStyle: React.CSSProperties = {
  fontSize: '0.85rem', color: '#9A9A9A', margin: 0,
};

const menuRowStyle: React.CSSProperties = {
  display: 'flex', alignItems: 'center', gap: '14px',
  padding: '16px 20px', textDecoration: 'none', color: 'inherit',
};

function StatItem({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ flex: 1 }}>
      <p style={{ margin: '0 0 4px', fontSize: '0.72rem', color: '#9A9A9A', fontWeight: 600 }}>{label}</p>
      <p style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800, color: '#FF5533' }}>{value}</p>
    </div>
  );
}

function InfoLine({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
      <span style={{ width: '90px', fontSize: '0.78rem', color: '#9A9A9A', fontWeight: 600, flexShrink: 0 }}>{label}</span>
      <span style={{ fontSize: '0.88rem', color: '#1A1A1A', fontWeight: 600 }}>{value}</span>
    </div>
  );
}

function ChevronRight() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#D1D5DB" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="9 18 15 12 9 6" />
    </svg>
  );
}
