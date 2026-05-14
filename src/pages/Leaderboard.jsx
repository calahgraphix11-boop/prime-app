import { useState, useEffect, useCallback } from 'react';
import { Trophy, Flame, Users, Globe } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';

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
        <p className="text-sm font-bold" style={{ color: meta.border }}>{fmtTime(entry.study_minutes)}</p>
        <div className="flex items-center gap-1 justify-end mt-0.5">
          <Flame size={11} style={{ color: '#fb923c' }} />
          <span className="text-xs text-white/45">{entry.streak || 0}</span>
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
        <p className="text-xs font-semibold text-white/80">{fmtTime(entry.study_minutes)}</p>
        <div className="flex items-center gap-1 justify-end mt-0.5">
          <Flame size={10} style={{ color: '#fb923c' }} />
          <span className="text-xs" style={{ color: 'rgba(255,255,255,0.32)' }}>{entry.streak || 0}</span>
        </div>
      </div>
    </div>
  );
}

export default function Leaderboard() {
  const { user } = useAuth();
  const { streak } = useApp();
  const [tab, setTab] = useState('global');
  const [entries, setEntries] = useState([]);
  const [friendIds, setFriendIds] = useState(new Set());
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    if (!user) return;
    setLoading(true);

    const weekStart = getWeekStart();

    const [{ data: scores }, { data: friendships }] = await Promise.all([
      supabase
        .from('leaderboard_scores')
        .select('user_id, study_minutes, sessions_completed, streak')
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

    // Build entries from scores (all users who studied this week)
    const allUserIds = new Set((scores || []).map((s) => s.user_id));
    allUserIds.add(user.id); // always include current user even with 0 minutes

    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, username, full_name, avatar_url, is_active, active_status_visible')
      .in('id', [...allUserIds]);

    const profileMap = {};
    for (const p of (profiles || [])) profileMap[p.id] = p;

    // Use scores as the base so every user with a score appears regardless of profile RLS
    const scoreEntries = (scores || []).map((s) => ({
      id: s.user_id,
      study_minutes: s.study_minutes,
      sessions_completed: s.sessions_completed,
      streak: s.user_id === user.id ? streak : (s.streak || 0),
      ...(profileMap[s.user_id] || {}),
    }));

    // Ensure current user appears even if they have no score this week
    if (!scoreEntries.find((e) => e.id === user.id)) {
      scoreEntries.push({
        id: user.id,
        study_minutes: 0,
        sessions_completed: 0,
        streak,
        ...(profileMap[user.id] || {}),
      });
    }

    const merged = scoreEntries;

    merged.sort((a, b) => b.study_minutes - a.study_minutes);
    setEntries(merged);
    setLoading(false);
  }, [user?.id, streak]);

  useEffect(() => { loadData(); }, [loadData]);

  const displayEntries = tab === 'friends'
    ? entries.filter((e) => e.id === user?.id || friendIds.has(e.id))
    : entries;

  const top3 = displayEntries.slice(0, 3);
  const rest = displayEntries.slice(3);

  return (
    <div className="space-y-5 pt-2">
      <div>
        <h1 className="text-2xl font-bold text-white">The Grind Board</h1>
        <p className="text-sm text-white/50 mt-0.5">Who's putting in the most hours this week?</p>
      </div>

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
    </div>
  );
}
