const crypto = require("crypto");

// In-memory OAuth state store: state -> { uid, returnTo, expiry }.
// Single-use and short-lived; a server restart simply invalidates pending logins.
const STATE_TTL_MS = 10 * 60 * 1000;

function createStateStore({ now = Date.now, ttlMs = STATE_TTL_MS } = {}) {
  const store = new Map();

  function cleanExpired() {
    const t = now();
    for (const [state, entry] of store) {
      if (t > entry.expiry) store.delete(state);
    }
  }

  function create({ uid, returnTo }) {
    cleanExpired();
    const state = crypto.randomUUID();
    store.set(state, { uid, returnTo, expiry: now() + ttlMs });
    return state;
  }

  // Returns { uid, returnTo } once, or null if unknown or expired
  function consume(state) {
    const entry = store.get(state);
    store.delete(state);
    if (!entry || now() > entry.expiry) return null;
    return { uid: entry.uid, returnTo: entry.returnTo };
  }

  return { create, consume, size: () => store.size };
}

module.exports = { createStateStore, STATE_TTL_MS };
