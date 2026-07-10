// Tiny pub-sub so plain modules (xp.js) can notify React (XpBubbleProvider,
// LevelUpModalProvider) without prop-drilling or importing React into
// non-component code.
const listeners = new Set();
const levelUpListeners = new Set();

export function emitXpAward(payload) {
  listeners.forEach((fn) => fn(payload));
}

export function subscribeXpAward(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

// Separate channel so the level-up modal can react independently of the
// XP bubble system, without either duplicating award logic.
export function emitLevelUp(payload) {
  levelUpListeners.forEach((fn) => fn(payload));
}

export function subscribeLevelUp(fn) {
  levelUpListeners.add(fn);
  return () => levelUpListeners.delete(fn);
}
