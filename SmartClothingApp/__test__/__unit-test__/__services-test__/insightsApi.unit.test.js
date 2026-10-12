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
let getFitbitAuthUrl;
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
  ({ addAuthHeaders, getErrorCode, getFitbitDay, getFitbitAuthUrl } = api);
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

describe('getErrorCode', () => {
  it('prefers the service error code, then the message', () => {
    expect(getErrorCode({ response: { data: { error: 'X' } } })).toBe('X');
    expect(getErrorCode(new Error('Network Error'))).toBe('Network Error');
    expect(getErrorCode(null)).toBe('UNKNOWN_ERROR');
  });
});
