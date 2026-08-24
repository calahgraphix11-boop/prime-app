import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Users, Clock } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';

function UserRow({ profile, action, t }) {
  const navigate = useNavigate();
  const initials = (profile?.full_name || profile?.username || '?').charAt(0).toUpperCase();
  return (
    <div
      className="flex items-center gap-3 px-4 py-3 rounded-xl"
      style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}
    >
      <button
        onClick={() => navigate(`/profile/${profile?.id}`)}
        className="flex items-center gap-3 flex-1 min-w-0 text-left hover:opacity-80 transition-opacity"
      >
        <div className="relative flex-shrink-0">
          <div
            className="w-9 h-9 rounded-full overflow-hidden flex items-center justify-center text-sm font-bold text-gray-900 select-none"
            style={{ background: profile?.avatar_url ? 'transparent' : '#F5A800' }}
          >
            {profile?.avatar_url ? (
              <img src={profile.avatar_url} alt="" className="w-full h-full object-cover" />
            ) : initials}
          </div>
          {profile?.active_status_visible && profile?.is_active && (
            <span
              className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2"
              style={{ background: '#22c55e', borderColor: 'rgba(0,22,12,0.98)' }}
            />
          )}
        </div>
        <div className="min-w-0">
          <p className="text-sm font-medium text-white truncate">
            {profile?.username || profile?.full_name || t.unknownUser}
          </p>
          {profile?.username && profile?.full_name && (
            <p className="text-xs text-white/35 truncate">{profile.full_name}</p>
          )}
        </div>
      </button>
      {action}
    </div>
  );
}

