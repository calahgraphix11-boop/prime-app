import { useState, useEffect } from 'react';
import { Menu } from 'lucide-react';
import Sidebar from './Sidebar';
import ChatBubble from './ChatBubble';
import { useApp } from '../context/AppContext';

export default function Layout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sessionNote, setSessionNote] = useState("");

  const {
    activeSession, remaining, running,
    pendingCompletedSession, saveCompletedSession,
    t,
  } = useApp();

  useEffect(() => {
    if (pendingCompletedSession) setSessionNote("");
  }, [pendingCompletedSession]);

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
          </div>
        </header>

        <main className="px-4 pb-20 max-w-2xl mx-auto pt-2">
          {children}
        </main>
      </div>

      <ChatBubble />

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
