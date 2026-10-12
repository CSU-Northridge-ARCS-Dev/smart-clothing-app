/**
 * @file fitbitFormat.unit.test.js
 * Display helpers for the Fitbit day , plus the local-date helpers
 * in dateConversions.js.
 */
import {
  formatMinutes,
  formatClockTime,
  formatPace,
  formatDistanceMiles,
  buildHypnogram,
} from '../../../src/utils/fitbitFormat';
import {
  toLocalDateString,
  addDaysToDateString,
} from '../../../src/utils/dateConversions';

describe('formatMinutes', () => {
  it('formats hours and minutes', () => {
    expect(formatMinutes(412)).toBe('6h 52m');
    expect(formatMinutes(60)).toBe('1h 00m');
    expect(formatMinutes(45)).toBe('45m');
    expect(formatMinutes(0)).toBe('0m');
  });

  it('shows -- for missing values', () => {
    expect(formatMinutes(null)).toBe('--');
    expect(formatMinutes(undefined)).toBe('--');
  });
});

describe('formatClockTime', () => {
  it('reads the wall-clock time without timezone shifts', () => {
    expect(formatClockTime('2026-10-09T23:10:00.000')).toBe('11:10 PM');
    expect(formatClockTime('2026-10-10T07:05:00.000-07:00')).toBe('7:05 AM');
    expect(formatClockTime('2026-10-10T00:30:00.000')).toBe('12:30 AM');
    expect(formatClockTime('2026-10-10T12:00:00.000')).toBe('12:00 PM');
  });

  it('shows -- for missing values', () => {
    expect(formatClockTime(null)).toBe('--');
  });
});

describe('formatDistanceMiles', () => {
  it('converts km to miles with one decimal', () => {
    expect(formatDistanceMiles(5)).toBe('3.1 mi');
    expect(formatDistanceMiles(1.6)).toBe('1.0 mi');
    expect(formatDistanceMiles(null)).toBeNull();
    expect(formatDistanceMiles(0)).toBeNull();
  });
});

describe('formatPace', () => {
  it('turns minutes per km into minutes per mile', () => {
    expect(formatPace(6)).toBe('9:39 /mi');
    expect(formatPace(6.25)).toBe('10:04 /mi');
    expect(formatPace(7.5)).toBe('12:04 /mi');
    expect(formatPace(null)).toBeNull();
  });
});

describe('buildHypnogram', () => {
  it('places stage segments as fractions of the night', () => {
    const result = buildHypnogram([
      { dateTime: '2026-10-09T23:00:00.000', level: 'wake', seconds: 600 },
      { dateTime: '2026-10-09T23:10:00.000', level: 'light', seconds: 1800 },
      { dateTime: '2026-10-09T23:40:00.000', level: 'deep', seconds: 1200 },
    ]);
    expect(result.rows).toEqual(['wake', 'rem', 'light', 'deep']);
    expect(result.segments).toEqual([
      { level: 'wake', row: 0, left: 0, width: 600 / 3600 },
      { level: 'light', row: 2, left: 600 / 3600, width: 1800 / 3600 },
      { level: 'deep', row: 3, left: 2400 / 3600, width: 1200 / 3600 },
    ]);
  });

  it('uses the classic rows for classic logs', () => {
    const result = buildHypnogram([
      { dateTime: '2026-10-09T23:00:00.000', level: 'asleep', seconds: 600 },
      { dateTime: '2026-10-09T23:10:00.000', level: 'restless', seconds: 60 },
    ]);
    expect(result.rows).toEqual(['awake', 'restless', 'asleep']);
    expect(result.segments.map((s) => s.row)).toEqual([2, 1]);
  });

  it('returns null without levels', () => {
    expect(buildHypnogram([])).toBeNull();
    expect(buildHypnogram(undefined)).toBeNull();
  });
});

describe('local date helpers', () => {
  it('formats the local calendar date, not UTC', () => {
    // 11:30 PM local time stays on the same day
    expect(toLocalDateString(new Date(2026, 9, 10, 23, 30))).toBe('2026-10-10');
    expect(toLocalDateString(new Date(2026, 0, 5))).toBe('2026-01-05');
  });

  it('adds days across month and year boundaries', () => {
    expect(addDaysToDateString('2026-10-31', 1)).toBe('2026-11-01');
    expect(addDaysToDateString('2026-01-01', -1)).toBe('2025-12-31');
    expect(addDaysToDateString('2028-03-01', -1)).toBe('2028-02-29');
  });
});
