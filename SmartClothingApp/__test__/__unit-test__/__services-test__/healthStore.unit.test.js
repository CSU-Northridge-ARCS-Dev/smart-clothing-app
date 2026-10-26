/**
 * @file healthStore.unit.test.js
 * Mapping a day onto the DailyStats document, and the DailyStats and
 * AIFeedback writes (Firestore mocked).
 */

jest.mock('../../../firebaseConfig.js', () => ({ database: { name: 'db' } }));

jest.mock('firebase/firestore', () => ({
  doc: jest.fn((db, ...path) => ({ path: path.join('/') })),
  setDoc: jest.fn(() => Promise.resolve()),
  serverTimestamp: jest.fn(() => 'SERVER_TIME'),
  increment: jest.fn((n) => ({ increment: n })),
}));

import { doc, setDoc } from 'firebase/firestore';
import {
  toDailyStatsDoc,
  saveDailyStats,
  saveAIFeedback,
} from '../../../src/services/healthStore';

const META = {
  source: 'fitbit',
  device: 'Pixel Watch 3',
  timezone: 'America/Los_Angeles',
};

const hr5min = Array.from({ length: 288 }, (_, i) => (i % 2 ? 60 : null));

// Shape returned by insights-service for one day
const fitbitDay = () => ({
  date: '2026-10-22',
  steps: 9842,
  sleep: {
    totalMinutes: 410,
    efficiency: 92,
    deep: 60,
    light: 240,
    rem: 80,
    wake: 30,
    bedTime: '2026-10-22T00:40:00.000',
    wakeTime: '2026-10-22T08:00:00.000',
    levels: [
      { dateTime: '2026-10-22T00:40:00.000', level: 'light', seconds: 1800 },
      { dateTime: '2026-10-22T01:10:00.000', level: 'deep', seconds: 1200 },
    ],
  },
  heart: {
    restingHeartRate: 58,
    previousRestingHeartRate: 60,
    zones: { fatBurn: 40, cardio: 12, peak: 0 },
    hr5min,
  },
  vo2Max: { low: 44, high: 48 },
  workouts: [
    {
      logId: 123,
      type: 'Run',
      startTime: '2026-10-22T18:00:00.000',
      durationMin: 30,
      avgHeartRate: 150,
      calories: 320,
      steps: 4200,
      hasGps: true,
      zones: { fatBurn: 5, cardio: 20, peak: 5 },
      distanceKm: 5.1,
      paceMinPerKm: 5.9,
    },
  ],
});

describe('toDailyStatsDoc', () => {
  it('maps a Fitbit day onto the document', () => {
    const d = toDailyStatsDoc(fitbitDay(), META);

    expect(d.date).toBe('2026-10-22');
    expect(d.schemaVersion).toBe(1);
    expect(d.source).toBe('fitbit');
    expect(d.device).toBe('Pixel Watch 3');
    expect(d.timezone).toBe('America/Los_Angeles');
    expect(d.steps).toBe(9842);
    expect(d.vo2Max).toEqual({ low: 44, high: 48 });
    expect(d.heart.hr5min).toBe(hr5min);
    expect(d.heart.restingHeartRate).toBe(58);
  });

  it('renames sleep levels to stages with start times', () => {
    const d = toDailyStatsDoc(fitbitDay(), META);
    expect(d.sleep.levels).toBeUndefined();
    expect(d.sleep.stages).toEqual([
      { start: '2026-10-22T00:40:00.000', seconds: 1800, level: 'light' },
      { start: '2026-10-22T01:10:00.000', seconds: 1200, level: 'deep' },
    ]);
  });

  it('renames workout logId to id', () => {
    const [w] = toDailyStatsDoc(fitbitDay(), META).workouts;
    expect(w.id).toBe(123);
    expect(w.logId).toBeUndefined();
    expect(w).toMatchObject({ type: 'Run', distanceKm: 5.1, paceMinPerKm: 5.9 });
  });

  it('keeps a day already in the stored shape (Health Connect, HealthKit)', () => {
    const day = fitbitDay();
    day.sleep.stages = [
      { start: '2026-10-22T00:40:00', seconds: 600, level: 'asleep' },
    ];
    delete day.sleep.levels;
    day.workouts = [{ id: 'hc-1', type: 'Walk', durationMin: 20, hasGps: false }];

    const d = toDailyStatsDoc(day, { ...META, source: 'health_connect' });
    expect(d.source).toBe('health_connect');
    expect(d.sleep.stages).toEqual([
      { start: '2026-10-22T00:40:00', seconds: 600, level: 'asleep' },
    ]);
    expect(d.workouts[0].id).toBe('hc-1');
  });

  it('stores missing values as null, never undefined or 0', () => {
    const d = toDailyStatsDoc(
      {
        date: '2026-10-22',
        heart: { zones: { fatBurn: 3 } },
        workouts: [{ type: 'Weights', durationMin: 45 }],
      },
      {},
    );

    expect(d.steps).toBeNull();
    expect(d.sleep).toBeNull();
    expect(d.vo2Max).toBeNull();
    expect(d.source).toBeNull();
    expect(d.device).toBeNull();
    expect(d.heart).toEqual({
      restingHeartRate: null,
      previousRestingHeartRate: null,
      zones: { fatBurn: 3, cardio: null, peak: null },
      hr5min: null,
    });
    expect(d.workouts[0]).toMatchObject({
      id: null,
      distanceKm: null,
      paceMinPerKm: null,
      avgHeartRate: null,
      hasGps: false,
      zones: null,
    });
  });

  it('drops fields that are not in the schema', () => {
    const day = fitbitDay();
    day.raw = { anything: true };
    day.sleep.extra = 1;
    day.workouts[0].activityName = 'Run';

    const d = toDailyStatsDoc(day, META);
    expect(d.raw).toBeUndefined();
    expect(d.sleep.extra).toBeUndefined();
    expect(d.workouts[0].activityName).toBeUndefined();
  });
});

