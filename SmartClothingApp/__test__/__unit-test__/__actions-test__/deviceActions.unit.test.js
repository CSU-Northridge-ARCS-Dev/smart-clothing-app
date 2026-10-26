/**
 * @file deviceActions.unit.test.js
 * Fitbit (Pixel Watch) thunks in deviceActions.js : check,
 * connect through the in-app browser, disconnect and loading a day.
 */
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';

import * as WebBrowser from 'expo-web-browser';
import {
  startCheckFitbit,
  startConnectFitbit,
  startDisconnectFitbit,
  startLoadFitbitDay,
  startLoadFitbitWeek,
  startLoadFitbitWorkout,
  startLoadFitbitMonth,
  startAutoSaveDays,
} from '../../../src/actions/deviceActions';
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
import {
  getFitbitTokens,
  setFitbitTokens,
  clearFitbitTokens,
} from '../../../src/utils/fitbitTokens';
import {
  getFitbitAuthUrl,
  getFitbitDay,
  getFitbitWeek,
  getFitbitWorkout,
  getFitbitMonthWorkouts,
} from '../../../src/services/insightsApi';
import { saveDailyStats } from '../../../src/services/healthStore';
import {
  getLastSavedDate,
  setLastSavedDate,
} from '../../../src/utils/localStorage';
import { auth } from '../../../firebaseConfig.js';

// These pull from __mocks__/
jest.mock('expo-web-browser');
jest.mock('expo-linking');

jest.mock('firebase/firestore', () => ({
  collection: jest.fn(),
  addDoc: jest.fn(),
  setDoc: jest.fn(),
  doc: jest.fn(),
  updateDoc: jest.fn(),
  getDoc: jest.fn(),
  getDocs: jest.fn(),
  deleteField: jest.fn(),
}));

jest.mock('../../../firebaseConfig.js', () => ({
  auth: { currentUser: { uid: 'user-1' } },
  database: {},
}));

jest.mock('../../../src/utils/fitbitTokens', () => ({
  getFitbitTokens: jest.fn(),
  setFitbitTokens: jest.fn(),
  clearFitbitTokens: jest.fn(),
}));

jest.mock('../../../src/services/insightsApi', () => ({
  getFitbitAuthUrl: jest.fn(),
  getFitbitDay: jest.fn(),
  getFitbitWeek: jest.fn(),
  getFitbitWorkout: jest.fn(),
  getFitbitMonthWorkouts: jest.fn(),
  getErrorCode: jest.requireActual('../../../src/services/insightsApi')
    .getErrorCode,
}));

jest.mock('../../../src/services/healthStore', () => ({
  saveDailyStats: jest.fn(),
}));

jest.mock('../../../src/utils/localStorage', () => ({
  getLastSavedDate: jest.fn(),
  setLastSavedDate: jest.fn(),
}));

const mockStore = configureMockStore([thunk]);
const RETURN_TO = 'exp://127.0.0.1:8081/--/fitbit';
const TOKENS = { accessToken: 'a', refreshToken: 'r' };

const storeWithDays = (days = {}, weeks = {}, workouts = {}, months = {}) =>
  mockStore({
    device: {
      fitbit: { status: 'connected', error: null, days, weeks, workouts, months },
    },
  });

const serviceError = (code) => {
  const error = new Error('Request failed');
  error.response = { data: { error: code } };
  return error;
};

beforeEach(() => {
  jest.clearAllMocks();
  jest.spyOn(console, 'log').mockImplementation(() => {});
});

describe('startCheckFitbit', () => {
  it('is connected when tokens are stored', async () => {
    getFitbitTokens.mockResolvedValue(TOKENS);
    const store = storeWithDays();
    expect(await store.dispatch(startCheckFitbit())).toBe(true);
    expect(store.getActions()).toEqual([
      { type: FITBIT_SET_STATUS, status: 'connected', error: null },
    ]);
  });

  it('is not connected without tokens', async () => {
    getFitbitTokens.mockResolvedValue(null);
    const store = storeWithDays();
    expect(await store.dispatch(startCheckFitbit())).toBe(false);
    expect(store.getActions()[0].status).toBe('not_connected');
  });
});

