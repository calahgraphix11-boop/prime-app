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

export const CHARACTERS = [
  { key: "male-glasses", name: "The Analyst", icon: "/gamification-assets/avatars/avatar-male-glasses.png" },
  { key: "female-braids", name: "The Strategist", icon: "/gamification-assets/avatars/avatar-female-braids.png" },
  { key: "male-locs", name: "The Grinder", icon: "/gamification-assets/avatars/avatar-male-locs.png" },
  { key: "female-afro", name: "The Visionary", icon: "/gamification-assets/avatars/avatar-female-afro.webp" },
  { key: "male-dreads", name: "The Motivator", icon: "/gamification-assets/avatars/avatar-male-dreads.png" },
  { key: "male-glasses-2", name: "The Scholar", icon: "/gamification-assets/avatars/avatar-male-glasses-2.png" },
  { key: "female-cornrows", name: "The Perfectionist", icon: "/gamification-assets/avatars/avatar-female-cornrows.png" },
  { key: "female-curls", name: "The Dreamer", icon: "/gamification-assets/avatars/avatar-female-curls.png" },
  { key: "female-braids-long", name: "The Trailblazer", icon: "/gamification-assets/avatars/avatar-female-braids-long.png" },
  { key: "male-beard", name: "The Mentor", icon: "/gamification-assets/avatars/avatar-male-beard.png" },
];

export function getCharacter(key) {
  return CHARACTERS.find((c) => c.key === key) || null;
}

// Mirrors the 8 badges awarded server-side by check_and_award_badges() —
// order here is the display order on the Profile badges grid.
export const BADGES = [
  {
    key: "first-step",
    name: "First Step",
    icon: "/gamification-assets/badges/badge-first-step.png",
    description: "Complete your first study action",
  },
  {
    key: "streak-starter",
    name: "Streak Starter",
    icon: "/gamification-assets/badges/badge-streak-starter.png",
    description: "Reach a 3-day study streak",
  },
  {
    key: "on-fire",
    name: "On Fire",
    icon: "/gamification-assets/badges/badge-on-fire.png",
    description: "Reach a 7-day study streak",
  },
  {
    key: "note-taker",
    name: "Note Taker",
    icon: "/gamification-assets/badges/badge-note-taker.png",
    description: "Summarize your first note",
  },
  {
    key: "exam-ready",
    name: "Exam Ready",
    icon: "/gamification-assets/badges/badge-exam-ready.png",
    description: "Complete your first Exam Coach session",
  },
  {
    key: "perfect-score",
    name: "Perfect Score",
    icon: "/gamification-assets/badges/badge-perfect-score.png",
    description: "Score 100% on an Exam Coach session",
  },
  {
    key: "bookworm",
    name: "Bookworm",
    icon: "/gamification-assets/badges/badge-bookworm.png",
    description: "Upload your first file",
  },
  {
    key: "century-club",
    name: "Century Club",
    icon: "/gamification-assets/badges/badge-century-club.png",
    description: "Complete 100 total study actions",
  },
];
