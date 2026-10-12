const { fakeResponse, tokenBody, setFitbitEnv } = require("./helpers");
const fitbitApi = require("../src/lib/fitbit-api");

describe("fitbit-api", () => {
  beforeEach(() => {
    setFitbitEnv();
    global.fetch = jest.fn();
    jest.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    delete global.fetch;
    console.error.mockRestore();
  });

  describe("exchangeCodeForTokens", () => {
    it("posts the code with Basic auth and returns a token pair", async () => {
      fetch.mockResolvedValue(fakeResponse(200, tokenBody()));

      const tokens = await fitbitApi.exchangeCodeForTokens("the-code");

      const [url, init] = fetch.mock.calls[0];
      expect(url).toBe("https://api.fitbit.com/oauth2/token");
      expect(init.method).toBe("POST");
      expect(init.headers.Authorization).toBe(
        `Basic ${Buffer.from("client-id:client-secret").toString("base64")}`,
      );
      const body = new URLSearchParams(init.body);
      expect(body.get("grant_type")).toBe("authorization_code");
      expect(body.get("code")).toBe("the-code");
      expect(body.get("redirect_uri")).toBe(
        "https://tunnel.example/api/fitbit/callback",
      );

      expect(tokens).toMatchObject({
        accessToken: "access-1",
        refreshToken: "refresh-1",
        fitbitUserId: "FITBIT123",
      });
      expect(new Date(tokens.expiresAt).getTime()).toBeGreaterThan(Date.now());
    });

    it("throws TOKEN_EXCHANGE_FAILED when Fitbit rejects the code", async () => {
      fetch.mockResolvedValue(fakeResponse(400, { errors: [] }));
      await expect(fitbitApi.exchangeCodeForTokens("bad")).rejects.toThrow(
        "TOKEN_EXCHANGE_FAILED",
      );
    });
  });

  describe("refreshTokens", () => {
    it("posts the refresh token and returns the new pair", async () => {
      fetch.mockResolvedValue(fakeResponse(200, tokenBody("2")));

      const tokens = await fitbitApi.refreshTokens("refresh-1");

      const body = new URLSearchParams(fetch.mock.calls[0][1].body);
      expect(body.get("grant_type")).toBe("refresh_token");
      expect(body.get("refresh_token")).toBe("refresh-1");
      expect(tokens.accessToken).toBe("access-2");
      expect(tokens.refreshToken).toBe("refresh-2");
    });

    it("throws FITBIT_REAUTH_REQUIRED when the refresh token is rejected", async () => {
      fetch.mockResolvedValue(fakeResponse(400, { errors: [] }));
      await expect(fitbitApi.refreshTokens("used")).rejects.toThrow(
        "FITBIT_REAUTH_REQUIRED",
      );
    });
  });

  describe("data calls", () => {
    it("getSleep calls the v1.2 sleep endpoint with the Bearer token", async () => {
      fetch.mockResolvedValue(fakeResponse(200, { sleep: [] }));
      await fitbitApi.getSleep("tok", "2026-10-10");
      const [url, init] = fetch.mock.calls[0];
      expect(url).toBe(
        "https://api.fitbit.com/1.2/user/-/sleep/date/2026-10-10.json",
      );
      expect(init.headers.Authorization).toBe("Bearer tok");
    });

    it("getHeart asks for the day before and the date", async () => {
      fetch.mockResolvedValue(fakeResponse(200, {}));
      await fitbitApi.getHeart("tok", "2026-10-10");
      expect(fetch.mock.calls[0][0]).toBe(
        "https://api.fitbit.com/1/user/-/activities/heart/date/2026-10-09/2026-10-10.json",
      );
    });

    it("previousDate crosses month and year boundaries", () => {
      expect(fitbitApi.previousDate("2026-11-01")).toBe("2026-10-31");
      expect(fitbitApi.previousDate("2026-01-01")).toBe("2025-12-31");
      expect(fitbitApi.previousDate("2028-03-01")).toBe("2028-02-29");
    });

    it("getActivities keeps only activities that start on the date", async () => {
      fetch.mockResolvedValue(
        fakeResponse(200, {
          activities: [
            { activityName: "Run", startTime: "2026-10-10T07:00:00.000-07:00" },
            { activityName: "Walk", startTime: "2026-10-11T08:00:00.000-07:00" },
            { activityName: "Weights", originalStartTime: "2026-10-10T18:00:00.000-07:00" },
            { activityName: "Bike" },
          ],
        }),
      );

      const list = await fitbitApi.getActivities("tok", "2026-10-10");

      expect(fetch.mock.calls[0][0]).toContain(
        "/1/user/-/activities/list.json?afterDate=2026-10-10",
      );
      expect(list.map((a) => a.activityName)).toEqual(["Run", "Weights"]);
    });

    it("throws FITBIT_TOKEN_EXPIRED on a 401", async () => {
      fetch.mockResolvedValue(fakeResponse(401, { errors: [] }));
      await expect(fitbitApi.getSleep("old", "2026-10-10")).rejects.toThrow(
        "FITBIT_TOKEN_EXPIRED",
      );
    });

    it("throws FITBIT_API_ERROR on other failures", async () => {
      fetch.mockResolvedValue(fakeResponse(429, "Too Many Requests"));
      await expect(fitbitApi.getHeart("tok", "2026-10-10")).rejects.toThrow(
        "FITBIT_API_ERROR",
      );
    });
  });

  describe("withFreshToken", () => {
    it("returns the result with no refresh when the token works", async () => {
      const fn = jest.fn().mockResolvedValue("data");

      const out = await fitbitApi.withFreshToken(
        { accessToken: "a1", refreshToken: "r1" },
        fn,
      );

      expect(out).toEqual({ result: "data", refreshedTokens: null });
      expect(fn).toHaveBeenCalledWith("a1");
      expect(fetch).not.toHaveBeenCalled();
    });

    it("refreshes once on FITBIT_TOKEN_EXPIRED and retries with the new token", async () => {
      fetch.mockResolvedValue(fakeResponse(200, tokenBody("2")));
      const fn = jest
        .fn()
        .mockRejectedValueOnce(new Error("FITBIT_TOKEN_EXPIRED"))
        .mockResolvedValueOnce("data");

      const out = await fitbitApi.withFreshToken(
        { accessToken: "a1", refreshToken: "r1" },
        fn,
      );

      expect(fn).toHaveBeenNthCalledWith(2, "access-2");
      expect(out.result).toBe("data");
      expect(out.refreshedTokens).toMatchObject({
        accessToken: "access-2",
        refreshToken: "refresh-2",
      });
    });

    it("throws FITBIT_REAUTH_REQUIRED when expired and there is no refresh token", async () => {
      const fn = jest.fn().mockRejectedValue(new Error("FITBIT_TOKEN_EXPIRED"));
      await expect(
        fitbitApi.withFreshToken({ accessToken: "a1" }, fn),
      ).rejects.toThrow("FITBIT_REAUTH_REQUIRED");
    });

    it("throws FITBIT_REAUTH_REQUIRED when the refresh fails", async () => {
      fetch.mockResolvedValue(fakeResponse(400, { errors: [] }));
      const fn = jest.fn().mockRejectedValue(new Error("FITBIT_TOKEN_EXPIRED"));
      await expect(
        fitbitApi.withFreshToken({ accessToken: "a1", refreshToken: "r1" }, fn),
      ).rejects.toThrow("FITBIT_REAUTH_REQUIRED");
      expect(fn).toHaveBeenCalledTimes(1);
    });

    it("attaches the new tokens to the error when the retry fails", async () => {
      fetch.mockResolvedValue(fakeResponse(200, tokenBody("2")));
      const fn = jest
        .fn()
        .mockRejectedValueOnce(new Error("FITBIT_TOKEN_EXPIRED"))
        .mockRejectedValueOnce(new Error("FITBIT_API_ERROR"));

      const error = await fitbitApi
        .withFreshToken({ accessToken: "a1", refreshToken: "r1" }, fn)
        .catch((e) => e);

      expect(error.message).toBe("FITBIT_API_ERROR");
      expect(error.refreshedTokens.refreshToken).toBe("refresh-2");
    });

    it("passes other errors straight through without refreshing", async () => {
      const fn = jest.fn().mockRejectedValue(new Error("FITBIT_API_ERROR"));
      await expect(
        fitbitApi.withFreshToken({ accessToken: "a1", refreshToken: "r1" }, fn),
      ).rejects.toThrow("FITBIT_API_ERROR");
      expect(fetch).not.toHaveBeenCalled();
    });
  });
});
