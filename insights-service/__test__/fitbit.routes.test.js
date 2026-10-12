jest.mock("../src/lib/firebaseAdmin", () => ({ verifyIdToken: jest.fn() }));
jest.mock("../src/lib/fitbit-api", () => ({
  exchangeCodeForTokens: jest.fn(),
  refreshTokens: jest.fn(),
  getSleep: jest.fn(),
  getHeart: jest.fn(),
  getActivities: jest.fn(),
  withFreshToken: jest.fn(),
}));

const request = require("supertest");
const { setFitbitEnv } = require("./helpers");
const { verifyIdToken } = require("../src/lib/firebaseAdmin");
const fitbitApi = require("../src/lib/fitbit-api");
const { createStateStore } = require("../src/lib/oauthState");
const { createApp } = require("../src/app");

const AUTH = { Authorization: "Bearer good-token" };
const RETURN_TO = "exp://192.168.1.5:8081/--/fitbit";
const TOKENS = {
  accessToken: "access-1",
  refreshToken: "refresh-1",
  expiresAt: "2026-10-11T00:00:00.000Z",
  fitbitUserId: "FITBIT123",
  scope: "sleep heartrate activity profile",
};

describe("Fitbit routes", () => {
  let app;
  let stateStore;

  beforeEach(() => {
    jest.clearAllMocks();
    setFitbitEnv();
    verifyIdToken.mockImplementation(async (token) => {
      if (token === "good-token") return { uid: "user-1" };
      throw new Error("invalid");
    });
    stateStore = createStateStore();
    app = createApp({ stateStore });
    jest.spyOn(console, "error").mockImplementation(() => {});
    jest.spyOn(console, "warn").mockImplementation(() => {});
  });

  afterEach(() => {
    console.error.mockRestore();
    console.warn.mockRestore();
  });

  describe("GET /api/fitbit/auth-url", () => {
    it("rejects a request without a Firebase ID token", async () => {
      const res = await request(app)
        .get("/api/fitbit/auth-url")
        .query({ returnTo: RETURN_TO });
      expect(res.status).toBe(401);
      expect(res.body).toEqual({ error: "UNAUTHENTICATED" });
    });

    it("rejects an invalid Firebase ID token", async () => {
      const res = await request(app)
        .get("/api/fitbit/auth-url")
        .set("Authorization", "Bearer bad")
        .query({ returnTo: RETURN_TO });
      expect(res.status).toBe(401);
    });

    it.each([
      ["missing", undefined],
      ["not a URL", "not a url"],
      ["https (could leak tokens to a website)", "https://evil.example/steal"],
      ["javascript", "javascript:alert(1)"],
    ])("returns 400 for a %s returnTo", async (_label, returnTo) => {
      const res = await request(app)
        .get("/api/fitbit/auth-url")
        .set(AUTH)
        .query(returnTo ? { returnTo } : {});
      expect(res.status).toBe(400);
      expect(res.body).toEqual({ error: "INVALID_RETURN_TO" });
    });

    it("returns a Fitbit authorize URL and stores the state", async () => {
      const res = await request(app)
        .get("/api/fitbit/auth-url")
        .set(AUTH)
        .query({ returnTo: RETURN_TO });

      expect(res.status).toBe(200);
      const url = new URL(res.body.url);
      expect(url.origin + url.pathname).toBe(
        "https://www.fitbit.com/oauth2/authorize",
      );
      expect(url.searchParams.get("response_type")).toBe("code");
      expect(url.searchParams.get("client_id")).toBe("client-id");
      expect(url.searchParams.get("redirect_uri")).toBe(
        "https://tunnel.example/api/fitbit/callback",
      );
      expect(url.searchParams.get("scope")).toBe(
        "sleep heartrate activity profile",
      );
      expect(stateStore.consume(url.searchParams.get("state"))).toEqual({
        uid: "user-1",
        returnTo: RETURN_TO,
      });
    });

    it("accepts the app's own scheme", async () => {
      const res = await request(app)
        .get("/api/fitbit/auth-url")
        .set(AUTH)
        .query({ returnTo: "com.arcs.smartclothingapp://fitbit" });
      expect(res.status).toBe(200);
    });

    it("uses ALLOWED_RETURN_SCHEMES when set", async () => {
      process.env.ALLOWED_RETURN_SCHEMES = "myapp";
      const blocked = await request(app)
        .get("/api/fitbit/auth-url")
        .set(AUTH)
        .query({ returnTo: RETURN_TO });
      const allowed = await request(app)
        .get("/api/fitbit/auth-url")
        .set(AUTH)
        .query({ returnTo: "myapp://fitbit" });
      expect(blocked.status).toBe(400);
      expect(allowed.status).toBe(200);
    });
  });

  describe("GET /api/fitbit/callback", () => {
    function startLogin() {
      return stateStore.create({ uid: "user-1", returnTo: RETURN_TO });
    }

    it("returns 400 for an unknown state", async () => {
      const res = await request(app)
        .get("/api/fitbit/callback")
        .query({ code: "c", state: "unknown" });
      expect(res.status).toBe(400);
      expect(fitbitApi.exchangeCodeForTokens).not.toHaveBeenCalled();
    });

    it("returns 400 when state is missing", async () => {
      const res = await request(app)
        .get("/api/fitbit/callback")
        .query({ code: "c" });
      expect(res.status).toBe(400);
    });

    it("redirects to returnTo with the tokens after a successful exchange", async () => {
      fitbitApi.exchangeCodeForTokens.mockResolvedValue(TOKENS);
      const state = startLogin();

      const res = await request(app)
        .get("/api/fitbit/callback")
        .query({ code: "the-code", state });

      expect(fitbitApi.exchangeCodeForTokens).toHaveBeenCalledWith("the-code");
      expect(res.status).toBe(302);
      const location = new URL(res.headers.location);
      expect(location.protocol).toBe("exp:");
      expect(location.pathname).toBe("/--/fitbit");
      expect(Object.fromEntries(location.searchParams)).toEqual({
        accessToken: "access-1",
        refreshToken: "refresh-1",
        expiresAt: "2026-10-11T00:00:00.000Z",
        fitbitUserId: "FITBIT123",
      });
    });

    it("can only be used once per state", async () => {
      fitbitApi.exchangeCodeForTokens.mockResolvedValue(TOKENS);
      const state = startLogin();
      await request(app).get("/api/fitbit/callback").query({ code: "c", state });
      const second = await request(app)
        .get("/api/fitbit/callback")
        .query({ code: "c", state });
      expect(second.status).toBe(400);
    });

    it("redirects with error when the user denies access", async () => {
      const state = startLogin();
      const res = await request(app)
        .get("/api/fitbit/callback")
        .query({ error: "access_denied", state });
      expect(res.status).toBe(302);
      expect(new URL(res.headers.location).searchParams.get("error")).toBe(
        "access_denied",
      );
      expect(fitbitApi.exchangeCodeForTokens).not.toHaveBeenCalled();
    });

    it("redirects with error when the code exchange fails", async () => {
      fitbitApi.exchangeCodeForTokens.mockRejectedValue(
        new Error("TOKEN_EXCHANGE_FAILED"),
      );
      const state = startLogin();
      const res = await request(app)
        .get("/api/fitbit/callback")
        .query({ code: "c", state });
      const location = new URL(res.headers.location);
      expect(location.searchParams.get("error")).toBe("token_exchange_failed");
      expect(location.searchParams.has("accessToken")).toBe(false);
    });
  });

  describe("POST /api/fitbit/refresh", () => {
    it("requires a Firebase ID token", async () => {
      const res = await request(app)
        .post("/api/fitbit/refresh")
        .send({ refreshToken: "r" });
      expect(res.status).toBe(401);
    });

    it("returns 400 without a refresh token", async () => {
      const res = await request(app).post("/api/fitbit/refresh").set(AUTH).send({});
      expect(res.status).toBe(400);
      expect(res.body).toEqual({ error: "MISSING_REFRESH_TOKEN" });
    });

    it("returns the new token pair", async () => {
      fitbitApi.refreshTokens.mockResolvedValue(TOKENS);
      const res = await request(app)
        .post("/api/fitbit/refresh")
        .set(AUTH)
        .send({ refreshToken: "refresh-0" });
      expect(fitbitApi.refreshTokens).toHaveBeenCalledWith("refresh-0");
      expect(res.status).toBe(200);
      expect(res.body).toEqual(TOKENS);
    });

    it("returns 401 FITBIT_REAUTH_REQUIRED when Fitbit rejects the refresh token", async () => {
      fitbitApi.refreshTokens.mockRejectedValue(
        new Error("FITBIT_REAUTH_REQUIRED"),
      );
      const res = await request(app)
        .post("/api/fitbit/refresh")
        .set(AUTH)
        .send({ refreshToken: "used" });
      expect(res.status).toBe(401);
      expect(res.body).toEqual({ error: "FITBIT_REAUTH_REQUIRED" });
    });

    it("returns 400 for malformed JSON", async () => {
      const res = await request(app)
        .post("/api/fitbit/refresh")
        .set(AUTH)
        .set("Content-Type", "application/json")
        .send("{not json");
      expect(res.status).toBe(400);
      expect(res.body).toEqual({ error: "INVALID_JSON" });
    });
  });

  describe("GET /api/fitbit/day/:date", () => {
    const FITBIT_HEADERS = {
      ...AUTH,
      "X-Fitbit-Token": "access-1",
      "X-Fitbit-Refresh-Token": "refresh-1",
    };

    // Make withFreshToken run the callback like the real one does
    function passThrough(refreshedTokens = null) {
      fitbitApi.withFreshToken.mockImplementation(async (tokens, fn) => ({
        result: await fn(refreshedTokens ? refreshedTokens.accessToken : tokens.accessToken),
        refreshedTokens,
      }));
    }

    beforeEach(() => {
      fitbitApi.getSleep.mockResolvedValue({ sleep: [] });
      fitbitApi.getHeart.mockResolvedValue({
        "activities-heart": [
          { dateTime: "2026-10-10", value: { restingHeartRate: 58 } },
        ],
      });
      fitbitApi.getActivities.mockResolvedValue([
        { activityName: "Run", activeDuration: 600000 },
        { activityName: "Yoga", activeDuration: 600000 },
      ]);
    });

    it("requires a Firebase ID token", async () => {
      const res = await request(app)
        .get("/api/fitbit/day/2026-10-10")
        .set("X-Fitbit-Token", "a");
      expect(res.status).toBe(401);
      expect(res.body).toEqual({ error: "UNAUTHENTICATED" });
    });

    it.each(["today", "2026-1-1", "10-10-2026"])(
      "returns 400 for date %s",
      async (date) => {
        const res = await request(app)
          .get(`/api/fitbit/day/${date}`)
          .set(FITBIT_HEADERS);
        expect(res.status).toBe(400);
        expect(res.body).toEqual({ error: "INVALID_DATE" });
      },
    );

    it("returns 401 FITBIT_NOT_CONNECTED without a Fitbit token", async () => {
      const res = await request(app).get("/api/fitbit/day/2026-10-10").set(AUTH);
      expect(res.status).toBe(401);
      expect(res.body).toEqual({ error: "FITBIT_NOT_CONNECTED" });
    });

    it("returns the normalized day", async () => {
      passThrough();
      const res = await request(app)
        .get("/api/fitbit/day/2026-10-10")
        .set(FITBIT_HEADERS);

      expect(res.status).toBe(200);
      expect(fitbitApi.withFreshToken.mock.calls[0][0]).toEqual({
        accessToken: "access-1",
        refreshToken: "refresh-1",
      });
      expect(fitbitApi.getSleep).toHaveBeenCalledWith("access-1", "2026-10-10");
      expect(fitbitApi.getHeart).toHaveBeenCalledWith("access-1", "2026-10-10");
      expect(fitbitApi.getActivities).toHaveBeenCalledWith(
        "access-1",
        "2026-10-10",
      );
      expect(res.body.day.date).toBe("2026-10-10");
      expect(res.body.day.sleep).toBeNull();
      expect(res.body.day.heart.restingHeartRate).toBe(58);
      expect(res.body.day.workouts.map((w) => w.type)).toEqual(["Run"]);
      expect(res.body).not.toHaveProperty("refreshedTokens");
    });

    it("includes refreshedTokens when the service refreshed", async () => {
      passThrough({ ...TOKENS, accessToken: "access-2", refreshToken: "refresh-2" });
      const res = await request(app)
        .get("/api/fitbit/day/2026-10-10")
        .set(FITBIT_HEADERS);
      expect(res.status).toBe(200);
      expect(fitbitApi.getSleep).toHaveBeenCalledWith("access-2", "2026-10-10");
      expect(res.body.refreshedTokens.refreshToken).toBe("refresh-2");
    });

    it("returns 401 FITBIT_REAUTH_REQUIRED when the refresh fails", async () => {
      fitbitApi.withFreshToken.mockRejectedValue(
        new Error("FITBIT_REAUTH_REQUIRED"),
      );
      const res = await request(app)
        .get("/api/fitbit/day/2026-10-10")
        .set(FITBIT_HEADERS);
      expect(res.status).toBe(401);
      expect(res.body).toEqual({ error: "FITBIT_REAUTH_REQUIRED" });
    });

    it("returns 502 with any refreshed tokens when Fitbit fails", async () => {
      const error = new Error("FITBIT_API_ERROR");
      error.refreshedTokens = { ...TOKENS, refreshToken: "refresh-2" };
      fitbitApi.withFreshToken.mockRejectedValue(error);
      const res = await request(app)
        .get("/api/fitbit/day/2026-10-10")
        .set(FITBIT_HEADERS);
      expect(res.status).toBe(502);
      expect(res.body.error).toBe("FITBIT_API_ERROR");
      expect(res.body.refreshedTokens.refreshToken).toBe("refresh-2");
    });

    it("returns 500 for unexpected errors", async () => {
      fitbitApi.withFreshToken.mockRejectedValue(new Error("boom"));
      const res = await request(app)
        .get("/api/fitbit/day/2026-10-10")
        .set(FITBIT_HEADERS);
      expect(res.status).toBe(500);
      expect(res.body).toEqual({ error: "INTERNAL_ERROR" });
    });
  });
});
