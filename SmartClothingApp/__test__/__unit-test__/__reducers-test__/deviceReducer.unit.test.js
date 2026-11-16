/**
 * @file deviceReducer.unit.test.js
 * The device list, the Health Connect status and the watch data slice.
 */
import deviceReducer from '../../../src/reducers/deviceReducer';
import {
  WATCH_DAY_LOADING,
  WATCH_DAY_LOADED,
  WATCH_DAY_ERROR,
  WATCH_CLEAR_DAYS,
  WATCH_WEEK_LOADING,
  WATCH_WEEK_LOADED,
  WATCH_WEEK_ERROR,
  WATCH_WORKOUT_LOADING,
  WATCH_WORKOUT_LOADED,
  WATCH_WORKOUT_ERROR,
  WATCH_MONTH_LOADING,
  WATCH_MONTH_LOADED,
  WATCH_MONTH_ERROR,
  HEALTH_CONNECT_SET_STATUS,
} from '../../../src/actions/types';

const DATE = '2026-10-10';
const DAY = { date: DATE, sleep: null, heart: {}, workouts: [] };

describe('deviceReducer', () => {
  const initial = deviceReducer(undefined, { type: '@@INIT' });

  it('lists Health Connect after the demo devices', () => {
    expect(initial.devicesData.map((d) => d.name)).toEqual([
      'Smart Sock',
      'Smart Shirt',
      'Health Connect',
    ]);
    expect(initial.devicesData[2].connection).toBe('health_connect');
  });

  it('starts with an unknown Health Connect status and no permissions', () => {
    expect(initial.healthConnect).toEqual({
      status: 'unknown',
      permissions: [],
      error: null,
    });
  });

  it('sets the Health Connect status, permissions and error', () => {
    const permissions = [{ accessType: 'read', recordType: 'Steps' }];
    let state = deviceReducer(initial, {
      type: HEALTH_CONNECT_SET_STATUS,
      status: 'connected',
      permissions,
      error: null,
    });
    expect(state.healthConnect).toEqual({
      status: 'connected',
      permissions,
      error: null,
    });
    expect(state.watch).toBe(initial.watch);

    state = deviceReducer(state, {
      type: HEALTH_CONNECT_SET_STATUS,
      status: 'not_connected',
      error: 'no_permissions',
    });
    expect(state.healthConnect).toEqual({
      status: 'not_connected',
      permissions: [],
      error: 'no_permissions',
    });
  });

  it('starts with no days, weeks, workouts or months', () => {
    expect(initial.watch).toEqual({
      days: {},
      weeks: {},
      workouts: {},
      months: {},
    });
  });

  it('tracks a day from loading to loaded', () => {
    let state = deviceReducer(initial, { type: WATCH_DAY_LOADING, date: DATE });
    expect(state.watch.days[DATE]).toEqual({ loading: true, error: null, data: null });
    state = deviceReducer(state, { type: WATCH_DAY_LOADED, date: DATE, day: DAY });
    expect(state.watch.days[DATE]).toEqual({ loading: false, error: null, data: DAY });
  });

  it('keeps the old data while a day reloads', () => {
    let state = deviceReducer(initial, { type: WATCH_DAY_LOADED, date: DATE, day: DAY });
    state = deviceReducer(state, { type: WATCH_DAY_LOADING, date: DATE });
    expect(state.watch.days[DATE]).toEqual({ loading: true, error: null, data: DAY });
  });

  it('records a day error and clears all days', () => {
    let state = deviceReducer(initial, {
      type: WATCH_DAY_ERROR,
      date: DATE,
      error: 'HEALTH_CONNECT_READ_FAILED',
    });
    expect(state.watch.days[DATE].error).toBe('HEALTH_CONNECT_READ_FAILED');
    state = deviceReducer(state, { type: WATCH_CLEAR_DAYS });
    expect(state.watch.days).toEqual({});
  });

  it('tracks a week from loading to loaded, keeping old data on reload', () => {
    const WEEK = [{ date: DATE, steps: 8432, sleepMinutes: 412 }];
    let state = deviceReducer(initial, { type: WATCH_WEEK_LOADING, endDate: DATE });
    expect(state.watch.weeks[DATE]).toEqual({ loading: true, error: null, data: null });
    state = deviceReducer(state, { type: WATCH_WEEK_LOADED, endDate: DATE, week: WEEK });
    expect(state.watch.weeks[DATE]).toEqual({ loading: false, error: null, data: WEEK });
    state = deviceReducer(state, { type: WATCH_WEEK_LOADING, endDate: DATE });
    expect(state.watch.weeks[DATE].data).toBe(WEEK);
    expect(state.watch.days).toEqual({});
  });

  it('records a week error, and clearing removes weeks too', () => {
    let state = deviceReducer(initial, { type: WATCH_DAY_LOADED, date: DATE, day: DAY });
    state = deviceReducer(state, {
      type: WATCH_WEEK_ERROR,
      endDate: DATE,
      error: 'HEALTH_CONNECT_READ_FAILED',
    });
    expect(state.watch.weeks[DATE]).toEqual({
      loading: false,
      error: 'HEALTH_CONNECT_READ_FAILED',
      data: null,
    });
    state = deviceReducer(state, { type: WATCH_CLEAR_DAYS });
    expect(state.watch.days).toEqual({});
    expect(state.watch.weeks).toEqual({});
  });
});

