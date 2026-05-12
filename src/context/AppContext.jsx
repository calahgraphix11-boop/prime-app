import { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';
import en from '../i18n/en';
import fr from '../i18n/fr';

const AppContext = createContext(null);

export const CHAT_LIMIT = 10;
export const REPORT_LIMIT = 5;

const today = () => new Date().toISOString().split('T')[0];

const DEFAULT_COURSES = [
  'Mathematics', 'French', 'Biology', 'Physics',
  'History', 'Chemistry', 'English', 'Computer Science',
];

export function AppProvider({ children }) {
  const { user } = useAuth();

  const [darkMode, setDarkMode] = useState(() => localStorage.getItem('prime_dark') === 'true');
  const [lang, setLang] = useState(() => localStorage.getItem('prime_lang') || 'en');
  const t = lang === 'fr' ? fr : en;

  const [sessions, setSessions] = useState([]);
  const [reports, setReports] = useState([]);
  const [chatSessions, setChatSessions] = useState([]);
  const [courses, setCourses] = useState([]);
  const [weeklyGoalMinutes, setWeeklyGoalMinutesState] = useState(300);
  const [dailyUsage, setDailyUsage] = useState({ chat_messages: 0, report_rewrites: 0 });
  const [dataLoading, setDataLoading] = useState(false);

  useEffect(() => {
    if (!user) {
      setSessions([]);
      setReports([]);
      setChatSessions([]);
      setCourses([]);
      setWeeklyGoalMinutesState(300);
      setDailyUsage({ chat_messages: 0, report_rewrites: 0 });
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
      setDailyUsage({ chat_messages: usage?.chat_messages || 0, report_rewrites: usage?.report_rewrites || 0 });

      const coursesArr = cData || [];
      if (coursesArr.length === 0) {
        supabase
          .from('courses')
          .insert(DEFAULT_COURSES.map((name) => ({ user_id: user.id, name })))
          .select()
          .then(({ data: seeded }) => { if (seeded) setCourses(seeded); });
      } else {
        setCourses(coursesArr);
      }
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
      })
      .select()
      .single();
    if (!error && data) setSessions((prev) => [data, ...prev]);
  };

  const deleteSession = async (id) => {
    const { error } = await supabase.from('study_sessions').delete().eq('id', id);
    if (!error) setSessions((prev) => prev.filter((s) => s.id !== id));
  };

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

  // ── Weekly goal ───────────────────────────────────────────
  const setWeeklyGoal = async (minutes) => {
    await supabase
      .from('user_settings')
      .upsert({ user_id: user.id, weekly_goal_minutes: minutes }, { onConflict: 'user_id' });
    setWeeklyGoalMinutesState(minutes);
  };

  // ── Daily usage ───────────────────────────────────────────
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
  };

  const incrementChat = () => incrementUsage('chat_messages');
  const incrementRewrite = () => incrementUsage('report_rewrites');
  const chatRemaining = Math.max(0, CHAT_LIMIT - dailyUsage.chat_messages);
  const rewriteRemaining = Math.max(0, REPORT_LIMIT - dailyUsage.report_rewrites);

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
      chatRemaining, rewriteRemaining, incrementChat, incrementRewrite,
      todayMinutes, weekMinutes, monthMinutes,
      weeklyData,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  return useContext(AppContext);
}
