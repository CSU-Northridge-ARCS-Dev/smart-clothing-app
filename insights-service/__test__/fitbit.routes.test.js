jest.mock("../src/lib/firebaseAdmin", () => ({ verifyIdToken: jest.fn() }));
jest.mock("../src/lib/fitbit-api", () => ({
  exchangeCodeForTokens: jest.fn(),
  refreshTokens: jest.fn(),
  getSleep: jest.fn(),
  getHeart: jest.fn(),
  getActivities: jest.fn(),
  getDaySummary: jest.fn(),
  getStepsRange: jest.fn(),
  getSleepRange: jest.fn(),
  getActivitiesFrom: jest.fn(),
  getActivityTcx: jest.fn(),
  getHeartIntraday: jest.fn(),
  withFreshToken: jest.fn(),
}));

const request = require("supertest");
const { setFitbitEnv, tcxXml, ACTIVITY_ZONES } = require("./helpers");
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
        "sleep heartrate activity profile location",
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

  describe("GET /api/fitbit/day/:date", () => {
    beforeEach(() => {
      fitbitApi.getDaySummary.mockResolvedValue({ summary: { steps: 8432 } });
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
      expect(fitbitApi.getDaySummary).toHaveBeenCalledWith(
        "access-1",
        "2026-10-10",
      );
      expect(res.body.day.date).toBe("2026-10-10");
      expect(res.body.day.steps).toBe(8432);
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
  describe("GET /api/fitbit/week/:endDate", () => {
    beforeEach(() => {
      fitbitApi.getStepsRange.mockResolvedValue({
        "activities-steps": [
          { dateTime: "2026-10-09", value: "9120" },
          { dateTime: "2026-10-10", value: "12004" },
        ],
      });
      fitbitApi.getSleepRange.mockResolvedValue({
        sleep: [{ dateOfSleep: "2026-10-10", isMainSleep: true, minutesAsleep: 412 }],
      });
    });

    it("requires a Firebase ID token", async () => {
      const res = await request(app)
        .get("/api/fitbit/week/2026-10-10")
        .set("X-Fitbit-Token", "a");
      expect(res.status).toBe(401);
      expect(res.body).toEqual({ error: "UNAUTHENTICATED" });
    });

    it("returns 400 for a bad date", async () => {
      const res = await request(app)
        .get("/api/fitbit/week/last-week")
        .set(FITBIT_HEADERS);
      expect(res.status).toBe(400);
      expect(res.body).toEqual({ error: "INVALID_DATE" });
    });

    it("returns 401 FITBIT_NOT_CONNECTED without a Fitbit token", async () => {
      const res = await request(app).get("/api/fitbit/week/2026-10-10").set(AUTH);
      expect(res.status).toBe(401);
      expect(res.body).toEqual({ error: "FITBIT_NOT_CONNECTED" });
    });

    it("returns 7 days from two range calls", async () => {
      passThrough();
      const res = await request(app)
        .get("/api/fitbit/week/2026-10-10")
        .set(FITBIT_HEADERS);

      expect(res.status).toBe(200);
      expect(fitbitApi.getStepsRange).toHaveBeenCalledWith(
        "access-1",
        "2026-10-04",
        "2026-10-10",
      );
      expect(fitbitApi.getSleepRange).toHaveBeenCalledWith(
        "access-1",
        "2026-10-04",
        "2026-10-10",
      );
      expect(fitbitApi.getSleep).not.toHaveBeenCalled();
      expect(res.body.week).toHaveLength(7);
      expect(res.body.week[0]).toEqual({
        date: "2026-10-04",
        steps: null,
        sleepMinutes: null,
      });
      expect(res.body.week[6]).toEqual({
        date: "2026-10-10",
        steps: 12004,
        sleepMinutes: 412,
      });
      expect(res.body).not.toHaveProperty("refreshedTokens");
    });

    it("includes refreshedTokens when the service refreshed", async () => {
      passThrough({ ...TOKENS, accessToken: "access-2", refreshToken: "refresh-2" });
      const res = await request(app)
        .get("/api/fitbit/week/2026-10-10")
        .set(FITBIT_HEADERS);
      expect(res.status).toBe(200);
      expect(fitbitApi.getStepsRange.mock.calls[0][0]).toBe("access-2");
      expect(res.body.refreshedTokens.refreshToken).toBe("refresh-2");
    });

    it("returns 502 with any refreshed tokens when Fitbit fails", async () => {
      const error = new Error("FITBIT_API_ERROR");
      error.refreshedTokens = { ...TOKENS, refreshToken: "refresh-2" };
      fitbitApi.withFreshToken.mockRejectedValue(error);
      const res = await request(app)
        .get("/api/fitbit/week/2026-10-10")
        .set(FITBIT_HEADERS);
      expect(res.status).toBe(502);
      expect(res.body.refreshedTokens.refreshToken).toBe("refresh-2");
    });

    it("returns 401 FITBIT_REAUTH_REQUIRED when the refresh fails", async () => {
      fitbitApi.withFreshToken.mockRejectedValue(
        new Error("FITBIT_REAUTH_REQUIRED"),
      );
      const res = await request(app)
        .get("/api/fitbit/week/2026-10-10")
        .set(FITBIT_HEADERS);
      expect(res.status).toBe(401);
      expect(res.body).toEqual({ error: "FITBIT_REAUTH_REQUIRED" });
    });
  });
  describe("GET /api/fitbit/workout/:date/:logId", () => {
    const URL = "/api/fitbit/workout/2026-10-11/74512345678";
    const run = {
      logId: 74512345678,
      activityName: "Workout",
      hasGps: true,
      startTime: "2026-10-11T07:00:00.000-07:00",
      activeDuration: 723780,
      distance: 1.6049,
      distanceUnit: "Kilometer",
      calories: 164,
      steps: 1932,
      heartRateZones: ACTIVITY_ZONES,
    };

    beforeEach(() => {
      fitbitApi.getActivities.mockResolvedValue([
        { logId: 1, activityName: "Walk", startTime: "2026-10-11T06:00:00.000-07:00" },
        run,
      ]);
      fitbitApi.getActivityTcx.mockResolvedValue(
        tcxXml([
          { time: "2026-10-11T07:00:00.000-07:00", lat: 34.24, lon: -118.53, bpm: 110 },
          { time: "2026-10-11T07:05:00.000-07:00", lat: 34.25, lon: -118.53, bpm: 150 },
        ]),
      );
    });

    it("requires a Firebase ID token", async () => {
      const res = await request(app).get(URL).set("X-Fitbit-Token", "a");
      expect(res.status).toBe(401);
      expect(res.body).toEqual({ error: "UNAUTHENTICATED" });
    });

    it("returns 400 for a bad date or logId", async () => {
      let res = await request(app)
        .get("/api/fitbit/workout/today/74512345678")
        .set(FITBIT_HEADERS);
      expect(res.status).toBe(400);
      expect(res.body).toEqual({ error: "INVALID_DATE" });

      res = await request(app)
        .get("/api/fitbit/workout/2026-10-11/abc")
        .set(FITBIT_HEADERS);
      expect(res.status).toBe(400);
      expect(res.body).toEqual({ error: "INVALID_LOG_ID" });
      expect(fitbitApi.withFreshToken).not.toHaveBeenCalled();
    });

    it("returns 401 FITBIT_NOT_CONNECTED without a Fitbit token", async () => {
      const res = await request(app).get(URL).set(AUTH);
      expect(res.status).toBe(401);
      expect(res.body).toEqual({ error: "FITBIT_NOT_CONNECTED" });
    });

    it("returns the workout with zone-tagged route points", async () => {
      passThrough();
      const res = await request(app).get(URL).set(FITBIT_HEADERS);

      expect(res.status).toBe(200);
      expect(fitbitApi.getActivities).toHaveBeenCalledWith("access-1", "2026-10-11");
      expect(fitbitApi.getActivityTcx).toHaveBeenCalledWith(
        "access-1",
        "74512345678",
      );
      expect(res.body.workout).toMatchObject({
        logId: 74512345678,
        type: "Run",
        date: "2026-10-11",
        calories: 164,
        steps: 1932,
        hasGps: true,
        hasRoute: true,
      });
      expect(res.body.workout.points.map((p) => p.zone)).toEqual([
        "outOfRange",
        "cardio",
      ]);
      expect(res.body).not.toHaveProperty("refreshedTokens");
    });

    it("still returns the workout when Fitbit refuses the TCX (no location scope)", async () => {
      passThrough();
      fitbitApi.getActivityTcx.mockRejectedValue(new Error("FITBIT_FORBIDDEN"));
      fitbitApi.getHeartIntraday.mockResolvedValue({});
      const res = await request(app).get(URL).set(FITBIT_HEADERS);
      expect(res.status).toBe(200);
      expect(res.body.workout).toMatchObject({
        calories: 164,
        points: [],
        hasRoute: false,
        needsReconnect: true,
      });
    });

    it("does not fetch intraday heart rate when the TCX has it", async () => {
      passThrough();
      await request(app).get(URL).set(FITBIT_HEADERS);
      expect(fitbitApi.getHeartIntraday).not.toHaveBeenCalled();
    });

    it("uses the intraday heart rate when the TCX has none", async () => {
      passThrough();
      fitbitApi.getActivityTcx.mockResolvedValue(
        tcxXml([{ time: "2026-10-11T07:00:00.000-07:00" }]),
      );
      fitbitApi.getHeartIntraday.mockResolvedValue({
        "activities-heart-intraday": {
          dataset: [
            { time: "07:00:00", value: 112 },
            { time: "07:01:00", value: 145 },
            { time: "07:02:00", value: 175 },
          ],
        },
      });
      const res = await request(app).get(URL).set(FITBIT_HEADERS);

      expect(res.status).toBe(200);
      // 723780 ms of active time from 07:00 ends in the 13th minute
      expect(fitbitApi.getHeartIntraday).toHaveBeenCalledWith(
        "access-1",
        "2026-10-11",
        "07:00",
        "07:13",
      );
      expect(res.body.workout.points).toEqual([
        { t: 0, lat: null, lon: null, bpm: 112, zone: "outOfRange" },
        { t: 60, lat: null, lon: null, bpm: 145, zone: "cardio" },
        { t: 120, lat: null, lon: null, bpm: 175, zone: "peak" },
      ]);
    });

    it("uses the intraday heart rate when the TCX was refused", async () => {
      passThrough();
      fitbitApi.getActivityTcx.mockRejectedValue(new Error("FITBIT_FORBIDDEN"));
      fitbitApi.getHeartIntraday.mockResolvedValue({
        "activities-heart-intraday": {
          dataset: [
            { time: "07:00:00", value: 112 },
            { time: "07:01:00", value: 145 },
            { time: "07:02:00", value: 175 },
          ],
        },
      });
      const res = await request(app).get(URL).set(FITBIT_HEADERS);
      expect(res.body.workout.needsReconnect).toBe(true);
      expect(res.body.workout.points).toHaveLength(3);
    });

    it("still returns the workout when the intraday call is refused", async () => {
      passThrough();
      fitbitApi.getActivityTcx.mockResolvedValue(tcxXml([]));
      fitbitApi.getHeartIntraday.mockRejectedValue(new Error("FITBIT_FORBIDDEN"));
      const res = await request(app).get(URL).set(FITBIT_HEADERS);
      expect(res.status).toBe(200);
      expect(res.body.workout.points).toEqual([]);
    });

    it("matches a logId sent as a string", async () => {
      passThrough();
      fitbitApi.getActivities.mockResolvedValue([
        { ...run, logId: "904183528666901765" },
      ]);
      const res = await request(app)
        .get("/api/fitbit/workout/2026-10-11/904183528666901765")
        .set(FITBIT_HEADERS);
      expect(res.status).toBe(200);
      expect(fitbitApi.getActivityTcx).toHaveBeenCalledWith(
        "access-1",
        "904183528666901765",
      );
      expect(res.body.workout.logId).toBe("904183528666901765");
      expect(res.body.workout.needsReconnect).toBe(false);
    });

    it("returns 502 when a data call is refused", async () => {
      fitbitApi.withFreshToken.mockRejectedValue(new Error("FITBIT_FORBIDDEN"));
      const res = await request(app).get(URL).set(FITBIT_HEADERS);
      expect(res.status).toBe(502);
      expect(res.body).toEqual({ error: "FITBIT_API_ERROR" });
    });

    it("returns 404 WORKOUT_NOT_FOUND without fetching a TCX for an unknown logId", async () => {
      passThrough();
      const res = await request(app)
        .get("/api/fitbit/workout/2026-10-11/999")
        .set(FITBIT_HEADERS);
      expect(res.status).toBe(404);
      expect(res.body).toEqual({ error: "WORKOUT_NOT_FOUND" });
      expect(fitbitApi.getActivityTcx).not.toHaveBeenCalled();
    });

    it("keeps refreshed tokens on a 404", async () => {
      passThrough({ ...TOKENS, accessToken: "access-2", refreshToken: "refresh-2" });
      const res = await request(app)
        .get("/api/fitbit/workout/2026-10-11/999")
        .set(FITBIT_HEADERS);
      expect(res.status).toBe(404);
      expect(res.body.refreshedTokens.refreshToken).toBe("refresh-2");
    });

    it("includes refreshedTokens when the service refreshed", async () => {
      passThrough({ ...TOKENS, accessToken: "access-2", refreshToken: "refresh-2" });
      const res = await request(app).get(URL).set(FITBIT_HEADERS);
      expect(res.status).toBe(200);
      expect(fitbitApi.getActivityTcx.mock.calls[0][0]).toBe("access-2");
      expect(res.body.refreshedTokens.refreshToken).toBe("refresh-2");
    });

    it("returns 502 with any refreshed tokens when Fitbit fails", async () => {
      const error = new Error("FITBIT_API_ERROR");
      error.refreshedTokens = { ...TOKENS, refreshToken: "refresh-2" };
      fitbitApi.withFreshToken.mockRejectedValue(error);
      const res = await request(app).get(URL).set(FITBIT_HEADERS);
      expect(res.status).toBe(502);
      expect(res.body.refreshedTokens.refreshToken).toBe("refresh-2");
    });
  });

  describe("GET /api/fitbit/workouts/:month", () => {
    beforeEach(() => {
      fitbitApi.getActivitiesFrom.mockResolvedValue([
        { logId: 1, activityName: "Run", startTime: "2026-10-01T07:00:00.000-07:00" },
        { logId: 2, activityName: "Yoga", startTime: "2026-10-02T07:00:00.000-07:00" },
        { logId: 3, activityName: "Weights", startTime: "2026-10-11T17:00:00.000-07:00" },
        { logId: 4, activityName: "Walk", startTime: "2026-11-02T07:00:00.000-07:00" },
      ]);
    });

    it("requires a Firebase ID token", async () => {
      const res = await request(app)
        .get("/api/fitbit/workouts/2026-10")
        .set("X-Fitbit-Token", "a");
      expect(res.status).toBe(401);
    });

    it("returns 400 for a bad month", async () => {
      for (const month of ["2026-13", "2026-1", "october"]) {
        const res = await request(app)
          .get(`/api/fitbit/workouts/${month}`)
          .set(FITBIT_HEADERS);
        expect(res.status).toBe(400);
        expect(res.body).toEqual({ error: "INVALID_MONTH" });
      }
    });

    it("returns the month's workouts from one list call", async () => {
      passThrough();
      const res = await request(app)
        .get("/api/fitbit/workouts/2026-10")
        .set(FITBIT_HEADERS);

      expect(res.status).toBe(200);
      expect(fitbitApi.getActivitiesFrom).toHaveBeenCalledTimes(1);
      expect(fitbitApi.getActivitiesFrom).toHaveBeenCalledWith(
        "access-1",
        "2026-10-01",
        100,
      );
      expect(res.body).toEqual({
        month: "2026-10",
        workouts: [
          { date: "2026-10-01", logId: 1, type: "Run" },
          { date: "2026-10-11", logId: 3, type: "Weights" },
        ],
      });
    });

    it("includes refreshedTokens when the service refreshed", async () => {
      passThrough({ ...TOKENS, accessToken: "access-2", refreshToken: "refresh-2" });
      const res = await request(app)
        .get("/api/fitbit/workouts/2026-10")
        .set(FITBIT_HEADERS);
      expect(res.body.refreshedTokens.refreshToken).toBe("refresh-2");
    });

    it("returns 401 FITBIT_REAUTH_REQUIRED when the refresh fails", async () => {
      fitbitApi.withFreshToken.mockRejectedValue(
        new Error("FITBIT_REAUTH_REQUIRED"),
      );
      const res = await request(app)
        .get("/api/fitbit/workouts/2026-10")
        .set(FITBIT_HEADERS);
      expect(res.status).toBe(401);
      expect(res.body).toEqual({ error: "FITBIT_REAUTH_REQUIRED" });
    });
  });
});
