import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Clock, Users, UserPlus, Flame } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';

export default function PublicProfile() {
  const { userId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [profile, setProfile] = useState(null);
  const [totalHours, setTotalHours] = useState(0);
  const [friendsCount, setFriendsCount] = useState(0);
  const [relationship, setRelationship] = useState(null); // null | 'pending_sent' | 'pending_received' | 'accepted'
  const [loading, setLoading] = useState(true);
  const [requesting, setRequesting] = useState(false);

  useEffect(() => {
    if (!userId || !user) return;

    const load = async () => {
      setLoading(true);

      const [{ data: prof }, { data: logs }, { count: fc }, { data: rel }] = await Promise.all([
        supabase
          .from('profiles')
          .select('id, username, full_name, avatar_url, active_status_visible, is_active, streak')
          .eq('id', userId)
          .maybeSingle(),

        supabase
          .from('study_sessions_log')
          .select('duration_minutes')
          .eq('user_id', userId),

        supabase
          .from('friendships')
          .select('id', { count: 'exact', head: true })
          .or(`requester_id.eq.${userId},receiver_id.eq.${userId}`)
          .eq('status', 'accepted'),

        supabase
          .from('friendships')
          .select('id, status, requester_id, receiver_id')
          .or(
            `and(requester_id.eq.${user.id},receiver_id.eq.${userId}),` +
            `and(requester_id.eq.${userId},receiver_id.eq.${user.id})`
          )
          .maybeSingle(),
      ]);

      setProfile(prof);
      setTotalHours(
        Math.round(((logs || []).reduce((s, r) => s + (r.duration_minutes || 0), 0) / 60) * 10) / 10
      );
      setFriendsCount(fc || 0);

      if (rel) {
        if (rel.status === 'accepted') setRelationship('accepted');
        else if (rel.status === 'pending')
          setRelationship(rel.requester_id === user.id ? 'pending_sent' : 'pending_received');
      }

      setLoading(false);
    };

    load();
  }, [userId, user?.id]);

  const sendRequest = async () => {
    setRequesting(true);
    const { error } = await supabase
      .from('friendships')
      .insert({ requester_id: user.id, receiver_id: userId, status: 'pending' });
    if (!error) setRelationship('pending_sent');
    setRequesting(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 rounded-full border-4 border-white/10 border-t-yellow-400 animate-spin" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="pt-2 text-center py-16">
        <p className="text-white/40">User not found.</p>
      </div>
    );
  }

  const initials = (profile.full_name || profile.username || '?').charAt(0).toUpperCase();
  const isActive = profile.active_status_visible && profile.is_active;
  const isSelf = userId === user?.id;

  return (
    <div className="space-y-5 pt-2">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-sm text-white/50 hover:text-white transition-colors"
      >
        <ArrowLeft size={16} /> Back
      </button>

      {/* Avatar + identity */}
      <div className="glass rounded-2xl p-6 flex flex-col items-center gap-4 text-center">
        <div className="relative">
          <div
            className="w-20 h-20 rounded-full overflow-hidden flex items-center justify-center text-3xl font-bold text-gray-900 select-none"
            style={{ background: profile.avatar_url ? 'transparent' : '#F5A800' }}
          >
            {profile.avatar_url ? (
              <img src={profile.avatar_url} alt="" className="w-full h-full object-cover" />
            ) : initials}
          </div>
          {isActive && (
            <span
              className="absolute bottom-1 right-1 w-3.5 h-3.5 rounded-full border-2"
              style={{ background: '#22c55e', borderColor: 'rgba(0,22,12,0.98)' }}
            />
          )}
        </div>

        <div>
          <h1 className="text-xl font-bold text-white">
            {profile.full_name || profile.username || 'Unknown'}
          </h1>
          {profile.username && (
            <p className="text-sm text-white/40 mt-0.5">@{profile.username}</p>
          )}
          {isActive && (
            <span
              className="inline-flex items-center gap-1.5 mt-2.5 px-2.5 py-1 rounded-full text-xs font-medium"
              style={{ background: 'rgba(34,197,94,0.1)', color: '#4ade80', border: '1px solid rgba(34,197,94,0.2)' }}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
              Studying now
            </span>
          )}
        </div>

        {!isSelf && (
          relationship === 'accepted' ? (
            <span
              className="px-5 py-2 rounded-xl text-sm font-medium"
              style={{ background: 'rgba(245,168,0,0.1)', color: '#F5A800', border: '1px solid rgba(245,168,0,0.25)' }}
            >
              Friends
            </span>
          ) : relationship === 'pending_sent' ? (
            <span
              className="px-5 py-2 rounded-xl text-sm font-medium text-white/35"
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}
            >
              Request Sent
            </span>
          ) : relationship === 'pending_received' ? (
            <span
              className="px-5 py-2 rounded-xl text-sm font-medium text-white/35"
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}
            >
              Respond in Friends
            </span>
          ) : (
            <button
              onClick={sendRequest}
              disabled={requesting}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all hover:opacity-85 disabled:opacity-50"
              style={{ background: '#F5A800', color: '#111' }}
            >
              <UserPlus size={15} />
              {requesting ? 'Sending…' : 'Send Friend Request'}
            </button>
          )
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { icon: Clock, value: totalHours, label: 'Study Hours' },
          { icon: Flame, value: profile.streak ?? 0, label: 'Day Streak' },
          { icon: Users, value: friendsCount, label: 'Friends' },
        ].map(({ icon: Icon, value, label }) => (
          <div key={label} className="glass rounded-2xl p-4 flex flex-col items-center gap-2 text-center">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ background: 'rgba(245,168,0,0.15)' }}
            >
              <Icon size={16} style={{ color: '#F5A800' }} />
            </div>
            <p className="text-xl font-bold text-white">{value}</p>
            <p className="text-xs text-white/35 leading-tight">{label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