describe('deviceReducer workouts and months', () => {
  const initial = deviceReducer(undefined, { type: '@@INIT' });
  const LOG_ID = 74512345678;
  const WORKOUT = { logId: LOG_ID, type: 'Run', points: [], hasRoute: false };
  const MONTH_WORKOUTS = [{ date: '2026-10-11', logId: LOG_ID, type: 'Run' }];

  it('tracks a workout from loading to loaded, keeping old data on reload', () => {
    let state = deviceReducer(initial, { type: WATCH_WORKOUT_LOADING, logId: LOG_ID });
    expect(state.watch.workouts[LOG_ID]).toEqual({ loading: true, error: null, data: null });
    state = deviceReducer(state, {
      type: WATCH_WORKOUT_LOADED,
      logId: LOG_ID,
      workout: WORKOUT,
    });
    expect(state.watch.workouts[LOG_ID]).toEqual({
      loading: false,
      error: null,
      data: WORKOUT,
    });
    state = deviceReducer(state, { type: WATCH_WORKOUT_LOADING, logId: LOG_ID });
    expect(state.watch.workouts[LOG_ID].data).toBe(WORKOUT);
  });

  it('records a workout error', () => {
    const state = deviceReducer(initial, {
      type: WATCH_WORKOUT_ERROR,
      logId: LOG_ID,
      error: 'WORKOUT_NOT_FOUND',
    });
    expect(state.watch.workouts[LOG_ID]).toEqual({
      loading: false,
      error: 'WORKOUT_NOT_FOUND',
      data: null,
    });
  });

  it('tracks a month from loading to loaded, and records an error', () => {
    let state = deviceReducer(initial, { type: WATCH_MONTH_LOADING, month: '2026-10' });
    expect(state.watch.months['2026-10'].loading).toBe(true);
    state = deviceReducer(state, {
      type: WATCH_MONTH_LOADED,
      month: '2026-10',
      workouts: MONTH_WORKOUTS,
    });
    expect(state.watch.months['2026-10']).toEqual({
      loading: false,
      error: null,
      data: MONTH_WORKOUTS,
    });
    state = deviceReducer(state, {
      type: WATCH_MONTH_ERROR,
      month: '2026-09',
      error: 'HEALTH_CONNECT_READ_FAILED',
    });
    expect(state.watch.months['2026-09'].error).toBe('HEALTH_CONNECT_READ_FAILED');
    expect(state.watch.months['2026-10'].data).toBe(MONTH_WORKOUTS);
  });

  it('clearing removes workouts and months too', () => {
    let state = deviceReducer(initial, {
      type: WATCH_WORKOUT_LOADED,
      logId: LOG_ID,
      workout: WORKOUT,
    });
    state = deviceReducer(state, {
      type: WATCH_MONTH_LOADED,
      month: '2026-10',
      workouts: MONTH_WORKOUTS,
    });
    state = deviceReducer(state, { type: WATCH_CLEAR_DAYS });
    expect(state.watch.workouts).toEqual({});
    expect(state.watch.months).toEqual({});
  });
});
