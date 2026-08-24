import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Users, Lock } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';

function Spinner() {
  return (
    <div className="flex items-center justify-center p-8">
      <div className="w-7 h-7 rounded-full border-2 border-green-900 border-t-yellow-500 animate-spin" />
    </div>
  );
}

export default function JoinGroup() {
  const { inviteCode } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { t } = useApp();
  const [group, setGroup] = useState(null);
  const [memberCount, setMemberCount] = useState(0);
  const [isMember, setIsMember] = useState(false);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);
  const [invalid, setInvalid] = useState(false);
  const [joinError, setJoinError] = useState('');

  useEffect(() => {
    const load = async () => {
      setLoading(true);

      const { data: g } = await supabase
        .from('study_groups')
        .select('*')
        .eq('invite_code', inviteCode)
        .single();

      if (!g) {
        setInvalid(true);
        setLoading(false);
        return;
      }

      setGroup(g);

      const { count } = await supabase
        .from('group_members')
        .select('*', { count: 'exact', head: true })
        .eq('group_id', g.id);

      setMemberCount(count || 0);

      if (user) {
        const { data: membership } = await supabase
          .from('group_members')
          .select('id')
          .eq('group_id', g.id)
          .eq('user_id', user.id)
          .single();

        setIsMember(!!membership);
      }

      setLoading(false);
    };

    load();
  }, [inviteCode, user?.id]);

  const handleJoin = async () => {
    if (!user || !group || joining) return;
    setJoining(true);
    setJoinError('');
    const { error } = await supabase
      .from('group_members')
      .insert({ group_id: group.id, user_id: user.id, role: 'member' });
    if (!error) {
      navigate('/study-groups');
    } else {
      setJoinError(error.message);
      setJoining(false);
    }
  };

  return (
    <div className="min-h-[60vh] flex items-center justify-center p-6">
      <div
        className="w-full max-w-sm rounded-2xl p-8 space-y-6"
        style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.07)' }}
      >
        {loading && <Spinner />}

        {!loading && invalid && (
          <div className="text-center space-y-3">
            <Lock size={36} className="mx-auto text-white/20" />
            <p className="text-base font-semibold text-white">{t.invalidInviteLink}</p>
            <p className="text-sm text-white/40">{t.inviteLinkRevoked}</p>
            <button
              onClick={() => navigate('/study-groups')}
              className="mt-2 px-5 py-2.5 rounded-xl text-sm font-semibold btn-gold"
            >
              {t.browseGroups}
            </button>
          </div>
        )}

        {!loading && group && (
          <>
            <div className="text-center space-y-2">
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold mx-auto"
                style={{ background: group.icon_url || '#C9943A', color: '#111' }}
              >
                {group.name.charAt(0).toUpperCase()}
              </div>
              <h1 className="text-xl font-bold text-white">{group.name}</h1>
              {group.description && (
                <p className="text-sm text-white/50">{group.description}</p>
              )}
            </div>

            <div className="flex items-center justify-center gap-2 text-sm text-white/40">
              <Users size={14} />
              <span>{memberCount} {memberCount === 1 ? t.memberSingular : t.memberPlural}</span>
              {!group.is_public && (
                <>
                  <span className="text-white/20">·</span>
                  <Lock size={12} />
                  <span>{t.privateLabel}</span>
                </>
              )}
            </div>

            {joinError && (
              <p className="text-sm text-red-400 text-center px-3 py-2 rounded-lg" style={{ background: 'rgba(239,68,68,0.1)' }}>
                {joinError}
              </p>
            )}

            {isMember ? (
              <div className="space-y-3">
                <p className="text-center text-sm font-medium" style={{ color: '#F5A800' }}>
                  {t.alreadyInGroup}
                </p>
                <button
                  onClick={() => navigate('/study-groups')}
                  className="w-full py-3 rounded-xl text-sm font-semibold btn-gold"
                >
                  {t.goToGroups}
                </button>
              </div>
            ) : (
              <button
                onClick={handleJoin}
                disabled={joining}
                className="w-full py-3 rounded-xl text-sm font-semibold transition-all btn-gold disabled:opacity-50"
              >
                {joining ? t.joiningEllipsis : t.joinGroupLabel}
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
}
