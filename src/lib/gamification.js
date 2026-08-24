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
  { max: 5, name: { en: "Novice", fr: "Novice" }, icon: "/gamification-assets/ranks/rank-1-novice.png" },
  { max: 12, name: { en: "Apprentice", fr: "Apprenti(e)" }, icon: "/gamification-assets/ranks/rank-2-apprentice.png" },
  { max: 20, name: { en: "Scholar", fr: "Érudit(e)" }, icon: "/gamification-assets/ranks/rank-3-scholar.png" },
  { max: 30, name: { en: "Master", fr: "Maître" }, icon: "/gamification-assets/ranks/rank-4-master.png" },
  { max: Infinity, name: { en: "Prime", fr: "Prime" }, icon: "/gamification-assets/ranks/rank-5-prime.png" },
];

export function getRank(level) {
  return RANKS.find((r) => level <= r.max) || RANKS[RANKS.length - 1];
}

// Resolves a bilingual { en, fr } name/description field for the current lang.
export function localize(field, lang) {
  if (field && typeof field === "object") return field[lang] || field.en;
  return field;
}

export const CHARACTERS = [
  { key: "male-glasses", name: { en: "The Analyst", fr: "L'Analyste" }, icon: "/gamification-assets/avatars/avatar-male-glasses.png" },
  { key: "female-braids", name: { en: "The Strategist", fr: "La Stratège" }, icon: "/gamification-assets/avatars/avatar-female-braids.png" },
  { key: "male-locs", name: { en: "The Grinder", fr: "Le Bosseur" }, icon: "/gamification-assets/avatars/avatar-male-locs.png" },
  { key: "female-afro", name: { en: "The Visionary", fr: "La Visionnaire" }, icon: "/gamification-assets/avatars/avatar-female-afro.webp" },
  { key: "male-dreads", name: { en: "The Motivator", fr: "Le Motivateur" }, icon: "/gamification-assets/avatars/avatar-male-dreads.png" },
  { key: "male-glasses-2", name: { en: "The Scholar", fr: "Le Savant" }, icon: "/gamification-assets/avatars/avatar-male-glasses-2.png" },
  { key: "female-cornrows", name: { en: "The Perfectionist", fr: "La Perfectionniste" }, icon: "/gamification-assets/avatars/avatar-female-cornrows.png" },
  { key: "female-curls", name: { en: "The Dreamer", fr: "La Rêveuse" }, icon: "/gamification-assets/avatars/avatar-female-curls.png" },
  { key: "female-braids-long", name: { en: "The Trailblazer", fr: "La Pionnière" }, icon: "/gamification-assets/avatars/avatar-female-braids-long.png" },
  { key: "male-beard", name: { en: "The Mentor", fr: "Le Mentor" }, icon: "/gamification-assets/avatars/avatar-male-beard.png" },
];

export function getCharacter(key) {
  return CHARACTERS.find((c) => c.key === key) || null;
}

// Mirrors the 8 badges awarded server-side by check_and_award_badges() —
// order here is the display order on the Profile badges grid.
export const BADGES = [
  {
    key: "first-step",
    name: { en: "First Step", fr: "Premier Pas" },
    icon: "/gamification-assets/badges/badge-first-step.png",
    description: { en: "Complete your first study action", fr: "Complétez votre première action d'étude" },
  },
  {
    key: "streak-starter",
    name: { en: "Streak Starter", fr: "Départ en Force" },
    icon: "/gamification-assets/badges/badge-streak-starter.png",
    description: { en: "Reach a 3-day study streak", fr: "Atteignez une série de 3 jours d'étude" },
  },
  {
    key: "on-fire",
    name: { en: "On Fire", fr: "En Feu" },
    icon: "/gamification-assets/badges/badge-on-fire.png",
    description: { en: "Reach a 7-day study streak", fr: "Atteignez une série de 7 jours d'étude" },
  },
  {
    key: "note-taker",
    name: { en: "Note Taker", fr: "Preneur de Notes" },
    icon: "/gamification-assets/badges/badge-note-taker.png",
    description: { en: "Summarize your first note", fr: "Résumez votre première note" },
  },
  {
    key: "exam-ready",
    name: { en: "Exam Ready", fr: "Prêt pour l'Examen" },
    icon: "/gamification-assets/badges/badge-exam-ready.png",
    description: { en: "Complete your first Exam Coach session", fr: "Complétez votre première session Exam Coach" },
  },
  {
    key: "perfect-score",
    name: { en: "Perfect Score", fr: "Score Parfait" },
    icon: "/gamification-assets/badges/badge-perfect-score.png",
    description: { en: "Score 100% on an Exam Coach session", fr: "Obtenez 100% à une session Exam Coach" },
  },
  {
    key: "bookworm",
    name: { en: "Bookworm", fr: "Rat de Bibliothèque" },
    icon: "/gamification-assets/badges/badge-bookworm.png",
    description: { en: "Upload your first file", fr: "Téléversez votre premier fichier" },
  },
  {
    key: "century-club",
    name: { en: "Century Club", fr: "Club des Cent" },
    icon: "/gamification-assets/badges/badge-century-club.png",
    description: { en: "Complete 100 total study actions", fr: "Complétez 100 actions d'étude au total" },
  },
];
