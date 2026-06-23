export type Difficulty = 'easy' | 'medium' | 'hard' | 'extreme';

const DIFFICULTY_MULTIPLIER: Record<Difficulty, number> = {
  easy: 1,
  medium: 1.5,
  hard: 2,
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
