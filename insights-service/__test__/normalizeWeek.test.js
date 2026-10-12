const { normalizeWeek, weekDates } = require("../src/lib/normalizeWeek");

// Shapes follow the Fitbit steps time series and sleep v1.2 range responses
const stepsFixture = {
  "activities-steps": [
    { dateTime: "2026-10-04", value: "0" },
    { dateTime: "2026-10-05", value: "10500" },
    { dateTime: "2026-10-07", value: "6230" },
    { dateTime: "2026-10-10", value: "12004" },
  ],
};

const sleepFixture = {
  sleep: [
    // Nap and main sleep on the same date: the main sleep wins
    { dateOfSleep: "2026-10-10", isMainSleep: false, duration: 1800000, minutesAsleep: 28 },
    { dateOfSleep: "2026-10-10", isMainSleep: true, duration: 27000000, minutesAsleep: 412, type: "stages" },
    // Classic log with no main flag: the only log for the date
    { dateOfSleep: "2026-10-08", type: "classic", duration: 20000000, minutesAsleep: 301 },
    // Two logs, none main: the longest one
    { dateOfSleep: "2026-10-06", duration: 3600000, minutesAsleep: 55 },
    { dateOfSleep: "2026-10-06", duration: 25000000, minutesAsleep: 380 },
  ],
};

describe("weekDates", () => {
  it("returns the 7 dates ending at endDate, oldest first", () => {
    expect(weekDates("2026-10-10")).toEqual([
      "2026-10-04",
      "2026-10-05",
      "2026-10-06",
      "2026-10-07",
      "2026-10-08",
      "2026-10-09",
      "2026-10-10",
    ]);
  });

  it("crosses month and year boundaries", () => {
    expect(weekDates("2026-01-03")[0]).toBe("2025-12-28");
    expect(weekDates("2028-03-02")).toContain("2028-02-29");
  });
});

describe("normalizeWeek", () => {
  const week = normalizeWeek("2026-10-10", stepsFixture, sleepFixture);

  it("returns one entry per day for 7 days", () => {
    expect(week).toHaveLength(7);
    expect(week.map((d) => d.date)).toEqual(weekDates("2026-10-10"));
  });

  it("turns Fitbit's string step values into numbers and keeps 0", () => {
    expect(week[0].steps).toBe(0);
    expect(week[1].steps).toBe(10500);
    expect(week[6].steps).toBe(12004);
  });

  it("uses null for days with no steps entry", () => {
    expect(week[2].steps).toBeNull();
    expect(week[5].steps).toBeNull();
  });

  it("counts the main sleep, not naps", () => {
    expect(week[6].sleepMinutes).toBe(412);
  });

  it("uses the longest log when none is main, and classic logs", () => {
    expect(week[2].sleepMinutes).toBe(380);
    expect(week[4].sleepMinutes).toBe(301);
  });

  it("uses null for nights with no sleep log", () => {
    expect(week[0].sleepMinutes).toBeNull();
    expect(week[5].sleepMinutes).toBeNull();
  });

  it("ignores entries outside the week", () => {
    const out = normalizeWeek(
      "2026-10-10",
      { "activities-steps": [{ dateTime: "2026-09-30", value: "999" }] },
      { sleep: [{ dateOfSleep: "2026-10-11", isMainSleep: true, minutesAsleep: 400 }] },
    );
    expect(out.every((d) => d.steps === null && d.sleepMinutes === null)).toBe(true);
  });

  it("returns an all-null week for empty or missing responses", () => {
    for (const out of [
      normalizeWeek("2026-10-10", {}, {}),
      normalizeWeek("2026-10-10", null, null),
    ]) {
      expect(out).toHaveLength(7);
      expect(out.every((d) => d.steps === null && d.sleepMinutes === null)).toBe(true);
    }
  });
});
