import { useState, useEffect, useRef, useCallback } from 'react';
import {
  Users, Search, Plus, MessageCircle, Lock, Globe,
  Send, ArrowLeft, X, Trophy, Crown, ShieldCheck, Link2,
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';

// ─── helpers ────────────────────────────────────────────────────────────────

function fmtAgo(iso) {
  if (!iso) return '';
  const diff = Date.now() - new Date(iso).getTime();
  if (diff < 60000) return 'just now';
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
  return new Date(iso).toLocaleDateString();
}

function fmtMins(m) {
  if (!m) return '0m';
  const h = Math.floor(m / 60);
  const min = m % 60;
  if (h === 0) return `${min}m`;
  if (min === 0) return `${h}h`;
  return `${h}h ${min}m`;
}

function currentWeekStart() {
  const now = new Date();
  const diff = now.getDay() === 0 ? -6 : 1 - now.getDay();
  const monday = new Date(now);
  monday.setDate(now.getDate() + diff);
  return monday.toISOString().split('T')[0];
}

// perceived brightness — returns light text color for dark bgs and vice versa
function iconFg(hex) {
  if (!hex || hex.length < 7) return '#111';
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255 > 0.45 ? '#111' : '#f0f0f0';
}

// ─── Invite code ─────────────────────────────────────────────────────────────
// NOTE: Run these SQL statements in the Supabase SQL Editor:
// ALTER TABLE study_groups ADD COLUMN IF NOT EXISTS invite_code text UNIQUE;
//
// Fix RLS so members tab can read group_members:
// DROP POLICY IF EXISTS "Users can view group members" ON group_members;
// CREATE POLICY "Users can view group members" ON group_members
// FOR SELECT USING (true);

const generateInviteCode = () => Math.random().toString(36).substring(2, 10).toUpperCase();

// ─── Icon color palette ───────────────────────────────────────────────────────

const ICON_COLORS = [
  '#C9943A', // gold (default)
  '#004d2e', // deep green
  '#1e40af', // royal blue
  '#6d28d9', // purple
  '#991b1b', // red
  '#0f766e', // teal
  '#b45309', // amber
  '#0e7490', // cyan
  '#9d174d', // pink
  '#065f46', // emerald
  '#5b21b6', // violet
  '#334155', // slate
];

const DEFAULT_COLOR = '#C9943A';

// ─── Group Icon ───────────────────────────────────────────────────────────────

function GroupIcon({ group, size = 36 }) {
  const color = group?.icon_url || DEFAULT_COLOR;
  const letter = (group?.name || 'G').charAt(0).toUpperCase();
  const fg = iconFg(color);
  return (
    <div
      className="rounded-full flex items-center justify-center font-bold select-none flex-shrink-0"
      style={{ width: size, height: size, fontSize: size * 0.42, background: color, color: fg }}
    >
      {letter}
    </div>
  );
}

// ─── User Avatar ─────────────────────────────────────────────────────────────

function Avi({ profile, size = 36 }) {
  const initials = (profile?.full_name || profile?.username || '?').charAt(0).toUpperCase();
  return (
    <div
      className="rounded-full overflow-hidden flex items-center justify-center font-bold text-gray-900 select-none flex-shrink-0"
      style={{
        width: size, height: size, fontSize: size * 0.38,
        background: profile?.avatar_url ? 'transparent' : '#F5A800',
      }}
    >
      {profile?.avatar_url
        ? <img src={profile.avatar_url} alt="" className="w-full h-full object-cover" />
        : initials}
    </div>
  );
}

// ─── Spinner ─────────────────────────────────────────────────────────────────

function Spinner() {
  return (
    <div className="flex items-center justify-center p-8">
      <div className="w-7 h-7 rounded-full border-2 border-green-900 border-t-yellow-500 animate-spin" />
    </div>
  );
}

// ─── Create Group Modal ──────────────────────────────────────────────────────

function CreateGroupModal({ onClose, onCreated, userId }) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isPublic, setIsPublic] = useState(true);
  const [iconColor, setIconColor] = useState(DEFAULT_COLOR);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const previewGroup = { name, icon_url: iconColor };

  const handleCreate = async () => {
    if (!name.trim()) { setError('Group name is required.'); return; }
    setLoading(true);
    setError('');

    const { data: group, error: groupErr } = await supabase
      .from('study_groups')
      .insert({
        name: name.trim(),
        description: description.trim(),
        is_public: isPublic,
        creator_id: userId,
        created_by: userId,
        icon_url: iconColor,
        invite_code: generateInviteCode(),
      })
      .select()
      .single();

    if (groupErr) { setError(groupErr.message); setLoading(false); return; }

    const { error: memberErr } = await supabase
      .from('group_members')
      .insert({ group_id: group.id, user_id: userId, role: 'admin' });

    if (memberErr) { setError(memberErr.message); setLoading(false); return; }

    setLoading(false);
    onCreated(group);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.72)' }}>
      <div
        className="w-full max-w-md rounded-2xl p-6 space-y-4 overflow-y-auto"
        style={{ background: 'rgba(0,22,12,0.99)', border: '1px solid rgba(255,255,255,0.1)', maxHeight: '90vh' }}
      >
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-white">Create Study Group</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-white/10 transition-colors">
            <X size={18} className="text-white/60" />
          </button>
        </div>

        {error && (
          <p className="text-sm text-red-400 px-3 py-2 rounded-lg" style={{ background: 'rgba(239,68,68,0.1)' }}>
            {error}
          </p>
        )}

        <div className="space-y-4">
          {/* Group name */}
          <div>
            <label className="block text-xs text-white/50 mb-1.5">Group Name *</label>
            <input
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="e.g. Math Study Squad"
              className="w-full glass-input rounded-xl px-3 py-2.5 text-sm"
              maxLength={60}
            />
          </div>

          {/* Icon picker */}
          <div>
            <label className="block text-xs text-white/50 mb-2">Group Icon</label>
            <div className="flex items-center gap-3 mb-3">
              <GroupIcon group={previewGroup} size={44} />
              <p className="text-xs text-white/35">Pick a color for your group icon</p>
            </div>
            <div className="grid grid-cols-6 gap-2">
              {ICON_COLORS.map(color => (
                <button
                  key={color}
                  onClick={() => setIconColor(color)}
                  className="relative aspect-square rounded-full transition-transform hover:scale-110"
                  style={{ background: color }}
                  title={color}
                >
                  {iconColor === color && (
                    <span
                      className="absolute inset-0 rounded-full"
                      style={{ boxShadow: `0 0 0 3px rgba(255,255,255,0.9)`, border: `2px solid ${color}` }}
                    />
                  )}
                  <span
                    className="absolute inset-0 flex items-center justify-center text-xs font-bold"
                    style={{ color: iconFg(color) }}
                  >
                    {(name || 'G').charAt(0).toUpperCase()}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs text-white/50 mb-1.5">Description</label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="What is this group about?"
              rows={3}
              className="w-full glass-input rounded-xl px-3 py-2.5 text-sm resize-none"
              maxLength={200}
            />
          </div>

          {/* Visibility */}
          <div>
            <label className="block text-xs text-white/50 mb-2">Visibility</label>
            <div className="flex gap-2">
              {[{ val: true, label: 'Public', Icon: Globe }, { val: false, label: 'Private', Icon: Lock }].map(({ val, label, Icon }) => (
                <button
                  key={label}
                  onClick={() => setIsPublic(val)}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium transition-all"
                  style={isPublic === val
                    ? { background: '#F5A800', color: '#111' }
                    : { background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.5)' }}
                >
                  <Icon size={14} /> {label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <button
          onClick={handleCreate}
          disabled={loading || !name.trim()}
          className="w-full py-3 rounded-xl text-sm font-semibold transition-all btn-gold disabled:opacity-50"
        >
          {loading ? 'Creating…' : 'Create Group'}
        </button>
      </div>
    </div>
  );
}

// ─── Invite Modal ────────────────────────────────────────────────────────────

function InviteModal({ group, inviteCode, onClose, onCodeChange }) {
  const [copied, setCopied] = useState(false);
  const [regenerating, setRegenerating] = useState(false);
  const link = `https://primestudyapp.com/join/${inviteCode}`;

  const copyLink = () => {
    navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const regenerate = async () => {
    setRegenerating(true);
    const newCode = generateInviteCode();
    const { error } = await supabase
      .from('study_groups')
      .update({ invite_code: newCode })
      .eq('id', group.id);
    if (!error) onCodeChange(newCode);
    setRegenerating(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.72)' }}>
      <div
        className="w-full max-w-sm rounded-2xl p-6 space-y-4"
        style={{ background: 'rgba(0,22,12,0.99)', border: '1px solid rgba(255,255,255,0.1)' }}
      >
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-white">Invite to {group.name}</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-white/10 transition-colors">
            <X size={18} className="text-white/60" />
          </button>
        </div>

        <div>
          <label className="block text-xs text-white/50 mb-2">Invite Link</label>
          <div
            className="px-3 py-2.5 rounded-xl text-xs break-all select-all"
            style={{ background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.7)', border: '1px solid rgba(255,255,255,0.1)' }}
          >
            {link}
          </div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={copyLink}
            className="flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all btn-gold"
          >
            {copied ? 'Copied!' : 'Copy Link'}
          </button>
          <button
            onClick={regenerate}
            disabled={regenerating}
            className="flex-1 py-2.5 rounded-xl text-sm font-medium transition-all disabled:opacity-50"
            style={{ background: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.7)', border: '1px solid rgba(255,255,255,0.1)' }}
          >
            {regenerating ? 'Updating…' : 'Regenerate'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Group Item (left panel row) ─────────────────────────────────────────────

function GroupItem({ group, isActive, onClick, onJoin, showJoin, joined }) {
  return (
    <div
      onClick={onClick}
      className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl cursor-pointer transition-all hover:bg-white/5"
      style={isActive
        ? { background: 'rgba(245,168,0,0.12)', border: '1px solid rgba(245,168,0,0.28)' }
        : { border: '1px solid transparent' }}
    >
      <GroupIcon group={group} size={36} />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-white truncate leading-tight">{group.name}</p>
        <div className="flex items-center gap-1.5 mt-0.5">
          <Users size={11} className="text-white/30 flex-shrink-0" />
          <span className="text-xs text-white/30">{group.member_count ?? 0}</span>
          {!group.is_public && (
            <span className="text-xs text-white/25 flex items-center gap-0.5 ml-1">
              <Lock size={9} /> Private
            </span>
          )}
        </div>
      </div>
      {showJoin && !joined && group.is_public && (
        <button
          onClick={e => { e.stopPropagation(); onJoin(); }}
          className="text-xs font-semibold px-2.5 py-1 rounded-lg flex-shrink-0 transition-all hover:opacity-80"
          style={{ background: '#F5A800', color: '#111' }}
        >
          Join
        </button>
      )}
      {showJoin && !group.is_public && (
        <Lock size={12} className="text-white/25 flex-shrink-0" />
      )}
    </div>
  );
}

// ─── Left Panel ──────────────────────────────────────────────────────────────

function LeftPanel({ myGroups, discoverGroups, activeGroupId, onSelect, onJoin, joinedIds, searchQuery, setSearchQuery, onCreateClick, loading }) {
  return (
    <div className="flex flex-col h-full" style={{ width: 280, minWidth: 280, flexShrink: 0, borderRight: '1px solid rgba(255,255,255,0.07)' }}>
      <div className="p-4 space-y-3" style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-white">Study Groups</h2>
          <button
            onClick={onCreateClick}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold btn-gold"
          >
            <Plus size={13} /> Create
          </button>
        </div>
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30 pointer-events-none" />
          <input
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search groups…"
            className="w-full pl-9 pr-3 py-2 rounded-xl glass-input text-sm"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-4">
        {loading && <Spinner />}

        {!loading && myGroups.length === 0 && discoverGroups.length === 0 && (
          <div className="text-center py-12">
            <Users size={28} className="mx-auto mb-2 text-white/15" />
            <p className="text-sm text-white/30">No groups found</p>
            <p className="text-xs text-white/20 mt-1">Create one to get started</p>
          </div>
        )}

        {!loading && myGroups.length > 0 && (
          <div>
            <p className="text-xs font-semibold text-white/30 uppercase tracking-wider px-2 mb-2">My Groups</p>
            <div className="space-y-1">
              {myGroups.map(g => (
                <GroupItem
                  key={g.id}
                  group={g}
                  isActive={g.id === activeGroupId}
                  onClick={() => onSelect(g)}
                />
              ))}
            </div>
          </div>
        )}

        {!loading && discoverGroups.length > 0 && (
          <div>
            <p className="text-xs font-semibold text-white/30 uppercase tracking-wider px-2 mb-2">Discover</p>
            <div className="space-y-1">
              {discoverGroups.map(g => (
                <GroupItem
                  key={g.id}
                  group={g}
                  isActive={g.id === activeGroupId}
                  onClick={() => onSelect(g)}
                  onJoin={() => onJoin(g)}
                  showJoin
                  joined={joinedIds.has(g.id)}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Chat Tab ────────────────────────────────────────────────────────────────

function ChatTab({ group, userId }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const bottomRef = useRef(null);
  const channelRef = useRef(null);

  const scrollDown = () => setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 80);

  const fetchMessages = useCallback(async () => {
    if (!group?.id) return;
    setLoading(true);
    const { data } = await supabase
      .from('group_messages')
      .select('*, profiles:user_id(id, username, full_name, avatar_url)')
      .eq('group_id', group.id)
      .order('created_at', { ascending: true })
      .limit(150);
    setMessages(data || []);
    setLoading(false);
    scrollDown();
  }, [group?.id]);

  useEffect(() => {
    fetchMessages();

    if (channelRef.current) supabase.removeChannel(channelRef.current);

    const ch = supabase
      .channel(`grp-chat-${group?.id}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'group_messages', filter: `group_id=eq.${group?.id}` },
        async (payload) => {
          const { data: prof } = await supabase
            .from('profiles')
            .select('id, username, full_name, avatar_url')
            .eq('id', payload.new.user_id)
            .single();
          setMessages(prev => [...prev, { ...payload.new, profiles: prof }]);
          scrollDown();
        })
      .subscribe();

    channelRef.current = ch;

    return () => {
      if (channelRef.current) { supabase.removeChannel(channelRef.current); channelRef.current = null; }
    };
  }, [group?.id, fetchMessages]);

  const sendMessage = async () => {
    const msg = input.trim();
    if (!msg || sending) return;
    setSending(true);
    setInput('');
    await supabase.from('group_messages').insert({ group_id: group.id, user_id: userId, message: msg });
    setSending(false);
  };

  const onKey = e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); } };

  if (loading) return <div className="flex-1"><Spinner /></div>;

  return (
    <div className="flex flex-col flex-1 min-h-0">
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.length === 0 && (
          <div className="text-center py-16">
            <MessageCircle size={28} className="mx-auto mb-2 text-white/15" />
            <p className="text-sm text-white/30">No messages yet — say hello!</p>
          </div>
        )}
        {messages.map(msg => {
          const isMe = msg.user_id === userId;
          const sender = msg.profiles;
          const name = sender?.username || sender?.full_name || 'Unknown';
          return (
            <div key={msg.id} className={`flex gap-2.5 ${isMe ? 'flex-row-reverse' : ''}`}>
              <Avi profile={sender} size={32} />
              <div className={`max-w-[72%] flex flex-col gap-1 ${isMe ? 'items-end' : 'items-start'}`}>
                {!isMe && <span className="text-xs text-white/40 px-1">{name}</span>}
                <div
                  className="px-3 py-2 text-sm leading-relaxed"
                  style={isMe
                    ? { background: '#F5A800', color: '#111', borderRadius: '16px 16px 4px 16px' }
                    : { background: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.9)', borderRadius: '16px 16px 16px 4px' }}
                >
                  {msg.message}
                </div>
                <span className="text-xs text-white/20 px-1">{fmtAgo(msg.created_at)}</span>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      <div className="p-3 flex items-center gap-2" style={{ borderTop: '1px solid rgba(255,255,255,0.07)' }}>
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={onKey}
          placeholder="Send a message…"
          className="flex-1 glass-input rounded-xl px-4 py-2.5 text-sm"
          maxLength={500}
        />
        <button
          onClick={sendMessage}
          disabled={!input.trim() || sending}
          className="w-10 h-10 rounded-xl flex items-center justify-center transition-all disabled:opacity-40"
          style={{ background: '#F5A800' }}
        >
          <Send size={16} style={{ color: '#111' }} />
        </button>
      </div>
    </div>
  );
}

// ─── Members Tab ─────────────────────────────────────────────────────────────

function MembersTab({ group, userId, onLeft }) {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [leaveWarning, setLeaveWarning] = useState(false);

  useEffect(() => {
    if (!group?.id) return;
    setLeaveWarning(false);
    setLoading(true);
    const run = async () => {
    const { data: memberRows, error } = await supabase
      .from('group_members')
      .select('id, group_id, user_id, role, joined_at')
      .eq('group_id', group.id)
      .order('joined_at', { ascending: true });

    console.log('[MembersTab] data:', JSON.stringify(memberRows));
    console.log('[MembersTab] error:', JSON.stringify(error));

    if (!memberRows?.length) { setMembers([]); setLoading(false); return; }

    const userIds = memberRows.map(m => m.user_id);
    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, username, full_name, avatar_url')
      .in('id', userIds);

    const profileMap = Object.fromEntries((profiles || []).map(p => [p.id, p]));
    const combined = memberRows.map(m => ({ ...m, profiles: profileMap[m.user_id] || null }));
    setMembers(combined);
    setLoading(false);
    };
    run();
  }, [group?.id]);

  const myRow = members.find(m => m.user_id === userId);
  const amIAdmin = myRow?.role === 'admin';
  const adminCount = members.filter(m => m.role === 'admin').length;

  const makeAdmin = async (memberId) => {
    const { error } = await supabase
      .from('group_members')
      .update({ role: 'admin' })
      .eq('id', memberId);
    if (!error) {
      setMembers(prev => prev.map(m => m.id === memberId ? { ...m, role: 'admin' } : m));
    }
  };

  const removeMember = async (memberId) => {
    if (!amIAdmin) return;
    const { error } = await supabase.from('group_members').delete().eq('id', memberId);
    if (!error) setMembers(prev => prev.filter(m => m.id !== memberId));
  };

  const leaveGroup = async () => {
    if (amIAdmin && adminCount === 1) {
      setLeaveWarning(true);
      return;
    }
    if (!myRow) return;
    const { error } = await supabase.from('group_members').delete().eq('id', myRow.id);
    if (!error) onLeft?.();
  };

  if (loading) return <div className="flex-1"><Spinner /></div>;

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-2">
      {leaveWarning && (
        <div
          className="flex items-start gap-3 px-4 py-3 rounded-xl mb-1"
          style={{ background: 'rgba(234,179,8,0.1)', border: '1px solid rgba(234,179,8,0.3)' }}
        >
          <Crown size={15} style={{ color: '#F5A800', flexShrink: 0, marginTop: 1 }} />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium" style={{ color: '#F5A800' }}>You are the only admin</p>
            <p className="text-xs text-white/50 mt-0.5">Make someone else admin before leaving the group.</p>
          </div>
          <button onClick={() => setLeaveWarning(false)} className="text-white/30 hover:text-white/60 transition-colors flex-shrink-0">
            <X size={14} />
          </button>
        </div>
      )}

      {members.map(member => {
        const p = member.profiles;
        const name = p?.username || p?.full_name || 'Unknown';
        const isAdmin = member.role === 'admin';
        const isMe = member.user_id === userId;

        return (
          <div
            key={member.id}
            className="flex items-center gap-3 px-4 py-3 rounded-xl"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}
          >
            <Avi profile={p} size={36} />

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <p className="text-sm font-medium text-white truncate">{name}</p>
                {isAdmin && (
                  <span
                    className="text-xs px-1.5 py-0.5 rounded-md font-semibold flex-shrink-0 flex items-center gap-1"
                    style={{ background: 'rgba(245,168,0,0.18)', color: '#F5A800' }}
                  >
                    <Crown size={10} /> Admin
                  </span>
                )}
                {isMe && !isAdmin && (
                  <span className="text-xs text-white/25 flex-shrink-0">(you)</span>
                )}
              </div>
              <p className="text-xs text-white/30">Joined {fmtAgo(member.joined_at)}</p>
            </div>

            {/* Action buttons */}
            <div className="flex items-center gap-1.5 flex-shrink-0">
              {/* Make Admin — shown to admins for non-admin members who aren't me */}
              {amIAdmin && !isMe && !isAdmin && (
                <button
                  onClick={() => makeAdmin(member.id)}
                  className="text-xs font-medium px-2.5 py-1.5 rounded-lg transition-all hover:bg-white/5 flex items-center gap-1"
                  style={{ border: '1px solid rgba(245,168,0,0.3)', color: 'rgba(245,168,0,0.8)' }}
                  title="Make Admin"
                >
                  <ShieldCheck size={12} />
                  <span className="hidden sm:inline">Admin</span>
                </button>
              )}
              {/* Remove — shown to admins for non-admin members who aren't me */}
              {amIAdmin && !isMe && !isAdmin && (
                <button
                  onClick={() => removeMember(member.id)}
                  className="text-xs font-medium px-2.5 py-1.5 rounded-lg transition-all hover:bg-white/5"
                  style={{ border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.3)' }}
                >
                  Remove
                </button>
              )}
              {/* Leave — shown only on my own row */}
              {isMe && (
                <button
                  onClick={leaveGroup}
                  className="text-xs font-medium px-2.5 py-1.5 rounded-lg transition-all"
                  style={{ border: '1px solid rgba(239,68,68,0.4)', color: 'rgba(239,68,68,0.75)' }}
                >
                  Leave
                </button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── Leaderboard Tab ─────────────────────────────────────────────────────────

const MEDAL = {
  0: { badge: '#F5A800', text: '#1a0c00', left: '#F5A800' },
  1: { badge: '#94a3b8', text: '#0f172a', left: '#94a3b8' },
  2: { badge: '#cd7f32', text: '#1a0c00', left: '#cd7f32' },
};

function LeaderboardTab({ group }) {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!group?.id) return;
    setLoading(true);
    supabase
      .from('group_members')
      .select('user_id, profiles:user_id(id, username, full_name, avatar_url)')
      .eq('group_id', group.id)
      .then(async ({ data: members }) => {
        if (!members?.length) { setLoading(false); return; }
        const userIds = members.map(m => m.user_id);
        const profileMap = Object.fromEntries(members.map(m => [m.user_id, m.profiles]));
        const { data: scores } = await supabase
          .from('leaderboard_scores')
          .select('user_id, study_minutes')
          .in('user_id', userIds)
          .eq('week_start', currentWeekStart());
        const scoreMap = Object.fromEntries((scores || []).map(s => [s.user_id, s.study_minutes]));
        const result = userIds
          .map(uid => ({ profile: profileMap[uid], minutes: scoreMap[uid] || 0 }))
          .sort((a, b) => b.minutes - a.minutes);
        setEntries(result);
        setLoading(false);
      });
  }, [group?.id]);

  if (loading) return <div className="flex-1"><Spinner /></div>;

  return (
    <div className="flex-1 overflow-y-auto p-4">
      <p className="text-xs text-white/30 text-center mb-4">Weekly study time · this week</p>
      {entries.length === 0 && (
        <div className="text-center py-12">
          <Trophy size={28} className="mx-auto mb-2 text-white/15" />
          <p className="text-sm text-white/30">No study data this week</p>
        </div>
      )}
      <div className="space-y-2">
        {entries.map((entry, i) => {
          const meta = MEDAL[i];
          const name = entry.profile?.username || entry.profile?.full_name || 'Unknown';
          return (
            <div
              key={entry.profile?.id || i}
              className="flex items-center gap-3 px-4 py-3 rounded-xl"
              style={{
                background: meta ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.025)',
                border: `1px solid ${meta ? meta.left + '35' : 'rgba(255,255,255,0.06)'}`,
                borderLeft: meta ? `3px solid ${meta.left}` : '1px solid rgba(255,255,255,0.06)',
              }}
            >
              <div
                className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                style={meta
                  ? { background: meta.badge, color: meta.text }
                  : { background: 'rgba(255,255,255,0.07)', color: 'rgba(255,255,255,0.35)' }}
              >
                {i + 1}
              </div>
              <Avi profile={entry.profile} size={32} />
              <p className="flex-1 text-sm font-medium text-white truncate">{name}</p>
              <p className="text-sm font-semibold flex-shrink-0" style={{ color: '#F5A800' }}>
                {fmtMins(entry.minutes)}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Right Panel (Group Detail) ───────────────────────────────────────────────

const TABS = ['chat', 'members', 'leaderboard'];

function RightPanel({ group, userId, isMember, onLeft, onGroupUpdate }) {
  const [tab, setTab] = useState('chat');
  const [isAdmin, setIsAdmin] = useState(false);
  const [inviteCode, setInviteCode] = useState(group?.invite_code || null);
  const [inviteOpen, setInviteOpen] = useState(false);
  const inviteCodeRef = useRef(inviteCode);
  inviteCodeRef.current = inviteCode;

  useEffect(() => {
    setTab('chat');
    setIsAdmin(false);
    setInviteOpen(false);
    setInviteCode(group?.invite_code || null);
  }, [group?.id]);

  // Check if current user is admin for this group
  useEffect(() => {
    if (!group?.id || !userId || !isMember) return;
    supabase
      .from('group_members')
      .select('role')
      .eq('group_id', group.id)
      .eq('user_id', userId)
      .single()
      .then(({ data }) => setIsAdmin(data?.role === 'admin'));
  }, [group?.id, userId, isMember]);

  // Auto-generate invite code for groups that don't have one yet
  useEffect(() => {
    if (!isAdmin || !group?.id || inviteCodeRef.current) return;
    const code = generateInviteCode();
    supabase
      .from('study_groups')
      .update({ invite_code: code })
      .eq('id', group.id)
      .then(({ error }) => {
        if (!error) {
          setInviteCode(code);
          onGroupUpdate?.(group.id, { invite_code: code });
        }
      });
  }, [isAdmin, group?.id]); // intentionally omitting inviteCode — using ref above

  if (!group) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
        <Users size={40} className="text-white/10 mb-3" />
        <p className="text-base font-medium text-white/30">Select a group to get started</p>
        <p className="text-sm text-white/20 mt-1">Or create your own study group</p>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col min-w-0 min-h-0">
      {/* Group header */}
      <div className="flex items-center gap-3 px-5 py-3.5 flex-shrink-0" style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
        <GroupIcon group={group} size={38} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-white truncate">{group.name}</h2>
            {!group.is_public && <Lock size={12} className="text-white/30 flex-shrink-0" />}
          </div>
          {group.description && (
            <p className="text-xs text-white/35 truncate">{group.description}</p>
          )}
        </div>
        {isAdmin && inviteCode && (
          <button
            onClick={() => setInviteOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold flex-shrink-0 transition-all hover:opacity-80"
            style={{ background: 'rgba(245,168,0,0.15)', color: '#F5A800', border: '1px solid rgba(245,168,0,0.3)' }}
          >
            <Link2 size={12} /> Invite
          </button>
        )}
      </div>

      {inviteOpen && inviteCode && (
        <InviteModal
          group={group}
          inviteCode={inviteCode}
          onClose={() => setInviteOpen(false)}
          onCodeChange={(code) => {
            setInviteCode(code);
            onGroupUpdate?.(group.id, { invite_code: code });
          }}
        />
      )}

      {/* Tab bar */}
      <div className="flex flex-shrink-0" style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
        {TABS.map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className="flex-1 py-2.5 text-sm font-medium capitalize transition-colors"
            style={tab === t
              ? { color: '#F5A800', borderBottom: '2px solid #F5A800' }
              : { color: 'rgba(255,255,255,0.4)' }}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {tab === 'chat' && (
        isMember
          ? <ChatTab group={group} userId={userId} />
          : (
            <div className="flex-1 flex flex-col items-center justify-center gap-3 p-8">
              <Lock size={28} className="text-white/20" />
              <p className="text-sm text-white/40">Join this group to participate in the chat</p>
            </div>
          )
      )}
      {tab === 'members' && <MembersTab group={group} userId={userId} onLeft={onLeft} />}
      {tab === 'leaderboard' && <LeaderboardTab group={group} />}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function StudyGroups() {
  const { user, profile } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [myGroups, setMyGroups] = useState([]);
  const [discoverGroups, setDiscoverGroups] = useState([]);
  const [joinedIds, setJoinedIds] = useState(new Set());
  const [activeGroup, setActiveGroup] = useState(null);
  const [loading, setLoading] = useState(true);
  const [createOpen, setCreateOpen] = useState(false);
  const [mobileShowDetail, setMobileShowDetail] = useState(false);

  const loadGroups = useCallback(async () => {
    if (!user) return;
    setLoading(true);

    const { data: memberRows } = await supabase
      .from('group_members')
      .select('group_id')
      .eq('user_id', user.id);

    const myGroupIds = (memberRows || []).map(r => r.group_id);
    setJoinedIds(new Set(myGroupIds));

    if (myGroupIds.length > 0) {
      const { data: myG } = await supabase
        .from('study_groups')
        .select('*, member_count:group_members(count)')
        .in('id', myGroupIds)
        .order('created_at', { ascending: false });
      setMyGroups(myG || []);
    } else {
      setMyGroups([]);
    }

    let discoverQuery = supabase
      .from('study_groups')
      .select('*, member_count:group_members(count)')
      .eq('is_public', true);

    if (myGroupIds.length > 0) {
      discoverQuery = discoverQuery.not('id', 'in', `(${myGroupIds.join(',')})`);
    }

    const { data: publicG } = await discoverQuery
      .order('created_at', { ascending: false })
      .limit(30);

    setDiscoverGroups(publicG || []);
    setLoading(false);
  }, [user?.id]);

  useEffect(() => { loadGroups(); }, [loadGroups]);

  const filteredMy = searchQuery
    ? myGroups.filter(g => g.name?.toLowerCase().includes(searchQuery.toLowerCase()))
    : myGroups;

  const filteredDiscover = searchQuery
    ? discoverGroups.filter(g => g.name?.toLowerCase().includes(searchQuery.toLowerCase()))
    : discoverGroups;

  const handleJoin = async (group) => {
    if (!user || joinedIds.has(group.id) || !group.is_public) return;
    const { error } = await supabase
      .from('group_members')
      .insert({ group_id: group.id, user_id: user.id, role: 'member' });
    if (!error) {
      setJoinedIds(prev => new Set([...prev, group.id]));
      setMyGroups(prev => [{ ...group, member_count: (group.member_count ?? 0) + 1 }, ...prev]);
      setDiscoverGroups(prev => prev.filter(g => g.id !== group.id));
      setActiveGroup(group);
      setMobileShowDetail(true);
    }
  };

  const handleSelect = (group) => {
    setActiveGroup(group);
    setMobileShowDetail(true);
  };

  const handleLeft = () => {
    if (!activeGroup) return;
    const left = activeGroup;
    setJoinedIds(prev => { const s = new Set(prev); s.delete(left.id); return s; });
    setMyGroups(prev => prev.filter(g => g.id !== left.id));
    if (left.is_public) setDiscoverGroups(prev => [left, ...prev]);
    setActiveGroup(null);
    setMobileShowDetail(false);
  };

  const handleCreated = (group) => {
    setMyGroups(prev => [{ ...group, member_count: 1 }, ...prev]);
    setJoinedIds(prev => new Set([...prev, group.id]));
    setActiveGroup(group);
    setMobileShowDetail(true);
  };

  const handleGroupUpdate = (groupId, updates) => {
    setMyGroups(prev => prev.map(g => g.id === groupId ? { ...g, ...updates } : g));
    setActiveGroup(prev => prev?.id === groupId ? { ...prev, ...updates } : prev);
  };

  const isMember = activeGroup ? joinedIds.has(activeGroup.id) : false;

  return (
    <div className="flex flex-col" style={{ height: 'calc(100vh - 100px)' }}>
      <div className="mb-3 flex-shrink-0">
        <h1 className="text-2xl font-bold text-white">Study Groups</h1>
        <p className="text-sm text-white/50 mt-0.5">Study together, grow together</p>
      </div>

      <div
        className="flex flex-1 rounded-2xl overflow-hidden min-h-0"
        style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.07)' }}
      >
        <div
          className={`${mobileShowDetail ? 'hidden md:flex' : 'flex'} flex-col h-full`}
          style={{ width: 280, minWidth: 280, flexShrink: 0, borderRight: '1px solid rgba(255,255,255,0.07)' }}
        >
          <LeftPanel
            myGroups={filteredMy}
            discoverGroups={filteredDiscover}
            activeGroupId={activeGroup?.id}
            onSelect={handleSelect}
            onJoin={handleJoin}
            joinedIds={joinedIds}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            onCreateClick={() => setCreateOpen(true)}
            loading={loading}
          />
        </div>

        <div className={`${mobileShowDetail ? 'flex' : 'hidden md:flex'} flex-1 flex-col min-w-0 min-h-0`}>
          {mobileShowDetail && (
            <button
              onClick={() => setMobileShowDetail(false)}
              className="md:hidden flex items-center gap-2 px-4 py-2.5 text-sm text-white/50 hover:text-white transition-colors flex-shrink-0"
              style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}
            >
              <ArrowLeft size={15} /> Back to Groups
            </button>
          )}
          <RightPanel
            group={activeGroup}
            userId={user?.id}
            profile={profile}
            isMember={isMember}
            onLeft={handleLeft}
            onGroupUpdate={handleGroupUpdate}
          />
        </div>
      </div>

      {createOpen && (
        <CreateGroupModal
          onClose={() => setCreateOpen(false)}
          onCreated={handleCreated}
          userId={user?.id}
        />
      )}
    </div>
  );
}
