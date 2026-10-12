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
} from '../../../src/services/insightsApi';

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
  getErrorCode: jest.requireActual('../../../src/services/insightsApi')
    .getErrorCode,
}));

const mockStore = configureMockStore([thunk]);
const RETURN_TO = 'exp://127.0.0.1:8081/--/fitbit';
const TOKENS = { accessToken: 'a', refreshToken: 'r' };

const storeWithDays = (days = {}, weeks = {}) =>
  mockStore({
    device: { fitbit: { status: 'connected', error: null, days, weeks } },
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
