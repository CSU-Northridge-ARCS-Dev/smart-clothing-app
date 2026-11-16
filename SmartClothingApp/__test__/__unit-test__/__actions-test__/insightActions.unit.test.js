/**
 * @file insightActions.unit.test.js
 * startGenerateFeedback : the day and profile sent to the service, the phone
 * cache, NO_DATA, the error paths and the Firestore save.
 */
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';

import {
  buildCoachProfile,
  startGenerateFeedback,
} from '../../../src/actions/insightActions';
import { generateInsightFromDay } from '../../../src/services/insightsApi';
import {
  getCachedFeedback,
  setCachedFeedback,
} from '../../../src/utils/localStorage';
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

jest.mock('../../../src/utils/localStorage', () => ({
  getCachedFeedback: jest.fn(),
  setCachedFeedback: jest.fn(),
}));

jest.mock('../../../src/services/healthStore', () => ({
  saveAIFeedback: jest.fn(),
}));

jest.mock('../../../src/services/insightsApi', () => ({
  generateInsightFromDay: jest.fn(),
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
  const DAY = {
    date: DATE,
    steps: 9483,
    sleep: { totalMinutes: 401 },
    heart: { restingHeartRate: 58 },
    workouts: [],
  };

  const storeWith = (day = DAY) =>
    mockStore({
      user: { userMetricsData: METRICS },
      device: { watch: { days: day ? { [DATE]: { data: day } } : {} } },
    });

  it('sends the loaded day, caches and returns the insight', async () => {
    generateInsightFromDay.mockResolvedValue({ insight: INSIGHT, usage: USAGE });
    const result = await storeWith().dispatch(startGenerateFeedback(DATE));
    expect(result).toEqual({ insight: INSIGHT });
    expect(generateInsightFromDay).toHaveBeenCalledWith(
      DATE,
      expect.objectContaining({ gender: 'male', height: 70 }),
      DAY
    );
    expect(setCachedFeedback).toHaveBeenCalledWith(DATE, INSIGHT);
  });

  it('saves the feedback with health_connect as its source', async () => {
    generateInsightFromDay.mockResolvedValue({ insight: INSIGHT, usage: USAGE });
    await storeWith().dispatch(startGenerateFeedback(DATE));
    expect(saveAIFeedback).toHaveBeenCalledWith('user-1', DATE, INSIGHT, USAGE, {
      dataSource: 'health_connect',
      regenerate: false,
    });
  });

  it('counts a forced generate as a regenerate', async () => {
    getCachedFeedback.mockResolvedValue({ headline: 'old' });
    generateInsightFromDay.mockResolvedValue({ insight: INSIGHT, usage: USAGE });
    await storeWith().dispatch(startGenerateFeedback(DATE, { force: true }));
    expect(getCachedFeedback).not.toHaveBeenCalled();
    expect(saveAIFeedback).toHaveBeenCalledWith('user-1', DATE, INSIGHT, USAGE, {
      dataSource: 'health_connect',
      regenerate: true,
    });
  });

  it('returns the cached insight without calling the service', async () => {
    getCachedFeedback.mockResolvedValue(INSIGHT);
    const result = await storeWith().dispatch(startGenerateFeedback(DATE));
    expect(result).toEqual({ insight: INSIGHT, cached: true });
    expect(generateInsightFromDay).not.toHaveBeenCalled();
  });

  it.each([
    ['has no sleep and no workouts', { ...DAY, sleep: null }],
    ['is not loaded', null],
  ])('answers NO_DATA without a call when the day %s', async (label, day) => {
    const result = await storeWith(day).dispatch(startGenerateFeedback(DATE));
    expect(result).toEqual({ reason: 'NO_DATA' });
    expect(generateInsightFromDay).not.toHaveBeenCalled();
    expect(saveAIFeedback).not.toHaveBeenCalled();
  });

  it('gives feedback on a day with a workout and no sleep', async () => {
    generateInsightFromDay.mockResolvedValue({ insight: INSIGHT, usage: USAGE });
    const day = { ...DAY, sleep: null, workouts: [{ type: 'Walk' }] };
    const result = await storeWith(day).dispatch(startGenerateFeedback(DATE));
    expect(result).toEqual({ insight: INSIGHT });
  });

  it('passes on the NO_DATA answer of the service', async () => {
    generateInsightFromDay.mockResolvedValue({ insight: null, reason: 'NO_DATA' });
    const result = await storeWith().dispatch(startGenerateFeedback(DATE));
    expect(result).toEqual({ reason: 'NO_DATA' });
    expect(setCachedFeedback).not.toHaveBeenCalled();
  });

  it.each(['COACH_API_ERROR', 'INVALID_DAY'])(
    'rethrows %s, dispatches nothing and saves nothing',
    async (code) => {
      generateInsightFromDay.mockRejectedValue(serviceError(code));
      const store = storeWith();
      const error = await rejectionOf(
        store.dispatch(startGenerateFeedback(DATE))
      );
      expect(error.message).toBe(code);
      expect(store.getActions()).toEqual([]);
      expect(saveAIFeedback).not.toHaveBeenCalled();
    }
  );

  it('still returns the insight when the write fails', async () => {
    const log = jest.spyOn(console, 'log').mockImplementation(() => {});
    generateInsightFromDay.mockResolvedValue({ insight: INSIGHT, usage: USAGE });
    saveAIFeedback.mockRejectedValue(new Error('permission-denied'));
    const result = await storeWith().dispatch(startGenerateFeedback(DATE));
    expect(result).toEqual({ insight: INSIGHT });
    expect(log).toHaveBeenCalled();
    log.mockRestore();
  });

  it('writes nothing without a signed-in user', async () => {
    auth.currentUser = null;
    generateInsightFromDay.mockResolvedValue({ insight: INSIGHT, usage: USAGE });
    const result = await storeWith().dispatch(startGenerateFeedback(DATE));
    expect(result).toEqual({ insight: INSIGHT });
    expect(saveAIFeedback).not.toHaveBeenCalled();
  });
});
