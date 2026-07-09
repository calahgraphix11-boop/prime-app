import { useState, useMemo } from "react";
import { Clock, Flame, BookOpen, Zap, TrendingUp, TrendingDown, Minus } from "lucide-react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip,
  PieChart, Pie, Cell,
} from "recharts";
import { useApp } from "../context/AppContext";
import { useAuth } from "../context/AuthContext";
import QuoteCard from "../components/QuoteCard";

const EASE_OUT = "cubic-bezier(0.23, 1, 0.32, 1)";
const ENTER_DURATION = "280ms";

function formatTime(minutes) {
  if (minutes < 60) return `${minutes}m`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}

function formatDate(dateStr) {
  const d = new Date(dateStr);
  const diff = Math.floor((Date.now() - d) / 86400000);
  if (diff === 0) return "Today";
  if (diff === 1) return "Yesterday";
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function calcTrend(curr, prev) {
  if (prev === 0) return curr > 0 ? 100 : 0;
  return Math.round(((curr - prev) / prev) * 100);
}

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

function todayLabel() {
  return new Date().toLocaleDateString("en-US", {
    weekday: "long", month: "long", day: "numeric", year: "numeric",
  });
}

const DONUT_COLORS = ["#F5A800", "#34d399", "#a78bfa", "#f472b6", "#60a5fa", "#fb923c", "#e879f9", "#4ade80"];

function enterStyle(i) {
  return {
    animation: `dash-enter ${ENTER_DURATION} ${EASE_OUT} both`,
    animationDelay: `${i * 55}ms`,
  };
}

function GlassTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="glass-elevated rounded-xl px-3 py-2 text-xs text-white">
      <div className="font-semibold mb-0.5">{label}</div>
      <div className="text-white/70">{payload[0].value} min</div>
    </div>
  );
}

function DonutTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="glass-elevated rounded-xl px-3 py-2 text-xs text-white">
      <div className="font-semibold">{payload[0].name}</div>
      <div className="text-white/70">{formatTime(payload[0].value)}</div>
    </div>
  );
}

function TrendBadge({ trend }) {
  if (trend === 0) {
    return (
      <span
        className="flex items-center gap-0.5 text-xs font-medium px-2 py-0.5 rounded-full"
        style={{ background: "var(--color-ghost-bg)", color: "var(--color-ghost-text)" }}
      >
        <Minus size={9} /> 0%
      </span>
    );
  }
  const up = trend > 0;
  return (
    <span
      className="flex items-center gap-0.5 text-xs font-semibold px-2 py-0.5 rounded-full"
      style={{
        background: up ? "rgba(52,211,153,0.15)" : "rgba(248,113,113,0.15)",
        color: up ? "#34d399" : "#f87171",
      }}
    >
      {up ? <TrendingUp size={9} /> : <TrendingDown size={9} />}
      {Math.abs(trend)}%
    </span>
  );
}

