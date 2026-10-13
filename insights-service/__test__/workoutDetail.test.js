const { zoneRanges, zoneForBpm } = require("../src/lib/workoutZones");
const { workoutDetail, monthWorkouts } = require("../src/lib/workoutDetail");
const { tcxXml, ACTIVITY_ZONES } = require("./helpers");

describe("zoneRanges", () => {
  it("maps Fitbit zone names to keys with their bpm ranges, lowest first", () => {
    expect(zoneRanges([...ACTIVITY_ZONES].reverse())).toEqual([
      { key: "outOfRange", min: 30, max: 115 },
      { key: "fatBurn", min: 115, max: 140 },
      { key: "cardio", min: 140, max: 171 },
      { key: "peak", min: 171, max: 220 },
    ]);
  });

  it("skips zones without a range and unknown names", () => {
    expect(
      zoneRanges([
        { name: "Fat Burn", minutes: 5 },
        { name: "Custom", min: 100, max: 120 },
        { name: "Peak", min: 171 },
      ]),
    ).toEqual([{ key: "peak", min: 171, max: null }]);
    expect(zoneRanges(undefined)).toEqual([]);
  });
});

describe("zoneForBpm", () => {
  const ranges = zoneRanges(ACTIVITY_ZONES);

  it("returns the highest zone the bpm reaches", () => {
    expect(zoneForBpm(100, ranges)).toBe("outOfRange");
    expect(zoneForBpm(115, ranges)).toBe("fatBurn");
    expect(zoneForBpm(139, ranges)).toBe("fatBurn");
    expect(zoneForBpm(140, ranges)).toBe("cardio");
    expect(zoneForBpm(171, ranges)).toBe("peak");
    expect(zoneForBpm(230, ranges)).toBe("peak");
  });

  it("is outOfRange below every zone", () => {
    expect(zoneForBpm(20, ranges)).toBe("outOfRange");
  });

  it("is null without a bpm or without ranges", () => {
    expect(zoneForBpm(null, ranges)).toBeNull();
    expect(zoneForBpm(150, [])).toBeNull();
  });
});

