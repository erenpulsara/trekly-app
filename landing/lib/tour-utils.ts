import type { Tour } from './types';

/** Turun "yaklaşan" sayılıp sayılmayacağını kontrol eder — bir tur başladığı gün
 *  (00:00'dan itibaren, bitiş tarihi ileride olsa bile) artık "yaklaşan etkinlik"
 *  değildir; bugüne denk gelen tur da listeden düşer, sadece bugünden sonrakiler kalır.
 *  Öncelik: start_date, yoksa dates[] içindeki en erken tarih, o da yoksa end_date.
 *  Hiç tarih yoksa filtrelenmez. */
export function isUpcomingTour(tour: Tour): boolean {
  const referenceDate = tour.start_date
    ?? tour.dates?.map((d) => d.date).sort()[0]
    ?? tour.end_date
    ?? null;
  if (!referenceDate) return true;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const d = new Date(referenceDate.includes('T') ? referenceDate : referenceDate + 'T00:00:00');
  return d > today;
}
