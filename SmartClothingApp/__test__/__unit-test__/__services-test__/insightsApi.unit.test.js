/**
 * @file insightsApi.unit.test.js
 * The insights-service client : auth headers, the day sent for feedback
 * and the error codes.
 */

jest.mock('../../../firebaseConfig.js', () => ({
  auth: {
    currentUser: { getIdToken: jest.fn(() => Promise.resolve('id-token-1')) },
  },
}));

let insightsApi;
let addAuthHeaders;
let getErrorCode;
let generateInsightFromDay;
let dayForCoach;

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
  const api = require('../../../src/services/insightsApi');
  insightsApi = api.default;
  ({
    addAuthHeaders,
    getErrorCode,
    generateInsightFromDay,
    dayForCoach,
  } = api);
  jest.clearAllMocks();
});

describe('addAuthHeaders', () => {
  it('adds the ID token and the tunnel header, and nothing else', async () => {
    const config = await addAuthHeaders({ headers: {} });
    expect(config.headers).toEqual({
      Authorization: 'Bearer id-token-1',
      'ngrok-skip-browser-warning': 'true',
    });
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