describe("workoutDetail", () => {
  // Shape of the lead's real Pixel Watch run on 2026-10-11
  const run = {
    logId: 74512345678,
    activityName: "Workout",
    hasGps: true,
    startTime: "2026-10-11T07:00:00.000-07:00",
    activeDuration: 723780,
    distance: 1.6049,
    distanceUnit: "Kilometer",
    averageHeartRate: 160,
    calories: 164,
    steps: 1932,
    heartRateZones: ACTIVITY_ZONES,
  };

  it("adds the zone to every point and flags the route", () => {
    const xml = tcxXml([
      { time: "2026-10-11T07:00:00.000-07:00", lat: 34.24, lon: -118.53, bpm: 110 },
      { time: "2026-10-11T07:05:00.000-07:00", lat: 34.25, lon: -118.53, bpm: 150 },
      { time: "2026-10-11T07:10:00.000-07:00", lat: 34.26, lon: -118.53, bpm: 180 },
    ]);
    const detail = workoutDetail(run, xml);

    expect(detail).toMatchObject({
      logId: 74512345678,
      type: "Run",
      date: "2026-10-11",
      durationMin: 12,
      calories: 164,
      steps: 1932,
      distanceKm: 1.6,
      hasGps: true,
      hasRoute: true,
    });
    expect(detail.zoneRanges).toHaveLength(4);
    expect(detail.points.map((p) => p.zone)).toEqual([
      "outOfRange",
      "cardio",
      "peak",
    ]);
    expect(detail.points[1]).toEqual({
      t: 300,
      lat: 34.25,
      lon: -118.53,
      bpm: 150,
      zone: "cardio",
    });
  });

  it("has no route when the GPS run's TCX has no positions", () => {
    const xml = tcxXml([{ time: "2026-10-11T07:00:00Z", bpm: 150 }]);
    const detail = workoutDetail(run, xml);
    expect(detail.hasGps).toBe(true);
    expect(detail.hasRoute).toBe(false);
    expect(detail.points[0].zone).toBe("cardio");
  });

  it("keeps the heart rate points of a weights session", () => {
    const weights = {
      logId: 1,
      activityName: "Weights",
      startTime: "2026-10-11T17:00:00.000-07:00",
      activeDuration: 2700000,
      heartRateZones: ACTIVITY_ZONES,
    };
    const xml = tcxXml([
      { time: "2026-10-11T17:00:00Z", bpm: 100 },
      { time: "2026-10-11T17:01:00Z", bpm: 125 },
    ]);
    const detail = workoutDetail(weights, xml);
    expect(detail.type).toBe("Weights");
    expect(detail.hasGps).toBe(false);
    expect(detail.hasRoute).toBe(false);
    expect(detail.points.map((p) => p.zone)).toEqual(["outOfRange", "fatBurn"]);
  });

  it("returns no points when there is no TCX", () => {
    const detail = workoutDetail(run, null);
    expect(detail.points).toEqual([]);
    expect(detail.needsReconnect).toBe(false);
  });

  it("uses the intraday heart rate when the TCX has none", () => {
    const weights = {
      logId: "2",
      activityName: "Weights",
      startTime: "2026-09-21T20:23:41.000-07:00",
      duration: 2700000,
      averageHeartRate: 135,
      heartRateZones: ACTIVITY_ZONES,
    };
    const intraday = {
      "activities-heart-intraday": {
        dataset: [
          { time: "20:23:41", value: 110 },
          { time: "20:30:41", value: 145 },
        ],
      },
    };
    const detail = workoutDetail(weights, tcxXml([{ time: "2026-09-21T20:23:41Z" }]), {
      heartIntraday: intraday,
    });
    expect(detail.points).toEqual([
      { t: 0, lat: null, lon: null, bpm: 110, zone: "outOfRange" },
      { t: 420, lat: null, lon: null, bpm: 145, zone: "cardio" },
    ]);
  });

  it("keeps the TCX heart rate over the intraday series", () => {
    const xml = tcxXml([
      { time: "2026-10-11T07:00:00Z", bpm: 150 },
      { time: "2026-10-11T07:00:30Z", bpm: 151 },
    ]);
    const detail = workoutDetail(run, xml, {
      heartIntraday: { "activities-heart-intraday": { dataset: [{ time: "07:00:00", value: 99 }] } },
    });
    expect(detail.points.map((p) => p.bpm)).toEqual([150, 151]);
  });

  it("flags a reconnect when Fitbit refused the TCX", () => {
    const detail = workoutDetail(run, null, { tcxDenied: true });
    expect(detail.needsReconnect).toBe(true);
    expect(detail.hasRoute).toBe(false);
    expect(detail.calories).toBe(164);
  });
});

describe("monthWorkouts", () => {
  it("keeps workouts that started in the month, oldest first", () => {
    const list = [
      { logId: 1, activityName: "Run", startTime: "2026-10-01T07:00:00.000-07:00" },
      { logId: 2, activityName: "Yoga", startTime: "2026-10-03T07:00:00.000-07:00" },
      {
        logId: 3,
        activityName: "Workout",
        hasGps: true,
        distance: 1.6,
        startTime: "2026-10-11T07:00:00.000-07:00",
      },
      { logId: 4, activityName: "Weights", originalStartTime: "2026-10-11T17:00:00.000-07:00" },
      { logId: 5, activityName: "Walk", startTime: "2026-11-01T08:00:00.000-07:00" },
      { logId: 6, activityName: "Walk" },
    ];
    expect(monthWorkouts("2026-10", list)).toEqual([
      { date: "2026-10-01", logId: 1, type: "Run" },
      { date: "2026-10-11", logId: 3, type: "Run" },
      { date: "2026-10-11", logId: 4, type: "Weights" },
    ]);
  });

  it("returns an empty list without activities", () => {
    expect(monthWorkouts("2026-10", undefined)).toEqual([]);
  });
});
