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

  it('starts with an unknown Fitbit status and no days', () => {
    expect(initial.fitbit).toEqual({ status: 'unknown', error: null, days: {} });
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
});
