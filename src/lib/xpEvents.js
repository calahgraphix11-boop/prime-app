// Tiny pub-sub so plain modules (xp.js) can notify React (XpBubbleProvider)
// without prop-drilling or importing React into non-component code.
const listeners = new Set();

export function emitXpAward(payload) {
  listeners.forEach((fn) => fn(payload));
}

export function subscribeXpAward(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}