describe('startConnectFitbit', () => {
  beforeEach(() => {
    getFitbitAuthUrl.mockResolvedValue('https://www.fitbit.com/oauth2/authorize?s=1');
  });

  it('opens the Fitbit login and saves the returned tokens', async () => {
    WebBrowser.openAuthSessionAsync.mockResolvedValue({
      type: 'success',
      url: `${RETURN_TO}?accessToken=a1&refreshToken=r1&expiresAt=2026-10-11T20%3A00%3A00.000Z&fitbitUserId=U1`,
    });
    const store = storeWithDays();

    expect(await store.dispatch(startConnectFitbit())).toBe(true);

    expect(getFitbitAuthUrl).toHaveBeenCalledWith(RETURN_TO);
    expect(WebBrowser.openAuthSessionAsync).toHaveBeenCalledWith(
      'https://www.fitbit.com/oauth2/authorize?s=1',
      RETURN_TO
    );
    expect(setFitbitTokens).toHaveBeenCalledWith({
      accessToken: 'a1',
      refreshToken: 'r1',
      expiresAt: '2026-10-11T20:00:00.000Z',
      fitbitUserId: 'U1',
    });
    expect(store.getActions().map((a) => a.status || a.type)).toEqual([
      'connecting',
      FITBIT_CLEAR_DAYS,
      'connected',
    ]);
  });

  it('goes back to not connected when the user closes the browser', async () => {
    WebBrowser.openAuthSessionAsync.mockResolvedValue({ type: 'cancel' });
    const store = storeWithDays();
    expect(await store.dispatch(startConnectFitbit())).toBe(false);
    expect(setFitbitTokens).not.toHaveBeenCalled();
    expect(store.getActions().pop().status).toBe('not_connected');
  });

  it('shows the error the service redirected with', async () => {
    WebBrowser.openAuthSessionAsync.mockResolvedValue({
      type: 'success',
      url: `${RETURN_TO}?error=access_denied`,
    });
    const store = storeWithDays();
    expect(await store.dispatch(startConnectFitbit())).toBe(false);
    expect(setFitbitTokens).not.toHaveBeenCalled();
    expect(store.getActions().pop()).toEqual({
      type: FITBIT_SET_STATUS,
      status: 'error',
      error: 'access_denied',
    });
  });

  it('shows an error when the service cannot be reached', async () => {
    getFitbitAuthUrl.mockRejectedValue(new Error('Network Error'));
    const store = storeWithDays();
    expect(await store.dispatch(startConnectFitbit())).toBe(false);
    expect(WebBrowser.openAuthSessionAsync).not.toHaveBeenCalled();
    expect(store.getActions().pop().error).toBe('Network Error');
  });
});

describe('startDisconnectFitbit', () => {
  it('clears the tokens and the loaded days', async () => {
    const store = storeWithDays();
    await store.dispatch(startDisconnectFitbit());
    expect(clearFitbitTokens).toHaveBeenCalled();
    expect(store.getActions()).toEqual([
      { type: FITBIT_CLEAR_DAYS },
      { type: FITBIT_SET_STATUS, status: 'not_connected', error: null },
    ]);
  });
});

