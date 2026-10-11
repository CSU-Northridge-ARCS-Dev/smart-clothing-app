jest.mock("../src/lib/firebaseAdmin", () => ({ verifyIdToken: jest.fn() }));

const request = require("supertest");
const { createApp } = require("../src/app");

describe("health and fallback routes", () => {
  it("GET /api/health returns ok without auth", async () => {
    const res = await request(createApp()).get("/api/health");
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ ok: true });
  });

  it("returns 404 JSON for unknown paths", async () => {
    const res = await request(createApp()).get("/api/nope");
    expect(res.status).toBe(404);
    expect(res.body).toEqual({ error: "NOT_FOUND" });
  });

  it("does not send the X-Powered-By header", async () => {
    const res = await request(createApp()).get("/api/health");
    expect(res.headers["x-powered-by"]).toBeUndefined();
  });
});
