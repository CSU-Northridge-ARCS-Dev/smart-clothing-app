/**
 * @file insightsApi.unit.test.js
 * The insights-service client : auth headers and saving refreshed
 * Fitbit tokens, including on error responses.
 */

jest.mock('../../../firebaseConfig.js', () => ({
  auth: {
    currentUser: { getIdToken: jest.fn(() => Promise.resolve('id-token-1')) },
  },
}));

jest.mock('../../../src/utils/fitbitTokens', () => ({
  getFitbitTokens: jest.fn(),
  setFitbitTokens: jest.fn(),
  clearFitbitTokens: jest.fn(),
}));

let insightsApi;
let addAuthHeaders;
let getErrorCode;
let getFitbitDay;
let getFitbitWeek;
let getFitbitWorkout;
let getFitbitMonthWorkouts;
let getFitbitAuthUrl;
let generateInsight;
let generateInsightFromDay;
let dayForCoach;
let fitbitTokens;

const REFRESHED = {
  accessToken: 'access-2',
  refreshToken: 'refresh-2',
  expiresAt: '2026-10-11T21:00:00.000Z',
  fitbitUserId: 'ABC123',
};

// An axios adapter that answers with the given status and body
const respondWith = (status, data) => (config) => {
  const response = { status, data, headers: {}, config, statusText: '' };
  if (status >= 200 && status < 300) return Promise.resolve(response);
  const error = new Error(`Request failed with status code ${status}`);
  error.config = config;
  error.response = response;
  return Promise.reject(error);
};

beforeEach(() => {
  jest.resetModules();
  fitbitTokens = require('../../../src/utils/fitbitTokens');
  const api = require('../../../src/services/insightsApi');
  insightsApi = api.default;
  ({
    addAuthHeaders,
    getErrorCode,
    getFitbitDay,
    getFitbitWeek,
    getFitbitWorkout,
    getFitbitMonthWorkouts,
    getFitbitAuthUrl,
    generateInsight,
    generateInsightFromDay,
    dayForCoach,
  } = api);
  jest.clearAllMocks();
});

describe('addAuthHeaders', () => {
  it('adds the ID token and the Fitbit token pair', async () => {
    fitbitTokens.getFitbitTokens.mockResolvedValue({
      accessToken: 'access-1',
      refreshToken: 'refresh-1',
    });
    const config = await addAuthHeaders({ headers: {} });
    expect(config.headers.Authorization).toBe('Bearer id-token-1');
    expect(config.headers['X-Fitbit-Token']).toBe('access-1');
    expect(config.headers['X-Fitbit-Refresh-Token']).toBe('refresh-1');
    expect(config.headers['ngrok-skip-browser-warning']).toBe('true');
  });

  it('leaves out the Fitbit headers when the watch is not connected', async () => {
    fitbitTokens.getFitbitTokens.mockResolvedValue(null);
    const config = await addAuthHeaders({ headers: {} });
    expect(config.headers.Authorization).toBe('Bearer id-token-1');
    expect(config.headers).not.toHaveProperty('X-Fitbit-Token');
  });
});

