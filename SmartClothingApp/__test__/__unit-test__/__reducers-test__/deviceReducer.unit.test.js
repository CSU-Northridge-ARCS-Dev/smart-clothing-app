/**
 * @file deviceReducer.unit.test.js
 * The device list and the Fitbit (Pixel Watch) slice .
 */
import deviceReducer from '../../../src/reducers/deviceReducer';
import {
  FITBIT_SET_STATUS,
  FITBIT_DAY_LOADING,
  FITBIT_DAY_LOADED,
  FITBIT_DAY_ERROR,
  FITBIT_CLEAR_DAYS,
  FITBIT_WEEK_LOADING,
  FITBIT_WEEK_LOADED,
  FITBIT_WEEK_ERROR,
  FITBIT_WORKOUT_LOADING,
  FITBIT_WORKOUT_LOADED,
  FITBIT_WORKOUT_ERROR,
  FITBIT_MONTH_LOADING,
  FITBIT_MONTH_LOADED,
  FITBIT_MONTH_ERROR,
} from '../../../src/actions/types';

const DATE = '2026-10-10';
const DAY = { date: DATE, sleep: null, heart: {}, workouts: [] };

describe('deviceReducer', () => {
  const initial = deviceReducer(undefined, { type: '@@INIT' });

  it('lists the Pixel Watch after the demo devices', () => {
    expect(initial.devicesData.map((d) => d.name)).toEqual([
      'Smart Sock',
      'Smart Shirt',
      'Pixel Watch',
    ]);
    expect(initial.devicesData[2].connection).toBe('fitbit');
  });

  it('starts with an unknown Fitbit status and no days, weeks, workouts or months', () => {
    expect(initial.fitbit).toEqual({
      status: 'unknown',
      error: null,
      days: {},
      weeks: {},
      workouts: {},
      months: {},
    });
  });

  it('sets the status and error', () => {
    const state = deviceReducer(initial, {
      type: FITBIT_SET_STATUS,
      status: 'error',
      error: 'access_denied',
    });
    expect(state.fitbit.status).toBe('error');
    expect(state.fitbit.error).toBe('access_denied');
    expect(state.devicesData).toBe(initial.devicesData);
  });

  it('tracks a day from loading to loaded', () => {
    let state = deviceReducer(initial, { type: FITBIT_DAY_LOADING, date: DATE });
    expect(state.fitbit.days[DATE]).toEqual({ loading: true, error: null, data: null });
    state = deviceReducer(state, { type: FITBIT_DAY_LOADED, date: DATE, day: DAY });
    expect(state.fitbit.days[DATE]).toEqual({ loading: false, error: null, data: DAY });
  });

  it('keeps the old data while a day reloads', () => {
    let state = deviceReducer(initial, { type: FITBIT_DAY_LOADED, date: DATE, day: DAY });
    state = deviceReducer(state, { type: FITBIT_DAY_LOADING, date: DATE });
    expect(state.fitbit.days[DATE]).toEqual({ loading: true, error: null, data: DAY });
  });

  it('records a day error and clears all days', () => {
    let state = deviceReducer(initial, {
      type: FITBIT_DAY_ERROR,
      date: DATE,
      error: 'FITBIT_API_ERROR',
    });
    expect(state.fitbit.days[DATE].error).toBe('FITBIT_API_ERROR');
    state = deviceReducer(state, { type: FITBIT_CLEAR_DAYS });
    expect(state.fitbit.days).toEqual({});
  });

  it('tracks a week from loading to loaded, keeping old data on reload', () => {
    const WEEK = [{ date: DATE, steps: 8432, sleepMinutes: 412 }];
    let state = deviceReducer(initial, { type: FITBIT_WEEK_LOADING, endDate: DATE });
    expect(state.fitbit.weeks[DATE]).toEqual({ loading: true, error: null, data: null });
    state = deviceReducer(state, { type: FITBIT_WEEK_LOADED, endDate: DATE, week: WEEK });
    expect(state.fitbit.weeks[DATE]).toEqual({ loading: false, error: null, data: WEEK });
    state = deviceReducer(state, { type: FITBIT_WEEK_LOADING, endDate: DATE });
    expect(state.fitbit.weeks[DATE].data).toBe(WEEK);
    expect(state.fitbit.days).toEqual({});
  });

  it('records a week error, and clearing removes weeks too', () => {
    let state = deviceReducer(initial, { type: FITBIT_DAY_LOADED, date: DATE, day: DAY });
    state = deviceReducer(state, {
      type: FITBIT_WEEK_ERROR,
      endDate: DATE,
      error: 'FITBIT_API_ERROR',
    });
    expect(state.fitbit.weeks[DATE]).toEqual({
      loading: false,
      error: 'FITBIT_API_ERROR',
      data: null,
    });
    state = deviceReducer(state, { type: FITBIT_CLEAR_DAYS });
    expect(state.fitbit.days).toEqual({});
    expect(state.fitbit.weeks).toEqual({});
  });
});

