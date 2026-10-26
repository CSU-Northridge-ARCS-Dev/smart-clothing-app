/**
 * @file insightActions.unit.test.js
 * startGenerateFeedback : the profile sent to the service, the phone cache,
 * NO_DATA, the error paths and the Firestore save.
 */
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';

import {
  buildCoachProfile,
  startGenerateFeedback,
} from '../../../src/actions/insightActions';
import { FITBIT_SET_STATUS, FITBIT_CLEAR_DAYS } from '../../../src/actions/types';
import { generateInsight } from '../../../src/services/insightsApi';
import {
  getCachedFeedback,
  setCachedFeedback,
} from '../../../src/utils/localStorage';
import { clearFitbitTokens } from '../../../src/utils/fitbitTokens';
import { saveAIFeedback } from '../../../src/services/healthStore';
import { auth } from '../../../firebaseConfig.js';

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

jest.mock('expo-web-browser');
jest.mock('expo-linking');

jest.mock('../../../src/utils/fitbitTokens', () => ({
  getFitbitTokens: jest.fn(),
  setFitbitTokens: jest.fn(),
  clearFitbitTokens: jest.fn(),
}));

jest.mock('../../../src/utils/localStorage', () => ({
  getCachedFeedback: jest.fn(),
  setCachedFeedback: jest.fn(),
}));

jest.mock('../../../src/services/healthStore', () => ({
  saveAIFeedback: jest.fn(),
}));

jest.mock('../../../src/services/insightsApi', () => ({
  generateInsight: jest.fn(),
  getErrorCode: jest.requireActual('../../../src/services/insightsApi')
    .getErrorCode,
}));

const mockStore = configureMockStore([thunk]);
const DATE = '2026-10-11';
const INSIGHT = { headline: 'Solid day', keySignals: ['a'], focus: ['b'] };
const USAGE = {
  model: 'claude-opus-5-5',
  inputTokens: 1200,
  outputTokens: 150,
};

// Born Mar 1, 2004
const METRICS = {
  gender: 'male',
  dob: new Date(2004, 2, 1),
  height: 70,
  weight: 165,
  sports: 'running',
};

const storeWith = (userMetricsData = METRICS) =>
  mockStore({ user: { userMetricsData } });

const serviceError = (code) => {
  const error = new Error('Request failed');
  error.response = { data: { error: code } };
  return error;
};

const rejectionOf = async (promise) => {
  try {
    await promise;
  } catch (e) {
    return e;
  }
  throw new Error('expected a rejection');
};

beforeEach(() => {
  jest.clearAllMocks();
  getCachedFeedback.mockResolvedValue(null);
  saveAIFeedback.mockResolvedValue();
  auth.currentUser = { uid: 'user-1' };
});

describe('buildCoachProfile', () => {
  it('sends gender, age, height, weight and sports', () => {
    const profile = buildCoachProfile(METRICS);
    expect(profile).toEqual({
      gender: 'male',
      age: expect.any(Number),
      height: 70,
      weight: 165,
      sports: 'running',
    });
    expect(profile.age).toBeGreaterThanOrEqual(22);
  });

  it('passes "No Data" through and leaves age empty without a dob', () => {
    expect(
      buildCoachProfile({ gender: 'No Data', dob: null, height: 'No Data' })
    ).toMatchObject({ gender: 'No Data', age: null, height: 'No Data' });
  });
});

