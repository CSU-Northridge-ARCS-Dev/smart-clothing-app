const { workoutWindow, intradayPoints } = require("../src/lib/heartIntraday");

// Shape of the lead's Weights session on 2026-09-21 at 8:23 pm
const weights = {
  activityName: "Weights",
  startTime: "2026-09-21T20:23:41.000-07:00",
  duration: 2700000,
  activeDuration: 2580000,
};

describe("workoutWindow", () => {
  it("covers the start minute to the end, rounded up", () => {
    expect(workoutWindow(weights)).toEqual({ start: "20:23", end: "21:08" });
  });

  it("uses activeDuration when there is no duration", () => {
    expect(
      workoutWindow({ startTime: "2026-09-21T07:00:00.000", activeDuration: 90000 }),
    ).toEqual({ start: "07:00", end: "07:02" });
  });

  it("stops at 23:59 for a workout that runs past midnight", () => {
    expect(
      workoutWindow({ startTime: "2026-09-21T23:30:00.000", duration: 3600000 }),
    ).toEqual({ start: "23:30", end: "23:59" });
  });

  it("is null without a start time", () => {
    expect(workoutWindow({ duration: 60000 })).toBeNull();
  });
});

describe("intradayPoints", () => {
  const raw = {
    "activities-heart": [{ dateTime: "2026-09-21", value: {} }],
    "activities-heart-intraday": {
      dataset: [
        { time: "20:23:30", value: 98 },
        { time: "20:23:41", value: 101 },
        { time: "20:24:41", value: 128 },
        { time: "20:25:00", value: "bad" },
        { time: "20:30:41", value: 141 },
      ],
      datasetInterval: 1,
      datasetType: "second",
    },
  };

  it("turns readings into points timed from the workout start", () => {
    expect(intradayPoints(raw, weights)).toEqual([
      { t: 0, lat: null, lon: null, bpm: 101 },
      { t: 60, lat: null, lon: null, bpm: 128 },
      { t: 420, lat: null, lon: null, bpm: 141 },
    ]);
  });

  it("returns no points without a dataset or a start time", () => {
    expect(intradayPoints({}, weights)).toEqual([]);
    expect(intradayPoints(null, weights)).toEqual([]);
    expect(intradayPoints(raw, { activityName: "Weights" })).toEqual([]);
  });
});
