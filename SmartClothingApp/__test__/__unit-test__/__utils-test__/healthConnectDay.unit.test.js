/**
 * @file healthConnectDay.unit.test.js
 * Building the day object from one day's raw Health Connect records, and
 * the week of rings, the month of workouts and one workout's page.
 * Every fixture is made up.
 */

import {
  buildDay,
  buildWeek,
  buildMonthWorkouts,
  buildWorkoutDetail,
  isEmptyDay,
  watchDevice,
} from '../../../src/utils/healthConnectDay';
import { buildHypnogram } from '../../../src/utils/fitbitFormat';

jest.mock('../../../firebaseConfig.js', () => ({ database: {} }));
jest.mock('firebase/firestore', () => ({
  doc: jest.fn(),
  setDoc: jest.fn(),
  serverTimestamp: jest.fn(),
  increment: jest.fn(),
}));

const { toDailyStatsDoc } = require('../../../src/services/healthStore');

const DATE = '2026-11-13';
// Aged 20 on the date: max heart rate 200
const PROFILE = { dob: '2006-03-04' };

// A local clock time in November 2026, as Health Connect's UTC string
const at = (day, h, min = 0, sec = 0) =>
  new Date(2026, 10, day, h, min, sec).toISOString();

const STAGE = { awake: 1, sleeping: 2, outOfBed: 3, light: 4, deep: 5, rem: 6 };

const stage = (name, start, end) => ({
  stage: STAGE[name] ?? name,
  startTime: start,
  endTime: end,
});

// One heart rate record holding one reading per minute
const heartRecord = (day, h, fromMin, bpms) => ({
  startTime: at(day, h, fromMin),
  endTime: at(day, h, fromMin + bpms.length),
  samples: bpms.map((bpm, i) => ({
    time: at(day, h, fromMin + i),
    beatsPerMinute: bpm,
  })),
});

// 11:00 PM to 7:00 AM: 8 h in bed, 30 min awake
const night = () => ({
  metadata: { id: 'sleep-night' },
  startTime: at(12, 23),
  endTime: at(13, 7),
  stages: [
    stage('light', at(12, 23), at(13, 1)),
    stage('deep', at(13, 1), at(13, 2, 30)),
    stage('awake', at(13, 2, 30), at(13, 3)),
    stage('rem', at(13, 3), at(13, 4, 30)),
    stage('light', at(13, 4, 30), at(13, 7)),
  ],
});

const nap = () => ({
  metadata: { id: 'sleep-nap' },
  startTime: at(13, 14),
  endTime: at(13, 15),
  stages: [stage('light', at(13, 14), at(13, 15))],
});

// A 30-minute run at 5:00 PM
const run = (extra = {}) => ({
  metadata: { id: 'exercise-run' },
  startTime: at(13, 17),
  endTime: at(13, 17, 30),
  exerciseType: 56,
  ...extra,
});

const emptyRaw = (extra = {}) => ({
  date: DATE,
  steps: { total: 9120, dataOrigins: ['com.example.watch'] },
  heartRate: [],
  restingHeartRate: { today: [], previous: [] },
  sleep: [],
  exercise: [],
  distance: [],
  totalCalories: [],
  vo2Max: [],
  errors: {},
  ...extra,
});

const fullRaw = () =>
  emptyRaw({
    heartRate: [
      heartRecord(13, 3, 0, [52, 54]),
      heartRecord(13, 17, 0, [150, 150, 160, 180]),
    ],
    restingHeartRate: {
      today: [{ time: at(13, 6), beatsPerMinute: 58 }],
      previous: [{ time: at(12, 6), beatsPerMinute: 60 }],
    },
    sleep: [nap(), night()],
    exercise: [run()],
    distance: [
      {
        startTime: at(13, 17),
        endTime: at(13, 17, 30),
        distance: { inMeters: 5000 },
      },
    ],
    totalCalories: [
      {
        startTime: at(13, 17),
        endTime: at(13, 17, 30),
        energy: { inKilocalories: 310.4 },
      },
    ],
    vo2Max: [{ time: at(13, 8), vo2MillilitersPerMinuteKilogram: 46.52 }],
  });

