'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useUserAuth } from '@/app/UserAuthContext';
import { getFavoriteIds, addFavorite, removeFavorite } from '@/lib/favorites-api';
import { T, type Lang, getLangClient } from '@/lib/i18n';

interface Props {
  tourId: string;
  tourName: string;
}

export default function TourActions({ tourId, tourName }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isLoading: authLoading } = useUserAuth();
  const [liked, setLiked] = useState(false);
  const [copied, setCopied] = useState(false);
  const [lang, setLang] = useState<Lang>('tr');
  useEffect(() => { setLang(getLangClient()); }, []);
  const tt = T[lang].td;

  useEffect(() => {
    if (!user) { setLiked(false); return; }
    getFavoriteIds().then((ids) => setLiked(ids.includes(tourId))).catch(() => {});
  }, [tourId, user]);

  async function toggleFav() {
    if (authLoading) return;
    if (!user) {
      router.push(`/giris?returnTo=${encodeURIComponent(pathname)}`);
      return;
    }
    const next = !liked;
    setLiked(next); // optimistic
    try {
      if (next) await addFavorite(tourId);
      else await removeFavorite(tourId);
    } catch {
      setLiked(!next); // revert on failure
    }
  }

  async function handleShare() {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({ title: tourName, url });
        return;
      } catch {}
    }
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  }

  const btnBase: React.CSSProperties = {
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
    width: 38, height: 38, borderRadius: '50%',
    border: '1.5px solid #E5E7EB',
    background: 'white',
    cursor: 'pointer',
    flexShrink: 0,
    transition: 'all 0.15s',
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
      {/* Favori */}
      <button
        onClick={toggleFav}
        title={liked ? tt.removeFav : tt.addFav}
        style={{
          ...btnBase,
          borderColor: liked ? '#FF5533' : '#E5E7EB',
          background: liked ? '#FFF4F1' : 'white',
        }}
        onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = '#FF5533'; }}
        onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = liked ? '#FF5533' : '#E5E7EB'; }}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill={liked ? '#FF5533' : 'none'} stroke={liked ? '#FF5533' : '#6B7280'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
        </svg>
      </button>

      {/* Paylaş */}
      <button
        onClick={handleShare}
        title={tt.shareTour}
        style={{
          ...btnBase,
          borderColor: copied ? '#10B981' : '#E5E7EB',
          background: copied ? '#ECFDF5' : 'white',
          position: 'relative',
        }}
        onMouseEnter={e => { if (!copied) (e.currentTarget as HTMLButtonElement).style.borderColor = '#9CA3AF'; }}
        onMouseLeave={e => { if (!copied) (e.currentTarget as HTMLButtonElement).style.borderColor = '#E5E7EB'; }}
      >
        {copied ? (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        ) : (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#6B7280" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" />
            <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" /><line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
          </svg>
        )}
      </button>

      {copied && (
        <span style={{ fontSize: '0.72rem', color: '#10B981', fontWeight: 600, whiteSpace: 'nowrap' }}>
          {tt.linkCopied}
        </span>
      )}
    </div>
  );
}