describe('startLoadFitbitDay', () => {
  beforeEach(() => {
    getFitbitTokens.mockResolvedValue(TOKENS);
  });

  it('loads the day into the store', async () => {
    const day = { date: '2026-10-10', sleep: null, heart: {}, workouts: [] };
    getFitbitDay.mockResolvedValue(day);
    const store = storeWithDays();
    await store.dispatch(startLoadFitbitDay('2026-10-10'));
    expect(getFitbitDay).toHaveBeenCalledWith('2026-10-10');
    expect(store.getActions()).toEqual([
      { type: FITBIT_DAY_LOADING, date: '2026-10-10' },
      { type: FITBIT_DAY_LOADED, date: '2026-10-10', day },
    ]);
  });

  it('skips a day that is already loaded unless forced', async () => {
    getFitbitDay.mockResolvedValue({});
    const store = storeWithDays({
      '2026-10-10': { loading: false, error: null, data: {} },
    });
    await store.dispatch(startLoadFitbitDay('2026-10-10'));
    expect(getFitbitDay).not.toHaveBeenCalled();
    await store.dispatch(startLoadFitbitDay('2026-10-10', { force: true }));
    expect(getFitbitDay).toHaveBeenCalledTimes(1);
  });

  it('records a Fitbit error for the day and stays connected', async () => {
    getFitbitDay.mockRejectedValue(serviceError('FITBIT_API_ERROR'));
    const store = storeWithDays();
    await store.dispatch(startLoadFitbitDay('2026-10-10'));
    expect(store.getActions().pop()).toEqual({
      type: FITBIT_DAY_ERROR,
      date: '2026-10-10',
      error: 'FITBIT_API_ERROR',
    });
    expect(clearFitbitTokens).not.toHaveBeenCalled();
  });

  it('disconnects when Fitbit needs a new login', async () => {
    getFitbitDay.mockRejectedValue(serviceError('FITBIT_REAUTH_REQUIRED'));
    const store = storeWithDays();
    await store.dispatch(startLoadFitbitDay('2026-10-10'));
    expect(clearFitbitTokens).toHaveBeenCalled();
    expect(store.getActions().pop()).toEqual({
      type: FITBIT_SET_STATUS,
      status: 'not_connected',
      error: 'FITBIT_REAUTH_REQUIRED',
    });
  });

  it('does not call the service without tokens', async () => {
    getFitbitTokens.mockResolvedValue(null);
    const store = storeWithDays();
    await store.dispatch(startLoadFitbitDay('2026-10-10'));
    expect(getFitbitDay).not.toHaveBeenCalled();
    expect(store.getActions()[0].status).toBe('not_connected');
  });

  describe('saving to Firestore', () => {
    const day = { date: '2026-10-10', steps: 9842, heart: {}, workouts: [] };

    beforeEach(() => {
      jest.useFakeTimers({ now: new Date(2026, 9, 11, 9, 0) });
      getFitbitDay.mockResolvedValue(day);
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('saves a finished day after it loads', async () => {
      const store = storeWithDays();
      await store.dispatch(startLoadFitbitDay('2026-10-10'));
      expect(saveDailyStats).toHaveBeenCalledWith('user-1', day, {
        source: 'fitbit',
        device: null,
        timezone: expect.any(String),
      });
    });

    it('never saves today', async () => {
      getFitbitDay.mockResolvedValue({ ...day, date: '2026-10-11' });
      const store = storeWithDays();
      await store.dispatch(startLoadFitbitDay('2026-10-11'));
      expect(getFitbitDay).toHaveBeenCalled();
      expect(saveDailyStats).not.toHaveBeenCalled();
    });

    it('still shows the day when the write fails', async () => {
      saveDailyStats.mockRejectedValue(new Error('offline'));
      const store = storeWithDays();
      await store.dispatch(startLoadFitbitDay('2026-10-10'));
      expect(store.getActions()).toEqual([
        { type: FITBIT_DAY_LOADING, date: '2026-10-10' },
        { type: FITBIT_DAY_LOADED, date: '2026-10-10', day },
      ]);
      expect(console.log).toHaveBeenCalledWith(
        'DailyStats save error: ',
        expect.any(Error)
      );
    });

    it('does not save a day that failed to load', async () => {
      getFitbitDay.mockRejectedValue(serviceError('FITBIT_API_ERROR'));
      const store = storeWithDays();
      await store.dispatch(startLoadFitbitDay('2026-10-10'));
      expect(saveDailyStats).not.toHaveBeenCalled();
    });

    it('does not save again a day that is already loaded', async () => {
      const store = storeWithDays({
        '2026-10-10': { loading: false, error: null, data: day },
      });
      await store.dispatch(startLoadFitbitDay('2026-10-10'));
      expect(saveDailyStats).not.toHaveBeenCalled();
    });
  });
});

describe('startAutoSaveDays', () => {
  const dayFor = (date) => ({ date, steps: 9842, heart: {}, workouts: [] });
  const fetchedDates = () => getFitbitDay.mock.calls.map(([date]) => date);
  const savedDates = () => setLastSavedDate.mock.calls.map(([, date]) => date);

  beforeEach(() => {
    // Today is 2026-10-11
    jest.useFakeTimers({ now: new Date(2026, 9, 11, 9, 0) });
    getFitbitTokens.mockResolvedValue(TOKENS);
    getFitbitDay.mockImplementation(async (date) => dayFor(date));
    saveDailyStats.mockResolvedValue();
  });

  afterEach(() => {
    jest.useRealTimers();
    auth.currentUser = { uid: 'user-1' };
  });

  it('saves yesterday and moves the last saved date to it', async () => {
    getLastSavedDate.mockResolvedValue('2026-10-09');
    const store = storeWithDays();
    await store.dispatch(startAutoSaveDays());
    expect(getLastSavedDate).toHaveBeenCalledWith('user-1');
    expect(saveDailyStats).toHaveBeenCalledWith(
      'user-1',
      dayFor('2026-10-10'),
      { source: 'fitbit', device: null, timezone: expect.any(String) }
    );
    expect(setLastSavedDate).toHaveBeenCalledWith('user-1', '2026-10-10');
  });

  it('puts each saved day in the store', async () => {
    getLastSavedDate.mockResolvedValue('2026-10-09');
    const store = storeWithDays();
    await store.dispatch(startAutoSaveDays());
    expect(store.getActions()).toEqual([
      { type: FITBIT_DAY_LOADED, date: '2026-10-10', day: dayFor('2026-10-10') },
    ]);
  });

  it('catches up missed days oldest first', async () => {
    getLastSavedDate.mockResolvedValue('2026-10-08');
    await storeWithDays().dispatch(startAutoSaveDays());
    expect(fetchedDates()).toEqual(['2026-10-09', '2026-10-10']);
    expect(savedDates()).toEqual(['2026-10-09', '2026-10-10']);
  });

  it('goes back at most 3 days', async () => {
    getLastSavedDate.mockResolvedValue('2026-10-01');
    await storeWithDays().dispatch(startAutoSaveDays());
    expect(fetchedDates()).toEqual(['2026-10-08', '2026-10-09', '2026-10-10']);
  });

  it('saves the last 3 days on the first run', async () => {
    getLastSavedDate.mockResolvedValue(null);
    await storeWithDays().dispatch(startAutoSaveDays());
    expect(fetchedDates()).toEqual(['2026-10-08', '2026-10-09', '2026-10-10']);
  });

  it('does nothing when yesterday is already saved', async () => {
    getLastSavedDate.mockResolvedValue('2026-10-10');
    await storeWithDays().dispatch(startAutoSaveDays());
    expect(getFitbitDay).not.toHaveBeenCalled();
    expect(saveDailyStats).not.toHaveBeenCalled();
  });

  it('never saves today', async () => {
    getLastSavedDate.mockResolvedValue(null);
    await storeWithDays().dispatch(startAutoSaveDays());
    expect(fetchedDates()).not.toContain('2026-10-11');
  });

  it('does nothing without a signed-in user', async () => {
    auth.currentUser = null;
    await storeWithDays().dispatch(startAutoSaveDays());
    expect(getLastSavedDate).not.toHaveBeenCalled();
    expect(getFitbitDay).not.toHaveBeenCalled();
  });

  it('does nothing without a Fitbit connection', async () => {
    getFitbitTokens.mockResolvedValue(null);
    await storeWithDays().dispatch(startAutoSaveDays());
    expect(getFitbitDay).not.toHaveBeenCalled();
  });

  it('stops at a day that fails to load and keeps the last saved date', async () => {
    getLastSavedDate.mockResolvedValue('2026-10-08');
    getFitbitDay.mockRejectedValueOnce(serviceError('FITBIT_API_ERROR'));
    await storeWithDays().dispatch(startAutoSaveDays());
    expect(fetchedDates()).toEqual(['2026-10-09']);
    expect(saveDailyStats).not.toHaveBeenCalled();
    expect(setLastSavedDate).not.toHaveBeenCalled();
    expect(clearFitbitTokens).not.toHaveBeenCalled();
  });

  it('disconnects when Fitbit needs a new login', async () => {
    getLastSavedDate.mockResolvedValue('2026-10-09');
    getFitbitDay.mockRejectedValue(serviceError('FITBIT_REAUTH_REQUIRED'));
    const store = storeWithDays();
    await store.dispatch(startAutoSaveDays());
    expect(clearFitbitTokens).toHaveBeenCalled();
    expect(store.getActions().pop()).toEqual({
      type: FITBIT_SET_STATUS,
      status: 'not_connected',
      error: 'FITBIT_REAUTH_REQUIRED',
    });
  });

  it('stops at a failed write', async () => {
    getLastSavedDate.mockResolvedValue('2026-10-08');
    saveDailyStats.mockRejectedValueOnce(new Error('offline'));
    await storeWithDays().dispatch(startAutoSaveDays());
    expect(fetchedDates()).toEqual(['2026-10-09']);
    expect(setLastSavedDate).not.toHaveBeenCalled();
  });

  it('ignores a second run while one is in progress', async () => {
    getLastSavedDate.mockResolvedValue('2026-10-09');
    const store = storeWithDays();
    await Promise.all([
      store.dispatch(startAutoSaveDays()),
      store.dispatch(startAutoSaveDays()),
    ]);
    expect(getFitbitDay).toHaveBeenCalledTimes(1);
  });

  it('runs again after the previous run finishes', async () => {
    getLastSavedDate.mockResolvedValue('2026-10-09');
    const store = storeWithDays();
    await store.dispatch(startAutoSaveDays());
    await store.dispatch(startAutoSaveDays());
    expect(getLastSavedDate).toHaveBeenCalledTimes(2);
  });
});

describe('startLoadFitbitWeek', () => {
  const WEEK = [{ date: '2026-10-10', steps: 8432, sleepMinutes: 412 }];

  beforeEach(() => {
    getFitbitTokens.mockResolvedValue(TOKENS);
  });

  it('loads the week into the store', async () => {
    getFitbitWeek.mockResolvedValue(WEEK);
    const store = storeWithDays();
    await store.dispatch(startLoadFitbitWeek('2026-10-10'));
    expect(getFitbitWeek).toHaveBeenCalledWith('2026-10-10');
    expect(getFitbitDay).not.toHaveBeenCalled();
    expect(store.getActions()).toEqual([
      { type: FITBIT_WEEK_LOADING, endDate: '2026-10-10' },
      { type: FITBIT_WEEK_LOADED, endDate: '2026-10-10', week: WEEK },
    ]);
  });

  it('skips a week that is already loaded unless forced', async () => {
    getFitbitWeek.mockResolvedValue(WEEK);
    const store = storeWithDays(
      {},
      { '2026-10-10': { loading: false, error: null, data: WEEK } }
    );
    await store.dispatch(startLoadFitbitWeek('2026-10-10'));
    expect(getFitbitWeek).not.toHaveBeenCalled();
    await store.dispatch(startLoadFitbitWeek('2026-10-10', { force: true }));
    expect(getFitbitWeek).toHaveBeenCalledTimes(1);
  });

  it('records a Fitbit error for the week and stays connected', async () => {
    getFitbitWeek.mockRejectedValue(serviceError('FITBIT_API_ERROR'));
    const store = storeWithDays();
    await store.dispatch(startLoadFitbitWeek('2026-10-10'));
    expect(store.getActions().pop()).toEqual({
      type: FITBIT_WEEK_ERROR,
      endDate: '2026-10-10',
      error: 'FITBIT_API_ERROR',
    });
    expect(clearFitbitTokens).not.toHaveBeenCalled();
  });

  it('disconnects when Fitbit needs a new login', async () => {
    getFitbitWeek.mockRejectedValue(serviceError('FITBIT_REAUTH_REQUIRED'));
    const store = storeWithDays();
    await store.dispatch(startLoadFitbitWeek('2026-10-10'));
    expect(clearFitbitTokens).toHaveBeenCalled();
    const types = store.getActions().map((a) => a.type);
    expect(types).toContain(FITBIT_CLEAR_DAYS);
    expect(store.getActions().pop()).toEqual({
      type: FITBIT_SET_STATUS,
      status: 'not_connected',
      error: 'FITBIT_REAUTH_REQUIRED',
    });
  });

  it('does not call the service without tokens', async () => {
    getFitbitTokens.mockResolvedValue(null);
    const store = storeWithDays();
    await store.dispatch(startLoadFitbitWeek('2026-10-10'));
    expect(getFitbitWeek).not.toHaveBeenCalled();
    expect(store.getActions()[0].status).toBe('not_connected');
  });
});

describe('startLoadFitbitWorkout', () => {
  const LOG_ID = 74512345678;
  const WORKOUT = { logId: LOG_ID, type: 'Run', points: [], hasRoute: false };

  beforeEach(() => {
    getFitbitTokens.mockResolvedValue(TOKENS);
  });

  it('loads the workout into the store', async () => {
    getFitbitWorkout.mockResolvedValue(WORKOUT);
    const store = storeWithDays();
    await store.dispatch(startLoadFitbitWorkout('2026-10-11', LOG_ID));
    expect(getFitbitWorkout).toHaveBeenCalledWith('2026-10-11', LOG_ID);
    expect(store.getActions()).toEqual([
      { type: FITBIT_WORKOUT_LOADING, logId: LOG_ID },
      { type: FITBIT_WORKOUT_LOADED, logId: LOG_ID, workout: WORKOUT },
    ]);
  });

  it('skips a workout that is already loaded unless forced', async () => {
    getFitbitWorkout.mockResolvedValue(WORKOUT);
    const store = storeWithDays({}, {}, {
      [LOG_ID]: { loading: false, error: null, data: WORKOUT },
    });
    await store.dispatch(startLoadFitbitWorkout('2026-10-11', LOG_ID));
    expect(getFitbitWorkout).not.toHaveBeenCalled();
    await store.dispatch(
      startLoadFitbitWorkout('2026-10-11', LOG_ID, { force: true })
    );
    expect(getFitbitWorkout).toHaveBeenCalledTimes(1);
  });

  it('records a missing workout and stays connected', async () => {
    getFitbitWorkout.mockRejectedValue(serviceError('WORKOUT_NOT_FOUND'));
    const store = storeWithDays();
    await store.dispatch(startLoadFitbitWorkout('2026-10-11', LOG_ID));
    expect(store.getActions().pop()).toEqual({
      type: FITBIT_WORKOUT_ERROR,
      logId: LOG_ID,
      error: 'WORKOUT_NOT_FOUND',
    });
    expect(clearFitbitTokens).not.toHaveBeenCalled();
  });

  it('disconnects when Fitbit needs a new login', async () => {
    getFitbitWorkout.mockRejectedValue(serviceError('FITBIT_REAUTH_REQUIRED'));
    const store = storeWithDays();
    await store.dispatch(startLoadFitbitWorkout('2026-10-11', LOG_ID));
    expect(clearFitbitTokens).toHaveBeenCalled();
    expect(store.getActions().pop().status).toBe('not_connected');
  });
});

describe('startLoadFitbitMonth', () => {
  const WORKOUTS = [{ date: '2026-10-11', logId: 1, type: 'Run' }];

  beforeEach(() => {
    getFitbitTokens.mockResolvedValue(TOKENS);
  });

  it('loads the month into the store', async () => {
    getFitbitMonthWorkouts.mockResolvedValue(WORKOUTS);
    const store = storeWithDays();
    await store.dispatch(startLoadFitbitMonth('2026-10'));
    expect(getFitbitMonthWorkouts).toHaveBeenCalledWith('2026-10');
    expect(store.getActions()).toEqual([
      { type: FITBIT_MONTH_LOADING, month: '2026-10' },
      { type: FITBIT_MONTH_LOADED, month: '2026-10', workouts: WORKOUTS },
    ]);
  });

  it('skips a month that is already loading', async () => {
    const store = storeWithDays({}, {}, {}, {
      '2026-10': { loading: true, error: null, data: null },
    });
    await store.dispatch(startLoadFitbitMonth('2026-10'));
    expect(getFitbitMonthWorkouts).not.toHaveBeenCalled();
  });

  it('records an error for the month', async () => {
    getFitbitMonthWorkouts.mockRejectedValue(serviceError('FITBIT_API_ERROR'));
    const store = storeWithDays();
    await store.dispatch(startLoadFitbitMonth('2026-10'));
    expect(store.getActions().pop()).toEqual({
      type: FITBIT_MONTH_ERROR,
      month: '2026-10',
      error: 'FITBIT_API_ERROR',
    });
  });
});
