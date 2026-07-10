import { supabase } from './supabase';
import { emitXpAward, emitLevelUp, emitBadgeEarned } from './xpEvents';
import { getRank } from './gamification';

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
export function awardXp(actionType) {
  supabase.rpc('award_xp', { p_action_type: actionType }).then(({ data, error }) => {
    if (error) { console.warn('[xp] award_xp failed:', actionType, error); return; }
    notifyIfAwarded(toRows(data)[0]);
    checkAndAwardBadges();
  }).catch((err) => {
    console.warn('[xp] award_xp failed:', actionType, err);
  });
}

export function dailyCheckin() {
  supabase.rpc('daily_checkin').then(({ data, error }) => {
    if (error) { console.warn('[xp] daily_checkin failed:', error); return; }

    // daily_checkin can internally trigger two award_xp calls (base checkin +
    // streak milestone bonus), returned as two rows. Fire a bubble per award,
    // but collapse any level-ups into a single modal event spanning from the
    // first row's old_level to the highest new_level reached, so the modal
    // never fires twice for one checkin.
    let oldLevel = null;
    let newLevel = null;

    for (const row of toRows(data)) {
      if (!row || !(row.xp_awarded > 0)) continue;
      emitXpAward({ xp: row.xp_awarded, leveledUp: !!row.leveled_up });
      if (row.leveled_up) {
        if (oldLevel === null) oldLevel = row.old_level;
        newLevel = newLevel === null ? row.new_level : Math.max(newLevel, row.new_level);
      }
    }

    if (newLevel !== null) {
      notifyLevelUp(oldLevel, newLevel);
    }
  }).catch((err) => {
    console.warn('[xp] daily_checkin failed:', err);
  });
}
