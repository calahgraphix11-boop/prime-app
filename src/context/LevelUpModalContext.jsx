import { useCallback, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { subscribeLevelUp } from "../lib/xpEvents";
import LevelUpModal from "../components/LevelUpModal";

let levelUpIdCounter = 0;

// Mounted once above the router (see App.jsx) so a level-up fires the modal
// regardless of which page the user is on, mirroring XpBubbleProvider.
// Queued rather than deduped by level, in case two award events resolve to
// separate level-ups in quick succession — each gets its own reveal.
export function LevelUpModalProvider({ children }) {
  const [queue, setQueue] = useState([]);

  useEffect(() => {
    return subscribeLevelUp((payload) => {
      setQueue((prev) => [...prev, { id: ++levelUpIdCounter, ...payload }]);
    });
  }, []);

  const dismiss = useCallback(() => {
    setQueue((prev) => prev.slice(1));
  }, []);

  const current = queue[0] || null;

  return (
    <>
      {children}
      {current && createPortal(
        <LevelUpModal
          key={current.id}
          level={current.level}
          rank={current.rank}
          rankChanged={current.rankChanged}
          onDismiss={dismiss}
        />,
        document.body
      )}
    </>
  );
}
