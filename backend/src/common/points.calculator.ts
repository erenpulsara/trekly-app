export type Difficulty =
  | 'easy'
  | 'easy_medium'
  | 'medium'
  | 'medium_hard'
  | 'hard'
  | 'very_hard'
  | 'extreme';

const DIFFICULTY_MULTIPLIER: Record<Difficulty, number> = {
  easy: 1,
  easy_medium: 1.25,
  medium: 1.5,
  medium_hard: 1.75,
  hard: 2,
  very_hard: 2.5,
  extreme: 3,
};

// Zorluk-bazlı taban puan: rakım/mesafe girilmemiş ya da düşük olsa bile
// (ör. su sporları, günübirlik etkinlikler) her tur en az bu kadar XP verir.
// Böylece hiçbir yayınlanan tur 0 puanla kalmaz.
const DIFFICULTY_BASE: Record<Difficulty, number> = {
  easy: 100,
  easy_medium: 150,
  medium: 200,
  medium_hard: 300,
  hard: 400,
  very_hard: 550,
  extreme: 750,
};

export function calculatePoints(
  altitudeMeters: number,
  distanceKm: number,
  difficulty: Difficulty,
): number {
  const altitudePoints = Math.floor(altitudeMeters / 500) * 100;
  const distancePoints = Math.floor(distanceKm / 10) * 50;
  const multiplier = DIFFICULTY_MULTIPLIER[difficulty];
  const computed = Math.floor((altitudePoints + distancePoints) * multiplier);
  // Taban ile hesaplananın büyüğünü döndür — rakım/mesafe bonusu korunur,
  // ama düşük değerli turlar da zorluğuna göre garanti bir XP alır.
  return Math.max(computed, DIFFICULTY_BASE[difficulty]);
}
