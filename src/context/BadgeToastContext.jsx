import { useCallback, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { subscribeBadgeEarned } from "../lib/xpEvents";
import { BADGES } from "../lib/gamification";

const TOAST_LIFETIME_MS = 3200;

let toastIdCounter = 0;

// Mounted once above the router (see App.jsx), mirroring XpBubbleProvider /
// LevelUpModalProvider, so a badge earned on any page surfaces this toast —
// deliberately smaller/quieter than LevelUpModal since badges are a bonus,
// not the primary progression moment.
export function BadgeToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const dismiss = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  useEffect(() => {
    return subscribeBadgeEarned(({ badgeKey }) => {
      const badge = BADGES.find((b) => b.key === badgeKey);
      if (!badge) return;
      const id = ++toastIdCounter;
      setToasts((prev) => [...prev, { id, badge }]);
      setTimeout(() => dismiss(id), TOAST_LIFETIME_MS);
    });
  }, [dismiss]);

  return (
    <>
      {children}
      {toasts.length > 0 && createPortal(
        <div className="badge-toast-layer" aria-live="polite">
          {toasts.map((t) => (
            <div key={t.id} className="badge-toast" role="status">
              <img src={t.badge.icon} alt="" className="badge-toast-icon" />
              <div className="badge-toast-text">
                <p className="badge-toast-label">Badge Earned</p>
                <p className="badge-toast-name">{t.badge.name}</p>
              </div>
            </div>
          ))}
        </div>,
        document.body
      )}
    </>
  );
}
