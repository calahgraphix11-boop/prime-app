import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { subscribeXpAward } from "../lib/xpEvents";

const XpBubbleAnchorContext = createContext(() => {});

// Keep consecutive bubbles from landing exactly on top of one another.
const STAGGER_MS = 50;
// Slightly longer than the CSS animation duration so bubbles never pop out mid-fade.
const BUBBLE_LIFETIME_MS = 540;

let bubbleIdCounter = 0;
let nextMountAt = 0;

export function XpBubbleProvider({ children }) {
  const [anchor, setAnchor] = useState(null);
  const [bubbles, setBubbles] = useState([]);

  const mountBubble = useCallback((payload) => {
    const id = ++bubbleIdCounter;
    setBubbles((prev) => [...prev, { id, ...payload }]);
    setTimeout(() => {
      setBubbles((prev) => prev.filter((b) => b.id !== id));
    }, BUBBLE_LIFETIME_MS);
  }, []);

  const scheduleBubble = useCallback((payload) => {
    const now = Date.now();
    const mountAt = Math.max(now, nextMountAt);
    nextMountAt = mountAt + STAGGER_MS;
    setTimeout(() => mountBubble(payload), Math.max(0, mountAt - now));
  }, [mountBubble]);

  useEffect(() => {
    return subscribeXpAward((payload) => {
      scheduleBubble(payload);
    });
  }, [scheduleBubble]);

  const registerAnchor = useCallback((node) => {
    setAnchor(node);
  }, []);

  return (
    <XpBubbleAnchorContext.Provider value={registerAnchor}>
      {children}
      {anchor && createPortal(
        <div className="xp-bubble-layer" aria-hidden="true">
          {bubbles.map((b, i) => (
            // The bigger "level up" bubble variant is intentionally not used here —
            // LevelUpModal now owns that celebration so the two don't stack.
            <span
              key={b.id}
              className="xp-bubble"
              style={{ "--xp-bubble-x": `${((i % 3) - 1) * 10}px` }}
            >
              +{b.xp} XP
            </span>
          ))}
        </div>,
        anchor
      )}
    </XpBubbleAnchorContext.Provider>
  );
}

export function useXpBubbleAnchor() {
  return useContext(XpBubbleAnchorContext);
}
