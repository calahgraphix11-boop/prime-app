import { useState, useEffect, useCallback } from 'react';
import { Trophy, Flame, Users, Globe, Zap, Star } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';
import { calculateLevelProgress, getRank, getCharacter } from '../lib/gamification';
import CharacterPortrait from '../components/CharacterPortrait';

const getWeekStart = () => {
  const now = new Date();
  const day = now.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  const monday = new Date(now);
  monday.setDate(now.getDate() + diff);
  return monday.toISOString().split('T')[0];
};

const fmtTime = (minutes) => {
  if (!minutes) return '0m';
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m}m`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
};

// activity_score stored in DB accumulates: minutes×1 + sessions×10 + AI features + friends×5
// streak×20 is added dynamically since streak updates live
const calcScore = (entry) => (entry.activity_score || 0) + (entry.streak || 0) * 20;

const fmtScore = (n) => n.toLocaleString();

const RANK_META = {
  1: { border: '#F5A800', bg: 'rgba(245,168,0,0.09)', badgeBg: '#F5A800', badgeText: '#1a0c00' },
  2: { border: '#94a3b8', bg: 'rgba(148,163,184,0.06)', badgeBg: '#94a3b8', badgeText: '#0f172a' },
  3: { border: '#cd7f32', bg: 'rgba(205,127,50,0.07)', badgeBg: '#cd7f32', badgeText: '#1a0c00' },
};

function Avatar({ profile, size }) {
  const initials = (profile?.full_name || profile?.username || '?').charAt(0).toUpperCase();
  return (
    <div className="relative flex-shrink-0">
      <div
        className="rounded-full overflow-hidden flex items-center justify-center font-bold text-gray-900 select-none"
        style={{
          width: size,
          height: size,
          fontSize: size * 0.38,
          background: profile?.avatar_url ? 'transparent' : '#F5A800',
        }}
      >
        {profile?.avatar_url ? (
          <img src={profile.avatar_url} alt="" className="w-full h-full object-cover" />
        ) : initials}
      </div>
      {profile?.active_status_visible && profile?.is_active && (
        <span
          className="absolute bottom-0 right-0 rounded-full border-2"
          style={{ width: 10, height: 10, background: '#22c55e', borderColor: 'rgba(0,22,12,0.98)' }}
        />
      )}
    </div>
  );
}

function TopCard({ entry, rank, isMe }) {
  const meta = RANK_META[rank];
  return (
    <div
      className="rounded-2xl p-4 flex items-center gap-3"
      style={{
        background: isMe ? 'rgba(245,168,0,0.13)' : meta.bg,
        border: `1px solid ${isMe ? 'rgba(245,168,0,0.35)' : 'rgba(255,255,255,0.07)'}`,
        borderLeft: `3px solid ${meta.border}`,
      }}
    >
      <div
        className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0"
        style={{ background: meta.badgeBg, color: meta.badgeText }}
      >
        {rank}
      </div>

      <Avatar profile={entry} size={40} />

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 flex-wrap">
          <p className="text-sm font-semibold text-white truncate">
            {entry.username || entry.full_name || 'Unknown'}
          </p>
          {isMe && (
            <span
              className="text-xs px-1.5 py-0.5 rounded-full font-medium flex-shrink-0"
              style={{ background: 'rgba(245,168,0,0.2)', color: '#F5A800' }}
            >
              You
            </span>
          )}
        </div>
        {entry.username && entry.full_name && (
          <p className="text-xs text-white/35 truncate">{entry.full_name}</p>
        )}
      </div>

      <div className="text-right flex-shrink-0">
        <div className="flex items-center gap-1 justify-end">
          <Zap size={12} style={{ color: meta.border }} />
          <p className="text-sm font-bold" style={{ color: meta.border }}>{fmtScore(calcScore(entry))}</p>
        </div>
        <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.28)' }}>Activity Score</p>
        <div className="flex items-center gap-1.5 justify-end mt-1">
          <span className="text-xs text-white/35">{fmtTime(entry.study_minutes)}</span>
          <span className="text-xs text-white/20">·</span>
          <span className="text-xs text-white/35">{entry.sessions_completed || 0} sessions</span>
          <Flame size={11} style={{ color: '#fb923c' }} />
          <span className="text-xs text-white/40">{entry.streak || 0}</span>
        </div>
      </div>
    </div>
  );
}

function LeaderboardRow({ entry, rank, isMe }) {
  return (
    <div
      className="flex items-center gap-3 px-4 py-3 rounded-xl"
      style={{
        background: isMe ? 'rgba(245,168,0,0.08)' : 'rgba(255,255,255,0.03)',
        border: `1px solid ${isMe ? 'rgba(245,168,0,0.22)' : 'rgba(255,255,255,0.05)'}`,
      }}
    >
      <span
        className="w-6 text-center text-sm font-medium flex-shrink-0"
        style={{ color: 'rgba(255,255,255,0.35)' }}
      >
        {rank}
      </span>

      <Avatar profile={entry} size={32} />

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 flex-wrap">
          <p className="text-sm font-medium text-white truncate">
            {entry.username || entry.full_name || 'Unknown'}
          </p>
          {isMe && (
            <span
              className="text-xs px-1.5 py-0.5 rounded-full font-medium flex-shrink-0"
              style={{ background: 'rgba(245,168,0,0.2)', color: '#F5A800' }}
            >
              You
            </span>
          )}
        </div>
        {entry.username && entry.full_name && (
          <p className="text-xs truncate" style={{ color: 'rgba(255,255,255,0.28)' }}>{entry.full_name}</p>
        )}
      </div>

      <div className="text-right flex-shrink-0">
        <div className="flex items-center gap-1 justify-end">
          <Zap size={11} style={{ color: '#F5A800' }} />
          <p className="text-xs font-semibold text-white/85">{fmtScore(calcScore(entry))}</p>
        </div>
        <div className="flex items-center gap-1 justify-end mt-0.5">
          <span className="text-xs text-white/30">{fmtTime(entry.study_minutes)}</span>
          <span className="text-xs text-white/20">·</span>
          <span className="text-xs text-white/30">{entry.sessions_completed || 0}s</span>
          <Flame size={10} style={{ color: '#fb923c' }} />
          <span className="text-xs" style={{ color: 'rgba(255,255,255,0.30)' }}>{entry.streak || 0}</span>
        </div>
      </div>
    </div>
  );
}

const PODIUM_META = {
  1: { label: '1st', height: 152, badgeBg: '#F5A800', badgeText: '#1a0c00', ring: 'rgba(245,168,0,0.4)', crest: 64 },
  2: { label: '2nd', height: 122, badgeBg: '#94a3b8', badgeText: '#0f172a', ring: 'rgba(148,163,184,0.35)', crest: 52 },
  3: { label: '3rd', height: 106, badgeBg: '#cd7f32', badgeText: '#1a0c00', ring: 'rgba(205,127,50,0.35)', crest: 52 },
};

function XpPodiumCard({ entry, rank, isMe, delayMs }) {
  const meta = PODIUM_META[rank];
  const { level } = calculateLevelProgress(entry.total_xp, entry.current_level);
  const rankInfo = getRank(level);
  const order = rank === 1 ? 2 : rank === 2 ? 1 : 3;

  return (
    <div
      className="lb-podium-item flex flex-col items-center"
      style={{ order, animationDelay: `${delayMs}ms` }}
    >
      <div className="relative flex-shrink-0 mb-2" style={{ width: meta.crest + 10, height: meta.crest + 10 }}>
        <div
          className="rounded-full overflow-hidden w-full h-full flex items-center justify-center"
          style={{ border: `2px solid ${meta.ring}`, background: 'rgba(255,255,255,0.04)' }}
        >
          {entry.character_avatar ? (
            <img
              src={getCharacter(entry.character_avatar)?.icon}
              alt=""
              className="w-full h-full object-cover"
            />
          ) : (
            <img
              src={rankInfo.icon}
              alt={rankInfo.name}
              style={{ width: meta.crest, height: meta.crest, objectFit: 'contain' }}
            />
          )}
        </div>
        {entry.character_avatar && (
          <img
            src={rankInfo.icon}
            alt={rankInfo.name}
            className="absolute rounded-full"
            style={{
              width: Math.round((meta.crest + 10) * 0.42),
              height: Math.round((meta.crest + 10) * 0.42),
              bottom: -2,
              right: -2,
              objectFit: 'contain',
              background: '#0a1a10',
              border: '2px solid rgba(0,26,16,0.95)',
            }}
          />
        )}
      </div>
      <p className="text-sm font-semibold text-white truncate max-w-[100px] text-center">
        {entry.username || entry.full_name || 'Unknown'}
      </p>
      <div className="flex items-center gap-1 mt-0.5">
        <Zap size={11} style={{ color: meta.badgeBg }} />
        <span className="text-xs font-bold" style={{ color: meta.badgeBg }}>{fmtScore(entry.total_xp || 0)}</span>
      </div>
      <div
        className="w-full rounded-t-xl mt-3 flex items-start justify-center pt-2"
        style={{
          height: meta.height,
          background: isMe ? 'rgba(52,211,153,0.14)' : 'rgba(255,255,255,0.05)',
          border: `1px solid ${isMe ? 'rgba(52,211,153,0.4)' : 'rgba(255,255,255,0.08)'}`,
          borderBottom: 'none',
        }}
      >
        <span
          className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold"
          style={{ background: meta.badgeBg, color: meta.badgeText }}
        >
          {rank}
        </span>
      </div>
    </div>
  );
}

function XpListRow({ entry, rank, isMe, pinned, delayMs }) {
  const { level } = calculateLevelProgress(entry.total_xp, entry.current_level);
  const rankInfo = getRank(level);
  return (
    <div
      className={pinned ? '' : 'lb-row-item'}
      style={{ animationDelay: `${delayMs}ms` }}
    >
      <div
        className="flex items-center gap-3 px-4 py-3 rounded-xl"
        style={{
          background: isMe ? 'rgba(52,211,153,0.1)' : 'rgba(255,255,255,0.03)',
          border: `1px solid ${isMe ? 'rgba(52,211,153,0.3)' : 'rgba(255,255,255,0.05)'}`,
        }}
      >
        <span
          className="w-6 text-center text-sm font-medium flex-shrink-0"
          style={{ color: 'rgba(255,255,255,0.35)' }}
        >
          {rank}
        </span>

        <CharacterPortrait characterKey={entry.character_avatar} rank={rankInfo} size={24} />

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 flex-wrap">
            <p className="text-sm font-medium text-white truncate">
              {entry.username || entry.full_name || 'Unknown'}
            </p>
            {isMe && (
              <span
                className="text-xs px-1.5 py-0.5 rounded-full font-medium flex-shrink-0"
                style={{ background: 'rgba(52,211,153,0.2)', color: '#34d399' }}
              >
                You
              </span>
            )}
          </div>
          <p className="text-xs" style={{ color: 'rgba(255,255,255,0.28)' }}>Lvl {level} · {rankInfo.name}</p>
        </div>

        <div className="flex items-center gap-1 flex-shrink-0">
          <Zap size={11} style={{ color: '#F5A800' }} />
          <p className="text-xs font-semibold text-white/85">{fmtScore(entry.total_xp || 0)}</p>
        </div>
      </div>
    </div>
  );
}

export default function Leaderboard() {
  const { user } = useAuth();
  const { streak } = useApp();
  const [tab, setTab] = useState('global');
  const [mode, setMode] = useState('xp');
  const [entries, setEntries] = useState([]);
  const [friendIds, setFriendIds] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [xpEntries, setXpEntries] = useState([]);
  const [xpLoading, setXpLoading] = useState(true);

  const loadData = useCallback(async () => {
    if (!user) return;
    setLoading(true);

    const weekStart = getWeekStart();

    const [{ data: allProfiles }, { data: scores }, { data: friendships }] = await Promise.all([
      supabase
        .from('profiles')
        .select('id, username, full_name, avatar_url, is_active, active_status_visible'),
      supabase
        .from('leaderboard_scores')
        .select('user_id, study_minutes, sessions_completed, streak, activity_score')
        .eq('week_start', weekStart),
      supabase
        .from('friendships')
        .select('requester_id, receiver_id')
        .or(`requester_id.eq.${user.id},receiver_id.eq.${user.id}`)
        .eq('status', 'accepted'),
    ]);

    const fIds = new Set((friendships || []).map((f) =>
      f.requester_id === user.id ? f.receiver_id : f.requester_id
    ));
    setFriendIds(fIds);

    // Build a Map of scores keyed by user_id for O(1) lookup
    const scoresMap = new Map((scores || []).map((s) => [s.user_id, s]));

    // Every profile gets a row; score defaults to 0 if no entry this week
    const merged = (allProfiles || []).map((p) => {
      const s = scoresMap.get(p.id);
      return {
        ...p,
        study_minutes: s?.study_minutes || 0,
        sessions_completed: s?.sessions_completed || 0,
        activity_score: s?.activity_score || 0,
        streak: p.id === user.id ? streak : (s?.streak || 0),
      };
    });

    merged.sort((a, b) => calcScore(b) - calcScore(a));
    setEntries(merged);
    setLoading(false);
  }, [user?.id, streak]);

  useEffect(() => { loadData(); }, [loadData]);

  const loadXpData = useCallback(async () => {
    if (!user) return;
    setXpLoading(true);

    const [{ data: xpRows }, { data: allProfiles }] = await Promise.all([
      supabase
        .from('user_xp')
        .select('user_id, total_xp, current_level')
        .order('total_xp', { ascending: false }),
      supabase
        .from('profiles')
        .select('id, username, full_name, avatar_url, character_avatar'),
    ]);

    const profileMap = new Map((allProfiles || []).map((p) => [p.id, p]));
    const merged = (xpRows || []).map((row) => ({
      ...profileMap.get(row.user_id),
      id: row.user_id,
      total_xp: row.total_xp,
      current_level: row.current_level,
    }));

    setXpEntries(merged);
    setXpLoading(false);
  }, [user?.id]);

  useEffect(() => { loadXpData(); }, [loadXpData]);

  const displayEntries = tab === 'friends'
    ? entries.filter((e) => e.id === user?.id || friendIds.has(e.id))
    : entries;

  const top3 = displayEntries.slice(0, 3);
  const rest = displayEntries.slice(3);

  const XP_TOP_N = 20;
  const xpTopN = xpEntries.slice(0, XP_TOP_N);
  const xpPodium = xpTopN.slice(0, 3);
  const xpRest = xpTopN.slice(3, XP_TOP_N);
  const myXpIndex = xpEntries.findIndex((e) => e.id === user?.id);
  const myXpRank = myXpIndex >= 0 ? myXpIndex + 1 : null;
  const myXpInTopN = myXpIndex >= 0 && myXpIndex < XP_TOP_N;
  const myXpEntry = myXpIndex >= 0 ? xpEntries[myXpIndex] : null;

  return (
    <div className="space-y-5 pt-2">
      <style>{`
        @keyframes lbFadeScale { from { opacity: 0; transform: translateY(12px) scale(0.94); } to { opacity: 1; transform: translateY(0) scale(1); } }
        @keyframes lbFadeIn { from { opacity: 0; } to { opacity: 1; } }
        .lb-podium-item { opacity: 0; animation: lbFadeScale 380ms cubic-bezier(0.23, 1, 0.32, 1) forwards; }
        .lb-row-item { opacity: 0; animation: lbFadeIn 260ms ease-out forwards; }
        @media (prefers-reduced-motion: reduce) {
          .lb-podium-item, .lb-row-item { animation: none !important; opacity: 1 !important; transform: none !important; }
        }
      `}</style>

      <div>
        <h1 className="text-2xl font-bold text-white">The Grind Board</h1>
        <p className="text-sm text-white/50 mt-0.5">
          {mode === 'weekly'
            ? 'Ranked by activity score — study, AI features, sessions & streak'
            : 'Ranked by total XP earned — all time'}
        </p>
      </div>

      {/* Mode toggle */}
      <div
        className="flex rounded-xl overflow-hidden"
        style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}
      >
        {[
          { key: 'xp', icon: Star, label: 'XP Ranking' },
          { key: 'weekly', icon: Flame, label: 'Weekly Activity' },
        ].map(({ key, icon: Icon, label }) => (
          <button
            key={key}
            onClick={() => setMode(key)}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-bold transition-all"
            style={
              mode === key
                ? { background: '#F5A800', color: '#1a0c00' }
                : { color: 'rgba(255,255,255,0.45)', fontWeight: 500 }
            }
          >
            <Icon size={15} />
            {label}
          </button>
        ))}
      </div>

      {mode === 'weekly' ? (
        <>
          {/* Tab toggle */}
          <div
            className="flex rounded-xl overflow-hidden"
            style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}
          >
            {[
              { key: 'global', icon: Globe, label: 'Global' },
              { key: 'friends', icon: Users, label: 'Friends' },
            ].map(({ key, icon: Icon, label }) => (
              <button
                key={key}
                onClick={() => setTab(key)}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-medium transition-all"
                style={
                  tab === key
                    ? { background: '#F5A800', color: '#1a0c00' }
                    : { color: 'rgba(255,255,255,0.45)' }
                }
              >
                <Icon size={15} />
                {label}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="flex justify-center py-16">
              <div
                className="w-8 h-8 rounded-full border-2 animate-spin"
                style={{ borderColor: 'rgba(255,255,255,0.1)', borderTopColor: '#F5A800' }}
              />
            </div>
          ) : displayEntries.length === 0 ? (
            <div className="text-center py-16">
              <Trophy size={32} className="mx-auto mb-3" style={{ color: 'rgba(255,255,255,0.12)' }} />
              <p className="text-sm" style={{ color: 'rgba(255,255,255,0.3)' }}>
                {tab === 'friends'
                  ? "None of your friends have studied this week yet"
                  : "No study sessions logged this week yet"}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {/* Top 3 podium */}
              {top3.length > 0 && (
                <div className="space-y-2">
                  {top3.map((entry, i) => (
                    <TopCard
                      key={entry.id}
                      entry={entry}
                      rank={i + 1}
                      isMe={entry.id === user?.id}
                    />
                  ))}
                </div>
              )}

              {/* Rank 4+ */}
              {rest.length > 0 && (
                <div
                  className="rounded-2xl overflow-hidden"
                  style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}
                >
                  <div className="p-3 space-y-1.5">
                    {rest.map((entry, i) => (
                      <LeaderboardRow
                        key={entry.id}
                        entry={entry}
                        rank={i + 4}
                        isMe={entry.id === user?.id}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </>
      ) : xpLoading ? (
        <div className="flex justify-center py-16">
          <div
            className="w-8 h-8 rounded-full border-2 animate-spin"
            style={{ borderColor: 'rgba(255,255,255,0.1)', borderTopColor: '#F5A800' }}
          />
        </div>
      ) : xpEntries.length === 0 ? (
        <div className="text-center py-16">
          <Star size={32} className="mx-auto mb-3" style={{ color: 'rgba(255,255,255,0.12)' }} />
          <p className="text-sm" style={{ color: 'rgba(255,255,255,0.3)' }}>No XP earned yet</p>
        </div>
      ) : (
        <div className="space-y-3">
          {/* Podium: 1st center/elevated, 2nd left, 3rd right */}
          {xpPodium.length > 0 && (
            <div className="glass rounded-2xl px-4 pt-6 pb-0 flex items-end justify-center gap-3">
              {xpPodium.map((entry, i) => (
                <XpPodiumCard
                  key={entry.id}
                  entry={entry}
                  rank={i + 1}
                  isMe={entry.id === user?.id}
                  delayMs={i * 80}
                />
              ))}
            </div>
          )}

          {/* Rank 4-20 */}
          {xpRest.length > 0 && (
            <div
              className="rounded-2xl overflow-hidden"
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}
            >
              <div className="p-3 space-y-1.5">
                {xpRest.map((entry, i) => (
                  <XpListRow
                    key={entry.id}
                    entry={entry}
                    rank={i + 4}
                    isMe={entry.id === user?.id}
                    delayMs={240 + i * 40}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Pinned own rank if outside top 20 */}
          {myXpEntry && !myXpInTopN && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.1)' }} />
                <span className="text-xs font-medium" style={{ color: 'rgba(255,255,255,0.3)' }}>Your Rank</span>
                <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.1)' }} />
              </div>
              <XpListRow entry={myXpEntry} rank={myXpRank} isMe pinned />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
