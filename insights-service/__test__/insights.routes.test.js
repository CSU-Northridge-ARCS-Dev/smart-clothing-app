jest.mock("../src/lib/firebaseAdmin", () => ({ verifyIdToken: jest.fn() }));
jest.mock("../src/lib/fitbit-api", () => ({
  getSleep: jest.fn(),
  getHeart: jest.fn(),
  getActivities: jest.fn(),
  getDaySummary: jest.fn(),
  withFreshToken: jest.fn(),
}));
jest.mock("../src/lib/usageLog", () => ({ logUsage: jest.fn() }));

const request = require("supertest");
const { setFitbitEnv } = require("./helpers");
const { verifyIdToken } = require("../src/lib/firebaseAdmin");
const fitbitApi = require("../src/lib/fitbit-api");
const { logUsage } = require("../src/lib/usageLog");
const { createApp } = require("../src/app");

const URL = "/api/insights/generate";
const AUTH = { Authorization: "Bearer good-token" };
const FITBIT_HEADERS = {
  ...AUTH,
  "X-Fitbit-Token": "access-1",
  "X-Fitbit-Refresh-Token": "refresh-1",
};
const REFRESHED = {
  accessToken: "access-2",
  refreshToken: "refresh-2",
  expiresAt: "2026-10-12T08:00:00.000Z",
  fitbitUserId: "FITBIT123",
};
const INSIGHT = {
  headline: "Solid run on decent sleep - build",
  keySignals: ["6h40m sleep - adequate recovery"],
  focus: ["Good recovery - room to push next session"],
};
const PROFILE = {
  gender: "Male",
  age: 21,
  height: 70,
  weight: 165,
  sports: "No Data",
};

function claudeReply(extra = {}) {
  return {
    model: "claude-opus-5-5",
    stop_reason: "end_turn",
    content: [{ type: "text", text: JSON.stringify(INSIGHT) }],
    usage: { input_tokens: 1500, output_tokens: 200 },
    ...extra,
  };
}

// Make withFreshToken run the callback like the real one does
function passThrough(refreshedTokens = null) {
  fitbitApi.withFreshToken.mockImplementation(async (tokens, fn) => ({
    result: await fn(refreshedTokens ? refreshedTokens.accessToken : tokens.accessToken),
    refreshedTokens,
  }));
}

