import { supabase } from './supabase';
import { emitXpAward, emitLevelUp, emitQuestComplete } from './xpEvents';
import { getRank } from './gamification';

// Fetches active quest definitions joined with the user's live progress for the
// current day/week window. Returns null on any failure so callers can simply
// not render — a quest outage must never break the Dashboard.
export async function fetchQuestProgress() {
  try {
    const { data, error } = await supabase.rpc('get_quest_progress');
    if (error) {
      console.warn('[quests] get_quest_progress failed:', error);
      return null;
    }
    return Array.isArray(data) ? data : [];
  } catch (err) {
    console.warn('[quests] get_quest_progress failed:', err);
    return null;
  }
}

// Fire-and-forget: an action that just earned XP may have completed a quest.
// Mirrors checkAndAwardBadges in xp.js — never throws, never blocks the
// underlying feature.
export function checkAndAwardQuests() {
  supabase.rpc('check_and_award_quests').then(({ data, error }) => {
    if (error) { console.warn('[quests] check_and_award_quests failed:', error); return; }

    const completed = data?.completed || [];

    // Like dailyCheckin: one bubble per reward, but collapse multiple quest
    // level-ups into a single modal spanning first old_level → highest new_level.
    let oldLevel = null;
    let newLevel = null;

    for (const quest of completed) {
      if (!quest || !(quest.xp_awarded > 0)) continue;
      emitXpAward({ xp: quest.xp_awarded, leveledUp: !!quest.leveled_up });
      emitQuestComplete({ title: quest.title, xp: quest.xp_awarded });
      if (quest.leveled_up) {
        if (oldLevel === null) oldLevel = quest.old_level;
        newLevel = newLevel === null ? quest.new_level : Math.max(newLevel, quest.new_level);
      }
    }

    if (newLevel !== null) {
      const rank = getRank(newLevel);
      const prevRank = getRank(oldLevel);
      emitLevelUp({ level: newLevel, rank, rankChanged: rank.name !== prevRank.name });
    }
  }).catch((err) => {
    console.warn('[quests] check_and_award_quests failed:', err);
  });
}
