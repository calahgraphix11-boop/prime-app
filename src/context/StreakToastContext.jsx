import { useCallback, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Flame } from "lucide-react";
import { subscribeStreakMilestone } from "../lib/xpEvents";
import { getStreakTier } from "../lib/streaks";

const TOAST_LIFETIME_MS = 3600;

let toastIdCounter = 0;

// Mounted once above the router (see App.jsx), same shell as the badge/quest
// toasts. Milestones are rare, so this one carries the tier's flame color and
// glow for a touch more ceremony without a new celebration surface.
export function StreakToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const dismiss = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  useEffect(() => {
    return subscribeStreakMilestone(({ days, xp }) => {
      const id = ++toastIdCounter;
      setToasts((prev) => [...prev, { id, days, xp }]);
      setTimeout(() => dismiss(id), TOAST_LIFETIME_MS);
    });
  }, [dismiss]);

  return (
    <>
      {children}
      {toasts.length > 0 && createPortal(
        <div className="badge-toast-layer" aria-live="polite">
          {toasts.map((t) => {
            const tier = getStreakTier(t.days);
            return (
              <div key={t.id} className="badge-toast" role="status">
                <span
                  className="quest-toast-icon"
                  aria-hidden="true"
                  style={{
                    background: tier.chipBg,
                    boxShadow: tier.chipGlow,
                    color: tier.flameColor,
                  }}
                >
                  <Flame size={16} fill={tier.flameFill} />
                </span>
                <div className="badge-toast-text">
                  <p className="badge-toast-label">Streak Milestone · +{t.xp} XP</p>
                  <p className="badge-toast-name">{t.days}-day streak</p>
                </div>
              </div>
            );
          })}
        </div>,
        document.body
      )}
    </>
  );
}
