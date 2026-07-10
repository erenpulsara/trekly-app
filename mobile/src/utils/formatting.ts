import type { Lang } from '../i18n/translations';

function parseLocalDate(dateString: string): Date {
  // Date-only strings parse as UTC; pin to local midnight to avoid day shifts
  return new Date(dateString.includes('T') ? dateString : dateString + 'T00:00:00');
}

const dateLocale = (lang: Lang) => (lang === 'en' ? 'en-US' : 'tr-TR');

export function formatDate(dateString: string, lang: Lang = 'tr'): string {
  const date = parseLocalDate(dateString);
  return date.toLocaleDateString(dateLocale(lang), {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

export function formatDateWithDay(dateString: string, lang: Lang = 'tr'): string {
  const date = parseLocalDate(dateString);
  const main = date.toLocaleDateString(dateLocale(lang), {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
  const weekday = date.toLocaleDateString(dateLocale(lang), { weekday: 'long' });
  return `${main} ${weekday}`;
}

export function formatDateRange(start: string, end?: string | null, lang: Lang = 'tr'): string {
  const s = parseLocalDate(start);
  if (!end) {
    return s.toLocaleDateString(dateLocale(lang), { day: 'numeric', month: 'short', year: 'numeric' });
  }
  const e = parseLocalDate(end);
  const sTxt = s.toLocaleDateString(dateLocale(lang), { day: 'numeric', month: 'short' });
  const eTxt = e.toLocaleDateString(dateLocale(lang), { day: 'numeric', month: 'short', year: 'numeric' });
  return `${sTxt} – ${eTxt}`;
}

export function formatShortDate(dateString: string, lang: Lang = 'tr'): string {
  const date = new Date(dateString);
  return date.toLocaleDateString(dateLocale(lang), {
    day: 'numeric',
    month: 'short',
  });
}

export function formatPoints(points: number): string {
  return `${points.toLocaleString('tr-TR')} XP`;
}

export function formatPrice(amount: number, currency?: 'TRY' | 'USD' | 'EUR' | null): string {
  const sym = currency === 'USD' ? '$' : currency === 'EUR' ? '€' : '₺';
  return `${sym}${Number(amount).toLocaleString('tr-TR')}`;
}

export function formatDistance(km: number): string {
  return `${km} km`;
}

export function formatAltitude(meters: number): string {
  return `${meters.toLocaleString('tr-TR')} m`;
}

export function formatDuration(hours: number): string {
  if (hours < 24) {
    return `${hours} saat`;
  }
  const days = Math.floor(hours / 24);
  const remaining = hours % 24;
  if (remaining === 0) return `${days} gün`;
  return `${days} gün ${remaining} saat`;
}

export function timeAgo(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return 'Az önce';
  if (diffMins < 60) return `${diffMins} dakika önce`;
  if (diffHours < 24) return `${diffHours} saat önce`;
  if (diffDays < 7) return `${diffDays} gün önce`;
  return formatDate(dateString);
}