function StatCard({ icon: Icon, label, value, iconColor, iconBg, accentColor, trend, enterDelay }) {
  return (
    <div
      className="glass rounded-2xl p-5 flex flex-col gap-4"
      style={{
        ...enterStyle(enterDelay),
        borderBottom: `2px solid ${accentColor}`,
        boxShadow: `0 4px 24px ${accentColor}18`,
        transition: `transform 180ms ${EASE_OUT}, box-shadow 200ms ease`,
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-2px)";
        e.currentTarget.style.boxShadow = `0 8px 32px ${accentColor}28`;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.boxShadow = `0 4px 24px ${accentColor}18`;
      }}
    >
      <div className="flex items-start justify-between">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: iconBg }}
        >
          <Icon size={18} style={{ color: iconColor }} />
        </div>
        <TrendBadge trend={trend} />
      </div>
      <div>
        <div
          className="font-bold leading-none text-white"
          style={{ fontSize: "2rem", letterSpacing: "-0.02em" }}
        >
          {value}
        </div>
        <div className="text-xs text-white/50 mt-1.5 font-medium">{label}</div>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { sessions, reports, chatSessions, streak } = useApp();
  const { user, profile } = useAuth();
  const [period, setPeriod] = useState("7d");

  const isAllTime = period === "all";
  const periodDays = period === "7d" ? 7 : 30;

  const displayName = useMemo(() => {
    const raw = profile?.username || profile?.full_name || user?.email?.split("@")[0] || "there";
    return raw.charAt(0).toUpperCase() + raw.slice(1);
  }, [profile, user]);

  const cutoff = useMemo(() => {
    if (isAllTime) return new Date(0);
    const d = new Date();
    d.setDate(d.getDate() - periodDays);
    d.setHours(0, 0, 0, 0);
    return d;
  }, [isAllTime, periodDays]);

  const prevCutoff = useMemo(() => {
    if (isAllTime) return new Date(0);
    const d = new Date();
    d.setDate(d.getDate() - periodDays * 2);
    d.setHours(0, 0, 0, 0);
    return d;
  }, [isAllTime, periodDays]);

  const periodSessions = useMemo(
    () => sessions.filter((s) => new Date(s.date) >= cutoff),
    [sessions, cutoff]
  );

  const prevSessions = useMemo(
    () => isAllTime ? [] : sessions.filter((s) => { const d = new Date(s.date); return d >= prevCutoff && d < cutoff; }),
    [isAllTime, sessions, prevCutoff, cutoff]
  );

  const totalMinutes = useMemo(
    () => periodSessions.reduce((sum, s) => sum + s.duration, 0),
    [periodSessions]
  );

  const prevMinutes = useMemo(
    () => prevSessions.reduce((sum, s) => sum + s.duration, 0),
    [prevSessions]
  );

  const aiUsed = useMemo(() => {
    const r = reports.filter((r) => new Date(r.date) >= cutoff).length;
    const c = chatSessions.filter((c) => new Date(c.date) >= cutoff).length;
    return r + c;
  }, [reports, chatSessions, cutoff]);

  const prevAiUsed = useMemo(() => {
    if (isAllTime) return 0;
    const r = reports.filter((r) => { const d = new Date(r.date); return d >= prevCutoff && d < cutoff; }).length;
    const c = chatSessions.filter((c) => { const d = new Date(c.date); return d >= prevCutoff && d < cutoff; }).length;
    return r + c;
  }, [isAllTime, reports, chatSessions, prevCutoff, cutoff]);

  const areaData = useMemo(() => {
    const days = isAllTime ? 30 : periodDays;
    const result = [];
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toDateString();
      const mins = sessions
        .filter((s) => new Date(s.date).toDateString() === dateStr)
        .reduce((sum, s) => sum + s.duration, 0);
      const label =
        period === "7d"
          ? d.toLocaleDateString("en-US", { weekday: "short" })
          : d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
      result.push({ label, minutes: mins });
    }
    return result;
  }, [sessions, period, periodDays, isAllTime]);

  const subjectData = useMemo(() => {
    const map = {};
    periodSessions.forEach((s) => {
      const subj = s.subject || "Other";
      map[subj] = (map[subj] || 0) + s.duration;
    });
    return Object.entries(map)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([name, value]) => ({ name, value }));
  }, [periodSessions]);

  const recentSessions = sessions.slice(0, 5);

  const timeTrend = isAllTime ? 0 : calcTrend(totalMinutes, prevMinutes);
  const sessionTrend = isAllTime ? 0 : calcTrend(periodSessions.length, prevSessions.length);
  const aiTrend = isAllTime ? 0 : calcTrend(aiUsed, prevAiUsed);

  const periodToggle = (
    <div
      className="flex items-center gap-0.5 p-1 rounded-full flex-shrink-0"
      style={{
        background: "var(--color-glass-bg)",
        border: "1px solid var(--color-glass-border)",
      }}
    >
      {[["7d", "7 days"], ["30d", "30 days"], ["all", "All time"]].map(([val, lbl]) => (
        <button
          key={val}
          onClick={() => setPeriod(val)}
          className="px-3 py-1.5 rounded-full text-xs font-semibold"
          style={{
            transition: `background 200ms ${EASE_OUT}, color 200ms ${EASE_OUT}, transform 160ms ease-out`,
            ...(period === val
              ? { background: "var(--gold)", color: "#1a0c00" }
              : { color: "var(--color-ghost-text)" }),
          }}
          onMouseDown={(e) => { e.currentTarget.style.transform = "scale(0.97)"; }}
          onMouseUp={(e) => { e.currentTarget.style.transform = "scale(1)"; }}
          onMouseLeave={(e) => { e.currentTarget.style.transform = "scale(1)"; }}
        >
          {lbl}
        </button>
      ))}
    </div>
  );

  return (
    <div className="space-y-5 pt-2">

      {/* Greeting header */}
      <div
        className="flex items-start justify-between gap-3 flex-wrap"
        style={enterStyle(0)}
      >
        <div>
          <h1
            className="font-bold text-white leading-tight"
            style={{ fontSize: "1.75rem", letterSpacing: "-0.025em" }}
          >
            {greeting()}, {displayName}
          </h1>
          <p className="text-sm text-white/50 mt-1">
            {todayLabel()}
          </p>
        </div>
        {periodToggle}
      </div>

      <div style={enterStyle(0.5)}>
        <QuoteCard />
      </div>

      {/* 4-column stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard
          icon={Clock}
          label="Total Study Time"
          value={formatTime(totalMinutes)}
          iconColor="#F5A800"
          iconBg="rgba(245,168,0,0.18)"
          accentColor="#F5A800"
          trend={timeTrend}
          enterDelay={1}
        />
        <StatCard
          icon={Flame}
          label="Current Streak"
          value={`${streak}d`}
          iconColor="#fb923c"
          iconBg="rgba(251,146,60,0.18)"
          accentColor="#fb923c"
          trend={0}
          enterDelay={2}
        />
        <StatCard
          icon={BookOpen}
          label="Sessions Completed"
          value={periodSessions.length}
          iconColor="#34d399"
          iconBg="rgba(52,211,153,0.18)"
          accentColor="#34d399"
          trend={sessionTrend}
          enterDelay={3}
        />
        <StatCard
          icon={Zap}
          label="AI Features Used"
          value={aiUsed}
          iconColor="#a78bfa"
          iconBg="rgba(167,139,250,0.18)"
          accentColor="#a78bfa"
          trend={aiTrend}
          enterDelay={4}
        />
      </div>

      {/* Charts — side by side on lg+ */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">

        {/* Study time area chart */}
        <div
          className="glass rounded-2xl p-5"
          style={{
            ...enterStyle(5),
            boxShadow: "0 4px 24px rgba(245,168,0,0.07)",
          }}
        >
          <h2 className="text-xs font-semibold text-white/50 uppercase tracking-widest mb-4">
            Study Time per Day
          </h2>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={areaData} margin={{ top: 4, right: 4, left: -24, bottom: 0 }}>
              <defs>
                <linearGradient id="goldFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#F5A800" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#F5A800" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.07)" />
              <XAxis
                dataKey="label"
                tick={{ fontSize: 11, fill: "rgba(255,255,255,0.4)" }}
                axisLine={false}
                tickLine={false}
                interval={period === "7d" ? 0 : 4}
              />
              <YAxis
                tick={{ fontSize: 11, fill: "rgba(255,255,255,0.4)" }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                content={<GlassTooltip />}
                cursor={{ stroke: "rgba(245,168,0,0.25)", strokeWidth: 1 }}
              />
              <Area
                type="monotone"
                dataKey="minutes"
                stroke="#F5A800"
                strokeWidth={2}
                fill="url(#goldFill)"
                dot={false}
                activeDot={{ r: 4, fill: "#F5A800", strokeWidth: 0 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Subject donut chart */}
        <div className="glass rounded-2xl p-5" style={enterStyle(6)}>
          <h2 className="text-xs font-semibold text-white/50 uppercase tracking-widest mb-4">
            Time by Subject
          </h2>
          {subjectData.length === 0 ? (
            <div className="flex items-center justify-center h-[200px]">
              <p className="text-sm text-white/35">No data for this period</p>
            </div>
          ) : (
            <div className="flex items-center gap-4 h-[200px]">
              <div className="relative flex-shrink-0" style={{ width: 160, height: 160 }}>
                <PieChart width={160} height={160}>
                  <Pie
                    data={subjectData}
                    cx={80}
                    cy={80}
                    innerRadius={50}
                    outerRadius={72}
                    dataKey="value"
                    strokeWidth={0}
                    paddingAngle={2}
                  >
                    {subjectData.map((_, i) => (
                      <Cell key={i} fill={DONUT_COLORS[i % DONUT_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip content={<DonutTooltip />} />
                </PieChart>
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-base font-bold text-white leading-none">
                    {formatTime(totalMinutes)}
                  </span>
                  <span className="text-xs text-white/40 mt-0.5">total</span>
                </div>
              </div>
              <div className="flex-1 space-y-2.5 min-w-0 overflow-y-auto" style={{ maxHeight: 160 }}>
                {subjectData.map((item, i) => (
                  <div key={item.name} className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <div
                        className="w-2 h-2 rounded-full flex-shrink-0"
                        style={{ background: DONUT_COLORS[i % DONUT_COLORS.length] }}
                      />
                      <span className="text-xs text-white/65 truncate">{item.name}</span>
                    </div>
                    <span className="text-xs font-semibold text-white/80 flex-shrink-0">
                      {formatTime(item.value)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Recent sessions */}
      <div className="glass rounded-2xl p-5" style={enterStyle(7)}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xs font-semibold text-white/50 uppercase tracking-widest">
            Recent Sessions
          </h2>
        </div>
        <div className="space-y-2">
          {recentSessions.length === 0 ? (
            <p className="text-sm text-white/35 text-center py-4">No sessions yet</p>
          ) : (
            recentSessions.map((s, i) => (
              <div
                key={s.id}
                className="flex items-center gap-3 p-3 rounded-xl"
                style={{
                  background: "var(--color-glass-bg)",
                  border: "1px solid var(--color-glass-border)",
                  transition: `background 150ms ${EASE_OUT}`,
                  animationDelay: `${(7 + i) * 40}ms`,
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = "var(--color-glass-elev-bg)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = "var(--color-glass-bg)"; }}
              >
                <div
                  className="w-9 h-9 rounded-xl flex-shrink-0 flex items-center justify-center"
                  style={{ background: "rgba(245,168,0,0.15)" }}
                >
                  <BookOpen size={15} style={{ color: "#F5A800" }} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-white truncate">{s.title}</div>
                  <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                    {s.subject && (
                      <span
                        className="text-xs px-1.5 py-0.5 rounded-md font-medium"
                        style={{ background: "rgba(167,139,250,0.15)", color: "#a78bfa" }}
                      >
                        {s.subject}
                      </span>
                    )}
                    <span className="text-xs text-white/40">{formatTime(s.duration)}</span>
                  </div>
                </div>
                <span className="text-xs text-white/35 flex-shrink-0">{formatDate(s.date)}</span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
