/*
  -- Run this in Supabase SQL Editor to create the notifications table:

  create table if not exists notifications (
    id uuid primary key default gen_random_uuid(),
    user_id uuid references auth.users(id) on delete cascade not null,
    message text not null,
    is_read boolean default false not null,
    created_at timestamptz default now() not null
  );
  alter table notifications enable row level security;
  create policy "Users can read own notifications" on notifications
    for select using (auth.uid() = user_id);
  create policy "Anyone can insert notifications" on notifications
    for insert with check (true);
  create policy "Users can update own notifications" on notifications
    for update using (auth.uid() = user_id);
*/
import { useState, useEffect, useRef } from 'react';
import { Menu, Bell } from 'lucide-react';
import Sidebar from './Sidebar';
import ChatBubble from './ChatBubble';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';

export default function Layout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sessionNote, setSessionNote] = useState("");
  const [notifications, setNotifications] = useState([]);
  const [bellOpen, setBellOpen] = useState(false);
  const bellRef = useRef(null);

  const {
    activeSession, remaining, running,
    pendingCompletedSession, saveCompletedSession,
    t,
  } = useApp();
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;
    supabase.from('profiles').update({ is_active: !!activeSession }).eq('id', user.id);
  }, [activeSession, user?.id]);

  useEffect(() => {
    if (pendingCompletedSession) setSessionNote("");
  }, [pendingCompletedSession]);

  useEffect(() => {
    if (!user) return;
    supabase
      .from('notifications')
      .select('id, message, is_read, created_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(20)
      .then(({ data }) => setNotifications(data || []));
  }, [user?.id]);

  // Close dropdown on outside click
  useEffect(() => {
    if (!bellOpen) return;
    const handler = (e) => {
      if (bellRef.current && !bellRef.current.contains(e.target)) setBellOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [bellOpen]);

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  const handleBellClick = async () => {
    const opening = !bellOpen;
    setBellOpen(opening);
    if (opening && unreadCount > 0) {
      await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('user_id', user.id)
        .eq('is_read', false);
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    }
  };

  const formatTime = (iso) => {
    const d = new Date(iso);
    const now = new Date();
    const diffMs = now - d;
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 1) return 'just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    return d.toLocaleDateString();
  };

  const mins = Math.floor(remaining / 60).toString().padStart(2, "0");
  const secs = (remaining % 60).toString().padStart(2, "0");

  return (
    <div className="app-bg">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="min-h-screen">
        <header
          className="sticky top-0 z-20 px-4 py-4"
          style={{
            background: 'rgba(0, 20, 10, 0.4)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            borderBottom: '1px solid rgba(255,255,255,0.08)',
          }}
        >
          <div className="flex items-center justify-between">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 rounded-lg transition-colors"
              style={{ background: 'rgba(255,255,255,0.1)' }}
            >
              <Menu size={20} className="text-white" />
            </button>

            {activeSession && (
              <div
                className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs"
                style={{ background: 'rgba(245,168,0,0.12)', border: '1px solid rgba(245,168,0,0.3)' }}
              >
                <div
                  className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${running ? 'animate-pulse' : ''}`}
                  style={{ background: running ? '#F5A800' : 'rgba(255,255,255,0.3)' }}
                />
                <span className="font-mono font-medium" style={{ color: '#F5A800' }}>{mins}:{secs}</span>
                <span className="text-white/50 max-w-[100px] truncate hidden sm:inline">{activeSession.title}</span>
              </div>
            )}

            {/* Bell */}
            <div ref={bellRef} className="relative">
              <button
                onClick={handleBellClick}
                className="relative p-2 rounded-lg transition-colors"
                style={{ background: 'rgba(255,255,255,0.1)' }}
              >
                <Bell size={20} className="text-white" />
                {unreadCount > 0 && (
                  <span
                    className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full"
                    style={{ background: '#ef4444', boxShadow: '0 0 0 2px rgba(0,20,10,0.8)' }}
                  />
                )}
              </button>

              {bellOpen && (
                <div
                  className="absolute right-0 top-full mt-2 w-72 rounded-2xl z-50 overflow-hidden"
                  style={{
                    background: 'rgba(0, 22, 12, 0.97)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    backdropFilter: 'blur(20px)',
                    WebkitBackdropFilter: 'blur(20px)',
                    boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
                  }}
                >
                  <div
                    className="px-4 py-3"
                    style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}
                  >
                    <p className="text-sm font-semibold text-white">Notifications</p>
                  </div>

                  <div className="max-h-72 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <p className="text-xs text-white/30 text-center py-8">No notifications yet</p>
                    ) : (
                      notifications.map((n) => (
                        <div
                          key={n.id}
                          className="px-4 py-3 flex items-start gap-3"
                          style={{
                            borderBottom: '1px solid rgba(255,255,255,0.04)',
                            background: n.is_read ? 'transparent' : 'rgba(245,168,0,0.05)',
                          }}
                        >
                          <div
                            className="w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0"
                            style={{ background: n.is_read ? 'rgba(255,255,255,0.1)' : '#F5A800' }}
                          />
                          <div className="min-w-0">
                            <p className="text-xs text-white/80 leading-relaxed">{n.message}</p>
                            <p className="text-xs text-white/30 mt-0.5">{formatTime(n.created_at)}</p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        <main className="px-4 pb-20 max-w-2xl mx-auto pt-2">
          {children}
        </main>
      </div>

      {!activeSession && <ChatBubble />}

      {/* Global session-complete notes modal */}
      {pendingCompletedSession && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" style={{ backdropFilter: 'blur(4px)' }}>
          <div className="glass-elevated rounded-2xl p-6 max-w-sm w-full">
            <div className="text-center mb-5">
              <div className="text-4xl mb-2">🎉</div>
              <h3 className="text-lg font-bold text-white">Session Complete!</h3>
              <p className="text-sm text-white/50 mt-1">
                {pendingCompletedSession.duration} min · {pendingCompletedSession.course}
              </p>
            </div>
            <label className="text-sm font-medium text-white/75">{t.sessionNotes}</label>
            <textarea
              value={sessionNote}
              onChange={(e) => setSessionNote(e.target.value)}
              placeholder={t.addNoteOptional}
              rows={3}
              autoFocus
              className="mt-1.5 w-full px-3 py-2.5 rounded-xl glass-input text-sm resize-none"
            />
            <button
              onClick={() => saveCompletedSession(sessionNote)}
              className="w-full mt-4 py-2.5 rounded-xl text-sm font-semibold btn-gold"
            >
              {t.saveSession}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
