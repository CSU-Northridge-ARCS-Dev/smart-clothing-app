// Turns a day's heart rate samples and sleep totals into the fields of the
// day object.
//
// samples: [{ time, bpm }], where time is an ISO string, a Date or
// milliseconds.

// 5-minute slots in a day
const SLOTS_PER_DAY = 288;

// Where each heart rate zone starts. With a resting heart rate, as a share
// of the heart rate reserve (max - resting) above resting. Without one, as
// a share of the max. Max is estimated as 220 - age, so the zones are an
// approximation: the watch's own app may place them differently.
const RESERVE_ZONES = { fatBurn: 0.4, cardio: 0.6, peak: 0.85 };
const MAX_ZONES = { fatBurn: 0.5, cardio: 0.7, peak: 0.85 };

// The bpm each zone starts at, or null without a usable age
export const zoneStarts = (age, restingHeartRate) => {
  if (!Number.isFinite(age) || age <= 0) return null;
  const max = 220 - age;
  const useReserve =
    Number.isFinite(restingHeartRate) &&
    restingHeartRate > 0 &&
    restingHeartRate < max;
  const start = (zone) =>
    useReserve
      ? restingHeartRate + RESERVE_ZONES[zone] * (max - restingHeartRate)
      : MAX_ZONES[zone] * max;
  return { fatBurn: start("fatBurn"), cardio: start("cardio"), peak: start("peak") };
};

// The zone a bpm falls in. Below every zone is "outOfRange".
export const zoneForBpm = (bpm, starts) => {
  if (!Number.isFinite(bpm) || !starts) return null;
  if (bpm >= starts.peak) return "peak";
  if (bpm >= starts.cardio) return "cardio";
  if (bpm >= starts.fatBurn) return "fatBurn";
  return "outOfRange";
};

const timeOf = (sample) => new Date(sample.time).getTime();

const usable = (sample) =>
  Boolean(sample) && Number.isFinite(sample.bpm) && !isNaN(timeOf(sample));

// 288 average bpm values from local midnight of a YYYY-MM-DD date, null
// where the watch has no reading. null when the day has no readings at all.
export const buildHr5min = (samples, date) => {
  if (!samples) return null;
  const [y, m, d] = date.split("-").map(Number);
  const start = new Date(y, m - 1, d).getTime();
  const end = new Date(y, m - 1, d + 1).getTime();

  const sums = new Array(SLOTS_PER_DAY).fill(0);
  const counts = new Array(SLOTS_PER_DAY).fill(0);
  samples.forEach((sample) => {
    if (!usable(sample)) return;
    const time = timeOf(sample);
    if (time < start || time >= end) return;
    // By the clock time, so the slots stay right on daylight saving days
    const local = new Date(time);
    const slot = local.getHours() * 12 + Math.floor(local.getMinutes() / 5);
    sums[slot] += sample.bpm;
    counts[slot] += 1;
  });

  if (counts.every((count) => count === 0)) return null;
  return sums.map((sum, slot) =>
    counts[slot] === 0 ? null : Math.round(sum / counts[slot])
  );
};

// Minutes in each zone: { fatBurn, cardio, peak }.
export const zoneMinutes = (samples, age, restingHeartRate) => {
  const starts = zoneStarts(age, restingHeartRate);
  if (!samples || !starts) return null;

  const minutes = new Map();
  samples.forEach((sample) => {
    if (!usable(sample)) return;
    const minute = Math.floor(timeOf(sample) / 60000);
    const entry = minutes.get(minute) || { sum: 0, count: 0 };
    entry.sum += sample.bpm;
    entry.count += 1;
    minutes.set(minute, entry);
  });
  if (minutes.size === 0) return null;

  const zones = { fatBurn: 0, cardio: 0, peak: 0 };
  minutes.forEach(({ sum, count }) => {
    const zone = zoneForBpm(sum / count, starts);
    if (zone !== "outOfRange") zones[zone] += 1;
  });
  return zones;
};

// Share of the time in bed spent asleep, as a whole percent
export const sleepEfficiency = (asleepMinutes, inBedMinutes) => {
  if (!Number.isFinite(asleepMinutes) || !Number.isFinite(inBedMinutes)) {
    return null;
  }
  if (inBedMinutes <= 0) return null;
  return Math.min(100, Math.round((asleepMinutes / inBedMinutes) * 100));
};
