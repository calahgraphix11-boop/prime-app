import { BADGES } from './gamification';

// Client-side mirror of the thresholds inside the check_and_award_badges RPC
// (which is not modified). Each goal derives progress from the same xp_events
// counts the RPC checks, so the nudge always agrees with what the server will
// actually award.
//
// counts: { exam, note, file, perfect } from the user's xp_events
// streak: user_xp.current_streak
const BADGE_GOALS = {
  'first-step': {
    progress: (c) => ({ current: c.exam + c.note, target: 1 }),
    remainingText: () => 'Complete an Exam Coach session or summarize a note',
  },
  'streak-starter': {
    progress: (c, streak) => ({ current: streak, target: 3 }),
    remainingText: (left) => `${left} more day${left === 1 ? '' : 's'} of studying`,
  },
  'on-fire': {
    progress: (c, streak) => ({ current: streak, target: 7 }),
    remainingText: (left) => `${left} more day${left === 1 ? '' : 's'} of studying`,
  },
  'note-taker': {
    progress: (c) => ({ current: c.note, target: 1 }),
    remainingText: () => 'Summarize your first note',
  },
  'exam-ready': {
    progress: (c) => ({ current: c.exam, target: 1 }),
    remainingText: (left) => `${left} more Exam Coach session${left === 1 ? '' : 's'}`,
  },
  'perfect-score': {
    progress: (c) => ({ current: c.perfect, target: 1 }),
    remainingText: () => 'Score 100% on an Exam Coach session',
  },
  'bookworm': {
    progress: (c) => ({ current: c.file, target: 1 }),
    remainingText: () => 'Upload your first file',
  },
  'century-club': {
    progress: (c) => ({ current: c.exam + c.note + c.file, target: 100 }),
    remainingText: (left) => `${left} more study action${left === 1 ? '' : 's'}`,
  },
};

// Picks the unearned badge the user is closest to (highest completion
// fraction; ties broken by fewest actions left). Returns null when every
// badge is earned or inputs are unusable.
export function computeNextBadge(earnedKeys, counts, streak) {
  let best = null;

  for (const badge of BADGES) {
    if (earnedKeys.has(badge.key)) continue;
    const goal = BADGE_GOALS[badge.key];
    if (!goal) continue;

    const { current, target } = goal.progress(counts, streak);
    const clamped = Math.min(current, target);
    const fraction = clamped / target;
    const left = target - clamped;

    const candidate = {
      badge,
      current: clamped,
      target,
      fraction,
      message: `${goal.remainingText(left)} until ${badge.name}`,
    };

    if (
      !best ||
      candidate.fraction > best.fraction ||
      (candidate.fraction === best.fraction && left < best.target - best.current)
    ) {
      best = candidate;
    }
  }

  return best;
}

// Reduces raw xp_events action_type rows into the counts the goals above need.
export function tallyActionCounts(rows) {
  const counts = { exam: 0, note: 0, file: 0, perfect: 0 };
  for (const row of rows || []) {
    if (row.action_type === 'exam_coach_session') counts.exam++;
    else if (row.action_type === 'note_summarized') counts.note++;
    else if (row.action_type === 'file_uploaded') counts.file++;
    else if (row.action_type === 'exam_coach_perfect') counts.perfect++;
  }
  return counts;
}
