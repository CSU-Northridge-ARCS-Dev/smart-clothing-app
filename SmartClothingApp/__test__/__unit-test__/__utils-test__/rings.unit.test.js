/**
 * @file rings.unit.test.js
 * Progress maths and dates behind the activity rings.
 */
import {
  goalProgress,
  toRingProgress,
  lastSevenDates,
  weekdayLetter,
} from '../../../src/utils/rings';
import { STEP_GOAL, SLEEP_GOAL_MINUTES } from '../../../src/constants/goals';

describe('goals', () => {
  it('are 10,000 steps and 6 hours of sleep', () => {
    expect(STEP_GOAL).toBe(10000);
    expect(SLEEP_GOAL_MINUTES).toBe(360);
  });
});

describe('goalProgress', () => {
  it('is 0 for no progress', () => {
    expect(goalProgress(0, 100)).toBe(0);
  });

  it('is a fraction for partial progress', () => {
    expect(goalProgress(25, 100)).toBe(0.25);
  });

  it('is exactly 1 at the goal', () => {
    expect(goalProgress(100, 100)).toBe(1);
  });

  it('goes above 1 past the goal', () => {
    expect(goalProgress(150, 100)).toBe(1.5);
  });

  it('is 0 for missing or bad values', () => {
    for (const value of [null, undefined, NaN, -5, '500']) {
      expect(goalProgress(value, 100)).toBe(0);
    }
  });
});

describe('toRingProgress', () => {
  it('divides steps and sleep by their goals', () => {
    expect(toRingProgress({ steps: 5000, sleepMinutes: 540 })).toEqual({
      steps: 0.5,
      sleep: 1.5,
    });
  });

  it('gives empty rings for a day with no data', () => {
    expect(toRingProgress({ steps: null, sleepMinutes: null })).toEqual({
      steps: 0,
      sleep: 0,
    });
    expect(toRingProgress(undefined)).toEqual({ steps: 0, sleep: 0 });
  });
});

describe('lastSevenDates', () => {
  it('returns 7 dates ending at the date, oldest first', () => {
    expect(lastSevenDates('2026-10-02')).toEqual([
      '2026-09-26',
      '2026-09-27',
      '2026-09-28',
      '2026-09-29',
      '2026-09-30',
      '2026-10-01',
      '2026-10-02',
    ]);
  });
});

describe('weekdayLetter', () => {
  it('gives the weekday initial of a local date', () => {
    expect(weekdayLetter('2026-10-10')).toBe('S'); // Saturday
    expect(weekdayLetter('2026-10-12')).toBe('M');
    expect(weekdayLetter('2026-10-15')).toBe('T'); // Thursday
  });
});