describe('buildDay with a full day', () => {
  const day = buildDay(DATE, fullRaw(), PROFILE);

  it('has the day fields the screens read', () => {
    expect(Object.keys(day)).toEqual([
      'date',
      'steps',
      'sleep',
      'heart',
      'vo2Max',
      'workouts',
    ]);
    expect(day.date).toBe(DATE);
  });

  it('takes steps from the step total', () => {
    expect(day.steps).toBe(9120);
  });

  it('has resting heart rate for the day and the day before', () => {
    expect(day.heart.restingHeartRate).toBe(58);
    expect(day.heart.previousRestingHeartRate).toBe(60);
  });

  it('has 288 heart rate slots, null where there are no readings', () => {
    expect(day.heart.hr5min).toHaveLength(288);
    expect(day.heart.hr5min[36]).toBe(53);
    expect(day.heart.hr5min[204]).toBe(160);
    expect(day.heart.hr5min[0]).toBeNull();
  });

  it('has heart rate zone minutes from the age', () => {
    expect(day.heart.zones).toEqual({ fatBurn: 0, cardio: 3, peak: 1 });
  });

  it('has VO2 max as one value', () => {
    expect(day.vo2Max).toEqual({ low: 46.5, high: 46.5 });
  });

  it('fits the saved document', () => {
    const doc = toDailyStatsDoc(day, { source: 'health_connect' });
    expect(doc.steps).toBe(9120);
    expect(doc.sleep.stages[0]).toEqual({
      start: '2026-11-12T23:00:00.000',
      seconds: 7200,
      level: 'light',
    });
    expect(doc.workouts[0].id).toBe('exercise-run');
    expect(doc.vo2Max).toEqual({ low: 46.5, high: 46.5 });
    expect(JSON.stringify(doc)).not.toContain('undefined');
  });
});

