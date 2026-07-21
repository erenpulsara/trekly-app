import type { Tour } from './types';

/** Turun geçmişte kalıp kalmadığını kontrol eder — end_date, yoksa start_date,
 *  o da yoksa dates[] içindeki en son tarihe bakar. Hiç tarih yoksa filtrelenmez. */
export function isUpcomingTour(tour: Tour): boolean {
  const lastDate = tour.end_date
    ?? tour.start_date
    ?? tour.dates?.map((d) => d.date).sort().slice(-1)[0]
    ?? null;
  if (!lastDate) return true;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const d = new Date(lastDate.includes('T') ? lastDate : lastDate + 'T00:00:00');
  return d >= today;
}
