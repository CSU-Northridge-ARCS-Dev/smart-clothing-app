/**
 * @file daySamples.unit.test.js
 * The shared day helpers: 5-minute heart rate slots, heart rate zone
 * minutes and sleep efficiency.
 */

import {
  buildHr5min,
  zoneMinutes,
  sleepEfficiency,
} from '../../../src/utils/daySamples';

// A reading at a local clock time on 2026-11-13
const at = (h, min, bpm, sec = 0, day = 13) => ({
  time: new Date(2026, 10, day, h, min, sec).toISOString(),
  bpm,
});

describe('buildHr5min', () => {
  it('averages each 5-minute slot from local midnight', () => {
    const slots = buildHr5min(
      [at(0, 0, 60), at(0, 4, 64, 59), at(0, 5, 70), at(23, 59, 81)],
      '2026-11-13'
    );
    expect(slots).toHaveLength(288);
    expect(slots[0]).toBe(62);
    expect(slots[1]).toBe(70);
    expect(slots[287]).toBe(81);
  });

  it('is null where the watch has no reading', () => {
    const slots = buildHr5min([at(8, 2, 75)], '2026-11-13');
    expect(slots[96]).toBe(75);
    expect(slots.filter((v) => v === null)).toHaveLength(287);
    expect(slots).not.toContain(0);
  });

  it('rounds the average', () => {
    const slots = buildHr5min([at(1, 0, 60), at(1, 1, 61)], '2026-11-13');
    expect(slots[12]).toBe(61);
  });

  it('leaves out readings from other days', () => {
    const slots = buildHr5min(
      [at(23, 59, 90, 0, 12), at(0, 0, 91, 0, 14), at(12, 0, 72)],
      '2026-11-13'
    );
    expect(slots.filter((v) => v !== null)).toEqual([72]);
  });

  it('leaves out readings that are not numbers', () => {
    const slots = buildHr5min(
      [at(3, 0, null), at(3, 1, undefined), at(3, 2, 55)],
      '2026-11-13'
    );
    expect(slots[36]).toBe(55);
  });

  it('accepts times as milliseconds or Dates', () => {
    const date = new Date(2026, 10, 13, 2, 0);
    const slots = buildHr5min(
      [
        { time: date, bpm: 50 },
        { time: date.getTime(), bpm: 52 },
      ],
      '2026-11-13'
    );
    expect(slots[24]).toBe(51);
  });

  it('is null when the day has no readings', () => {
    expect(buildHr5min([], '2026-11-13')).toBeNull();
    expect(buildHr5min([at(9, 0, 70, 0, 12)], '2026-11-13')).toBeNull();
  });

  it('is null when heart rate was not read', () => {
    expect(buildHr5min(null, '2026-11-13')).toBeNull();
  });
});

describe('zoneMinutes', () => {
  // Age 20: max heart rate 200, fat burn from 100, cardio from 140,
  // peak from 170

  it('counts minutes in fat burn, cardio and peak', () => {
    const zones = zoneMinutes(
      [
        at(9, 0, 99),
        at(9, 1, 100),
        at(9, 2, 139),
        at(9, 3, 140),
        at(9, 4, 169),
        at(9, 5, 170),
        at(9, 6, 195),
      ],
      20
    );
    expect(zones).toEqual({ fatBurn: 2, cardio: 2, peak: 2 });
  });

  it('counts a minute once however many readings it has', () => {
    const everyTwoSeconds = Array.from({ length: 30 }, (_, i) =>
      at(9, 0, 150, i * 2)
    );
    expect(zoneMinutes(everyTwoSeconds, 20)).toEqual({
      fatBurn: 0,
      cardio: 1,
      peak: 0,
    });
  });

  it('uses the average of the minute', () => {
    const zones = zoneMinutes([at(9, 0, 130, 0), at(9, 0, 160, 30)], 20);
    expect(zones).toEqual({ fatBurn: 0, cardio: 1, peak: 0 });
  });

  it('depends on age', () => {
    const samples = [at(9, 0, 150)];
    expect(zoneMinutes(samples, 20).cardio).toBe(1);
    expect(zoneMinutes(samples, 50).peak).toBe(1);
  });

  it('is all zero for a day spent below the zones', () => {
    expect(zoneMinutes([at(9, 0, 62), at(9, 1, 64)], 20)).toEqual({
      fatBurn: 0,
      cardio: 0,
      peak: 0,
    });
  });

  // Age 20, resting 60: reserve 140, fat burn from 116, cardio from 144,
  // peak from 179
  it('starts the zones above resting heart rate when one is given', () => {
    const zones = zoneMinutes(
      [
        at(9, 0, 115),
        at(9, 1, 116),
        at(9, 2, 143),
        at(9, 3, 144),
        at(9, 4, 178),
        at(9, 5, 179),
      ],
      20,
      60
    );
    expect(zones).toEqual({ fatBurn: 2, cardio: 2, peak: 1 });
  });

  it('counts fewer fat burn minutes for a higher resting heart rate', () => {
    const samples = [at(9, 0, 105), at(9, 1, 110), at(9, 2, 125)];
    expect(zoneMinutes(samples, 20).fatBurn).toBe(3);
    expect(zoneMinutes(samples, 20, 83).fatBurn).toBe(0);
  });

  it('falls back to a share of the max without a usable resting heart rate', () => {
    const samples = [at(9, 0, 105)];
    expect(zoneMinutes(samples, 20, null).fatBurn).toBe(1);
    expect(zoneMinutes(samples, 20, 0).fatBurn).toBe(1);
    expect(zoneMinutes(samples, 20, 230).fatBurn).toBe(1);
  });

  it('is null without an age', () => {
    const samples = [at(9, 0, 150)];
    expect(zoneMinutes(samples, null)).toBeNull();
    expect(zoneMinutes(samples, undefined)).toBeNull();
    expect(zoneMinutes(samples, 0)).toBeNull();
  });

  it('is null without readings', () => {
    expect(zoneMinutes(null, 20)).toBeNull();
    expect(zoneMinutes([], 20)).toBeNull();
    expect(zoneMinutes([at(9, 0, null)], 20)).toBeNull();
  });
});

describe('sleepEfficiency', () => {
  it('is the share of time in bed spent asleep, as a whole percent', () => {
    expect(sleepEfficiency(400, 433)).toBe(92);
    expect(sleepEfficiency(240, 480)).toBe(50);
  });

  it('never goes over 100', () => {
    expect(sleepEfficiency(481, 480)).toBe(100);
  });

  it('is null with no time in bed', () => {
    expect(sleepEfficiency(0, 0)).toBeNull();
  });

  it('is null when a value is missing', () => {
    expect(sleepEfficiency(null, 480)).toBeNull();
    expect(sleepEfficiency(400, undefined)).toBeNull();
  });
});
