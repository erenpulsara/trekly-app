// Same level system as the mobile app (mobile/src/utils/levels.ts) —
// keep the two in sync so users see identical levels on web and mobile.
export interface LevelInfo {
  level: number;
  title: string;
  minPoints: number;
  maxPoints: number;
  nextLevelPoints: number;
}

const LEVELS: Array<{ level: number; title: string; minPoints: number; maxPoints: number }> = [
  { level: 1, title: 'Gezgin', minPoints: 0, maxPoints: 99 },
  { level: 2, title: 'Kaşif', minPoints: 100, maxPoints: 299 },
  { level: 3, title: 'Maceraperest', minPoints: 300, maxPoints: 599 },
  { level: 4, title: 'Dağcı', minPoints: 600, maxPoints: 999 },
  { level: 5, title: 'İzci', minPoints: 1000, maxPoints: 1999 },
  { level: 6, title: 'Rehber', minPoints: 2000, maxPoints: 3999 },
  { level: 7, title: 'Uzman', minPoints: 4000, maxPoints: 6999 },
  { level: 8, title: 'Kaşif', minPoints: 7000, maxPoints: Infinity },
];

export function getUserLevel(totalPoints: number): LevelInfo {
  const levelData = LEVELS.find(
    (l) => totalPoints >= l.minPoints && totalPoints <= l.maxPoints
  ) ?? LEVELS[LEVELS.length - 1];

  const nextLevel = LEVELS.find((l) => l.level === levelData.level + 1);
  const nextLevelPoints = nextLevel ? nextLevel.minPoints : levelData.maxPoints;

  return {
    level: levelData.level,
    title: levelData.title,
    minPoints: levelData.minPoints,
    maxPoints: levelData.maxPoints,
    nextLevelPoints,
  };
}

export function getLevelProgress(totalPoints: number): number {
  const levelInfo = getUserLevel(totalPoints);
  if (levelInfo.level === 8) return 1;
  const range = levelInfo.nextLevelPoints - levelInfo.minPoints;
  const progress = totalPoints - levelInfo.minPoints;
  return Math.min(progress / range, 1);
}

export function getPointsToNextLevel(totalPoints: number): number {
  const levelInfo = getUserLevel(totalPoints);
  if (levelInfo.level === 8) return 0;
  return levelInfo.nextLevelPoints - totalPoints;
}
