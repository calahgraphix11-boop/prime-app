import { supabase } from './supabase';
import { emitXpAward } from './xpEvents';

// RPCs may return a single row as an object, or as a one-row array
// depending on the Postgres function's return type — normalize both.
function firstRow(data) {
  return Array.isArray(data) ? data[0] : data;
}

function notifyIfAwarded(result) {
  if (result && result.xp_awarded > 0) {
    emitXpAward({ xp: result.xp_awarded, leveledUp: !!result.leveled_up });
  }
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
