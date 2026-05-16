import { useState, useRef, useEffect } from "react";
import { Plus, Trash2, BookOpen, Clock, ChevronDown, Timer, Coffee, MessageCircle, X } from "lucide-react";
import { useApp } from "../context/AppContext";
import { useAuth } from "../context/AuthContext";
import { generateContent, DEFAULT_MODEL } from "../lib/gemini";
import SessionChatPanel from "../components/SessionChatPanel";
import { supabase } from "../lib/supabase";

function formatDate(iso) {
  const d = new Date(iso);
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric" }) + ", " +
    d.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });
}

function CircularTimer({ totalSeconds, remaining, running, phase }) {
  const r = 54;
  const circ = 2 * Math.PI * r;
  const progress = totalSeconds > 0 ? remaining / totalSeconds : 0;
  const offset = circ * (1 - progress);
  const mins = Math.floor(remaining / 60).toString().padStart(2, "0");
  const secs = (remaining % 60).toString().padStart(2, "0");
  const isBreak = phase === "break";
  return (
    <div className="flex items-center justify-center py-6">
      <div className="relative w-40 h-40">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
          <circle cx="60" cy="60" r={r} fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth="8" />
          <circle
            cx="60" cy="60" r={r} fill="none"
            stroke={isBreak ? "#F59E0B" : "#F5A800"}
            strokeWidth="8"
            strokeDasharray={circ}
            strokeDashoffset={offset}
            strokeLinecap="round"
            className="transition-all duration-1000"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-3xl font-bold text-white tabular-nums">{mins}:{secs}</span>
          <span className="text-xs text-white/45 mt-0.5">
            {!running ? "paused" : isBreak ? "break" : "studying"}
          </span>
        </div>
      </div>
    </div>
  );
}

