import { supabase } from './supabase';
import { emitXpAward, emitLevelUp, emitStreakMilestone } from './xpEvents';
import { getRank } from './gamification';

// Visual escalation tiers for the streak flame, mirroring how the rank crests
// grow in ornamentation from Novice to Prime. The base tier reproduces the
// existing flame chip exactly, so nothing changes visually below 14 days.
// Glows are static (no animated box-shadow) to stay inside the established
// motion rules for persistent UI.
export const STREAK_TIERS = [
  {
    min: 100,
    key: 'eternal',
    flameColor: '#FFD34D',
    flameFill: '#F5A800',
    chipBg: 'rgba(245,168,0,0.22)',
    chipBorder: '1px solid rgba(255,211,77,0.55)',
    chipGlow: '0 0 8px rgba(245,168,0,0.55), 0 0 22px rgba(245,168,0,0.3)',
  },
  {
    min: 30,
    key: 'gold',
    flameColor: '#F5A800',
    flameFill: 'rgba(245,168,0,0.45)',
    chipBg: 'rgba(245,168,0,0.18)',
    chipBorder: '1px solid rgba(245,168,0,0.45)',
    chipGlow: '0 0 6px rgba(245,168,0,0.35), 0 0 16px rgba(245,168,0,0.2)',
  },
  {
    min: 14,
    key: 'blaze',
    flameColor: '#fbbf24',
    flameFill: 'rgba(251,191,36,0.35)',
    chipBg: 'rgba(251,191,36,0.16)',
    chipBorder: '1px solid rgba(251,191,36,0.3)',
    chipGlow: '0 0 10px rgba(251,191,36,0.28)',
  },
  {
    min: 0,
    key: 'ember',
    flameColor: '#fb923c',
    flameFill: 'none',
    chipBg: 'rgba(251,146,60,0.15)',
    chipBorder: '1px solid transparent',
    chipGlow: 'none',
  },
];

export function getStreakTier(streak) {
  const s = Number(streak) || 0;
  return STREAK_TIERS.find((t) => s >= t.min) || STREAK_TIERS[STREAK_TIERS.length - 1];
}

// Fire-and-forget: called right after the daily check-in resolves (see xp.js).
// The 3/7-day bonuses stay inside daily_checkin untouched; this only claims
// the new 14/30/100-day tiers, idempotently per streak run.
export function claimStreakMilestones() {
  supabase.rpc('claim_streak_milestones').then(({ data, error }) => {
    if (error) { console.warn('[streaks] claim_streak_milestones failed:', error); return; }

    const awarded = data?.awarded || [];

    let oldLevel = null;
    let newLevel = null;

    for (const milestone of awarded) {
      if (!milestone || !(milestone.xp_awarded > 0)) continue;
      emitXpAward({ xp: milestone.xp_awarded, leveledUp: !!milestone.leveled_up });
      emitStreakMilestone({ days: milestone.milestone_days, xp: milestone.xp_awarded });
      if (milestone.leveled_up) {
        if (oldLevel === null) oldLevel = milestone.old_level;
        newLevel = newLevel === null ? milestone.new_level : Math.max(newLevel, milestone.new_level);
      }
    }

    if (newLevel !== null) {
      const rank = getRank(newLevel);
      const prevRank = getRank(oldLevel);
      emitLevelUp({ level: newLevel, rank, rankChanged: rank.name !== prevRank.name });
    }
  }).catch((err) => {
    console.warn('[streaks] claim_streak_milestones failed:', err);
  });
}
