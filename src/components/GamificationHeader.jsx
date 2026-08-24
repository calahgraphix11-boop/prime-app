import { useEffect, useRef, useState } from "react";
import { Flame } from "lucide-react";
import { supabase } from "../lib/supabase";
import { useAuth } from "../context/AuthContext";
import { useApp } from "../context/AppContext";
import { useXpBubbleAnchor } from "../context/XpBubbleContext";
import { calculateLevelProgress, getRank, localize } from "../lib/gamification";
import { getStreakTier } from "../lib/streaks";
import CharacterPortrait from "./CharacterPortrait";

const EASE_OUT = "cubic-bezier(0.23, 1, 0.32, 1)";

export default function GamificationHeader() {
  const { user, profile } = useAuth();
  const { t, lang } = useApp();
  const [xpRow, setXpRow] = useState(null);
  const [pulseStreak, setPulseStreak] = useState(false);
  const prevStreakRef = useRef(null);
  const registerXpBubbleAnchor = useXpBubbleAnchor();
  const xpBarRef = useRef(null);

  useEffect(() => {
    registerXpBubbleAnchor(xpBarRef.current);
    return () => registerXpBubbleAnchor(null);
  }, [registerXpBubbleAnchor, xpRow]);

  useEffect(() => {
    if (!user) {
      setXpRow(null);
      prevStreakRef.current = null;
      return;
    }
    let cancelled = false;
    supabase
      .from("user_xp")
      .select("total_xp, current_level, current_streak, longest_streak")
      .eq("user_id", user.id)
      .maybeSingle()
      .then(({ data, error }) => {
        if (cancelled || error || !data) return;
        setXpRow((prev) => {
          if (prevStreakRef.current === null) {
            prevStreakRef.current = data.current_streak;
          } else if (data.current_streak > prevStreakRef.current) {
            setPulseStreak(true);
            prevStreakRef.current = data.current_streak;
            setTimeout(() => setPulseStreak(false), 200);
          }
          return data;
        });
      });
    return () => { cancelled = true; };
  }, [user]);

  if (!xpRow) return null;

  const { total_xp, current_level, current_streak } = xpRow;
  const { level, xpIntoLevel, xpForNextLevel, progress } = calculateLevelProgress(total_xp, current_level);
  const rank = getRank(level);
  const streakTier = getStreakTier(current_streak);

  return (
    <div
      className="gamification-header glass rounded-2xl px-4 py-3 mb-5 flex items-center justify-between gap-4 flex-wrap"
    >
      <div className="flex items-center gap-3 min-w-0">
        <CharacterPortrait
          characterKey={profile?.character_avatar}
          rank={rank}
          size={40}
          className="gh-crest"
        />
        <div className="min-w-0">
          <div className="text-sm font-bold text-white leading-tight">
            {t.lvl} {level} <span className="text-white/40 font-medium">·</span> {localize(rank.name, lang)}
          </div>
          <div ref={xpBarRef} className="mt-1.5" style={{ position: "relative" }}>
            <div
              className="rounded-full overflow-hidden"
              style={{ width: 140, height: 5, background: "rgba(255,255,255,0.12)" }}
              title={`${xpIntoLevel} / ${xpForNextLevel} XP`}
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
          </div>
        </div>
      </div>

      {/* Flame escalates with streak milestones (14/30/100 days) — richer color
          and a bigger static glow per tier, mirroring the rank-crest escalation.
          Below 14 days this renders exactly the original chip. */}
      <div
        className="flex items-center gap-1.5 flex-shrink-0 px-2.5 py-1 rounded-full"
        style={{
          background: streakTier.chipBg,
          border: streakTier.chipBorder,
          boxShadow: streakTier.chipGlow,
          transform: pulseStreak ? "scale(1.12)" : "scale(1)",
          transition: `transform 180ms ${EASE_OUT}`,
        }}
      >
        <Flame
          size={15}
          fill={streakTier.flameFill}
          style={{ color: streakTier.flameColor }}
        />
        <span className="text-sm font-bold text-white">{current_streak}</span>
      </div>
    </div>
  );
}