describe('buildDay sleep', () => {
  it('takes the longest session and ignores naps', () => {
    const { sleep } = buildDay(DATE, fullRaw(), PROFILE);
    expect(sleep.bedTime).toBe('2026-11-12T23:00:00.000');
    expect(sleep.wakeTime).toBe('2026-11-13T07:00:00.000');
  });

  it('writes a night that crosses midnight as local clock times', () => {
    const { sleep } = buildDay(DATE, fullRaw(), PROFILE);
    expect(sleep.levels.map((l) => l.dateTime)).toEqual([
      '2026-11-12T23:00:00.000',
      '2026-11-13T01:00:00.000',
      '2026-11-13T02:30:00.000',
      '2026-11-13T03:00:00.000',
      '2026-11-13T04:30:00.000',
    ]);
  });

  it('totals each stage in minutes', () => {
    const { sleep } = buildDay(DATE, fullRaw(), PROFILE);
    expect(sleep.light).toBe(270);
    expect(sleep.deep).toBe(90);
    expect(sleep.rem).toBe(90);
    expect(sleep.wake).toBe(30);
    expect(sleep.totalMinutes).toBe(450);
  });

  it('has efficiency as asleep minutes over time in bed', () => {
    const { sleep } = buildDay(DATE, fullRaw(), PROFILE);
    expect(sleep.efficiency).toBe(94);
  });

  it('has a timeline the hypnogram can draw', () => {
    const { sleep } = buildDay(DATE, fullRaw(), PROFILE);
    expect(sleep.levels[1]).toEqual({
      dateTime: '2026-11-13T01:00:00.000',
      level: 'deep',
      seconds: 5400,
    });
    const hypnogram = buildHypnogram(sleep.levels);
    expect(hypnogram.rows).toEqual(['wake', 'rem', 'light', 'deep']);
    expect(hypnogram.segments).toHaveLength(5);
    expect(hypnogram.segments[0].left).toBe(0);
  });

  it('puts the timeline in time order', () => {
    const session = night();
    session.stages.reverse();
    const { sleep } = buildDay(DATE, emptyRaw({ sleep: [session] }), PROFILE);
    expect(sleep.levels.map((l) => l.level)).toEqual([
      'light',
      'deep',
      'wake',
      'rem',
      'light',
    ]);
  });

  it('counts awake, out of bed and awake in bed as wake', () => {
    const session = {
      startTime: at(12, 23),
      endTime: at(13, 1),
      stages: [
        stage('light', at(12, 23), at(13, 0)),
        stage('awake', at(13, 0), at(13, 0, 10)),
        stage('outOfBed', at(13, 0, 10), at(13, 0, 20)),
        stage(7, at(13, 0, 20), at(13, 0, 30)),
        stage('light', at(13, 0, 30), at(13, 1)),
      ],
    };
    const { sleep } = buildDay(DATE, emptyRaw({ sleep: [session] }), PROFILE);
    expect(sleep.wake).toBe(30);
    expect(sleep.totalMinutes).toBe(90);
    expect(sleep.levels.map((l) => l.level)).toEqual([
      'light',
      'wake',
      'wake',
      'wake',
      'light',
    ]);
  });

  it('counts sleeping time in the total but leaves it off a staged timeline', () => {
    const session = {
      startTime: at(12, 23),
      endTime: at(13, 2),
      stages: [
        stage('light', at(12, 23), at(13, 0)),
        stage('sleeping', at(13, 0), at(13, 1)),
        stage('deep', at(13, 1), at(13, 2)),
      ],
    };
    const { sleep } = buildDay(DATE, emptyRaw({ sleep: [session] }), PROFILE);
    expect(sleep.totalMinutes).toBe(180);
    expect(sleep.light).toBe(60);
    expect(sleep.deep).toBe(60);
    expect(sleep.levels.map((l) => l.level)).toEqual(['light', 'deep']);
    expect(buildHypnogram(sleep.levels).rows).toEqual([
      'wake',
      'rem',
      'light',
      'deep',
    ]);
  });

  it('keeps asleep on the timeline when the night has no light, deep or REM', () => {
    const session = {
      startTime: at(12, 23),
      endTime: at(13, 1),
      stages: [
        stage('sleeping', at(12, 23), at(13, 0, 30)),
        stage('awake', at(13, 0, 30), at(13, 1)),
      ],
    };
    const { sleep } = buildDay(DATE, emptyRaw({ sleep: [session] }), PROFILE);
    expect(sleep.totalMinutes).toBe(90);
    expect(sleep.wake).toBe(30);
    expect(sleep.light).toBeNull();
    expect(sleep.deep).toBeNull();
    expect(sleep.rem).toBeNull();
    expect(sleep.levels.map((l) => l.level)).toEqual(['asleep', 'wake']);
  });

  it('uses the length of the night when the session has no stages', () => {
    const session = { startTime: at(12, 23), endTime: at(13, 6, 30) };
    const { sleep } = buildDay(DATE, emptyRaw({ sleep: [session] }), PROFILE);
    expect(sleep.totalMinutes).toBe(450);
    expect(sleep.efficiency).toBeNull();
    expect(sleep.deep).toBeNull();
    expect(sleep.wake).toBeNull();
    expect(sleep.levels).toEqual([
      { dateTime: '2026-11-12T23:00:00.000', level: 'asleep', seconds: 27000 },
    ]);
  });

  it('is null on a day with no sleep', () => {
    expect(buildDay(DATE, emptyRaw(), PROFILE).sleep).toBeNull();
  });

  it('is null when sleep could not be read', () => {
    expect(buildDay(DATE, emptyRaw({ sleep: null }), PROFILE).sleep).toBeNull();
  });
});

describe('buildDay heart', () => {
  it('keeps gaps in heart rate as null', () => {
    const raw = emptyRaw({
      heartRate: [heartRecord(13, 1, 0, [50]), heartRecord(13, 9, 0, [70])],
    });
    const { hr5min } = buildDay(DATE, raw, PROFILE).heart;
    expect(hr5min[12]).toBe(50);
    expect(hr5min[108]).toBe(70);
    expect(hr5min.slice(13, 108).every((v) => v === null)).toBe(true);
  });

  it('uses the latest resting heart rate when there are several', () => {
    const raw = emptyRaw({
      restingHeartRate: {
        today: [
          { time: at(13, 9), beatsPerMinute: 57 },
          { time: at(13, 5), beatsPerMinute: 59 },
        ],
        previous: [],
      },
    });
    const { heart } = buildDay(DATE, raw, PROFILE);
    expect(heart.restingHeartRate).toBe(57);
    expect(heart.previousRestingHeartRate).toBeNull();
  });

  // Age 20, max 200. 110 bpm is fat burn by share of max (from 100) but
  // below it with a resting heart rate of 80 (from 128).
  it('places the zones above the resting heart rate of the day', () => {
    const heartRate = [heartRecord(13, 9, 0, [110, 130])];
    const withResting = emptyRaw({
      heartRate,
      restingHeartRate: {
        today: [{ time: at(13, 6), beatsPerMinute: 80 }],
        previous: [],
      },
    });
    expect(buildDay(DATE, withResting, PROFILE).heart.zones.fatBurn).toBe(1);
    expect(
      buildDay(DATE, emptyRaw({ heartRate }), PROFILE).heart.zones.fatBurn
    ).toBe(2);
  });

  it('uses the day before when the day has no resting heart rate', () => {
    const raw = emptyRaw({
      heartRate: [heartRecord(13, 9, 0, [110, 130])],
      restingHeartRate: {
        today: [],
        previous: [{ time: at(12, 6), beatsPerMinute: 80 }],
      },
    });
    expect(buildDay(DATE, raw, PROFILE).heart.zones.fatBurn).toBe(1);
  });

  it('has no zones without a date of birth', () => {
    const { heart } = buildDay(DATE, fullRaw(), {});
    expect(heart.zones).toBeNull();
    expect(heart.hr5min).toHaveLength(288);
    expect(buildDay(DATE, fullRaw(), undefined).heart.zones).toBeNull();
  });

  it('works out the age on the date of the day', () => {
    // Turns 21 the day after: still 20, so 170 bpm is the first peak minute
    const raw = emptyRaw({ heartRate: [heartRecord(13, 9, 0, [170])] });
    const { zones } = buildDay(DATE, raw, { dob: '2005-11-14' }).heart;
    expect(zones).toEqual({ fatBurn: 0, cardio: 0, peak: 1 });
  });
});

