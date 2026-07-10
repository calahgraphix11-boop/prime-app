import { useEffect, useState } from "react";
import { Lock } from "lucide-react";
import { BADGES } from "../lib/gamification";
import { subscribeBadgeEarned } from "../lib/xpEvents";

const GLOW_DURATION_MS = 1400;

export default function BadgeGrid({ earnedKeys }) {
  // Badges earned mid-session (via the live pub-sub) get merged in immediately
  // rather than waiting for a refetch, and get the unlock glow the DB-sourced
  // earnedKeys never trigger (those are already-known, not "just happened").
  const [liveEarned, setLiveEarned] = useState(() => new Set());
  const [glowing, setGlowing] = useState(() => new Set());
  const [openKey, setOpenKey] = useState(null);

  useEffect(() => {
    return subscribeBadgeEarned(({ badgeKey }) => {
      setLiveEarned((prev) => new Set(prev).add(badgeKey));
      setGlowing((prev) => new Set(prev).add(badgeKey));
      setTimeout(() => {
        setGlowing((prev) => {
          const next = new Set(prev);
          next.delete(badgeKey);
          return next;
        });
      }, GLOW_DURATION_MS);
    });
  }, []);

  return (
    <div className="grid grid-cols-4 gap-3">
      {BADGES.map((badge, i) => {
        const earned = earnedKeys.has(badge.key) || liveEarned.has(badge.key);
        const isGlowing = glowing.has(badge.key);
        const isOpen = openKey === badge.key;

        return (
          <div key={badge.key} className="flex flex-col items-center">
            <button
              type="button"
              onClick={() => !earned && setOpenKey(isOpen ? null : badge.key)}
              title={earned ? badge.name : badge.description}
              className={`badge-grid-item${isGlowing ? " badge-grid-item--glow" : ""}`}
              style={{ animationDelay: `${i * 50}ms` }}
            >
              <img
                src={badge.icon}
                alt={badge.name}
                className={earned ? "badge-grid-icon" : "badge-grid-icon badge-grid-icon--locked"}
              />
              {!earned && (
                <span className="badge-grid-lock" aria-hidden="true">
                  <Lock size={11} />
                </span>
              )}
            </button>
            <p
              className="text-xs mt-1.5 text-center leading-tight"
              style={{ color: earned ? "rgba(255,255,255,0.85)" : "rgba(255,255,255,0.35)" }}
            >
              {badge.name}
            </p>
            {!earned && isOpen && (
              <p className="text-[10px] mt-1 text-center leading-tight" style={{ color: "rgba(255,255,255,0.4)" }}>
                {badge.description}
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
}
