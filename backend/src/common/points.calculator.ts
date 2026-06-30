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

export function calculatePoints(
  altitudeMeters: number,
  distanceKm: number,
  difficulty: Difficulty,
): number {
  const altitudePoints = Math.floor(altitudeMeters / 500) * 100;
  const distancePoints = Math.floor(distanceKm / 10) * 50;
  const multiplier = DIFFICULTY_MULTIPLIER[difficulty];
  return Math.floor((altitudePoints + distancePoints) * multiplier);
}
