// Level N requires 100 * N^1.5 total XP (cumulative threshold to reach level N).
export function xpForLevel(level) {
  return Math.round(100 * Math.pow(level, 1.5));
}

// Returns { level, xpIntoLevel, xpForNextLevel, progress (0-1) } derived from total_xp.
// Falls back to the stored current_level from user_xp if total_xp doesn't cleanly resolve.
export function calculateLevelProgress(totalXp, storedLevel = 1) {
  const xp = Number(totalXp) || 0;
  let level = 1;
  while (xpForLevel(level + 1) <= xp) level++;
  level = Math.max(level, storedLevel || 1);

  const currentThreshold = level === 1 ? 0 : xpForLevel(level);
  const nextThreshold = xpForLevel(level + 1);
  const xpIntoLevel = Math.max(0, xp - currentThreshold);
  const xpForNextLevel = Math.max(1, nextThreshold - currentThreshold);
  const progress = Math.min(1, xpIntoLevel / xpForNextLevel);

  return { level, xpIntoLevel, xpForNextLevel, progress };
}

const RANKS = [
  { max: 5, name: "Novice", icon: "/gamification-assets/ranks/rank-1-novice.png" },
  { max: 12, name: "Apprentice", icon: "/gamification-assets/ranks/rank-2-apprentice.png" },
  { max: 20, name: "Scholar", icon: "/gamification-assets/ranks/rank-3-scholar.png" },
  { max: 30, name: "Master", icon: "/gamification-assets/ranks/rank-4-master.png" },
  { max: Infinity, name: "Prime", icon: "/gamification-assets/ranks/rank-5-prime.png" },
];

export function getRank(level) {
  return RANKS.find((r) => level <= r.max) || RANKS[RANKS.length - 1];
}
