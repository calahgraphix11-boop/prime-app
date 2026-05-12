import { Clock, TrendingUp, FileText, MessageCircle, BookOpen, Flame } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip } from "recharts";
import { useApp } from "../context/AppContext";

function formatTime(minutes) {
  if (minutes < 60) return `${minutes}m`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}

function StatCard({ icon: Icon, label, value, iconBg, iconColor }) {
  return (
    <div className="glass rounded-2xl p-5 flex items-center justify-between">
      <div>
        <div className="text-sm text-white/55 mb-1">{label}</div>
        <div className="text-3xl font-bold text-white">{value}</div>
      </div>
      <div className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0" style={{ background: iconBg }}>
        <Icon size={22} style={{ color: iconColor }} />
      </div>
    </div>
  );
}

const GlassTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="glass-elevated rounded-xl px-3 py-2 text-xs text-white">
      <div className="font-semibold mb-0.5">{label}</div>
      <div className="text-white/70">{payload[0].value} min</div>
    </div>
  );
};

export default function Dashboard() {
  const {
    t, sessions, reports, chatSessions,
    todayMinutes, weekMinutes, monthMinutes, weeklyData,
    streak, weeklyGoalMinutes,
  } = useApp();

  const recentSessions = sessions.slice(0, 5);

  const weekProgress = weeklyGoalMinutes > 0 ? Math.min((weekMinutes / weeklyGoalMinutes) * 100, 100) : 0;
  const weekGoalHours = (weeklyGoalMinutes / 60).toFixed(1);
  const weekStudiedHours = (weekMinutes / 60).toFixed(1);

  const MONTHLY_GOAL = 3000;
  const monthProgress = Math.min((monthMinutes / MONTHLY_GOAL) * 100, 100);

  const dayKeys = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"];
  const dayIds = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const chartDays = weeklyData.map((d) => {
    const idx = dayIds.indexOf(d.day);
    return { day: t[dayKeys[idx]] || d.day, minutes: d.minutes };
  });

  return (
    <div className="space-y-5 pt-2">
      <div>
        <h1 className="text-2xl font-bold text-white">{t.dashboard}</h1>
        <p className="text-sm text-white/50 mt-0.5">{t.studyCompanion}</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-4">
        <StatCard icon={Clock} label={t.studyToday} value={formatTime(todayMinutes)} iconBg="rgba(167,139,250,0.2)" iconColor="#a78bfa" />
        <StatCard icon={TrendingUp} label={t.thisWeek} value={formatTime(weekMinutes)} iconBg="rgba(251,191,36,0.2)" iconColor="#fbbf24" />
        <StatCard icon={FileText} label={t.reportsGenerated} value={reports.length} iconBg="rgba(52,211,153,0.2)" iconColor="#34d399" />
        <StatCard icon={MessageCircle} label={t.chatSessions} value={chatSessions.length} iconBg="rgba(244,114,182,0.2)" iconColor="#f472b6" />

        {/* Streak — full width */}
        <div className="col-span-2 glass rounded-2xl p-5 flex items-center justify-between">
          <div>
            <div className="text-sm text-white/55 mb-1">{t.dayStreak}</div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-white">{streak}</span>
              <span className="text-sm text-white/40">{streak === 1 ? "day" : "days"}</span>
            </div>
          </div>
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ background: 'rgba(245,168,0,0.2)' }}>
            <Flame size={22} style={{ color: '#F5A800' }} />
          </div>
        </div>
      </div>

      {/* Weekly goal progress */}
      <div className="glass rounded-2xl p-5">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-semibold text-white">{t.weeklyProgress}</h2>
          {weekProgress >= 100 && (
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full" style={{ background: 'rgba(245,168,0,0.2)', color: '#F5A800', border: '1px solid rgba(245,168,0,0.35)' }}>
              {t.goalReached}
            </span>
          )}
        </div>
        <div className="flex items-baseline gap-2 mb-3">
          <span className="text-2xl font-bold text-white">{weekStudiedHours}h</span>
          <span className="text-sm text-white/45">/ {weekGoalHours}h {t.weeklyGoal}</span>
        </div>
        <div className="h-2.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.1)' }}>
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{ width: `${weekProgress}%`, background: weekProgress >= 100 ? '#34d399' : '#F5A800' }}
          />
        </div>
        <div className="text-xs text-white/35 mt-2">{weekMinutes} / {weeklyGoalMinutes} min this week</div>
      </div>

      {/* Weekly chart */}
      <div className="glass rounded-2xl p-5">
        <h2 className="text-base font-semibold text-white mb-4">{t.weeklyOverview}</h2>
        <ResponsiveContainer width="100%" height={180}>
          <BarChart data={chartDays} barSize={32}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.08)" />
            <XAxis dataKey="day" tick={{ fontSize: 12, fill: 'rgba(255,255,255,0.45)' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 12, fill: 'rgba(255,255,255,0.45)' }} axisLine={false} tickLine={false} />
            <Tooltip content={<GlassTooltip />} cursor={{ fill: 'rgba(255,255,255,0.05)' }} />
            <Bar dataKey="minutes" fill="#F5A800" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Recent sessions */}
      <div className="glass rounded-2xl p-5">
        <h2 className="text-base font-semibold text-white mb-4">{t.recentSessions}</h2>
        <div className="space-y-3">
          {recentSessions.length === 0 ? (
            <p className="text-sm text-white/35 text-center py-4">No sessions yet</p>
          ) : (
            recentSessions.map((s) => (
              <div key={s.id} className="flex items-center gap-3 p-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.06)' }}>
                <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(167,139,250,0.2)' }}>
                  <BookOpen size={16} style={{ color: '#a78bfa' }} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-white truncate">{s.title}</div>
                  <div className="text-xs text-white/45">{s.subject} · {s.duration} {t.min}</div>
                </div>
                <span className="text-xs font-medium px-2.5 py-1 rounded-full flex-shrink-0" style={{ background: 'rgba(52,211,153,0.18)', color: '#34d399', border: '1px solid rgba(52,211,153,0.3)' }}>
                  {t.completed}
                </span>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Monthly total */}
      <div className="glass rounded-2xl p-5">
        <h2 className="text-base font-semibold text-white mb-1">{t.thisMonth}</h2>
        <div className="flex items-baseline gap-2 mb-3">
          <span className="text-3xl font-bold text-white">{formatTime(monthMinutes)}</span>
          <span className="text-sm text-white/45">{t.totalThisMonth}</span>
        </div>
        <div className="h-2.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.1)' }}>
          <div className="h-full rounded-full transition-all duration-500" style={{ width: `${monthProgress}%`, background: '#F5A800' }} />
        </div>
        <div className="text-xs text-white/35 mt-2">{monthMinutes} / {MONTHLY_GOAL} {t.monthlyGoal}</div>
      </div>
    </div>
  );
}