describe('buildDay workouts', () => {
  it('builds a run with distance, pace, calories and heart rate', () => {
    const [workout] = buildDay(DATE, fullRaw(), PROFILE).workouts;
    expect(workout).toEqual({
      logId: 'exercise-run',
      type: 'Run',
      startTime: '2026-11-13T17:00:00.000',
      durationMin: 30,
      avgHeartRate: 160,
      calories: 310,
      steps: null,
      hasGps: false,
      zones: { fatBurn: 0, cardio: 3, peak: 1 },
      distanceKm: 5,
      paceMinPerKm: 6,
    });
  });

  it.each([
    [56, 'Run'],
    [57, 'Run'],
    [79, 'Walk'],
    [70, 'Weights'],
    [81, 'Weights'],
    [8, 'Workout'],
    [0, 'Workout'],
  ])('maps exercise type %i to %s', (exerciseType, type) => {
    const raw = emptyRaw({ exercise: [run({ exerciseType })] });
    expect(buildDay(DATE, raw, PROFILE).workouts[0].type).toBe(type);
  });

  it('only counts heart rate, distance and calories inside the session', () => {
    const raw = emptyRaw({
      heartRate: [
        heartRecord(13, 16, 58, [90, 90]),
        heartRecord(13, 17, 0, [150]),
        heartRecord(13, 17, 30, [95]),
      ],
      exercise: [run()],
      distance: [
        {
          startTime: at(13, 16),
          endTime: at(13, 17),
          distance: { inMeters: 900 },
        },
        {
          startTime: at(13, 17, 10),
          endTime: at(13, 17, 20),
          distance: { inMeters: 2000 },
        },
      ],
      totalCalories: [
        {
          startTime: at(13, 17, 30),
          endTime: at(13, 18),
          energy: { inKilocalories: 80 },
        },
        {
          startTime: at(13, 17, 5),
          endTime: at(13, 17, 6),
          energy: { inKilocalories: 12 },
        },
      ],
    });
    const [workout] = buildDay(DATE, raw, PROFILE).workouts;
    expect(workout.avgHeartRate).toBe(150);
    expect(workout.distanceKm).toBe(2);
    expect(workout.calories).toBe(12);
  });

  it('counts the part of a record that overlaps the session', () => {
    const raw = emptyRaw({
      exercise: [run()],
      totalCalories: [
        {
          startTime: at(13, 16, 50),
          endTime: at(13, 17, 10),
          energy: { inKilocalories: 100 },
        },
      ],
    });
    expect(buildDay(DATE, raw, PROFILE).workouts[0].calories).toBe(50);
  });

  it('has no distance or pace for weights', () => {
    const raw = fullRaw();
    raw.exercise = [run({ exerciseType: 70 })];
    const [workout] = buildDay(DATE, raw, PROFILE).workouts;
    expect(workout.type).toBe('Weights');
    expect(workout).not.toHaveProperty('distanceKm');
    expect(workout).not.toHaveProperty('paceMinPerKm');
  });

  it('is null for what the watch did not record in the session', () => {
    const raw = emptyRaw({ exercise: [run({ metadata: undefined })] });
    const [workout] = buildDay(DATE, raw, PROFILE).workouts;
    expect(workout.logId).toBeNull();
    expect(workout.avgHeartRate).toBeNull();
    expect(workout.calories).toBeNull();
    expect(workout.zones).toBeNull();
    expect(workout).not.toHaveProperty('distanceKm');
  });

  it('lists workouts in time order', () => {
    const raw = emptyRaw({
      exercise: [
        run(),
        {
          metadata: { id: 'exercise-walk' },
          startTime: at(13, 8),
          endTime: at(13, 8, 20),
          exerciseType: 79,
        },
      ],
    });
    expect(buildDay(DATE, raw, PROFILE).workouts.map((w) => w.logId)).toEqual([
      'exercise-walk',
      'exercise-run',
    ]);
  });

  it('is an empty list on a day with no exercise', () => {
    expect(buildDay(DATE, emptyRaw(), PROFILE).workouts).toEqual([]);
  });
});