function SessionHistoryModal({ session, onClose }) {
  const [messages, setMessages] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!session?.session_key) {
      setMessages([]);
      setLoading(false);
      return;
    }
    supabase
      .from('study_session_chats')
      .select('messages')
      .eq('session_key', session.session_key)
      .maybeSingle()
      .then(({ data }) => {
        setMessages(data?.messages || []);
        setLoading(false);
      });
  }, [session?.session_key]);

  return (
    <div
      className="fixed inset-0 z-[80] flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(6px)' }}
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-lg rounded-2xl flex flex-col"
        style={{
          maxHeight: '80vh',
          background: 'rgba(0,22,10,0.97)',
          border: '1px solid rgba(245,168,0,0.25)',
          boxShadow: '0 24px 60px rgba(0,0,0,0.6)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          className="flex items-start justify-between px-5 py-4 flex-shrink-0"
          style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}
        >
          <div>
            <div className="text-base font-semibold text-white leading-tight">{session.title}</div>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 mt-1">
              <span className="text-xs text-white/40">{session.subject}</span>
              <span className="flex items-center gap-1 text-xs text-white/40"><Clock size={10} /> {session.duration} min</span>
              <span className="text-xs text-white/30">{formatDate(session.date)}</span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="ml-3 flex-shrink-0 p-1.5 rounded-lg text-white/40 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X size={15} />
          </button>
        </div>

        {/* Chat history */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
          <div className="text-xs font-semibold text-white/35 uppercase tracking-wider mb-3">Chat History</div>
          {loading ? (
            <p className="text-sm text-white/40 text-center py-6">Loading…</p>
          ) : !messages || messages.length === 0 ? (
            <p className="text-sm text-white/40 text-center py-6">No chat history for this session.</p>
          ) : (
            messages.map((msg, i) => (
              <div
                key={i}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className="max-w-[80%] px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed"
                  style={msg.role === 'user'
                    ? { background: '#F5A800', color: '#1a0c00' }
                    : { background: 'rgba(0,77,46,0.5)', color: 'rgba(255,255,255,0.85)', border: '1px solid rgba(0,77,46,0.8)' }
                  }
                >
                  {msg.content || msg.text || ''}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

const DURATIONS = [15, 25, 45, 60];

export default function StudySessions() {
  const {
    t, sessions, deleteSession, courses,
    activeSession, remaining, running, pomodoroPhase, pomodoroRounds,
    startTimerSession, pauseTimer, resumeTimer, cancelTimer, endTimerSession,
  } = useApp();
  const { profile } = useAuth();

  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [course, setCourse] = useState("");
  const [duration, setDuration] = useState(25);
  const [pomodoroEnabled, setPomodoroEnabled] = useState(false);

  const [chatOpen, setChatOpen] = useState(false);
  const [selectedSession, setSelectedSession] = useState(null);
  const [motivation, setMotivation] = useState("");
  const [motivationVisible, setMotivationVisible] = useState(false);
  const motivationTimerRef = useRef(null);

  useEffect(() => {
    if (!activeSession) setChatOpen(false);
  }, [activeSession]);

  const dismissMotivation = () => {
    clearTimeout(motivationTimerRef.current);
    setMotivationVisible(false);
    setTimeout(() => setMotivation(""), 500);
  };

  const startSession = () => {
    if (!title.trim()) return;
    const selectedCourse = course || courses[0]?.name || "General";
    startTimerSession({ title: title.trim(), course: selectedCourse, duration: pomodoroEnabled ? 25 : duration, pomodoroEnabled });
    setShowForm(false);

    const name = profile?.full_name || profile?.username || "you";
    const sessionTitle = title.trim();
    generateContent(
      `Generate a short, funny but locked-in motivational message for ${name} who is about to study ${sessionTitle}. Maximum 2 lines. Be creative and different every time. No hashtags, no emojis.`,
      DEFAULT_MODEL
    ).then((msg) => {
      setMotivation(msg);
      setMotivationVisible(true);
      motivationTimerRef.current = setTimeout(() => {
        setMotivationVisible(false);
        setTimeout(() => setMotivation(""), 500);
      }, 6000);
    }).catch(() => {});

    setTitle("");
  };

  return (
    <div className="space-y-5 pt-2">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">{t.studySessions}</h1>
          <p className="text-sm text-white/50 mt-0.5">{t.studyTimer}</p>
        </div>
        {!activeSession && (
          <button
            onClick={() => { setShowForm(true); if (courses.length > 0 && !course) setCourse(courses[0].name); }}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-semibold btn-gold shadow-md"
          >
            <Plus size={16} />{t.newSession}
          </button>
        )}
      </div>

      {/* Session form */}
      {showForm && (
        <div className="glass-elevated rounded-2xl p-5 space-y-4">
          <div>
            <label className="text-xs font-semibold text-white/50 uppercase tracking-wider">{t.sessionTitle}</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Calculus Review"
              className="mt-1.5 w-full px-3 py-2.5 rounded-xl glass-input text-sm"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-white/50 uppercase tracking-wider">{t.course}</label>
            <div className="mt-1.5 relative">
              <select
                value={course}
                onChange={(e) => setCourse(e.target.value)}
                className="w-full appearance-none px-3 py-2.5 rounded-xl glass-input text-sm"
              >
                {courses.length === 0
                  ? <option value="">No courses — add in Settings</option>
                  : courses.map((c) => <option key={c.id} value={c.name}>{c.name}</option>)
                }
              </select>
              <ChevronDown size={14} className="absolute right-3 top-3 text-white/40 pointer-events-none" />
            </div>
          </div>

          {/* Pomodoro toggle */}
          <div className="flex items-center justify-between p-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}>
            <div className="flex items-center gap-2">
              <Timer size={16} className="text-white/50" />
              <div>
                <div className="text-sm font-medium text-white/85">{t.pomodoroMode}</div>
                <div className="text-xs text-white/40">25 min study · 5 min break</div>
              </div>
            </div>
            <button
              onClick={() => setPomodoroEnabled((p) => !p)}
              className="relative w-11 h-6 rounded-full transition-colors"
              style={{ background: pomodoroEnabled ? '#F5A800' : 'rgba(255,255,255,0.15)' }}
              aria-label="Toggle Pomodoro"
            >
              <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${pomodoroEnabled ? "translate-x-5" : ""}`} />
            </button>
          </div>

          {!pomodoroEnabled && (
            <div>
              <label className="text-xs font-semibold text-white/50 uppercase tracking-wider">{t.duration}</label>
              <div className="mt-1.5 flex gap-2">
                {DURATIONS.map((d) => (
                  <button
                    key={d}
                    onClick={() => setDuration(d)}
                    className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-all ${duration === d ? "btn-gold" : "btn-ghost"}`}
                  >
                    {d}m
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="flex gap-3 pt-1">
            <button
              onClick={startSession}
              disabled={!title.trim()}
              className="flex-1 py-2.5 rounded-xl text-sm font-semibold btn-gold"
            >
              {t.startSession}
            </button>
            <button
              onClick={() => setShowForm(false)}
              className="flex-1 py-2.5 rounded-xl text-sm font-medium btn-ghost"
            >
              {t.cancelSession}
            </button>
          </div>
        </div>
      )}

      {/* Active session */}
      {activeSession && (
        <div className="glass-elevated rounded-2xl p-5 text-center">
          <div className="text-base font-semibold text-white">{activeSession.title}</div>
          <div className="text-sm text-white/50 mt-0.5">{activeSession.course}</div>

          {activeSession.pomodoroEnabled && (
            <div className="flex items-center justify-center gap-3 mt-3">
              <span
                className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold transition-colors"
                style={pomodoroPhase === "study"
                  ? { background: '#F5A800', color: '#1a0c00' }
                  : { background: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.4)' }
                }
              >
                <BookOpen size={11} /> {t.studyPhase}
              </span>
              <span
                className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold transition-colors"
                style={pomodoroPhase === "break"
                  ? { background: '#F59E0B', color: '#1a0800' }
                  : { background: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.4)' }
                }
              >
                <Coffee size={11} /> {t.breakPhase}
              </span>
              <span className="text-xs text-white/35">
                Round {pomodoroRounds + (pomodoroPhase === "study" ? 1 : 0)}
              </span>
            </div>
          )}

          <CircularTimer
            totalSeconds={activeSession.pomodoroEnabled
              ? (pomodoroPhase === "study" ? 25 * 60 : 5 * 60)
              : activeSession.duration * 60}
            remaining={remaining}
            running={running}
            phase={pomodoroPhase}
          />

          {activeSession.pomodoroEnabled ? (
            /* Pomodoro: Pause/Resume + End Session — unchanged */
            <div className="flex gap-3">
              <button
                onClick={() => running ? pauseTimer() : resumeTimer()}
                className="flex-1 py-2.5 rounded-xl text-sm font-semibold btn-gold"
              >
                {running ? t.pause : t.resume}
              </button>
              <button
                onClick={endTimerSession}
                className="flex-1 py-2.5 rounded-xl text-sm font-medium btn-ghost"
              >
                {t.endSession}
              </button>
            </div>
          ) : (
            <>
              {/* Desktop: Pause/Resume + Cancel (unchanged) */}
              <div className="hidden sm:flex gap-3">
                <button
                  onClick={() => running ? pauseTimer() : resumeTimer()}
                  className="flex-1 py-2.5 rounded-xl text-sm font-semibold btn-gold"
                >
                  {running ? t.pause : t.resume}
                </button>
                <button
                  onClick={cancelTimer}
                  className="flex-1 py-2.5 rounded-xl text-sm font-medium btn-ghost"
                >
                  {t.cancelSession}
                </button>
              </div>
              {/* Mobile: Pause/Resume + End Session on top, Cancel below */}
              <div className="flex flex-col gap-2 sm:hidden">
                <div className="flex gap-3">
                  <button
                    onClick={() => running ? pauseTimer() : resumeTimer()}
                    className="flex-1 py-2.5 rounded-xl text-sm font-semibold btn-gold"
                  >
                    {running ? t.pause : t.resume}
                  </button>
                  <button
                    onClick={endTimerSession}
                    className="flex-1 py-2.5 rounded-xl text-sm font-semibold btn-gold"
                  >
                    {t.endSession}
                  </button>
                </div>
                <button
                  onClick={cancelTimer}
                  className="w-full py-2 rounded-xl text-xs font-medium btn-ghost"
                >
                  {t.cancelSession}
                </button>
              </div>
            </>
          )}
        </div>
      )}

      {/* Session history */}
      <div>
        <h2 className="text-base font-semibold text-white mb-4">{t.sessionHistory}</h2>
        <div className="space-y-3">
          {sessions.length === 0 ? (
            <p className="text-sm text-white/35 text-center py-8">No sessions yet</p>
          ) : (
            sessions.map((s) => (
              <div
                key={s.id}
                className="flex items-start gap-3 p-4 rounded-2xl glass cursor-pointer hover:bg-white/5 transition-colors"
                onClick={() => setSelectedSession(s)}
              >
                <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5" style={{ background: 'rgba(167,139,250,0.2)' }}>
                  <BookOpen size={16} style={{ color: '#a78bfa' }} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-white truncate">{s.title}</div>
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 mt-0.5">
                    <span className="text-xs text-white/40">{s.subject}</span>
                    <span className="flex items-center gap-1 text-xs text-white/40"><Clock size={10} /> {s.duration} {t.min}</span>
                    <span className="text-xs text-white/30 hidden sm:inline">{formatDate(s.date)}</span>
                  </div>
                  {s.notes && (
                    <div className="text-xs text-white/40 mt-1.5 italic">"{s.notes}"</div>
                  )}
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className="text-xs font-medium px-2.5 py-1 rounded-full" style={{ background: 'rgba(52,211,153,0.18)', color: '#34d399', border: '1px solid rgba(52,211,153,0.3)' }}>
                    {t.completed}
                  </span>
                  <button
                    onClick={(e) => { e.stopPropagation(); deleteSession(s.id); }}
                    className="p-1.5 rounded-lg transition-colors hover:bg-white/10"
                  >
                    <Trash2 size={14} className="text-white/30" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Motivational toast */}
      {motivation && (
        <div
          className="fixed top-3 left-1/2 z-50 max-w-xs w-full px-3"
          style={{ transform: 'translateX(-50%)', transition: 'opacity 500ms ease', opacity: motivationVisible ? 1 : 0 }}
        >
          <div
            className="flex items-start gap-2 px-3 py-2 rounded-xl"
            style={{ background: 'rgba(0,18,8,0.92)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', border: '1px solid rgba(245,168,0,0.35)', boxShadow: '0 8px 32px rgba(0,0,0,0.4)' }}
          >
            <p className="flex-1 text-xs text-white/90 leading-snug">{motivation}</p>
            <button onClick={dismissMotivation} className="flex-shrink-0 text-white/35 hover:text-white/70 transition-colors">
              <X size={12} />
            </button>
          </div>
        </div>
      )}

      {/* StudyPal FAB — only visible during an active session, above ChatBubble (z-50) */}
      {activeSession && <button
        onClick={() => setChatOpen((o) => !o)}
        className="fixed bottom-6 right-6 z-[60] w-12 h-12 rounded-full shadow-lg flex items-center justify-center transition-all"
        style={chatOpen
          ? { background: 'rgba(245,168,0,0.15)', border: '1.5px solid #F5A800' }
          : { background: '#F5A800', border: 'none' }}
        aria-label="Toggle StudyPal"
      >
        {chatOpen
          ? <X size={18} style={{ color: '#F5A800' }} />
          : <MessageCircle size={18} style={{ color: '#1a0c00' }} />}
      </button>}

      {/* Session history modal */}
      {selectedSession && (
        <SessionHistoryModal session={selectedSession} onClose={() => setSelectedSession(null)} />
      )}

      {/* StudyPal slide-in panel */}
      {chatOpen && (
        <div
          className="fixed top-0 right-0 bottom-0 z-[70] flex flex-col"
          style={{
            width: 'min(420px, 100vw)',
            background: 'rgba(0, 18, 8, 0.97)',
            backdropFilter: 'blur(30px)',
            WebkitBackdropFilter: 'blur(30px)',
            borderLeft: '1px solid rgba(255,255,255,0.08)',
            overflow: 'hidden',
          }}
        >
          <div
            className="flex items-center justify-between px-4 py-3 flex-shrink-0"
            style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}
          >
            <div className="flex items-center gap-2">
              <MessageCircle size={15} style={{ color: '#F5A800' }} />
              <span className="text-sm font-semibold text-white">StudyPal</span>
            </div>
            <button
              onClick={() => setChatOpen(false)}
              className="p-1.5 rounded-lg text-white/40 hover:text-white hover:bg-white/10 transition-colors"
            >
              <X size={15} />
            </button>
          </div>
          <div className="flex-1 overflow-hidden">
            <SessionChatPanel />
          </div>
        </div>
      )}
    </div>
  );
}
