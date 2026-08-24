import { useEffect, useRef, useState } from "react";
import { supabase } from "../lib/supabase";
import { useAuth } from "../context/AuthContext";
import { useApp } from "../context/AppContext";
import { computeNextBadge, tallyActionCounts } from "../lib/badgeProgress";
import { localize } from "../lib/gamification";
import { subscribeXpAward, subscribeBadgeEarned } from "../lib/xpEvents";

const EASE_OUT = "cubic-bezier(0.23, 1, 0.32, 1)";
const REFETCH_DELAY_MS = 1200;

// Surfaces the badge the user is closest to earning, with real progress from
// xp_events — a concrete next goal instead of just the locked grid on Profile.
export default function NextBadgeCard() {
  const { user } = useAuth();
  const { t, lang } = useApp();
  const [next, setNext] = useState(null);
  const refetchTimerRef = useRef(null);

  useEffect(() => {
    if (!user) { setNext(null); return; }
    let cancelled = false;

    const load = async () => {
      try {
        const [{ data: badgeRows, error: badgeErr }, { data: eventRows, error: eventErr }, { data: xpRow, error: xpErr }] = await Promise.all([
          supabase.from("user_badges").select("badge_key").eq("user_id", user.id),
          supabase.from("xp_events").select("action_type").eq("user_id", user.id),
          supabase.from("user_xp").select("current_streak").eq("user_id", user.id).maybeSingle(),
        ]);
        if (cancelled) return;
        if (badgeErr || eventErr || xpErr) {
          console.warn("[next-badge] fetch failed:", badgeErr || eventErr || xpErr);
          return;
        }
        const earnedKeys = new Set((badgeRows || []).map((b) => b.badge_key));
        const counts = tallyActionCounts(eventRows);
        setNext(computeNextBadge(earnedKeys, counts, xpRow?.current_streak || 0, lang));
      } catch (err) {
        console.warn("[next-badge] fetch failed:", err);
      }
    };
    load();

    const scheduleReload = () => {
      clearTimeout(refetchTimerRef.current);
      refetchTimerRef.current = setTimeout(load, REFETCH_DELAY_MS);
    };
    const unsubXp = subscribeXpAward(scheduleReload);
    const unsubBadge = subscribeBadgeEarned(scheduleReload);

    return () => {
      cancelled = true;
      unsubXp();
      unsubBadge();
      clearTimeout(refetchTimerRef.current);
    };
  }, [user, lang]);

  // Nothing to chase (all earned) or data unavailable — disappear quietly.
  if (!next) return null;

  const { badge, current, target, fraction, message } = next;
  const badgeName = localize(badge.name, lang);

  return (
    <div className="glass rounded-2xl p-5" style={{ boxShadow: "0 4px 24px rgba(52,211,153,0.07)" }}>
      <h2 className="text-xs font-semibold text-white/50 uppercase tracking-widest mb-4">
        {t.nextBadge}
      </h2>
      <div className="flex items-center gap-4">
        <div
          className="flex-shrink-0 rounded-2xl flex items-center justify-center"
          style={{
            width: 64,
            height: 64,
            padding: 8,
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(245,168,0,0.25)",
          }}
        >
          <img
            src={badge.icon}
            alt={badgeName}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "contain",
              filter: "grayscale(0.65)",
              opacity: 0.75,
            }}
          />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-sm font-bold text-white">{badgeName}</div>
          <div className="text-xs text-white/50 mt-0.5 leading-snug">{message}</div>
          <div className="flex items-center gap-2 mt-2.5">
            <div
              className="flex-1 rounded-full overflow-hidden"
              style={{ height: 5, background: "rgba(255,255,255,0.12)" }}
            >
              <div
                className="h-full rounded-full"
                style={{
                  width: `${fraction * 100}%`,
                  background: "linear-gradient(90deg, #F5A800, #34d399)",
                  transition: `width 500ms ${EASE_OUT}`,
                }}
              />
            </div>
            <span className="text-xs font-semibold text-white/50 flex-shrink-0">
              {current}/{target}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
