const { createStateStore, STATE_TTL_MS } = require("../src/lib/oauthState");

describe("oauthState", () => {
  it("returns the stored uid and returnTo once", () => {
    const store = createStateStore();
    const state = store.create({ uid: "u1", returnTo: "exp://host/--/fitbit" });

    expect(typeof state).toBe("string");
    expect(store.consume(state)).toEqual({
      uid: "u1",
      returnTo: "exp://host/--/fitbit",
    });
    expect(store.consume(state)).toBeNull();
  });

  it("returns null for an unknown state", () => {
    expect(createStateStore().consume("nope")).toBeNull();
  });

  it("creates a different state each time", () => {
    const store = createStateStore();
    const a = store.create({ uid: "u1", returnTo: "exp://a" });
    const b = store.create({ uid: "u1", returnTo: "exp://a" });
    expect(a).not.toBe(b);
  });

  it("expires a state after the TTL", () => {
    let t = 1000;
    const store = createStateStore({ now: () => t });
    const state = store.create({ uid: "u1", returnTo: "exp://a" });

    t += STATE_TTL_MS + 1;
    expect(store.consume(state)).toBeNull();
  });

  it("keeps a state that is still inside the TTL", () => {
    let t = 1000;
    const store = createStateStore({ now: () => t });
    const state = store.create({ uid: "u1", returnTo: "exp://a" });

    t += STATE_TTL_MS - 1;
    expect(store.consume(state)).not.toBeNull();
  });

  it("drops expired entries when a new state is created", () => {
    let t = 0;
    const store = createStateStore({ now: () => t });
    store.create({ uid: "u1", returnTo: "exp://a" });
    t += STATE_TTL_MS + 1;
    store.create({ uid: "u2", returnTo: "exp://b" });
    expect(store.size()).toBe(1);
  });
});
