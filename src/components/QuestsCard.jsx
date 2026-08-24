import { useEffect, useRef, useState } from "react";
import { Swords, Check } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useApp } from "../context/AppContext";
import { fetchQuestProgress } from "../lib/quests";
import { subscribeXpAward } from "../lib/xpEvents";

const EASE_OUT = "cubic-bezier(0.23, 1, 0.32, 1)";

// Progress lands server-side slightly after the XP bubble fires (award → quest
// claim chain), so refetches triggered by XP awards wait for the chain to settle.
const REFETCH_DELAY_MS = 1200;

function QuestRow({ quest }) {
  const { title, description, target_count, xp_reward, current_count, reward_claimed } = quest;
  const done = reward_claimed || current_count >= target_count;
  const progress = Math.min(1, current_count / target_count);

  return (
    <div
      className="rounded-xl p-3"
      style={{
        background: done ? "rgba(245,168,0,0.07)" : "var(--color-glass-bg)",
        border: `1px solid ${done ? "rgba(245,168,0,0.3)" : "var(--color-glass-border)"}`,
        transition: `background 200ms ${EASE_OUT}, border-color 200ms ${EASE_OUT}`,
      }}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="text-sm font-medium text-white truncate">{title}</div>
          <div className="text-xs text-white/45 mt-0.5">{description}</div>
        </div>
        <span
          className="flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full flex-shrink-0"
          style={done
            ? { background: "var(--gold)", color: "#1a0c00" }
            : { background: "rgba(245,168,0,0.14)", color: "#F5A800" }}
        >
          {done && <Check size={11} strokeWidth={3} />}
          +{xp_reward} XP
        </span>
      </div>
      <div className="flex items-center gap-2 mt-2.5">
        <div
          className="flex-1 rounded-full overflow-hidden"
          style={{ height: 5, background: "rgba(255,255,255,0.12)" }}
        >
          <div
            className="h-full rounded-full"
            style={{
              width: `${progress * 100}%`,
              background: "linear-gradient(90deg, #F5A800, #34d399)",
              transition: `width 500ms ${EASE_OUT}`,
            }}
          />
        </div>
        <span className="text-xs font-semibold flex-shrink-0" style={{ color: done ? "#F5A800" : "rgba(255,255,255,0.5)" }}>
          {Math.min(current_count, target_count)}/{target_count}
        </span>
      </div>
    </div>
  );
}

export default function QuestsCard() {
  const { user } = useAuth();
  const { t } = useApp();
  const [quests, setQuests] = useState(null);
  const refetchTimerRef = useRef(null);

  useEffect(() => {
    if (!user) { setQuests(null); return; }
    let cancelled = false;

    const load = () => {
      fetchQuestProgress().then((rows) => {
        if (!cancelled && rows) setQuests(rows);
      });
    };
    load();

    // Live-update the card when the user earns XP anywhere in the app.
    const unsubscribe = subscribeXpAward(() => {
      clearTimeout(refetchTimerRef.current);
      refetchTimerRef.current = setTimeout(load, REFETCH_DELAY_MS);
    });

    return () => {
      cancelled = true;
      unsubscribe();
      clearTimeout(refetchTimerRef.current);
    };
  }, [user]);

  // Quest system unavailable (fetch failed / not signed in) — vanish quietly
  // rather than showing a broken card.
  if (!quests || quests.length === 0) return null;

  const daily = quests.filter((q) => q.period === "daily");
  const weekly = quests.filter((q) => q.period === "weekly");

  return (
    <div className="glass rounded-2xl p-5" style={{ boxShadow: "0 4px 24px rgba(245,168,0,0.07)" }}>
      <div className="flex items-center gap-2 mb-4">
        <Swords size={13} style={{ color: "#F5A800" }} />
        <h2 className="text-xs font-semibold text-white/50 uppercase tracking-widest">
          {t.quests}
        </h2>
      </div>
      <div className="space-y-2">
        {daily.length > 0 && (
          <>
            <p className="text-xs font-medium text-white/40 px-1">{t.today}</p>
            {daily.map((q) => <QuestRow key={q.quest_key} quest={q} />)}
          </>
        )}
        {weekly.length > 0 && (
          <>
            <p className="text-xs font-medium text-white/40 px-1 pt-2">{t.thisWeek}</p>
            {weekly.map((q) => <QuestRow key={q.quest_key} quest={q} />)}
          </>
        )}
      </div>
    </div>
  );
}