describe('startGenerateFeedback', () => {
  it('returns the cached insight without calling the service', async () => {
    getCachedFeedback.mockResolvedValue(INSIGHT);
    const result = await storeWith().dispatch(startGenerateFeedback(DATE));
    expect(result).toEqual({ insight: INSIGHT, cached: true });
    expect(generateInsight).not.toHaveBeenCalled();
  });

  it('calls the service, caches and returns the insight', async () => {
    generateInsight.mockResolvedValue({ insight: INSIGHT, usage: {} });
    const result = await storeWith().dispatch(startGenerateFeedback(DATE));
    expect(result).toEqual({ insight: INSIGHT });
    expect(generateInsight).toHaveBeenCalledWith(
      DATE,
      expect.objectContaining({ gender: 'male', height: 70, weight: 165 })
    );
    expect(setCachedFeedback).toHaveBeenCalledWith(DATE, INSIGHT);
  });

  it('skips the cache when forced', async () => {
    getCachedFeedback.mockResolvedValue({ headline: 'old' });
    generateInsight.mockResolvedValue({ insight: INSIGHT });
    const result = await storeWith().dispatch(
      startGenerateFeedback(DATE, { force: true })
    );
    expect(result).toEqual({ insight: INSIGHT });
    expect(getCachedFeedback).not.toHaveBeenCalled();
    expect(setCachedFeedback).toHaveBeenCalledWith(DATE, INSIGHT);
  });

  it('returns NO_DATA and caches nothing', async () => {
    generateInsight.mockResolvedValue({ insight: null, reason: 'NO_DATA' });
    const result = await storeWith().dispatch(startGenerateFeedback(DATE));
    expect(result).toEqual({ reason: 'NO_DATA' });
    expect(setCachedFeedback).not.toHaveBeenCalled();
  });

  it('rejects with the service error code', async () => {
    generateInsight.mockRejectedValue(serviceError('COACH_API_ERROR'));
    const store = storeWith();
    const error = await rejectionOf(store.dispatch(startGenerateFeedback(DATE)));
    expect(error.message).toBe('COACH_API_ERROR');
    expect(setCachedFeedback).not.toHaveBeenCalled();
    expect(store.getActions()).toEqual([]);
  });

  it('disconnects the watch when Fitbit needs a new login', async () => {
    generateInsight.mockRejectedValue(serviceError('FITBIT_REAUTH_REQUIRED'));
    const store = storeWith();
    const error = await rejectionOf(store.dispatch(startGenerateFeedback(DATE)));
    expect(error.message).toBe('FITBIT_REAUTH_REQUIRED');
    expect(clearFitbitTokens).toHaveBeenCalled();
    expect(store.getActions()).toEqual([
      { type: FITBIT_CLEAR_DAYS },
      {
        type: FITBIT_SET_STATUS,
        status: 'not_connected',
        error: 'FITBIT_REAUTH_REQUIRED',
      },
    ]);
  });
});

describe('startGenerateFeedback saving to Firestore', () => {
  it('saves the feedback with the model and token counts', async () => {
    generateInsight.mockResolvedValue({ insight: INSIGHT, usage: USAGE });
    await storeWith().dispatch(startGenerateFeedback(DATE));
    expect(saveAIFeedback).toHaveBeenCalledWith('user-1', DATE, INSIGHT, USAGE, {
      dataSource: 'fitbit',
      regenerate: false,
    });
  });

  it('counts a forced generate as a regenerate', async () => {
    generateInsight.mockResolvedValue({ insight: INSIGHT, usage: USAGE });
    await storeWith().dispatch(startGenerateFeedback(DATE, { force: true }));
    expect(saveAIFeedback).toHaveBeenCalledWith('user-1', DATE, INSIGHT, USAGE, {
      dataSource: 'fitbit',
      regenerate: true,
    });
  });

  it('writes nothing when the phone cache answers', async () => {
    getCachedFeedback.mockResolvedValue(INSIGHT);
    await storeWith().dispatch(startGenerateFeedback(DATE));
    expect(saveAIFeedback).not.toHaveBeenCalled();
  });

  it('writes nothing for NO_DATA', async () => {
    generateInsight.mockResolvedValue({ insight: null, reason: 'NO_DATA' });
    await storeWith().dispatch(startGenerateFeedback(DATE));
    expect(saveAIFeedback).not.toHaveBeenCalled();
  });

  it('writes nothing when the service fails', async () => {
    generateInsight.mockRejectedValue(serviceError('COACH_API_ERROR'));
    await rejectionOf(storeWith().dispatch(startGenerateFeedback(DATE)));
    expect(saveAIFeedback).not.toHaveBeenCalled();
  });

  it('still returns the insight when the write fails', async () => {
    const log = jest.spyOn(console, 'log').mockImplementation(() => {});
    generateInsight.mockResolvedValue({ insight: INSIGHT, usage: USAGE });
    saveAIFeedback.mockRejectedValue(new Error('permission-denied'));
    const result = await storeWith().dispatch(startGenerateFeedback(DATE));
    expect(result).toEqual({ insight: INSIGHT });
    expect(log).toHaveBeenCalled();
    log.mockRestore();
  });

  it('writes nothing without a signed-in user', async () => {
    auth.currentUser = null;
    generateInsight.mockResolvedValue({ insight: INSIGHT, usage: USAGE });
    const result = await storeWith().dispatch(startGenerateFeedback(DATE));
    expect(result).toEqual({ insight: INSIGHT });
    expect(saveAIFeedback).not.toHaveBeenCalled();
  });
});