describe('buildDay with missing data', () => {
  it('is null, never 0, on a day with nothing recorded', () => {
    const day = buildDay(DATE, emptyRaw({ steps: { total: null } }), PROFILE);
    expect(day).toEqual({
      date: DATE,
      steps: null,
      sleep: null,
      heart: {
        restingHeartRate: null,
        previousRestingHeartRate: null,
        zones: null,
        hr5min: null,
      },
      vo2Max: null,
      workouts: [],
    });
  });

  it('is null for every type that could not be read', () => {
    const raw = {
      date: DATE,
      steps: null,
      heartRate: null,
      restingHeartRate: null,
      sleep: null,
      exercise: null,
      distance: null,
      totalCalories: null,
      vo2Max: null,
      errors: { Steps: 'no_permission' },
    };
    const day = buildDay(DATE, raw, PROFILE);
    expect(day.steps).toBeNull();
    expect(day.sleep).toBeNull();
    expect(day.heart).toEqual({
      restingHeartRate: null,
      previousRestingHeartRate: null,
      zones: null,
      hr5min: null,
    });
    expect(day.vo2Max).toBeNull();
    expect(day.workouts).toEqual([]);
  });

  it('keeps a real step count of 0', () => {
    const day = buildDay(DATE, emptyRaw({ steps: { total: 0 } }), PROFILE);
    expect(day.steps).toBe(0);
  });

  it('builds a workout when distance and calories could not be read', () => {
    const raw = emptyRaw({
      exercise: [run()],
      distance: null,
      totalCalories: null,
      heartRate: null,
    });
    const [workout] = buildDay(DATE, raw, PROFILE).workouts;
    expect(workout.durationMin).toBe(30);
    expect(workout.calories).toBeNull();
    expect(workout.avgHeartRate).toBeNull();
    expect(workout).not.toHaveProperty('distanceKm');
  });

  it('uses the latest VO2 max of the day', () => {
    const raw = emptyRaw({
      vo2Max: [
        { time: at(13, 20), vo2MillilitersPerMinuteKilogram: 47 },
        { time: at(13, 8), vo2MillilitersPerMinuteKilogram: 45 },
      ],
    });
    expect(buildDay(DATE, raw, PROFILE).vo2Max).toEqual({ low: 47, high: 47 });
  });
});

describe('isEmptyDay', () => {
  const noStepsRaw = (extra = {}) =>
    emptyRaw({ steps: { total: null, dataOrigins: [] }, ...extra });

  it('is true when nothing was recorded', () => {
    expect(isEmptyDay(buildDay(DATE, noStepsRaw(), PROFILE))).toBe(true);
  });

  it('is true when the only value is a step total of 0', () => {
    const raw = emptyRaw({ steps: { total: 0, dataOrigins: [] } });
    expect(isEmptyDay(buildDay(DATE, raw, PROFILE))).toBe(true);
  });

  it('is true when every record type is missing', () => {
    const raw = { date: DATE, errors: {} };
    expect(isEmptyDay(buildDay(DATE, raw, PROFILE))).toBe(true);
  });

  it('is false with steps', () => {
    expect(isEmptyDay(buildDay(DATE, emptyRaw(), PROFILE))).toBe(false);
  });

  it('is false with only a night of sleep', () => {
    const raw = noStepsRaw({ sleep: [night()] });
    expect(isEmptyDay(buildDay(DATE, raw, PROFILE))).toBe(false);
  });

  it('is false with only heart rate', () => {
    const raw = noStepsRaw({ heartRate: [heartRecord(13, 9, 0, [60, 62])] });
    expect(isEmptyDay(buildDay(DATE, raw, PROFILE))).toBe(false);
  });

  it('is false with only a workout', () => {
    const raw = noStepsRaw({ exercise: [run()] });
    expect(isEmptyDay(buildDay(DATE, raw, PROFILE))).toBe(false);
  });

  it('is false for a full day', () => {
    expect(isEmptyDay(buildDay(DATE, fullRaw(), PROFILE))).toBe(false);
  });
});