export default function Friends() {
  const { user, profile: currentProfile } = useAuth();
  const { t, addLeaderboardPoints } = useApp();

  const [tab, setTab] = useState('friends');
  const [query, setQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [friends, setFriends] = useState([]);
  const [requests, setRequests] = useState([]);
  const [sentIds, setSentIds] = useState(new Set());
  const [loading, setLoading] = useState(true);

  const loadFriendships = useCallback(async () => {
    if (!user) return;
    setLoading(true);

    // Step 1: flat fetch of all friendship rows touching this user
    const { data: rows, error: rowsError } = await supabase
      .from('friendships')
      .select('id, status, requester_id, receiver_id')
      .or(`requester_id.eq.${user.id},receiver_id.eq.${user.id}`);

    console.log('[Friends] friendship rows:', rows, '| error:', rowsError);

    if (!rows || rows.length === 0) { setLoading(false); return; }

    // Step 2: collect all profile IDs we need, then fetch profiles in one query
    const profileIds = new Set();
    for (const row of rows) {
      if (row.requester_id !== user.id) profileIds.add(row.requester_id);
      if (row.receiver_id !== user.id) profileIds.add(row.receiver_id);
    }

    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id, username, full_name, avatar_url, active_status_visible, is_active')
      .in('id', [...profileIds]);

    console.log('[Friends] profiles:', profiles, '| error:', profilesError);

    const profileMap = {};
    for (const p of (profiles || [])) profileMap[p.id] = p;

    // Step 3: classify rows
    const accepted = [];
    const incoming = [];
    const sent = new Set();

    for (const row of rows) {
      const iAmRequester = row.requester_id === user.id;
      const otherId = iAmRequester ? row.receiver_id : row.requester_id;
      const otherProfile = profileMap[otherId];

      if (row.status === 'accepted') {
        accepted.push({ rowId: row.id, profile: otherProfile });
      } else if (row.status === 'pending') {
        if (iAmRequester) {
          sent.add(row.receiver_id);
        } else {
          incoming.push({ rowId: row.id, profile: otherProfile });
        }
      }
    }

    setFriends(accepted);
    setRequests(incoming);
    setSentIds(sent);
    setLoading(false);
  }, [user?.id]);

  useEffect(() => { loadFriendships(); }, [loadFriendships]);

  const searchUsers = useCallback(async (q) => {
    if (!q.trim() || !user) { setSearchResults([]); return; }
    setSearching(true);
    const { data } = await supabase
      .from('profiles')
      .select('id, username, full_name, avatar_url, active_status_visible, is_active')
      .ilike('username', `%${q}%`)
      .neq('id', user.id)
      .limit(10);
    setSearchResults(data || []);
    setSearching(false);
  }, [user?.id]);

  useEffect(() => {
    const timer = setTimeout(() => searchUsers(query), 300);
    return () => clearTimeout(timer);
  }, [query, searchUsers]);

  const sendRequest = async (addresseeId) => {
    const { error } = await supabase
      .from('friendships')
      .insert({ requester_id: user.id, receiver_id: addresseeId, status: 'pending' });
    if (!error) setSentIds((prev) => new Set([...prev, addresseeId]));
  };

  const accept = async (rowId, requesterProfile) => {
    const { error } = await supabase
      .from('friendships')
      .update({ status: 'accepted' })
      .eq('id', rowId);
    if (!error) {
      setRequests((prev) => prev.filter((r) => r.rowId !== rowId));
      setFriends((prev) => [...prev, { rowId, profile: requesterProfile }]);
      addLeaderboardPoints(5);
      const accepterName = currentProfile?.username || currentProfile?.full_name || t.someoneLabel;
      await supabase.from('notifications').insert({
        user_id: requesterProfile.id,
        message: `${accepterName} ${t.acceptedYourFriendRequestSuffix}`,
      });
    }
  };

  const decline = async (rowId) => {
    const { error } = await supabase.from('friendships').delete().eq('id', rowId);
    if (!error) setRequests((prev) => prev.filter((r) => r.rowId !== rowId));
  };

  const isAlreadyFriend = (id) => friends.some((f) => f.profile?.id === id);

  return (
    <div className="space-y-5 pt-2">
      <div>
        <h1 className="text-2xl font-bold text-white">{t.friends}</h1>
        <p className="text-sm text-white/50 mt-0.5">{t.connectWithStudents}</p>
      </div>

      {/* Search */}
      <div className="glass rounded-2xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ background: 'rgba(245,168,0,0.2)' }}
          >
            <Search size={16} style={{ color: '#F5A800' }} />
          </div>
          <h2 className="text-base font-semibold text-white">{t.findStudents}</h2>
        </div>
        <div className="relative">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30 pointer-events-none" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t.searchByUsername}
            className="w-full pl-9 pr-3 py-2.5 rounded-xl glass-input text-sm"
          />
        </div>

        {query.trim() && (
          <div className="mt-3 space-y-2">
            {searching && (
              <p className="text-xs text-white/30 text-center py-3">{t.searchingEllipsis}</p>
            )}
            {!searching && searchResults.length === 0 && (
              <p className="text-xs text-white/30 text-center py-3">{t.noUsersFound}</p>
            )}
            {searchResults.map((p) => (
              <UserRow
                key={p.id}
                profile={p}
                t={t}
                action={
                  isAlreadyFriend(p.id) ? (
                    <span
                      className="text-xs text-white/30 font-medium px-3 py-1.5 rounded-lg flex-shrink-0"
                      style={{ background: 'rgba(255,255,255,0.05)' }}
                    >
                      {t.friends}
                    </span>
                  ) : sentIds.has(p.id) ? (
                    <span
                      className="text-xs text-white/40 font-medium px-3 py-1.5 rounded-lg flex items-center gap-1.5 flex-shrink-0"
                      style={{ background: 'rgba(255,255,255,0.05)' }}
                    >
                      <Clock size={11} /> {t.pendingLabel}
                    </span>
                  ) : (
                    <button
                      onClick={() => sendRequest(p.id)}
                      className="text-xs font-semibold px-3 py-1.5 rounded-lg transition-all hover:opacity-85 flex-shrink-0"
                      style={{ background: '#F5A800', color: '#111' }}
                    >
                      {t.addLabel}
                    </button>
                  )
                }
              />
            ))}
          </div>
        )}
      </div>

      {/* Friends / Requests tabs */}
      <div className="glass rounded-2xl overflow-hidden">
        <div className="flex" style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
          {[
            { key: 'friends', label: friends.length ? `${t.friends} (${friends.length})` : t.friends },
            { key: 'requests', label: requests.length ? `${t.requests} (${requests.length})` : t.requests },
          ].map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className="flex-1 py-3 text-sm font-medium transition-colors"
              style={
                tab === key
                  ? { color: '#F5A800', borderBottom: '2px solid #F5A800' }
                  : { color: 'rgba(255,255,255,0.4)' }
              }
            >
              {label}
            </button>
          ))}
        </div>

        <div className="p-4 space-y-2">
          {loading && (
            <p className="text-xs text-white/30 text-center py-6">{t.loadingText}</p>
          )}

          {/* Friends list */}
          {!loading && tab === 'friends' && friends.length === 0 && (
            <div className="text-center py-8">
              <Users size={28} className="mx-auto mb-2 text-white/15" />
              <p className="text-sm text-white/30">{t.noFriendsYetSearchAbove}</p>
            </div>
          )}
          {tab === 'friends' && friends.map(({ rowId, profile }) => (
            <UserRow key={rowId} profile={profile} t={t} />
          ))}

          {/* Requests list */}
          {!loading && tab === 'requests' && requests.length === 0 && (
            <p className="text-sm text-white/30 text-center py-8">{t.noPendingRequests}</p>
          )}
          {tab === 'requests' && requests.map(({ rowId, profile }) => (
            <UserRow
              key={rowId}
              profile={profile}
              t={t}
              action={
                <div className="flex gap-2 flex-shrink-0">
                  <button
                    onClick={() => accept(rowId, profile)}
                    className="text-xs font-semibold px-3 py-1.5 rounded-full transition-all hover:opacity-85"
                    style={{ background: '#F5A800', color: '#111' }}
                  >
                    {t.acceptLabel}
                  </button>
                  <button
                    onClick={() => decline(rowId)}
                    className="text-xs font-medium px-3 py-1.5 rounded-full transition-colors hover:bg-white/10"
                    style={{ background: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.4)' }}
                  >
                    {t.declineLabel}
                  </button>
                </div>
              }
            />
          ))}
        </div>
      </div>
    </div>
  );
}
