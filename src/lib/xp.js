import { supabase } from './supabase';

// Fire-and-forget XP calls. Never throw — a failure here must never block
// or affect the underlying feature (exam, summary, upload, etc).
export function awardXp(actionType) {
  supabase.rpc('award_xp', { p_action_type: actionType }).then(({ error }) => {
    if (error) console.warn('[xp] award_xp failed:', actionType, error);
  }).catch((err) => {
    console.warn('[xp] award_xp failed:', actionType, err);
  });
}

export function dailyCheckin() {
  supabase.rpc('daily_checkin').then(({ error }) => {
    if (error) console.warn('[xp] daily_checkin failed:', error);
  }).catch((err) => {
    console.warn('[xp] daily_checkin failed:', err);
  });
}
