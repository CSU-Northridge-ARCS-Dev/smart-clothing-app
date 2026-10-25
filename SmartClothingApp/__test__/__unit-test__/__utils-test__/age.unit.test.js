/**
 * @file age.unit.test.js
 * ageFromDob : age in whole years from a Date, a string or a Firestore
 * Timestamp.
 */
import { ageFromDob } from '../../../src/utils/age';

const NOW = new Date(2026, 9, 12); // Oct 12, 2026

describe('ageFromDob', () => {
  it('counts a birthday earlier in the year', () => {
    expect(ageFromDob(new Date(2004, 2, 1), NOW)).toBe(22);
  });

  it('subtracts a year before this year\'s birthday', () => {
    expect(ageFromDob(new Date(2004, 9, 13), NOW)).toBe(21);
    expect(ageFromDob(new Date(2004, 11, 1), NOW)).toBe(21);
  });

  it('counts the birthday itself', () => {
    expect(ageFromDob(new Date(2004, 9, 12), NOW)).toBe(22);
  });

  it('reads a live Firestore Timestamp', () => {
    const dob = { seconds: 1, nanoseconds: 0, toDate: () => new Date(2004, 2, 1) };
    expect(ageFromDob(dob, NOW)).toBe(22);
  });

  it('reads a Timestamp that was saved as JSON', () => {
    const seconds = new Date(2004, 2, 1).getTime() / 1000;
    expect(ageFromDob({ seconds, nanoseconds: 0 }, NOW)).toBe(22);
  });

  it('reads a date string', () => {
    expect(ageFromDob('2004-03-01T12:00:00.000Z', NOW)).toBe(22);
  });

  it('returns null without a usable date', () => {
    expect(ageFromDob(null, NOW)).toBeNull();
    expect(ageFromDob('No Data', NOW)).toBeNull();
  });
});