describe('deviceReducer workouts and months', () => {
  const initial = deviceReducer(undefined, { type: '@@INIT' });
  const LOG_ID = 74512345678;
  const WORKOUT = { logId: LOG_ID, type: 'Run', points: [], hasRoute: false };
  const MONTH_WORKOUTS = [{ date: '2026-10-11', logId: LOG_ID, type: 'Run' }];

  it('tracks a workout from loading to loaded, keeping old data on reload', () => {
    let state = deviceReducer(initial, { type: FITBIT_WORKOUT_LOADING, logId: LOG_ID });
    expect(state.fitbit.workouts[LOG_ID]).toEqual({ loading: true, error: null, data: null });
    state = deviceReducer(state, {
      type: FITBIT_WORKOUT_LOADED,
      logId: LOG_ID,
      workout: WORKOUT,
    });
    expect(state.fitbit.workouts[LOG_ID]).toEqual({
      loading: false,
      error: null,
      data: WORKOUT,
    });
    state = deviceReducer(state, { type: FITBIT_WORKOUT_LOADING, logId: LOG_ID });
    expect(state.fitbit.workouts[LOG_ID].data).toBe(WORKOUT);
  });

  it('records a workout error', () => {
    const state = deviceReducer(initial, {
      type: FITBIT_WORKOUT_ERROR,
      logId: LOG_ID,
      error: 'WORKOUT_NOT_FOUND',
    });
    expect(state.fitbit.workouts[LOG_ID]).toEqual({
      loading: false,
      error: 'WORKOUT_NOT_FOUND',
      data: null,
    });
  });

  it('tracks a month from loading to loaded, and records an error', () => {
    let state = deviceReducer(initial, { type: FITBIT_MONTH_LOADING, month: '2026-10' });
    expect(state.fitbit.months['2026-10'].loading).toBe(true);
    state = deviceReducer(state, {
      type: FITBIT_MONTH_LOADED,
      month: '2026-10',
      workouts: MONTH_WORKOUTS,
    });
    expect(state.fitbit.months['2026-10']).toEqual({
      loading: false,
      error: null,
      data: MONTH_WORKOUTS,
    });
    state = deviceReducer(state, {
      type: FITBIT_MONTH_ERROR,
      month: '2026-09',
      error: 'FITBIT_API_ERROR',
    });
    expect(state.fitbit.months['2026-09'].error).toBe('FITBIT_API_ERROR');
    expect(state.fitbit.months['2026-10'].data).toBe(MONTH_WORKOUTS);
  });

  it('clearing removes workouts and months too', () => {
    let state = deviceReducer(initial, {
      type: FITBIT_WORKOUT_LOADED,
      logId: LOG_ID,
      workout: WORKOUT,
    });
    state = deviceReducer(state, {
      type: FITBIT_MONTH_LOADED,
      month: '2026-10',
      workouts: MONTH_WORKOUTS,
    });
    state = deviceReducer(state, { type: FITBIT_CLEAR_DAYS });
    expect(state.fitbit.workouts).toEqual({});
    expect(state.fitbit.months).toEqual({});
  });
});
