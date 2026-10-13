const { parseTcx, downsample, MAX_POINTS } = require("../src/lib/parseTcx");
const { tcxXml } = require("./helpers");

describe("parseTcx", () => {
  it("reads time, position and heart rate from every trackpoint", () => {
    const xml = tcxXml([
      { time: "2026-10-11T07:00:00.000-07:00", lat: 34.2401, lon: -118.5291, bpm: 120 },
      { time: "2026-10-11T07:00:05.000-07:00", lat: 34.2403, lon: -118.5294, bpm: 131 },
      { time: "2026-10-11T07:01:00.000-07:00", lat: 34.241, lon: -118.53, bpm: 165 },
    ]);
    expect(parseTcx(xml)).toEqual([
      { t: 0, lat: 34.2401, lon: -118.5291, bpm: 120 },
      { t: 5, lat: 34.2403, lon: -118.5294, bpm: 131 },
      { t: 60, lat: 34.241, lon: -118.53, bpm: 165 },
    ]);
  });

  it("joins trackpoints from every lap", () => {
    const xml = tcxXml(
      [
        { time: "2026-10-11T07:00:00Z", lat: 1, lon: 2, bpm: 100 },
        { time: "2026-10-11T07:00:10Z", lat: 1, lon: 2, bpm: 110 },
        { time: "2026-10-11T07:00:20Z", lat: 1, lon: 2, bpm: 120 },
        { time: "2026-10-11T07:00:30Z", lat: 1, lon: 2, bpm: 130 },
      ],
      { laps: 2 },
    );
    expect(parseTcx(xml).map((p) => p.t)).toEqual([0, 10, 20, 30]);
  });

  it("keeps heart rate only when there is no position", () => {
    const xml = tcxXml([
      { time: "2026-10-11T17:00:00Z", bpm: 98 },
      { time: "2026-10-11T17:00:30Z", bpm: 104 },
    ]);
    expect(parseTcx(xml)).toEqual([
      { t: 0, lat: null, lon: null, bpm: 98 },
      { t: 30, lat: null, lon: null, bpm: 104 },
    ]);
  });

  it("returns a null bpm for a trackpoint without heart rate", () => {
    const xml = tcxXml([{ time: "2026-10-11T07:00:00Z", lat: 1, lon: 2 }]);
    expect(parseTcx(xml)[0].bpm).toBeNull();
  });

  it("works with a single trackpoint", () => {
    const xml = tcxXml([{ time: "2026-10-11T07:00:00Z", lat: 1, lon: 2, bpm: 90 }]);
    expect(parseTcx(xml)).toHaveLength(1);
  });

  it("skips trackpoints with a bad time", () => {
    const xml = tcxXml([
      { time: "not-a-time", bpm: 90 },
      { time: "2026-10-11T07:00:00Z", bpm: 95 },
    ]);
    expect(parseTcx(xml)).toEqual([{ t: 0, lat: null, lon: null, bpm: 95 }]);
  });

  it("returns an empty list for empty or trackpoint-free input", () => {
    expect(parseTcx("")).toEqual([]);
    expect(parseTcx(null)).toEqual([]);
    expect(
      parseTcx("<TrainingCenterDatabase><Activities></Activities></TrainingCenterDatabase>"),
    ).toEqual([]);
  });

  it("downsamples a long activity", () => {
    const start = Date.parse("2026-10-11T07:00:00Z");
    const trackpoints = Array.from({ length: 3000 }, (_, i) => ({
      time: new Date(start + i * 1000).toISOString(),
      lat: 34,
      lon: -118,
      bpm: 150,
    }));
    const points = parseTcx(tcxXml(trackpoints));
    expect(points.length).toBeLessThanOrEqual(MAX_POINTS + 1);
    expect(points[0].t).toBe(0);
    expect(points[points.length - 1].t).toBe(2999);
  });
});

describe("downsample", () => {
  it("leaves a short list alone", () => {
    const list = [1, 2, 3];
    expect(downsample(list, 5)).toBe(list);
  });

  it("keeps every nth item and the last one", () => {
    expect(downsample([0, 1, 2, 3, 4, 5, 6], 3)).toEqual([0, 3, 6]);
    expect(downsample([0, 1, 2, 3, 4, 5, 6, 7], 3)).toEqual([0, 3, 6, 7]);
  });
});