describe('saveDailyStats', () => {
  beforeEach(() => jest.clearAllMocks());

  it('writes one document at Users/uid/DailyStats/date', async () => {
    await saveDailyStats('uid-1', fitbitDay(), META);

    expect(doc).toHaveBeenCalledWith(
      { name: 'db' },
      'Users',
      'uid-1',
      'DailyStats',
      '2026-10-22',
    );
    expect(setDoc).toHaveBeenCalledTimes(1);
    const [ref, data, options] = setDoc.mock.calls[0];
    expect(ref.path).toBe('Users/uid-1/DailyStats/2026-10-22');
    expect(data.syncedAt).toBe('SERVER_TIME');
    expect(data.sleep.stages).toHaveLength(2);
    expect(options).toBeUndefined();
  });

  it('passes a failed write to the caller', async () => {
    setDoc.mockRejectedValueOnce(new Error('offline'));
    await expect(saveDailyStats('uid-1', fitbitDay(), META)).rejects.toThrow(
      'offline',
    );
  });
});

describe('saveAIFeedback', () => {
  beforeEach(() => jest.clearAllMocks());

  const insight = {
    headline: 'Back off next session after short sleep',
    keySignals: ['5h31m sleep'],
    focus: ['Keep it easy'],
  };
  const usage = {
    model: 'claude-opus-5-5',
    inputTokens: 1200,
    outputTokens: 150,
  };

  it('writes the feedback with model and token counts', async () => {
    await saveAIFeedback('uid-1', '2026-10-22', insight, usage, {
      dataSource: 'fitbit',
    });

    const [ref, data, options] = setDoc.mock.calls[0];
    expect(ref.path).toBe('Users/uid-1/AIFeedback/2026-10-22');
    expect(data).toEqual({
      date: '2026-10-22',
      schemaVersion: 1,
      ...insight,
      ...usage,
      dataSource: 'fitbit',
      regeneratedCount: 0,
      createdAt: 'SERVER_TIME',
    });
    expect(options).toEqual({ merge: true });
  });

  it('increments regeneratedCount on Regenerate', async () => {
    await saveAIFeedback('uid-1', '2026-10-22', insight, usage, {
      dataSource: 'fitbit',
      regenerate: true,
    });

    const [, data, options] = setDoc.mock.calls[0];
    expect(data.regeneratedCount).toEqual({ increment: 1 });
    expect(options).toEqual({ merge: true });
  });

  it('stores null token counts when usage is missing', async () => {
    await saveAIFeedback('uid-1', '2026-10-22', { headline: 'Rest' }, null);

    const [, data] = setDoc.mock.calls[0];
    expect(data.model).toBeNull();
    expect(data.inputTokens).toBeNull();
    expect(data.keySignals).toEqual([]);
    expect(data.dataSource).toBeNull();
  });
});
