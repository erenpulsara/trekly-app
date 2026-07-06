'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import SiteFooter from '@/app/components/SiteFooter';
import LandingNav from '../landing-nav';
import { useUserAuth } from '../UserAuthContext';
import { fetchLeaderboard, fetchMyRank, LeaderboardEntry } from '@/lib/user-api';
import { getUserLevel } from '@/lib/levels';

const MEDALS = ['🥇', '🥈', '🥉'];

export default function LiderlikPage() {
  const { user, isLoading } = useUserAuth();
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [myRank, setMyRank] = useState<{ rank: number; total_points: number } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([fetchLeaderboard(), fetchMyRank()])
      .then(([list, mine]) => {
        setEntries(list);
        setMyRank(mine);
      })
      .finally(() => setLoading(false));
  }, [user]);

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
          <div style={{ textAlign: 'center', marginBottom: '28px' }}>
            <h1 style={{
              fontFamily: '"Cormorant Garamond", serif', fontSize: 'clamp(1.5rem, 2.8vw, 2.1rem)',
              fontWeight: 700, color: '#1A1A1A', margin: '0 0 8px', textTransform: 'uppercase',
              letterSpacing: '0.02em',
            }}>
              Liderlik Tablosu
            </h1>
            <p style={{ fontSize: '0.85rem', color: '#9A9A9A', margin: 0 }}>
              Turlara katıl, XP kazan, zirveye tırman! 🏔️
            </p>
          </div>

          {/* My rank card */}
          {!isLoading && user && myRank && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: '14px',
              background: '#1A1A1A', borderRadius: '16px', padding: '16px 20px', marginBottom: '16px',
            }}>
              <div style={{
                width: '44px', height: '44px', borderRadius: '50%', background: '#FF5533',
                color: 'white', fontWeight: 800, fontSize: '1rem',
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
              }}>
                {user.name.charAt(0).toUpperCase()}
              </div>
              <div style={{ flex: 1 }}>
                <p style={{ margin: 0, fontSize: '0.9rem', fontWeight: 700, color: 'white' }}>
                  Senin Sıran: #{myRank.rank}
                </p>
                <p style={{ margin: '2px 0 0', fontSize: '0.75rem', color: 'rgba(255,255,255,0.55)' }}>
                  Seviye {getUserLevel(myRank.total_points).level} — {getUserLevel(myRank.total_points).title}
                </p>
              </div>
              <span style={{ fontSize: '1rem', fontWeight: 800, color: '#FF5533' }}>
                {myRank.total_points.toLocaleString('tr-TR')} XP
              </span>
            </div>
          )}

          {/* Leaderboard list */}
          <div style={{
            background: 'white', border: '1px solid #EAEAEA', borderRadius: '20px', overflow: 'hidden',
          }}>
            {loading ? (
              <p style={{ textAlign: 'center', padding: '40px 0', color: '#9A9A9A', fontSize: '0.9rem' }}>
                Yükleniyor...
              </p>
            ) : entries.length === 0 ? (
              <p style={{ textAlign: 'center', padding: '40px 20px', color: '#9A9A9A', fontSize: '0.9rem' }}>
                Henüz sıralama oluşmadı. İlk XP kazanan sen ol!
              </p>
            ) : (
              entries.map((e, i) => {
                const level = getUserLevel(e.total_points);
                const isTop3 = e.rank <= 3;
                return (
                  <div
                    key={`${e.rank}-${e.name}`}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '14px',
                      padding: '14px 20px',
                      borderBottom: i < entries.length - 1 ? '1px solid #F5F5F5' : 'none',
                      background: isTop3 ? '#FFFDF7' : 'white',
                    }}
                  >
                    <span style={{
                      width: '36px', textAlign: 'center', fontSize: isTop3 ? '1.3rem' : '0.85rem',
                      fontWeight: 800, color: '#9A9A9A', flexShrink: 0,
                    }}>
                      {isTop3 ? MEDALS[e.rank - 1] : `#${e.rank}`}
                    </span>
                    <div style={{
                      width: '38px', height: '38px', borderRadius: '50%',
                      background: isTop3 ? '#FF5533' : '#F3F4F6',
                      color: isTop3 ? 'white' : '#6B7280',
                      fontWeight: 800, fontSize: '0.9rem',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                    }}>
                      {e.name.charAt(0).toUpperCase()}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ margin: 0, fontSize: '0.9rem', fontWeight: 700, color: '#1A1A1A' }}>
                        {e.name} {e.surname_initial}
                      </p>
                      <p style={{ margin: '2px 0 0', fontSize: '0.72rem', color: '#9A9A9A' }}>
                        Seviye {level.level} — {level.title}
                      </p>
                    </div>
                    <span style={{ fontSize: '0.92rem', fontWeight: 800, color: '#FF5533', flexShrink: 0 }}>
                      {e.total_points.toLocaleString('tr-TR')} XP
                    </span>
                  </div>
                );
              })
            )}
          </div>

          {!isLoading && !user && (
            <p style={{ textAlign: 'center', fontSize: '0.85rem', color: '#9A9A9A', marginTop: '20px' }}>
              Kendi sıranı görmek için{' '}
              <Link href="/giris?returnTo=/liderlik" style={{ color: '#FF5533', fontWeight: 700, textDecoration: 'none' }}>
                giriş yap
              </Link>
            </p>
          )}
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
