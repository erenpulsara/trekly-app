export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('tr-TR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

export function formatShortDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('tr-TR', {
    day: 'numeric',
    month: 'short',
  });
}

export function formatPoints(points: number): string {
  return `${points.toLocaleString('tr-TR')} XP`;
}

export function formatPrice(amount: number): string {
  return `₺${amount.toLocaleString('tr-TR')}`;
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
