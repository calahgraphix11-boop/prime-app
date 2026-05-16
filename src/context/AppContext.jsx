import { createContext, useContext, useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';
import en from '../i18n/en';
import fr from '../i18n/fr';

const AppContext = createContext(null);

export const CHAT_LIMIT = 10;
export const REPORT_LIMIT = 5;
export const NOTE_LIMIT = 5;
export const EXAM_LIMIT = 5;
export const FILE_UPLOAD_LIMIT_TRIAL = 2;
export const FILE_UPLOAD_LIMIT_BASIC = 5;

/*
 * SQL — run once in Supabase SQL Editor:
 * ALTER TABLE daily_usage ADD COLUMN IF NOT EXISTS exam_prep_count integer DEFAULT 0;
 * ALTER TABLE daily_usage ADD COLUMN IF NOT EXISTS file_uploads integer DEFAULT 0;
 * ALTER TABLE study_sessions ADD COLUMN IF NOT EXISTS session_key text;
 * ALTER TABLE study_sessions_log ADD COLUMN IF NOT EXISTS session_key text;
 * ALTER TABLE leaderboard_scores ADD COLUMN IF NOT EXISTS feature_uses integer DEFAULT 0;
 *
 * create table if not exists study_session_chats (
 *   id uuid primary key default gen_random_uuid(),
 *   session_key text not null,
 *   user_id uuid references auth.users(id) on delete cascade not null,
 *   messages jsonb not null default '[]',
 *   created_at timestamptz default now() not null,
 *   updated_at timestamptz default now() not null
 * );
 * alter table study_session_chats enable row level security;
 * create policy "Users can manage own session chats" on study_session_chats
 *   for all using (auth.uid() = user_id);
 * create index on study_session_chats (user_id, session_key);
 */

const today = () => new Date().toISOString().split('T')[0];

const getWeekStart = () => {
  const now = new Date();
  const day = now.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  const monday = new Date(now);
  monday.setDate(now.getDate() + diff);
  return monday.toISOString().split('T')[0];
};


export function AppProvider({ children }) {
  const { user, trialActive, trialExpired, planActive, userPlan } = useAuth();

  const [darkMode, setDarkMode] = useState(() => localStorage.getItem('prime_dark') === 'true');
  const [lang, setLang] = useState(() => localStorage.getItem('prime_lang') || 'en');
  const t = lang === 'fr' ? fr : en;

  const [sessions, setSessions] = useState([]);
  const [reports, setReports] = useState([]);
  const [chatSessions, setChatSessions] = useState([]);
  const [courses, setCourses] = useState([]);
  const [weeklyGoalMinutes, setWeeklyGoalMinutesState] = useState(300);
  const [dailyUsage, setDailyUsage] = useState({ chat_messages: 0, report_rewrites: 0, note_summaries: 0, exam_prep_count: 0, file_uploads: 0 });
  const [dataLoading, setDataLoading] = useState(false);

  // ── Global timer state ────────────────────────────────────
  const [activeSession, setActiveSession] = useState(null);
  const [remaining, setRemaining] = useState(0);
  const [running, setRunning] = useState(false);
  const [pomodoroPhase, setPomodoroPhase] = useState("study");
  const [pomodoroRounds, setPomodoroRounds] = useState(0);
  const [pendingCompletedSession, setPendingCompletedSession] = useState(null);
  const intervalRef = useRef(null);
  const sessionStartTimeRef = useRef(null);
  const sessionKeyRef = useRef(null);
  const sessionChatIdRef = useRef(null);
  const [sessionMessages, setSessionMessages] = useState([]);

  useEffect(() => {
    if (!user) {
      setSessions([]);
      setReports([]);
      setChatSessions([]);
      setCourses([]);
      setWeeklyGoalMinutesState(300);
      setDailyUsage({ chat_messages: 0, report_rewrites: 0, note_summaries: 0, exam_prep_count: 0, file_uploads: 0 });
      clearInterval(intervalRef.current);
      setActiveSession(null);
      setRunning(false);
      setRemaining(0);
      setPomodoroPhase("study");
      setPomodoroRounds(0);
      setPendingCompletedSession(null);
      setSessionMessages([]);
      sessionKeyRef.current = null;
      sessionChatIdRef.current = null;
      return;
    }
    setDataLoading(true);
    Promise.all([
      supabase.from('study_sessions').select('*').eq('user_id', user.id).order('date', { ascending: false }),
      supabase.from('reports').select('*').eq('user_id', user.id).order('date', { ascending: false }),
      supabase.from('chat_sessions').select('*').eq('user_id', user.id).order('date', { ascending: false }),
      supabase.from('courses').select('*').eq('user_id', user.id).order('created_at'),
      supabase.from('user_settings').select('*').eq('user_id', user.id).maybeSingle(),
      supabase.from('daily_usage').select('*').eq('user_id', user.id).eq('date', today()).maybeSingle(),
    ]).then(([{ data: s }, { data: r }, { data: c }, { data: cData }, { data: settings }, { data: usage }]) => {
      setSessions(s || []);
      setReports(r || []);
      setChatSessions(c || []);
      setWeeklyGoalMinutesState(settings?.weekly_goal_minutes || 300);
      setDailyUsage({ chat_messages: usage?.chat_messages || 0, report_rewrites: usage?.report_rewrites || 0, note_summaries: usage?.note_summaries || 0, exam_prep_count: usage?.exam_prep_count || 0, file_uploads: usage?.file_uploads || 0 });

      setCourses(cData || []);
    }).finally(() => setDataLoading(false));
  }, [user?.id]);

  useEffect(() => {
    localStorage.setItem('prime_dark', darkMode);
    document.documentElement.classList.toggle('dark', darkMode);
  }, [darkMode]);

  useEffect(() => {
    localStorage.setItem('prime_lang', lang);
  }, [lang]);

  const toggleLang = () => setLang((l) => (l === 'en' ? 'fr' : 'en'));

  // ── Global timer tick ─────────────────────────────────────
  useEffect(() => {
    clearInterval(intervalRef.current);
    if (!running) return;

    if (remaining > 0) {
      intervalRef.current = setInterval(() => setRemaining((r) => r - 1), 1000);
      return () => clearInterval(intervalRef.current);
    }

    if (!activeSession) return;

    if (activeSession.pomodoroEnabled) {
      if (pomodoroPhase === "study") {
        setPomodoroRounds((r) => r + 1);
        setPomodoroPhase("break");
        setRemaining(5 * 60);
      } else {
        setPomodoroPhase("study");
        setRemaining(25 * 60);
      }
    } else {
      setRunning(false);
      setPendingCompletedSession({
        title: activeSession.title,
        course: activeSession.course,
        duration: activeSession.duration,
        pomodoroEnabled: false,
        session_key: activeSession.session_key,
        startTime: sessionStartTimeRef.current,
        endTime: new Date().toISOString(),
      });
      setActiveSession(null);
    }
  }, [running, remaining, pomodoroPhase, activeSession]);

  // ── Timer controls ────────────────────────────────────────
  const startTimerSession = (sessionData) => {
    sessionStartTimeRef.current = new Date().toISOString();
    sessionKeyRef.current = crypto.randomUUID();
    sessionChatIdRef.current = null;
    setSessionMessages([]);
    setActiveSession({ ...sessionData, session_key: sessionKeyRef.current });
    setRemaining((sessionData.pomodoroEnabled ? 25 : sessionData.duration) * 60);
    setRunning(true);
    setPomodoroPhase("study");
    setPomodoroRounds(0);
  };

  const pauseTimer = () => setRunning(false);
  const resumeTimer = () => setRunning(true);

  const cancelTimer = () => {
    clearInterval(intervalRef.current);
    setActiveSession(null);
    setRunning(false);
    setRemaining(0);
    setPomodoroPhase("study");
    setPomodoroRounds(0);
    setSessionMessages([]);
    sessionKeyRef.current = null;
    sessionChatIdRef.current = null;
  };

  const endTimerSession = () => {
    clearInterval(intervalRef.current);
    setRunning(false);
    let totalMinutes = pomodoroRounds * 25;
    if (pomodoroPhase === "study") {
      totalMinutes += Math.floor((25 * 60 - remaining) / 60);
    }
    const snap = { title: activeSession.title, course: activeSession.course, session_key: activeSession.session_key };
    setActiveSession(null);
    setPomodoroPhase("study");
    setPomodoroRounds(0);
    setSessionMessages([]);
    sessionKeyRef.current = null;
    sessionChatIdRef.current = null;
    if (totalMinutes > 0) {
      setPendingCompletedSession({
        ...snap,
        duration: totalMinutes,
        pomodoroEnabled: true,
        startTime: sessionStartTimeRef.current,
        endTime: new Date().toISOString(),
      });
    }
  };

  // ── Sessions ──────────────────────────────────────────────
  const addSession = async (session) => {
    const { data, error } = await supabase
      .from('study_sessions')
      .insert({
        user_id: user.id,
        title: session.title,
        subject: session.course || session.subject || '',
        duration: session.duration,
        date: new Date().toISOString(),
        status: session.status || 'completed',
        notes: session.notes || null,
        session_key: session.session_key || null,
      })
      .select()
      .single();
    if (!error && data) setSessions((prev) => [data, ...prev]);
  };

  const deleteSession = async (id) => {
    const { error } = await supabase.from('study_sessions').delete().eq('id', id);
    if (!error) setSessions((prev) => prev.filter((s) => s.id !== id));
  };

  const logSessionAnalytics = async (session) => {
    if (!user) return;
    await supabase.from('study_sessions_log').insert({
      user_id: user.id,
      session_title: session.title,
      subject: session.course || session.subject || '',
      start_time: session.startTime,
      end_time: session.endTime,
      duration_minutes: session.duration,
      pomodoro_enabled: session.pomodoroEnabled || false,
      session_key: session.session_key || null,
    });
  };

  const upsertLeaderboardScore = async (durationMinutes, currentStreak) => {
    if (!user || !durationMinutes) return;
    const weekStart = getWeekStart();
    const { data: existing } = await supabase
      .from('leaderboard_scores')
      .select('id, study_minutes, sessions_completed')
      .eq('user_id', user.id)
      .eq('week_start', weekStart)
      .maybeSingle();
    if (existing) {
      await supabase.from('leaderboard_scores').update({
        study_minutes: existing.study_minutes + durationMinutes,
        sessions_completed: existing.sessions_completed + 1,
        streak: currentStreak,
        updated_at: new Date().toISOString(),
      }).eq('id', existing.id);
    } else {
      await supabase.from('leaderboard_scores').insert({
        user_id: user.id,
        week_start: weekStart,
        study_minutes: durationMinutes,
        sessions_completed: 1,
        streak: currentStreak,
      });
    }
  };

  const saveCompletedSession = async (notes) => {
    if (!pendingCompletedSession) return;
    const s = pendingCompletedSession;
    setPendingCompletedSession(null);
    await addSession({ ...s, notes, status: 'completed' });
    await logSessionAnalytics(s);
    await upsertLeaderboardScore(s.duration, streak);
  };

  const dismissCompletedSession = () => setPendingCompletedSession(null);

  // ── Reports ───────────────────────────────────────────────
  const addReport = async (report) => {
    const { data, error } = await supabase
      .from('reports')
      .insert({
        user_id: user.id,
        title: report.title,
        tone: report.tone,
        preview: report.preview,
        content: report.content || null,
        date: new Date().toISOString(),
      })
      .select()
      .single();
    if (!error && data) setReports((prev) => [data, ...prev]);
  };

  // ── Chat sessions ─────────────────────────────────────────
  const createChatSession = async () => {
    const { data, error } = await supabase
      .from('chat_sessions')
      .insert({ user_id: user.id, label: 'New Chat', messages: [], date: new Date().toISOString() })
      .select()
      .single();
    if (!error && data) {
      setChatSessions((prev) => [data, ...prev]);
      return data;
    }
    return null;
  };

  const updateChatSession = async (id, messages, label) => {
    const { error } = await supabase.from('chat_sessions').update({ messages, label }).eq('id', id);
    if (!error) {
      setChatSessions((prev) => prev.map((c) => (c.id === id ? { ...c, messages, label } : c)));
    }
  };

  // ── Courses ───────────────────────────────────────────────
  const addCourse = async (name) => {
    const { data, error } = await supabase
      .from('courses')
      .insert({ user_id: user.id, name })
      .select()
      .single();
    if (!error && data) setCourses((prev) => [...prev, data]);
  };

  const renameCourse = async (id, name) => {
    const { error } = await supabase.from('courses').update({ name }).eq('id', id);
    if (!error) setCourses((prev) => prev.map((c) => (c.id === id ? { ...c, name } : c)));
  };

  const deleteCourse = async (id) => {
    const { error } = await supabase.from('courses').delete().eq('id', id);
    if (!error) setCourses((prev) => prev.filter((c) => c.id !== id));
  };

  // ── Session chat ──────────────────────────────────────────
  const updateSessionMessages = async (messages) => {
    if (!user || !sessionKeyRef.current) return;
    setSessionMessages(messages);
    if (sessionChatIdRef.current) {
      await supabase.from('study_session_chats')
        .update({ messages, updated_at: new Date().toISOString() })
        .eq('id', sessionChatIdRef.current);
    } else {
      const { data } = await supabase.from('study_session_chats')
        .insert({ user_id: user.id, session_key: sessionKeyRef.current, messages })
        .select('id')
        .single();
      if (data) sessionChatIdRef.current = data.id;
    }
  };

  // ── Weekly goal ───────────────────────────────────────────
  const setWeeklyGoal = async (minutes) => {
    await supabase
      .from('user_settings')
      .upsert({ user_id: user.id, weekly_goal_minutes: minutes }, { onConflict: 'user_id' });
    setWeeklyGoalMinutesState(minutes);
  };

  // ── Daily usage ───────────────────────────────────────────
  const incrementLeaderboardFeatureUse = async () => {
    if (!user) return;
    const weekStart = getWeekStart();
    const { data: existing } = await supabase
      .from('leaderboard_scores')
      .select('id, feature_uses')
      .eq('user_id', user.id)
      .eq('week_start', weekStart)
      .maybeSingle();
    if (existing) {
      await supabase.from('leaderboard_scores')
        .update({ feature_uses: (existing.feature_uses || 0) + 1, updated_at: new Date().toISOString() })
        .eq('id', existing.id);
    } else {
      await supabase.from('leaderboard_scores').insert({
        user_id: user.id,
        week_start: weekStart,
        study_minutes: 0,
        sessions_completed: 0,
        streak,
        feature_uses: 1,
      });
    }
  };

  const incrementUsage = async (field) => {
    const newVal = (dailyUsage[field] || 0) + 1;
    setDailyUsage((prev) => ({ ...prev, [field]: newVal }));
    const { data: existing } = await supabase
      .from('daily_usage')
      .select('id')
      .eq('user_id', user.id)
      .eq('date', today())
      .maybeSingle();
    if (existing) {
      await supabase.from('daily_usage').update({ [field]: newVal }).eq('id', existing.id);
    } else {
      await supabase.from('daily_usage').insert({ user_id: user.id, date: today(), [field]: 1 });
    }
    incrementLeaderboardFeatureUse();
  };

  const incrementChat = () => incrementUsage('chat_messages');
  const incrementRewrite = () => incrementUsage('report_rewrites');
  const incrementSummary = () => incrementUsage('note_summaries');
  const incrementExam = () => incrementUsage('exam_prep_count');
  const incrementFileUpload = () => incrementUsage('file_uploads');
  const chatRemaining = (trialActive || planActive) ? 999 : Math.max(0, CHAT_LIMIT - dailyUsage.chat_messages);
  const rewriteRemaining = (trialActive || planActive) ? 999 : Math.max(0, REPORT_LIMIT - dailyUsage.report_rewrites);
  const summaryRemaining = (trialActive || planActive) ? 999 : Math.max(0, NOTE_LIMIT - dailyUsage.note_summaries);
  const examRemaining = (trialActive || planActive) ? 999 : Math.max(0, EXAM_LIMIT - dailyUsage.exam_prep_count);
  const fileUploadsRemaining = planActive
    ? (userPlan === 'pro' ? 999 : Math.max(0, FILE_UPLOAD_LIMIT_BASIC - dailyUsage.file_uploads))
    : trialActive
    ? Math.max(0, FILE_UPLOAD_LIMIT_TRIAL - dailyUsage.file_uploads)
    : 0;

  // ── Computed ──────────────────────────────────────────────
  const todayMinutes = sessions
    .filter((s) => new Date(s.date).toDateString() === new Date().toDateString())
    .reduce((sum, s) => sum + s.duration, 0);

  const weekMinutes = (() => {
    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    startOfWeek.setHours(0, 0, 0, 0);
    return sessions
      .filter((s) => new Date(s.date) >= startOfWeek)
      .reduce((sum, s) => sum + s.duration, 0);
  })();

  const monthMinutes = (() => {
    const now = new Date();
    return sessions
      .filter((s) => {
        const d = new Date(s.date);
        return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
      })
      .reduce((sum, s) => sum + s.duration, 0);
  })();

  const weeklyData = (() => {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const now = new Date();
    return days.map((day, i) => {
      const d = new Date(now);
      const dayOfWeek = now.getDay();
      const diff = i - (dayOfWeek === 0 ? 6 : dayOfWeek - 1);
      d.setDate(now.getDate() + diff);
      const mins = sessions
        .filter((s) => new Date(s.date).toDateString() === d.toDateString())
        .reduce((sum, s) => sum + s.duration, 0);
      return { day, minutes: mins };
    });
  })();

  const streak = (() => {
    if (sessions.length === 0) return 0;
    const sessionDates = new Set(sessions.map((s) => new Date(s.date).toDateString()));
    const today = new Date();
    let check = new Date(today);
    // Preserve yesterday's streak if user hasn't studied today yet
    if (!sessionDates.has(check.toDateString())) {
      check.setDate(check.getDate() - 1);
      if (!sessionDates.has(check.toDateString())) return 0;
    }
    let count = 0;
    while (sessionDates.has(check.toDateString())) {
      count++;
      check.setDate(check.getDate() - 1);
    }
    return count;
  })();

  return (
    <AppContext.Provider value={{
      darkMode, setDarkMode,
      lang, toggleLang, t,
      sessions, addSession, deleteSession,
      reports, addReport,
      chatSessions, createChatSession, updateChatSession,
      courses, addCourse, renameCourse, deleteCourse,
      weeklyGoalMinutes, setWeeklyGoal,
      streak,
      dataLoading,
      chatRemaining, rewriteRemaining, summaryRemaining, examRemaining, incrementChat, incrementRewrite, incrementSummary, incrementExam,
      fileUploadsRemaining, incrementFileUpload,
      trialActive, trialExpired, planActive, userPlan,
      todayMinutes, weekMinutes, monthMinutes,
      weeklyData,
      activeSession, remaining, running, pomodoroPhase, pomodoroRounds,
      startTimerSession, pauseTimer, resumeTimer, cancelTimer, endTimerSession,
      sessionMessages, updateSessionMessages,
      pendingCompletedSession, saveCompletedSession, dismissCompletedSession,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  return useContext(AppContext);
}