describe('watchDevice', () => {
  const from = (model, type) => ({ metadata: { device: { model, type } } });

  it('is the model on a sleep session', () => {
    const raw = emptyRaw({
      heartRate: [from(null, 0)],
      sleep: [from('Pixel Watch 3', 1)],
    });
    expect(watchDevice(raw)).toBe('Pixel Watch 3');
  });

  it('is the model on a workout when there is no sleep', () => {
    const raw = emptyRaw({ exercise: [from('Galaxy Watch7', 1)] });
    expect(watchDevice(raw)).toBe('Galaxy Watch7');
  });

  it('ignores records written by the phone', () => {
    const raw = emptyRaw({ exercise: [from('SM-A176U1', 2)] });
    expect(watchDevice(raw)).toBeNull();
  });

  it('is null when no record names a model', () => {
    expect(watchDevice(emptyRaw({ heartRate: [from(null, 0)] }))).toBeNull();
  });

  it('is null when record types are missing', () => {
    expect(watchDevice({ date: DATE, errors: {} })).toBeNull();
  });
});

describe('buildWeek', () => {
  const rawWeek = (extra = {}) => ({
    dates: ['2026-11-12', DATE],
    steps: { '2026-11-12': null, [DATE]: 9120 },
    sleep: { '2026-11-12': [], [DATE]: [nap(), night()] },
    errors: {},
    ...extra,
  });

  it('has one entry per day, oldest first, with null for a day with no data', () => {
    expect(buildWeek(rawWeek())).toEqual([
      { date: '2026-11-12', steps: null, sleepMinutes: null },
      { date: DATE, steps: 9120, sleepMinutes: 450 },
    ]);
  });

  it("has the same sleep as the day's own total", () => {
    const day = buildDay(DATE, fullRaw(), PROFILE);
    expect(buildWeek(rawWeek())[1].sleepMinutes).toBe(day.sleep.totalMinutes);
  });

  it('keeps a real step count of 0', () => {
    const week = buildWeek(rawWeek({ steps: { '2026-11-12': 0, [DATE]: 9120 } }));
    expect(week[0].steps).toBe(0);
  });

  it('has no sleep when sleep could not be read', () => {
    const week = buildWeek(rawWeek({ sleep: null }));
    expect(week.map((d) => d.sleepMinutes)).toEqual([null, null]);
    expect(week[1].steps).toBe(9120);
  });
});

describe('buildMonthWorkouts', () => {
  const walk = () => ({
    metadata: { id: 'exercise-walk' },
    startTime: at(20, 7),
    endTime: at(20, 8),
    exerciseType: 79,
  });

  it('lists the workouts of the month, oldest first', () => {
    expect(buildMonthWorkouts('2026-11', [walk(), run()])).toEqual([
      { date: DATE, logId: 'exercise-run', type: 'Run' },
      { date: '2026-11-20', logId: 'exercise-walk', type: 'Walk' },
    ]);
  });

  it('leaves out a workout that started in another month', () => {
    const october = run({
      startTime: new Date(2026, 9, 31, 23, 50).toISOString(),
      endTime: at(1, 0, 20),
    });
    expect(buildMonthWorkouts('2026-11', [october])).toEqual([]);
  });

  it('puts a late evening workout on its local date', () => {
    const late = run({ startTime: at(13, 23, 30), endTime: at(13, 23, 55) });
    expect(buildMonthWorkouts('2026-11', [late])[0].date).toBe(DATE);
  });

  it('has no logId when the record has no id', () => {
    const [workout] = buildMonthWorkouts('2026-11', [run({ metadata: {} })]);
    expect(workout.logId).toBeNull();
  });

  it('is an empty list when there are no sessions', () => {
    expect(buildMonthWorkouts('2026-11', [])).toEqual([]);
    expect(buildMonthWorkouts('2026-11', null)).toEqual([]);
  });
});

