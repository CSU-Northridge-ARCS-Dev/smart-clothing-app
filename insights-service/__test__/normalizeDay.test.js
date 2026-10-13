const { normalizeDay } = require("../src/lib/normalizeDay");

// Shapes follow the Fitbit Web API responses (sleep v1.2, heart over a 2-day range,
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
        data: [
          { dateTime: "2026-10-09T23:10:00.000", level: "wake", seconds: 600, extra: 1 },
          { dateTime: "2026-10-09T23:20:00.000", level: "light", seconds: 1800 },
          { dateTime: "2026-10-09T23:50:00.000", level: "deep", seconds: 2400 },
        ],
      },
    },
  ],
};

const heartFixture = {
  "activities-heart": [
    { dateTime: "2026-10-09", value: { restingHeartRate: 59 } },
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

  it("takes steps from the daily summary", () => {
    const withSteps = normalizeDay("2026-10-10", null, null, [], {
      summary: { steps: 8432 },
    });
    expect(withSteps.steps).toBe(8432);
  });

  it("keeps 0 steps and returns null steps without a summary", () => {
    expect(
      normalizeDay("2026-10-10", null, null, [], { summary: { steps: 0 } }).steps,
    ).toBe(0);
    expect(day.steps).toBeNull();
    expect(normalizeDay("2026-10-10", null, null, [], {}).steps).toBeNull();
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
      levels: [
        { dateTime: "2026-10-09T23:10:00.000", level: "wake", seconds: 600 },
        { dateTime: "2026-10-09T23:20:00.000", level: "light", seconds: 1800 },
        { dateTime: "2026-10-09T23:50:00.000", level: "deep", seconds: 2400 },
      ],
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
    expect(sleep.levels).toEqual([]);
  });

  it("returns null sleep when there are no sleep logs", () => {
    expect(normalizeDay("2026-10-10", { sleep: [] }, heartFixture, []).sleep)
      .toBeNull();
    expect(normalizeDay("2026-10-10", null, heartFixture, []).sleep).toBeNull();
  });

  it("returns resting HR, yesterday's resting HR and zone minutes", () => {
    expect(day.heart).toEqual({
      restingHeartRate: 56,
      previousRestingHeartRate: 59,
      zones: { fatBurn: 45, cardio: 22, peak: 4 },
    });
  });

  it("uses the entry for the date, whatever the order", () => {
    const reversed = {
      "activities-heart": [...heartFixture["activities-heart"]].reverse(),
    };
    const heart = normalizeDay("2026-10-10", null, reversed, []).heart;
    expect(heart.restingHeartRate).toBe(56);
    expect(heart.previousRestingHeartRate).toBe(59);
  });

  it("returns a null resting HR and zero zones when heart data is missing", () => {
    const noResting = {
      "activities-heart": [
        { dateTime: "2026-10-10", value: { heartRateZones: [] } },
      ],
    };
    expect(normalizeDay("2026-10-10", null, noResting, []).heart).toEqual({
      restingHeartRate: null,
      previousRestingHeartRate: null,
      zones: { fatBurn: 0, cardio: 0, peak: 0 },
    });
    expect(normalizeDay("2026-10-10", null, {}, []).heart.restingHeartRate)
      .toBeNull();
  });

  it("keeps only Run, Weights and Walk workouts", () => {
    expect(day.workouts.map((w) => w.type)).toEqual(["Run", "Weights", "Walk"]);
  });

  it("shows a Workout with GPS and a distance as a Run", () => {
    // Shape of the lead's real Pixel Watch run on 2026-10-11 (activityTypeId 91060)
    const out = normalizeDay("2026-10-11", null, null, [
      {
        activityName: "Workout",
        activityTypeId: 91060,
        hasGps: true,
        activeDuration: 723780,
        distance: 1.6049,
        distanceUnit: "Kilometer",
        averageHeartRate: 175,
      },
    ]);
    expect(out.workouts[0]).toMatchObject({
      type: "Run",
      durationMin: 12,
      avgHeartRate: 175,
      distanceKm: 1.6,
      paceMinPerKm: 7.5,
    });
  });

  it("keeps a generic Workout, with distance and pace only when Fitbit has one", () => {
    const out = normalizeDay("2026-10-11", null, null, [
      { activityName: "Workout", activeDuration: 723780 },
      { activityName: "Workout", activeDuration: 720000, distance: 2.1, distanceUnit: "Kilometer" },
    ]);
    expect(out.workouts.map((w) => w.type)).toEqual(["Workout", "Workout"]);
    expect(out.workouts[0].durationMin).toBe(12);
    expect(out.workouts[0]).not.toHaveProperty("distanceKm");
    expect(out.workouts[1].distanceKm).toBe(2.1);
    expect(out.workouts[1].paceMinPerKm).toBe(5.7);
  });

  it("adds distance and pace to a run", () => {
    expect(day.workouts[0]).toEqual({
      logId: null,
      type: "Run",
      startTime: "2026-10-10T07:00:00.000-07:00",
      durationMin: 30,
      avgHeartRate: 152,
      calories: null,
      steps: null,
      hasGps: false,
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

  it("keeps the logId, calories, steps and GPS flag from the activity record", () => {
    const out = normalizeDay("2026-10-11", null, null, [
      {
        logId: 74512345678,
        activityName: "Workout",
        hasGps: true,
        activeDuration: 723780,
        distance: 1.6049,
        distanceUnit: "Kilometer",
        calories: 164,
        steps: 1932,
      },
    ]);
    expect(out.workouts[0]).toMatchObject({
      logId: 74512345678,
      calories: 164,
      steps: 1932,
      hasGps: true,
    });
  });

  it("returns an empty workout list when there are no activities", () => {
    expect(normalizeDay("2026-10-10", null, null, undefined).workouts).toEqual([]);
  });
});
