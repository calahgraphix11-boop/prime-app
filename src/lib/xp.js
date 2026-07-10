import { supabase } from './supabase';
import { emitXpAward, emitLevelUp } from './xpEvents';
import { calculateLevelProgress, getRank } from './gamification';

// RPCs may return a single row as an object, or as a one-row array
// depending on the Postgres function's return type — normalize both.
function firstRow(data) {
  return Array.isArray(data) ? data[0] : data;
}

function notifyIfAwarded(result) {
  if (result && result.xp_awarded > 0) {
    emitXpAward({ xp: result.xp_awarded, leveledUp: !!result.leveled_up });
    if (result.leveled_up) {
      notifyLevelUp(result.xp_awarded);
    }
  }
}

// The RPC only reports a leveled_up boolean, not the resulting level/rank —
// resolve those by reading the user's current total_xp back. Deriving the
// pre-award total from total_xp - xp_awarded lets us detect a rank change
// without needing the RPC to report the previous level.
function notifyLevelUp(xpAwarded) {
  supabase.auth.getUser().then(({ data }) => {
    const user = data?.user;
    if (!user) return;
    return supabase
      .from('user_xp')
      .select('total_xp, current_level')
      .eq('user_id', user.id)
      .maybeSingle()
      .then(({ data: xpRow, error }) => {
        if (error || !xpRow) return;
        const { level } = calculateLevelProgress(xpRow.total_xp, xpRow.current_level);
        const prevLevel = calculateLevelProgress(Math.max(0, xpRow.total_xp - xpAwarded), 1).level;
        const rank = getRank(level);
        const prevRank = getRank(prevLevel);
        emitLevelUp({ level, rank, rankChanged: rank.name !== prevRank.name });
      });
  }).catch((err) => {
    console.warn('[xp] failed to resolve level-up details:', err);
  });
}

// Fire-and-forget XP calls. Never throw — a failure here must never block
// or affect the underlying feature (exam, summary, upload, etc).
export function awardXp(actionType) {
  supabase.rpc('award_xp', { p_action_type: actionType }).then(({ data, error }) => {
    if (error) { console.warn('[xp] award_xp failed:', actionType, error); return; }
    notifyIfAwarded(firstRow(data));
  }).catch((err) => {
    console.warn('[xp] award_xp failed:', actionType, err);
  });
}

export function dailyCheckin() {
  supabase.rpc('daily_checkin').then(({ data, error }) => {
    if (error) { console.warn('[xp] daily_checkin failed:', error); return; }
    notifyIfAwarded(firstRow(data));
  }).catch((err) => {
    console.warn('[xp] daily_checkin failed:', err);
  });
}