describe('requests', () => {
  beforeEach(() => {
    fitbitTokens.getFitbitTokens.mockResolvedValue({
      accessToken: 'access-1',
      refreshToken: 'refresh-1',
    });
  });

  it('getFitbitDay returns the day and saves refreshed tokens', async () => {
    let seen;
    insightsApi.defaults.adapter = (config) => {
      seen = config;
      return respondWith(200, {
        day: { date: '2026-10-10' },
        refreshedTokens: REFRESHED,
      })(config);
    };
    const day = await getFitbitDay('2026-10-10');
    expect(day).toEqual({ date: '2026-10-10' });
    expect(seen.url).toBe('/api/fitbit/day/2026-10-10');
    expect(seen.headers['X-Fitbit-Token']).toBe('access-1');
    expect(fitbitTokens.setFitbitTokens).toHaveBeenCalledWith(REFRESHED);
  });

  it('saves refreshed tokens from a 502 error response', async () => {
    insightsApi.defaults.adapter = respondWith(502, {
      error: 'FITBIT_API_ERROR',
      refreshedTokens: REFRESHED,
    });
    let caught;
    try {
      await getFitbitDay('2026-10-10');
    } catch (e) {
      caught = e;
    }
    expect(getErrorCode(caught)).toBe('FITBIT_API_ERROR');
    expect(fitbitTokens.setFitbitTokens).toHaveBeenCalledWith(REFRESHED);
  });

  it('does not touch the tokens when none were refreshed', async () => {
    insightsApi.defaults.adapter = respondWith(200, { day: {} });
    await getFitbitDay('2026-10-10');
    expect(fitbitTokens.setFitbitTokens).not.toHaveBeenCalled();
  });

  it('getFitbitWeek asks for the week ending at the date', async () => {
    let seen;
    const week = [{ date: '2026-10-10', steps: 8432, sleepMinutes: 412 }];
    insightsApi.defaults.adapter = (config) => {
      seen = config;
      return respondWith(200, { week })(config);
    };
    expect(await getFitbitWeek('2026-10-10')).toEqual(week);
    expect(seen.url).toBe('/api/fitbit/week/2026-10-10');
  });

  it('getFitbitWorkout asks for the workout by date and logId', async () => {
    let seen;
    const workout = { logId: 745, type: 'Run', points: [], hasRoute: false };
    insightsApi.defaults.adapter = (config) => {
      seen = config;
      return respondWith(200, { workout })(config);
    };
    expect(await getFitbitWorkout('2026-10-11', 745)).toEqual(workout);
    expect(seen.url).toBe('/api/fitbit/workout/2026-10-11/745');
  });

  it('getFitbitMonthWorkouts asks for the month and returns its workouts', async () => {
    let seen;
    const workouts = [{ date: '2026-10-11', logId: 745, type: 'Run' }];
    insightsApi.defaults.adapter = (config) => {
      seen = config;
      return respondWith(200, { month: '2026-10', workouts })(config);
    };
    expect(await getFitbitMonthWorkouts('2026-10')).toEqual(workouts);
    expect(seen.url).toBe('/api/fitbit/workouts/2026-10');
  });

  it('getFitbitAuthUrl sends returnTo and returns the url', async () => {
    let seen;
    insightsApi.defaults.adapter = (config) => {
      seen = config;
      return respondWith(200, {
        url: 'https://www.fitbit.com/oauth2/authorize?x=1',
      })(config);
    };
    const url = await getFitbitAuthUrl('exp://127.0.0.1:8081/--/fitbit');
    expect(url).toBe('https://www.fitbit.com/oauth2/authorize?x=1');
    expect(seen.params).toEqual({ returnTo: 'exp://127.0.0.1:8081/--/fitbit' });
  });
});

describe('generateInsight', () => {
  const PROFILE = { gender: 'male', age: 22, height: 70, weight: 165, sports: 'running' };
  const INSIGHT = { headline: 'Solid day', keySignals: ['a'], focus: ['b'] };

  beforeEach(() => {
    fitbitTokens.getFitbitTokens.mockResolvedValue({
      accessToken: 'access-1',
      refreshToken: 'refresh-1',
    });
  });

  it('posts the date and profile and returns the body', async () => {
    let seen;
    const body = {
      insight: INSIGHT,
      usage: { model: 'm', inputTokens: 1, outputTokens: 2 },
    };
    insightsApi.defaults.adapter = (config) => {
      seen = config;
      return respondWith(200, body)(config);
    };
    expect(await generateInsight('2026-10-11', PROFILE)).toEqual(body);
    expect(seen.method).toBe('post');
    expect(seen.url).toBe('/api/insights/generate');
    expect(JSON.parse(seen.data)).toEqual({ date: '2026-10-11', profile: PROFILE });
    expect(seen.headers['X-Fitbit-Token']).toBe('access-1');
  });

  it('returns the NO_DATA answer as is', async () => {
    insightsApi.defaults.adapter = respondWith(200, { insight: null, reason: 'NO_DATA' });
    expect(await generateInsight('2026-10-11', PROFILE)).toEqual({
      insight: null,
      reason: 'NO_DATA',
    });
  });

  it('saves refreshed tokens when Claude fails with a 502', async () => {
    insightsApi.defaults.adapter = respondWith(502, {
      error: 'COACH_API_ERROR',
      refreshedTokens: REFRESHED,
    });
    let caught;
    try {
      await generateInsight('2026-10-11', PROFILE);
    } catch (e) {
      caught = e;
    }
    expect(getErrorCode(caught)).toBe('COACH_API_ERROR');
    expect(fitbitTokens.setFitbitTokens).toHaveBeenCalledWith(REFRESHED);
  });
});

const PHONE_DAY = {
  date: '2026-11-14',
  steps: 9483,
  sleep: {
    totalMinutes: 401,
    efficiency: 91,
    deep: 62,
    bedTime: '2026-11-13T23:41:10.000',
    wakeTime: '2026-11-14T07:00:30.000',
    levels: [{ dateTime: '2026-11-13T23:41:10.000', level: 'light', seconds: 600 }],
  },
  heart: {
    restingHeartRate: 58,
    previousRestingHeartRate: 60,
    zones: { fatBurn: 41, cardio: 12, peak: 0 },
    hr5min: [61, 60, null],
  },
  vo2Max: { low: 47.2, high: 47.2 },
  workouts: [
    {
      logId: 'abc-123',
      type: 'Walk',
      startTime: '2026-11-14T17:05:00.000',
      durationMin: 36,
      avgHeartRate: 122,
      calories: 358,
      steps: null,
      hasGps: false,
      zones: { fatBurn: 11, cardio: 0, peak: 0 },
      distanceKm: 1.9,
      paceMinPerKm: 18.2,
    },
  ],
};

