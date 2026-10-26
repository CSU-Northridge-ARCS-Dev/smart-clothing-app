jest.mock("../src/lib/fitbit-api", () => ({
  getSleep: jest.fn(),
  getHeart: jest.fn(),
  getActivities: jest.fn(),
  getDaySummary: jest.fn(),
  getHeartDay5min: jest.fn(),
  getVo2Max: jest.fn(),
}));

const fitbitApi = require("../src/lib/fitbit-api");
const { fetchDayRaw, toDay } = require("../src/lib/fitbitDay");

describe("fetchDayRaw", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, "warn").mockImplementation(() => {});
    fitbitApi.getSleep.mockResolvedValue({ sleep: [] });
    fitbitApi.getHeart.mockResolvedValue({
      "activities-heart": [
        { dateTime: "2026-10-20", value: { restingHeartRate: 57 } },
      ],
    });
    fitbitApi.getActivities.mockResolvedValue([]);
    fitbitApi.getDaySummary.mockResolvedValue({ summary: { steps: 9842 } });
    fitbitApi.getHeartDay5min.mockResolvedValue({
      "activities-heart-intraday": { dataset: [{ time: "00:05:00", value: 60 }] },
    });
    fitbitApi.getVo2Max.mockResolvedValue({
      cardioScore: [{ dateTime: "2026-10-20", value: { vo2Max: "44-48" } }],
    });
  });

  afterEach(() => {
    console.warn.mockRestore();
  });

  it("makes all six calls with the token and date", async () => {
    const day = toDay("2026-10-20", await fetchDayRaw("tok", "2026-10-20"));
    for (const fn of Object.values(fitbitApi)) {
      expect(fn).toHaveBeenCalledWith("tok", "2026-10-20");
    }
    expect(day.heart.hr5min[1]).toBe(60);
    expect(day.vo2Max).toEqual({ low: 44, high: 48 });
  });

  it("gives null for a failed 5-minute call and the day still loads", async () => {
    fitbitApi.getHeartDay5min.mockRejectedValue(new Error("FITBIT_API_ERROR"));
    const day = toDay("2026-10-20", await fetchDayRaw("tok", "2026-10-20"));
    expect(day.heart.hr5min).toBeNull();
    expect(day.heart.restingHeartRate).toBe(57);
    expect(day.steps).toBe(9842);
    expect(console.warn).toHaveBeenCalled();
  });

  it("gives null VO2 max when the login lacks the cardio_fitness scope", async () => {
    fitbitApi.getVo2Max.mockRejectedValue(new Error("FITBIT_FORBIDDEN"));
    const day = toDay("2026-10-20", await fetchDayRaw("tok", "2026-10-20"));
    expect(day.vo2Max).toBeNull();
    expect(day.heart.hr5min).not.toBeNull();
  });

  it.each(["getHeartDay5min", "getVo2Max"])(
    "rethrows an expired token from %s so the caller can refresh",
    async (name) => {
      fitbitApi[name].mockRejectedValue(new Error("FITBIT_TOKEN_EXPIRED"));
      await expect(fetchDayRaw("tok", "2026-10-20")).rejects.toThrow(
        "FITBIT_TOKEN_EXPIRED",
      );
    },
  );

  it("still fails the day when a required call fails", async () => {
    fitbitApi.getSleep.mockRejectedValue(new Error("FITBIT_API_ERROR"));
    await expect(fetchDayRaw("tok", "2026-10-20")).rejects.toThrow(
      "FITBIT_API_ERROR",
    );
  });
});
