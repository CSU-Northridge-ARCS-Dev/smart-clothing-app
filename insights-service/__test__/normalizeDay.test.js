const { normalizeDay } = require("../src/lib/normalizeDay");

// Shapes follow the Fitbit Web API responses (sleep v1.2, heart 1d,
// activities/list). Values are made up.
const sleepFixture = {
  sleep: [
    {
      isMainSleep: false,
      type: "classic",
      duration: 1800000,
      minutesAsleep: 28,
      startTime: "2026-10-10T14:00:00.000",
      endTime: "2026-10-10T14:30:00.000",
    },
    {
      isMainSleep: true,
      type: "stages",
      duration: 27000000,
      minutesAsleep: 412,
      efficiency: 93,
      startTime: "2026-10-09T23:10:00.000",
      endTime: "2026-10-10T06:40:00.000",
      levels: {
        summary: {
          deep: { minutes: 70 },
          light: { minutes: 240 },
          rem: { minutes: 102 },
          wake: { minutes: 38 },
        },
      },
    },
  ],
};

const heartFixture = {
  "activities-heart": [
    {
      dateTime: "2026-10-10",
      value: {
        restingHeartRate: 56,
        heartRateZones: [
          { name: "Out of Range", minutes: 1200 },
          { name: "Fat Burn", minutes: 45 },
          { name: "Cardio", minutes: 22 },
          { name: "Peak", minutes: 4 },
        ],
      },
    },
  ],
};

const activitiesFixture = [
  {
    activityName: "Run",
    startTime: "2026-10-10T07:00:00.000-07:00",
    activeDuration: 1800000,
    averageHeartRate: 152,
    distance: 5,
    distanceUnit: "Kilometer",
    heartRateZones: [
      { name: "Fat Burn", minutes: 5 },
      { name: "Cardio", minutes: 20 },
      { name: "Peak", minutes: 5 },
    ],
  },
  {
    activityName: "Weights",
    startTime: "2026-10-10T17:00:00.000-07:00",
    activeDuration: 2700000,
    averageHeartRate: 110,
    heartRateZones: [{ name: "Fat Burn", minutes: 15 }],
  },
  {
    activityName: "Walk",
    startTime: "2026-10-10T19:00:00.000-07:00",
    activeDuration: 1200000,
    averageHeartRate: 95,
    distance: 1,
    distanceUnit: "Mile",
  },
  {
    activityName: "Bike",
    startTime: "2026-10-10T12:00:00.000-07:00",
    activeDuration: 600000,
  },
];

describe("normalizeDay", () => {
  const day = normalizeDay(
    "2026-10-10",
    sleepFixture,
    heartFixture,
    activitiesFixture,
  );

  it("keeps the date", () => {
    expect(day.date).toBe("2026-10-10");
  });

  it("uses the main sleep log and its stage minutes", () => {
    expect(day.sleep).toEqual({
      totalMinutes: 412,
      efficiency: 93,
      deep: 70,
      light: 240,
      rem: 102,
      wake: 38,
      bedTime: "2026-10-09T23:10:00.000",
      wakeTime: "2026-10-10T06:40:00.000",
    });
  });

  it("falls back to the longest log when none is main, with null stages for classic logs", () => {
    const classicOnly = {
      sleep: [
        { type: "classic", duration: 1000, minutesAsleep: 10 },
        { type: "classic", duration: 9000, minutesAsleep: 150, efficiency: 80 },
      ],
    };
    const sleep = normalizeDay("2026-10-10", classicOnly, null, []).sleep;
    expect(sleep.totalMinutes).toBe(150);
    expect(sleep.deep).toBeNull();
    expect(sleep.rem).toBeNull();
  });

  it("returns null sleep when there are no sleep logs", () => {
    expect(normalizeDay("2026-10-10", { sleep: [] }, heartFixture, []).sleep)
      .toBeNull();
    expect(normalizeDay("2026-10-10", null, heartFixture, []).sleep).toBeNull();
  });

  it("returns resting HR and zone minutes", () => {
    expect(day.heart).toEqual({
      restingHeartRate: 56,
      zones: { fatBurn: 45, cardio: 22, peak: 4 },
    });
  });

  it("returns a null resting HR and zero zones when heart data is missing", () => {
    const noResting = {
      "activities-heart": [{ value: { heartRateZones: [] } }],
    };
    expect(normalizeDay("2026-10-10", null, noResting, []).heart).toEqual({
      restingHeartRate: null,
      zones: { fatBurn: 0, cardio: 0, peak: 0 },
    });
    expect(normalizeDay("2026-10-10", null, {}, []).heart.restingHeartRate)
      .toBeNull();
  });

  it("keeps only Run, Weights and Walk workouts", () => {
    expect(day.workouts.map((w) => w.type)).toEqual(["Run", "Weights", "Walk"]);
  });

  it("adds distance and pace to a run", () => {
    expect(day.workouts[0]).toEqual({
      type: "Run",
      startTime: "2026-10-10T07:00:00.000-07:00",
      durationMin: 30,
      avgHeartRate: 152,
      zones: { fatBurn: 5, cardio: 20, peak: 5 },
      distanceKm: 5,
      paceMinPerKm: 6,
    });
  });

  it("has no distance on a weights session", () => {
    const weights = day.workouts[1];
    expect(weights.durationMin).toBe(45);
    expect(weights).not.toHaveProperty("distanceKm");
    expect(weights).not.toHaveProperty("paceMinPerKm");
  });

  it("converts a walk in miles to km", () => {
    const walk = day.workouts[2];
    expect(walk.distanceKm).toBe(1.6);
    expect(walk.paceMinPerKm).toBe(12.4);
    expect(walk.zones).toEqual({ fatBurn: 0, cardio: 0, peak: 0 });
  });

  it("returns an empty workout list when there are no activities", () => {
    expect(normalizeDay("2026-10-10", null, null, undefined).workouts).toEqual([]);
  });
});
