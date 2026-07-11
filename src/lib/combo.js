// In-session combo mechanic for Exam Coach (Multiple Choice only).
// Consecutive correct answers accrue bonus XP at an escalating rate; a wrong
// answer resets the run. The bonus is paid once at session end, folded into
// the existing exam_coach_session award via award_xp's p_xp_override
// parameter — never as a separate per-question award. Quick Practice sessions
// never accrue a combo, consistent with their existing exclusion from XP.

// Mirrors the exam_coach_session amount defined inside the award_xp RPC —
// needed because p_xp_override replaces (not adds to) the base amount.
export const EXAM_COACH_BASE_XP = 25;

// Combo bonus can at most double the session award (25 + 25).
export const COMBO_BONUS_CAP = 25;

// Bonus XP earned by the answer that just extended the run to `combo`:
// the 3rd and 4th in a row are worth +2 each, the 5th-7th +3, the 8th on +5.
export function comboBonusForStreak(combo) {
  if (combo >= 8) return 5;
  if (combo >= 5) return 3;
  if (combo >= 3) return 2;
  return 0;
}

// Escalating chip treatment, same tier language as the streak flame: richer
// color and a bigger static glow as the run grows.
const COMBO_TIERS = [
  {
    min: 8,
    color: '#F5A800',
    bg: 'rgba(245,168,0,0.2)',
    border: '1px solid rgba(245,168,0,0.5)',
    glow: '0 0 8px rgba(245,168,0,0.45), 0 0 18px rgba(245,168,0,0.25)',
  },
  {
    min: 5,
    color: '#F5A800',
    bg: 'rgba(245,168,0,0.16)',
    border: '1px solid rgba(245,168,0,0.35)',
    glow: '0 0 10px rgba(245,168,0,0.3)',
  },
  {
    min: 3,
    color: '#fbbf24',
    bg: 'rgba(251,191,36,0.14)',
    border: '1px solid rgba(251,191,36,0.3)',
    glow: 'none',
  },
  {
    min: 0,
    color: '#34d399',
    bg: 'rgba(52,211,153,0.14)',
    border: '1px solid rgba(52,211,153,0.3)',
    glow: 'none',
  },
];

export function getComboTier(combo) {
  return COMBO_TIERS.find((t) => combo >= t.min) || COMBO_TIERS[COMBO_TIERS.length - 1];
}