describe('dayForCoach', () => {
  it('leaves the timeline, heart rate slots, VO2 max and ids on the phone', () => {
    expect(dayForCoach(PHONE_DAY)).toEqual({
      date: '2026-11-14',
      steps: 9483,
      sleep: {
        totalMinutes: 401,
        efficiency: 91,
        deep: 62,
        bedTime: '2026-11-13T23:41:10.000',
        wakeTime: '2026-11-14T07:00:30.000',
      },
      heart: {
        restingHeartRate: 58,
        previousRestingHeartRate: 60,
        zones: { fatBurn: 41, cardio: 12, peak: 0 },
      },
      workouts: [
        {
          type: 'Walk',
          startTime: '2026-11-14T17:05:00.000',
          durationMin: 36,
          avgHeartRate: 122,
          zones: { fatBurn: 11, cardio: 0, peak: 0 },
          distanceKm: 1.9,
          paceMinPerKm: 18.2,
        },
      ],
    });
  });

  it('keeps a day with no sleep as null', () => {
    const day = dayForCoach({ date: '2026-11-14', sleep: null, workouts: [] });
    expect(day).toEqual({
      date: '2026-11-14',
      steps: null,
      sleep: null,
      heart: {},
      workouts: [],
    });
  });
});

describe('generateInsightFromDay', () => {
  const PROFILE = { gender: 'male', age: 22, height: 70, weight: 165, sports: 'running' };
  const INSIGHT = { headline: 'Solid day', keySignals: ['a'], focus: ['b'] };

  beforeEach(() => {
    fitbitTokens.getFitbitTokens.mockResolvedValue(null);
  });

  it('posts the date, profile, trimmed day and source, and returns the body', async () => {
    let seen;
    const body = {
      insight: INSIGHT,
      usage: { model: 'm', inputTokens: 1, outputTokens: 2 },
    };
    insightsApi.defaults.adapter = (config) => {
      seen = config;
      return respondWith(200, body)(config);
    };
    expect(await generateInsightFromDay('2026-11-14', PROFILE, PHONE_DAY)).toEqual(
      body
    );
    expect(seen.method).toBe('post');
    expect(seen.url).toBe('/api/insights/generate-from-day');
    expect(JSON.parse(seen.data)).toEqual({
      date: '2026-11-14',
      profile: PROFILE,
      day: dayForCoach(PHONE_DAY),
      source: 'health_connect',
    });
    expect(seen.headers.Authorization).toBe('Bearer id-token-1');
    expect(seen.headers['X-Fitbit-Token']).toBeUndefined();
  });

  it('returns the NO_DATA answer as is', async () => {
    insightsApi.defaults.adapter = respondWith(200, { insight: null, reason: 'NO_DATA' });
    expect(await generateInsightFromDay('2026-11-14', PROFILE, PHONE_DAY)).toEqual({
      insight: null,
      reason: 'NO_DATA',
    });
  });

  it('gives the service error code when the day is rejected', async () => {
    insightsApi.defaults.adapter = respondWith(400, { error: 'INVALID_DAY' });
    let caught;
    try {
      await generateInsightFromDay('2026-11-14', PROFILE, PHONE_DAY);
    } catch (e) {
      caught = e;
    }
    expect(getErrorCode(caught)).toBe('INVALID_DAY');
  });
});

describe('getErrorCode', () => {
  it('prefers the service error code, then the message', () => {
    expect(getErrorCode({ response: { data: { error: 'X' } } })).toBe('X');
    expect(getErrorCode(new Error('Network Error'))).toBe('Network Error');
    expect(getErrorCode(null)).toBe('UNKNOWN_ERROR');
  });

  it('treats a tunnel answer with no error code as an unreachable service', () => {
    const gateway = (status) => ({
      message: `Request failed with status code ${status}`,
      response: { status, data: '<html>Bad Gateway</html>' },
    });
    expect(getErrorCode(gateway(502))).toBe('Network Error');
    expect(getErrorCode(gateway(503))).toBe('Network Error');
    expect(getErrorCode(gateway(504))).toBe('Network Error');
    expect(
      getErrorCode({ response: { status: 502, data: { error: 'COACH_API_ERROR' } } })
    ).toBe('COACH_API_ERROR');
    expect(getErrorCode(gateway(500))).toBe('Request failed with status code 500');
  });
});
