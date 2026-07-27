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

export interface TourDateRange {
  date: string;
  end_date?: string | null;
}

/** Turun tüm tarih seçeneklerini döner. Backend, bir tura ilk ek tarih
 *  eklendiği anda zorunlu start_date/end_date'i de gerçek bir dates[]
 *  kaydına dönüştürüyor (bkz. backend ensurePrimaryTourDate) — yani
 *  dates[] doluyken zaten TÜM seçenekleri içerir, ayrıca start_date
 *  eklemek tekrar/duplicate'e yol açar. dates[] boşsa (mevcut turların
 *  tamamı) tek seçenek olarak start_date/end_date kullanılır. */
export function getAllTourDateRanges(tour: Pick<Tour, 'start_date' | 'end_date' | 'dates'>): TourDateRange[] {
  if (tour.dates && tour.dates.length > 0) {
    return tour.dates.map((d) => ({ date: d.date, end_date: d.end_date }));
  }
  if (tour.start_date) {
    return [{ date: tour.start_date, end_date: tour.end_date }];
  }
  return [];
}
