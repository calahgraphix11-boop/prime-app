import { useState, useEffect } from 'react';
import { MessageCircle, X, History, ArrowLeft, User } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';
import { getCharacter } from '../lib/gamification';
import SessionChatPanel from './SessionChatPanel';

const BOT_AVATAR = '/gamification-assets/avatars/studypal-avatar.png';

function BotAvatar() {
  return (
    <img
      src={BOT_AVATAR}
      alt="StudyPal"
      className="w-7 h-7 rounded-full object-cover flex-shrink-0"
      style={{ border: '1px solid rgba(245,168,0,0.35)' }}
    />
  );
}

function UserAvatar({ character }) {
  if (character) {
    return (
      <img
        src={character.icon}
        alt={character.name}
        className="w-7 h-7 rounded-full object-cover flex-shrink-0"
        style={{ border: '1px solid rgba(0,77,46,0.5)' }}
      />
    );
  }
  return (
    <div
      className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0"
      style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)' }}
    >
      <User size={14} className="text-white/50" />
    </div>
  );
}

function relativeDate(iso) {
  const d = new Date(iso);
  const diffDays = Math.floor((Date.now() - d) / 86400000);
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays}d ago`;
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

function preview(messages) {
  const first = messages?.[0];
  const text = first?.content || first?.text || '';
  return text.length > 42 ? text.slice(0, 42) + '…' : text;
}

function HistoryView({ chat, onBack }) {
  const { profile } = useAuth();
  const userCharacter = getCharacter(profile?.character_avatar);
  return (
    <div className="flex flex-col h-full">
      <div
        className="px-4 py-2.5 flex items-center gap-2 flex-shrink-0"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}
      >
        <button
          onClick={onBack}
          className="p-1 rounded-lg text-white/40 hover:text-white hover:bg-white/10 transition-colors"
          aria-label="Back to active session"
        >
          <ArrowLeft size={14} />
        </button>
        <div className="min-w-0">
          <div className="text-xs font-semibold text-white truncate">{chat.sessionTitle || 'Study Chat'}</div>
          <div className="text-[10px] text-white/35">{relativeDate(chat.updated_at)}</div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        {chat.messages.length === 0 ? (
          <p className="text-xs text-white/35 text-center py-8">No messages in this session.</p>
        ) : (
          chat.messages.map((m, i) => (
            <div key={i} className={`flex items-end gap-2 ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              {m.role !== 'user' && <BotAvatar />}
              <div
                className="max-w-[80%] px-3 py-2 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap"
                style={m.role === 'user'
                  ? { background: '#F5A800', color: '#111' }
                  : { background: 'rgba(255,255,255,0.07)', color: 'rgba(255,255,255,0.88)', border: '1px solid rgba(255,255,255,0.08)' }
                }
              >
                {m.content || m.text || ''}
              </div>
              {m.role === 'user' && <UserAvatar character={userCharacter} />}
            </div>
          ))
        )}
      </div>

      <div
        className="px-4 py-2.5 flex-shrink-0"
        style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}
      >
        <p className="text-[10px] text-white/25 text-center">Read-only — start a new session to continue chatting</p>
      </div>
    </div>
  );
}