describe("POST /api/insights/generate", () => {
  let app;
  let create;

  beforeEach(() => {
    jest.clearAllMocks();
    setFitbitEnv();
    process.env.ANTHROPIC_API_KEY = "sk-test";
    process.env.COACH_MODEL = "claude-opus-5-5";
    delete process.env.USAGE_LOG_PATH;
    verifyIdToken.mockImplementation(async (token) => {
      if (token === "good-token") return { uid: "user-1" };
      throw new Error("invalid");
    });

    fitbitApi.getDaySummary.mockResolvedValue({ summary: { steps: 8432 } });
    fitbitApi.getSleep.mockResolvedValue({
      sleep: [
        {
          isMainSleep: true,
          type: "stages",
          minutesAsleep: 400,
          efficiency: 92,
          startTime: "2026-10-10T23:30:00.000",
          endTime: "2026-10-11T06:50:00.000",
          levels: {
            summary: {
              deep: { minutes: 70 },
              light: { minutes: 230 },
              rem: { minutes: 100 },
              wake: { minutes: 20 },
            },
            data: [{ dateTime: "2026-10-10T23:30:00.000", level: "wake", seconds: 60 }],
          },
        },
      ],
    });
    fitbitApi.getHeart.mockResolvedValue({
      "activities-heart": [
        { dateTime: "2026-10-11", value: { restingHeartRate: 58 } },
      ],
    });
    fitbitApi.getActivities.mockResolvedValue([
      { activityName: "Run", activeDuration: 720000, averageHeartRate: 170 },
    ]);
    passThrough();

    create = jest.fn().mockResolvedValue(claudeReply());
    app = createApp({ coachClient: { beta: { messages: { create } } } });
    jest.spyOn(console, "error").mockImplementation(() => {});
    jest.spyOn(console, "warn").mockImplementation(() => {});
  });

  afterEach(() => {
    console.error.mockRestore();
    console.warn.mockRestore();
    delete process.env.ANTHROPIC_API_KEY;
    delete process.env.COACH_MODEL;
  });

  const generate = (body = { date: "2026-10-11", profile: PROFILE }) =>
    request(app).post(URL).set(FITBIT_HEADERS).send(body);

  it("requires a Firebase ID token", async () => {
    const res = await request(app)
      .post(URL)
      .set("X-Fitbit-Token", "access-1")
      .send({ date: "2026-10-11" });
    expect(res.status).toBe(401);
    expect(res.body).toEqual({ error: "UNAUTHENTICATED" });
    expect(create).not.toHaveBeenCalled();
  });

  it.each([undefined, "today", "2026-1-1", 20261011])(
    "returns 400 for date %s",
    async (date) => {
      const res = await generate({ date });
      expect(res.status).toBe(400);
      expect(res.body).toEqual({ error: "INVALID_DATE" });
    },
  );

  it("returns 401 FITBIT_NOT_CONNECTED without a Fitbit token", async () => {
    const res = await request(app).post(URL).set(AUTH).send({ date: "2026-10-11" });
    expect(res.status).toBe(401);
    expect(res.body).toEqual({ error: "FITBIT_NOT_CONNECTED" });
  });

  it.each(["ANTHROPIC_API_KEY", "COACH_MODEL"])(
    "returns 500 COACH_NOT_CONFIGURED without %s",
    async (key) => {
      delete process.env[key];
      // Only a missing model matters when a client is passed in
      const res =
        key === "COACH_MODEL"
          ? await generate()
          : await request(createApp()).post(URL).set(FITBIT_HEADERS).send({
              date: "2026-10-11",
            });
      expect(res.status).toBe(500);
      expect(res.body).toEqual({ error: "COACH_NOT_CONFIGURED" });
      expect(fitbitApi.withFreshToken).not.toHaveBeenCalled();
    },
  );

  it("returns the insight and usage, and logs the usage", async () => {
    const res = await generate();

    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      insight: INSIGHT,
      usage: { model: "claude-opus-5-5", inputTokens: 1500, outputTokens: 200 },
    });
    expect(fitbitApi.withFreshToken.mock.calls[0][0]).toEqual({
      accessToken: "access-1",
      refreshToken: "refresh-1",
    });
    expect(fitbitApi.getSleep).toHaveBeenCalledWith("access-1", "2026-10-11");
    expect(logUsage).toHaveBeenCalledWith(
      {
        date: "2026-10-11",
        model: "claude-opus-5-5",
        inputTokens: 1500,
        outputTokens: 200,
      },
      {},
    );
  });

  it("sends the sanitized profile and the day without the sleep timeline", async () => {
    await generate();
    const params = create.mock.calls[0][0];

    expect(params.model).toBe("claude-opus-5-5");
    expect(params.system).toContain("- Age: 21");
    expect(params.system).toContain(`- Height: 5'10"`);
    expect(params.system).not.toContain("No Data");
    expect(params.messages[0].content).toContain("Sleep: 6h 40min asleep");
    expect(params.messages[0].content).toContain("- Run at");
    expect(params.messages[0].content).not.toContain("levels");
  });

  it("writes the usage row to USAGE_LOG_PATH when it is set", async () => {
    process.env.USAGE_LOG_PATH = "/tmp/usage.csv";
    await generate();
    expect(logUsage.mock.calls[0][1]).toEqual({ filePath: "/tmp/usage.csv" });
  });

  it("returns NO_DATA without calling Claude when there is no sleep or workout", async () => {
    fitbitApi.getSleep.mockResolvedValue({ sleep: [] });
    fitbitApi.getActivities.mockResolvedValue([{ activityName: "Yoga" }]);

    const res = await generate();

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ insight: null, reason: "NO_DATA" });
    expect(create).not.toHaveBeenCalled();
    expect(logUsage).not.toHaveBeenCalled();
  });

  it("returns refreshed tokens with the insight", async () => {
    passThrough(REFRESHED);
    const res = await generate();
    expect(res.status).toBe(200);
    expect(res.body.refreshedTokens).toEqual(REFRESHED);
    expect(fitbitApi.getSleep).toHaveBeenCalledWith("access-2", "2026-10-11");
  });

  it("returns refreshed tokens with NO_DATA", async () => {
    passThrough(REFRESHED);
    fitbitApi.getSleep.mockResolvedValue({ sleep: [] });
    fitbitApi.getActivities.mockResolvedValue([]);
    const res = await generate();
    expect(res.body).toEqual({ insight: null, reason: "NO_DATA", refreshedTokens: REFRESHED });
  });

  it("returns 401 FITBIT_REAUTH_REQUIRED when the token can't be refreshed", async () => {
    fitbitApi.withFreshToken.mockRejectedValue(new Error("FITBIT_REAUTH_REQUIRED"));
    const res = await generate();
    expect(res.status).toBe(401);
    expect(res.body).toEqual({ error: "FITBIT_REAUTH_REQUIRED" });
    expect(create).not.toHaveBeenCalled();
  });

  it("returns 502 with refreshed tokens when Fitbit fails", async () => {
    const error = new Error("FITBIT_API_ERROR");
    error.refreshedTokens = REFRESHED;
    fitbitApi.withFreshToken.mockRejectedValue(error);
    const res = await generate();
    expect(res.status).toBe(502);
    expect(res.body).toEqual({ error: "FITBIT_API_ERROR", refreshedTokens: REFRESHED });
  });

  it("returns 502 COACH_API_ERROR with refreshed tokens when Claude fails", async () => {
    passThrough(REFRESHED);
    create.mockRejectedValue(new Error("overloaded"));
    const res = await generate();
    expect(res.status).toBe(502);
    expect(res.body).toEqual({ error: "COACH_API_ERROR", refreshedTokens: REFRESHED });
    expect(logUsage).not.toHaveBeenCalled();
  });

  it("returns 502 COACH_REFUSED on a refusal", async () => {
    create.mockResolvedValue(
      claudeReply({ stop_reason: "refusal", stop_details: { type: "refusal" }, content: [] }),
    );
    const res = await generate();
    expect(res.status).toBe(502);
    expect(res.body).toEqual({ error: "COACH_REFUSED" });
  });

  it("works without a profile", async () => {
    const res = await generate({ date: "2026-10-11" });
    expect(res.status).toBe(200);
    expect(create.mock.calls[0][0].system).toContain("hasn't filled in their profile");
  });
});
