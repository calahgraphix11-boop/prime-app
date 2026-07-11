import { useCallback, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Swords } from "lucide-react";
import { subscribeQuestComplete } from "../lib/xpEvents";

const TOAST_LIFETIME_MS = 3200;

let toastIdCounter = 0;

// Mounted once above the router (see App.jsx), mirroring BadgeToastProvider —
// reuses the badge-toast visual language so quest completions read as the same
// family of quiet celebration, distinct from the level-up modal.
export function QuestToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const dismiss = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  useEffect(() => {
    return subscribeQuestComplete(({ title, xp }) => {
      const id = ++toastIdCounter;
      setToasts((prev) => [...prev, { id, title, xp }]);
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
              <span className="quest-toast-icon" aria-hidden="true">
                <Swords size={16} />
              </span>
              <div className="badge-toast-text">
                <p className="badge-toast-label">Quest Complete · +{t.xp} XP</p>
                <p className="badge-toast-name">{t.title}</p>
              </div>
            </div>
          ))}
        </div>,
        document.body
      )}
    </>
  );
}
