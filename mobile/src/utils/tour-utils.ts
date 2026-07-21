import { Tour } from '../types';

/** Turun "yaklaşan" sayılıp sayılmayacağını kontrol eder — bir tur başladığı andan
 *  itibaren (bitiş tarihi ileride olsa bile) artık "yaklaşan etkinlik" değildir.
 *  Öncelik: start_date, yoksa dates[] içindeki en erken tarih, o da yoksa end_date.
 *  Hiç tarih yoksa filtrelenmez. Web'deki landing/lib/tour-utils.ts ile aynı mantık. */
export function isUpcomingTour(tour: Tour): boolean {
  const referenceDate = tour.start_date
    ?? tour.dates?.map((d) => d.date).sort()[0]
    ?? tour.end_date
    ?? null;
  if (!referenceDate) return true;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const d = new Date(referenceDate.includes('T') ? referenceDate : referenceDate + 'T00:00:00');
  return d >= today;
}
