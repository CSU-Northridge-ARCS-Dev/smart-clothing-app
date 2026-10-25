/**
 * @file aiFeedbackStorage.unit.test.js
 * The AI feedback cache and consent helpers in localStorage.js.
 */
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  getCachedFeedback,
  setCachedFeedback,
  getAIConsent,
  setAIConsent,
} from '../../../src/utils/localStorage.js';

jest.mock('@react-native-async-storage/async-storage', () => ({
  setItem: jest.fn(),
  getItem: jest.fn(),
}));

const INSIGHT = { headline: 'Solid day', keySignals: ['a'], focus: ['b'] };

beforeEach(() => {
  jest.clearAllMocks();
  jest.spyOn(console, 'error').mockImplementation(() => {});
});

describe('feedback cache', () => {
  it('stores the insight under the date', async () => {
    await setCachedFeedback('2026-10-11', INSIGHT);
    expect(AsyncStorage.setItem).toHaveBeenCalledWith(
      'aiFeedback:2026-10-11',
      JSON.stringify(INSIGHT)
    );
  });

  it('reads the insight back for the date', async () => {
    AsyncStorage.getItem.mockResolvedValue(JSON.stringify(INSIGHT));
    expect(await getCachedFeedback('2026-10-11')).toEqual(INSIGHT);
    expect(AsyncStorage.getItem).toHaveBeenCalledWith('aiFeedback:2026-10-11');
  });

  it('returns null when nothing is cached', async () => {
    AsyncStorage.getItem.mockResolvedValue(null);
    expect(await getCachedFeedback('2026-10-11')).toBeNull();
  });

  it('returns null when the read fails', async () => {
    AsyncStorage.getItem.mockRejectedValue(new Error('boom'));
    expect(await getCachedFeedback('2026-10-11')).toBeNull();
  });
});

describe('AI consent', () => {
  it('is false until the user agrees', async () => {
    AsyncStorage.getItem.mockResolvedValue(null);
    expect(await getAIConsent()).toBe(false);
  });

  it('is true once stored', async () => {
    AsyncStorage.getItem.mockResolvedValue('true');
    expect(await getAIConsent()).toBe(true);
    expect(AsyncStorage.getItem).toHaveBeenCalledWith('aiConsent');
  });

  it('stores the answer as a string', async () => {
    await setAIConsent(true);
    expect(AsyncStorage.setItem).toHaveBeenCalledWith('aiConsent', 'true');
    await setAIConsent(false);
    expect(AsyncStorage.setItem).toHaveBeenCalledWith('aiConsent', 'false');
  });

  it('is false when the read fails', async () => {
    AsyncStorage.getItem.mockRejectedValue(new Error('boom'));
    expect(await getAIConsent()).toBe(false);
  });
});