export default function StudyPalPanel({ onClose }) {
  const { activeSession } = useApp();
  const { user } = useAuth();

  const [historyChats, setHistoryChats] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [viewing, setViewing] = useState(null);
  const [historyOpen, setHistoryOpen] = useState(false);

  useEffect(() => {
    if (!user) return;
    setLoadingHistory(true);
    Promise.all([
      supabase
        .from('study_session_chats')
        .select('id, session_key, messages, created_at, updated_at')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false })
        .limit(60),
      supabase
        .from('study_sessions')
        .select('title, session_key')
        .eq('user_id', user.id),
    ]).then(([{ data: chats }, { data: sessions }]) => {
      const titleMap = {};
      (sessions || []).forEach((s) => { if (s.session_key) titleMap[s.session_key] = s.title; });
      setHistoryChats(
        (chats || [])
          .filter((c) => Array.isArray(c.messages) && c.messages.length > 0)
          .map((c) => ({ ...c, sessionTitle: titleMap[c.session_key] || null }))
      );
    }).finally(() => setLoadingHistory(false));
  }, [user?.id]);

  const openChat = (chat) => { setViewing(chat); setHistoryOpen(false); };
  const backToActive = () => { setViewing(null); setHistoryOpen(false); };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div
        className="flex items-center justify-between px-4 py-3 flex-shrink-0"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}
      >
        <div className="flex items-center gap-2">
          <button
            className="sm:hidden p-1 rounded-lg text-white/40 hover:text-white hover:bg-white/10 transition-colors"
            onClick={() => setHistoryOpen((o) => !o)}
            aria-label="Toggle history"
          >
            <History size={15} />
          </button>
          <MessageCircle size={15} style={{ color: '#F5A800' }} />
          <span className="text-sm font-semibold text-white">
            {viewing ? (viewing.sessionTitle || 'Study Chat') : 'StudyPal'}
          </span>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 rounded-lg text-white/40 hover:text-white hover:bg-white/10 transition-colors"
        >
          <X size={15} />
        </button>
      </div>

      {/* Body */}
      <div className="flex-1 flex overflow-hidden">
        {/* History sidebar — always visible on desktop, toggled on mobile */}
        <div
          className={`flex-shrink-0 flex-col overflow-hidden sm:flex sm:w-40 ${historyOpen ? 'flex w-full' : 'hidden'}`}
          style={{ borderRight: '1px solid rgba(255,255,255,0.08)' }}
        >
          <div
            className="px-3 py-2 flex-shrink-0"
            style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}
          >
            <span className="text-[10px] font-semibold text-white/35 uppercase tracking-wider">History</span>
          </div>

          <div className="flex-1 overflow-y-auto">
            {/* Active session shortcut */}
            {activeSession && (
              <button
                onClick={backToActive}
                className="w-full text-left px-3 py-2.5 hover:bg-white/5 transition-colors"
                style={!viewing
                  ? { background: 'rgba(245,168,0,0.08)', borderLeft: '2px solid #F5A800' }
                  : { borderLeft: '2px solid transparent' }
                }
              >
                <div className="flex items-center gap-1.5 mb-0.5">
                  <div className="w-1.5 h-1.5 rounded-full flex-shrink-0 animate-pulse" style={{ background: '#4ade80' }} />
                  <span className="text-xs font-medium text-white/90 truncate">{activeSession.title}</span>
                </div>
                <div className="text-[10px] text-white/35 ml-3">Active</div>
              </button>
            )}

            {loadingHistory && (
              <p className="text-[10px] text-white/30 text-center py-4">Loading…</p>
            )}

            {!loadingHistory && historyChats.length === 0 && (
              <p className="text-[10px] text-white/25 text-center py-6 px-2 leading-relaxed">
                Past chats appear here after sessions end
              </p>
            )}

            {historyChats.map((chat) => {
              if (activeSession && chat.session_key === activeSession.session_key) return null;
              const selected = viewing?.id === chat.id;
              return (
                <button
                  key={chat.id}
                  onClick={() => openChat(chat)}
                  className="w-full text-left px-3 py-2.5 hover:bg-white/5 transition-colors"
                  style={selected
                    ? { background: 'rgba(245,168,0,0.08)', borderLeft: '2px solid #F5A800' }
                    : { borderLeft: '2px solid transparent' }
                  }
                >
                  <div className="text-xs font-medium text-white/80 truncate">{chat.sessionTitle || 'Study Chat'}</div>
                  <div className="text-[10px] text-white/40 truncate mt-0.5">{preview(chat.messages)}</div>
                  <div className="text-[10px] text-white/25 mt-0.5">{relativeDate(chat.updated_at)}</div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Chat or history view */}
        <div className={`flex-1 flex flex-col overflow-hidden min-w-0 ${historyOpen ? 'hidden sm:flex' : 'flex'}`}>
          {viewing ? (
            <HistoryView chat={viewing} onBack={backToActive} />
          ) : (
            <SessionChatPanel />
          )}
        </div>
      </div>
    </div>
  );
}
