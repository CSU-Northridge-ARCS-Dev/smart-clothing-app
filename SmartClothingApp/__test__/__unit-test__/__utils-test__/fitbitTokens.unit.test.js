/**
 * @file fitbitTokens.unit.test.js
 * Fitbit token storage in SecureStore .
 */

// This pulls from __mocks__/expo-secure-store.js
jest.mock('expo-secure-store');

let SecureStore;
let getFitbitTokens;
let setFitbitTokens;
let clearFitbitTokens;

const TOKENS = {
  accessToken: 'access-1',
  refreshToken: 'refresh-1',
  expiresAt: '2026-10-11T20:00:00.000Z',
  fitbitUserId: 'ABC123',
};

beforeEach(() => {
  jest.resetModules();
  SecureStore = require('expo-secure-store');
  SecureStore.__reset();
  ({ getFitbitTokens, setFitbitTokens, clearFitbitTokens } =
    require('../../../src/utils/fitbitTokens'));
  jest.clearAllMocks();
});

describe('fitbitTokens', () => {
  it('returns null when nothing is stored', async () => {
    expect(await getFitbitTokens()).toBeNull();
  });

  it('stores and reads back the token pair under one key', async () => {
    await setFitbitTokens({ ...TOKENS, scope: 'sleep heartrate' });
    expect(SecureStore.setItemAsync).toHaveBeenCalledWith(
      'fitbitTokens',
      expect.any(String)
    );
    // Only the four fields the app needs are kept
    expect(await getFitbitTokens()).toEqual(TOKENS);
  });

  it('clears the tokens', async () => {
    await setFitbitTokens(TOKENS);
    await clearFitbitTokens();
    expect(await getFitbitTokens()).toBeNull();
  });

  it('returns null for an incomplete or corrupt value', async () => {
    await SecureStore.setItemAsync('fitbitTokens', JSON.stringify({ accessToken: 'a' }));
    expect(await getFitbitTokens()).toBeNull();
    await SecureStore.setItemAsync('fitbitTokens', 'not json');
    expect(await getFitbitTokens()).toBeNull();
  });
});
