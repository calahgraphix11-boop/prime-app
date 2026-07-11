import { supabase } from './supabase';
import { emitXpAward, emitLevelUp, emitBadgeEarned } from './xpEvents';
import { getRank } from './gamification';
import { checkAndAwardQuests } from './quests';
import { claimStreakMilestones } from './streaks';

// RPCs may return a single row as an object, or as a one-row array
// depending on the Postgres function's return type — normalize both to an array.
function toRows(data) {
  return Array.isArray(data) ? data : [data];
}

// old_level/new_level come straight from the RPC response — never re-derive
// these by re-querying user_xp, since a second award_xp call (e.g. a streak
// milestone bonus fired right after the base checkin) can land its XP before
// this one reads back, making any inferred "previous level" wrong.
function notifyLevelUp(oldLevel, newLevel) {
  const rank = getRank(newLevel);
  const prevRank = getRank(oldLevel);
  emitLevelUp({ level: newLevel, rank, rankChanged: rank.name !== prevRank.name });
}

function notifyIfAwarded(result) {
  if (result && result.xp_awarded > 0) {
    emitXpAward({ xp: result.xp_awarded, leveledUp: !!result.leveled_up });
    if (result.leveled_up) {
      notifyLevelUp(result.old_level, result.new_level);
    }
  }
}

// Fire-and-forget: a just-completed action may have crossed a badge
// milestone (first exam, 100th study action, etc). Never throw — a failure
// here must never block or affect the underlying feature.
function checkAndAwardBadges() {
  supabase.rpc('check_and_award_badges').then(({ data, error }) => {
    if (error) { console.warn('[xp] check_and_award_badges failed:', error); return; }
    const newlyEarned = data?.newly_earned || [];
    newlyEarned.forEach((badgeKey) => emitBadgeEarned({ badgeKey }));
  }).catch((err) => {
    console.warn('[xp] check_and_award_badges failed:', err);
  });
}

// Fire-and-forget XP calls. Never throw — a failure here must never block
// or affect the underlying feature (exam, summary, upload, etc).
// xpOverride rides award_xp's existing p_xp_override parameter (the RPC is
// unchanged); the combo mechanic uses it to fold the session's combo bonus
// into the single exam_coach_session award.
export function awardXp(actionType, xpOverride) {
  const params = xpOverride != null
    ? { p_action_type: actionType, p_xp_override: xpOverride }
    : { p_action_type: actionType };
  supabase.rpc('award_xp', params).then(({ data, error }) => {
    if (error) { console.warn('[xp] award_xp failed:', actionType, error); return; }
    notifyIfAwarded(toRows(data)[0]);
    checkAndAwardBadges();
    checkAndAwardQuests();
  }).catch((err) => {
    console.warn('[xp] award_xp failed:', actionType, err);
  });
}

export function dailyCheckin() {
  supabase.rpc('daily_checkin').then(({ data, error }) => {
    if (error) { console.warn('[xp] daily_checkin failed:', error); return; }

    // daily_checkin returns a single object — { allowed, new_streak,
    // checkin_xp: {...}, milestone_xp: {...} | null } — with the award_xp
    // results nested inside, not as rows. checkin_xp is the base checkin
    // award; milestone_xp only exists on 3/7-day streak days. Fire a bubble
    // per award that actually granted XP, but collapse any level-ups into a
    // single modal event spanning from the first award's old_level to the
    // highest new_level reached, so the modal never fires twice for one
    // checkin. When allowed is false (already checked in today), neither
    // award is present and nothing fires.
    const result = toRows(data)[0] || {};
    const awards = [result.checkin_xp, result.milestone_xp].filter(Boolean);

    let oldLevel = null;
    let newLevel = null;

    for (const award of awards) {
      if (!(award.xp_awarded > 0)) continue;
      emitXpAward({ xp: award.xp_awarded, leveledUp: !!award.leveled_up });
      if (award.leveled_up) {
        if (oldLevel === null) oldLevel = award.old_level;
        newLevel = newLevel === null ? award.new_level : Math.max(newLevel, award.new_level);
      }
    }

    if (newLevel !== null) {
      notifyLevelUp(oldLevel, newLevel);
    }

    // The 14/30/100-day tiers live outside daily_checkin (which still owns
    // 3/7-day internally). Chained here so the claim always sees the streak
    // value this checkin just wrote. Fire-and-forget like everything above.
    claimStreakMilestones();
  }).catch((err) => {
    console.warn('[xp] daily_checkin failed:', err);
  });
}