describe('buildWorkoutDetail', () => {
  // The run's records out of the full day, as readWorkoutRecords returns them
  const rawWorkout = (extra = {}) => {
    const day = fullRaw();
    return {
      date: DATE,
      session: run(),
      heartRate: day.heartRate,
      restingHeartRate: day.restingHeartRate,
      distance: day.distance,
      totalCalories: day.totalCalories,
      errors: {},
      ...extra,
    };
  };

  it("has the same stats as the workout in the day's list", () => {
    const day = buildDay(DATE, fullRaw(), PROFILE);
    const detail = buildWorkoutDetail(DATE, rawWorkout(), PROFILE);
    expect(detail).toMatchObject(day.workouts[0]);
    expect(detail.date).toBe(DATE);
  });

  it('has no route, so the page shows no map', () => {
    const detail = buildWorkoutDetail(DATE, rawWorkout(), PROFILE);
    expect(detail.hasRoute).toBe(false);
    expect(detail.hasGps).toBe(false);
  });

  // Resting 58 and max 200: fat burn from 114.8, cardio 143.2, peak 178.7
  it('gives each point its seconds from the start and its zone', () => {
    const detail = buildWorkoutDetail(DATE, rawWorkout(), PROFILE);
    expect(detail.points).toEqual([
      { t: 0, bpm: 150, zone: 'cardio' },
      { t: 60, bpm: 150, zone: 'cardio' },
      { t: 120, bpm: 160, zone: 'cardio' },
      { t: 180, bpm: 180, zone: 'peak' },
    ]);
  });

  it('leaves out readings from before and after the session', () => {
    const detail = buildWorkoutDetail(
      DATE,
      rawWorkout({
        heartRate: [
          heartRecord(13, 16, 58, [90, 95]),
          heartRecord(13, 17, 0, [150]),
          heartRecord(13, 17, 30, [120]),
        ],
      }),
      PROFILE
    );
    expect(detail.points).toEqual([{ t: 0, bpm: 150, zone: 'cardio' }]);
  });

  it('marks a low reading as out of range', () => {
    const detail = buildWorkoutDetail(
      DATE,
      rawWorkout({ heartRate: [heartRecord(13, 17, 0, [100, 120])] }),
      PROFILE
    );
    expect(detail.points.map((p) => p.zone)).toEqual(['outOfRange', 'fatBurn']);
  });

  it('keeps at most 600 points, the last reading among them', () => {
    const start = new Date(at(13, 17)).getTime();
    const samples = Array.from({ length: 900 }, (_, i) => ({
      time: new Date(start + i * 2000).toISOString(),
      beatsPerMinute: 120 + (i % 10),
    }));
    const detail = buildWorkoutDetail(
      DATE,
      rawWorkout({ heartRate: [{ samples }] }),
      PROFILE
    );
    expect(detail.points.length).toBeLessThanOrEqual(600);
    expect(detail.points.length).toBeGreaterThan(300);
    expect(detail.points[0].t).toBe(0);
    expect(detail.points[detail.points.length - 1].t).toBe(1798);
  });

  it('has no points when the watch recorded no heart rate', () => {
    const detail = buildWorkoutDetail(
      DATE,
      rawWorkout({ heartRate: [] }),
      PROFILE
    );
    expect(detail.points).toEqual([]);
    expect(detail.avgHeartRate).toBeNull();
    expect(detail.durationMin).toBe(30);
  });

  it('has no points when heart rate could not be read', () => {
    const detail = buildWorkoutDetail(
      DATE,
      rawWorkout({ heartRate: null }),
      PROFILE
    );
    expect(detail.points).toEqual([]);
    expect(detail.zones).toBeNull();
  });

  it('has points without zones when the age is not known', () => {
    const detail = buildWorkoutDetail(DATE, rawWorkout(), {});
    expect(detail.points).toHaveLength(4);
    expect(detail.points.every((p) => p.zone === null)).toBe(true);
    expect(detail.zones).toBeNull();
  });

  it('is null when the session is gone', () => {
    expect(
      buildWorkoutDetail(DATE, { date: DATE, session: null, errors: {} }, PROFILE)
    ).toBeNull();
  });
});
