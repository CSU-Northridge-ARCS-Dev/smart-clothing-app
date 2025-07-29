/**
 * @file notifications.unit.test.js
 */

jest.mock('expo-constants', () => ({
  expoConfig: { extra: { eas: { projectId: 'test-proj-123' } } },
  isDevice: true,
}), { virtual: true });

import { Platform } from 'react-native';
const originalOS = Platform.OS;
const setOS = os => Object.defineProperty(Platform, 'OS', { configurable: true, get: () => os });

afterEach(() => {
  Object.defineProperty(Platform, 'OS', { configurable: true, get: () => originalOS });
  jest.resetModules();     // clean import cache between tests
  jest.clearAllMocks();
});

/** helper to load util with a fresh, per-test mock of expo-notifications */
function loadWithExpoNotificationsMock(factory) {
  jest.doMock('expo-notifications', factory, { virtual: true });
  const Notifications = require('expo-notifications');
  const { registerForPushNotificationsAsync, sendNotification } =
    require('../../../src/utils/notifications');
  return { Notifications, registerForPushNotificationsAsync, sendNotification };
}

describe('registerForPushNotificationsAsync', () => {
  it('returns token and sets Android channel when permission already granted', async () => {
    setOS('android');

    const { Notifications, registerForPushNotificationsAsync } =
      loadWithExpoNotificationsMock(() => ({
        getPermissionsAsync: jest.fn().mockResolvedValue({ status: 'granted' }),
        requestPermissionsAsync: jest.fn(),
        getExpoPushTokenAsync: jest.fn().mockResolvedValue({ data: 'ExponentPushToken[abc123]' }),
        scheduleNotificationAsync: jest.fn(),
        setNotificationChannelAsync: jest.fn(),
        AndroidImportance: { MAX: 'MAX' },
      }));

    const token = await registerForPushNotificationsAsync();

    expect(Notifications.getPermissionsAsync).toHaveBeenCalledTimes(1);
    expect(Notifications.requestPermissionsAsync).not.toHaveBeenCalled();
    expect(Notifications.getExpoPushTokenAsync).toHaveBeenCalledWith(
      expect.objectContaining({ projectId: expect.any(String) })
    );
    expect(token).toBe('ExponentPushToken[abc123]');
    expect(Notifications.setNotificationChannelAsync).toHaveBeenCalledWith('default', expect.any(Object));
  });

  it('requests permission then returns token (iOS) and does not set Android channel', async () => {
    setOS('ios');

    const { Notifications, registerForPushNotificationsAsync } =
      loadWithExpoNotificationsMock(() => ({
        getPermissionsAsync: jest.fn().mockResolvedValue({ status: 'undetermined' }),
        requestPermissionsAsync: jest.fn().mockResolvedValue({ status: 'granted' }),
        getExpoPushTokenAsync: jest.fn().mockResolvedValue({ data: 'ExponentPushToken[xyz987]' }),
        scheduleNotificationAsync: jest.fn(),
        setNotificationChannelAsync: jest.fn(),
        AndroidImportance: { MAX: 'MAX' },
      }));

    const token = await registerForPushNotificationsAsync();

    expect(Notifications.getPermissionsAsync).toHaveBeenCalled();
    expect(Notifications.requestPermissionsAsync).toHaveBeenCalled();
    expect(Notifications.getExpoPushTokenAsync).toHaveBeenCalledWith(
      expect.objectContaining({ projectId: expect.any(String) })
    );
    expect(token).toBe('ExponentPushToken[xyz987]');
    expect(Notifications.setNotificationChannelAsync).not.toHaveBeenCalled();
  });

  it('returns undefined and does not fetch token when permission denied', async () => {
    setOS('android');

    const { Notifications, registerForPushNotificationsAsync } =
      loadWithExpoNotificationsMock(() => ({
        getPermissionsAsync: jest.fn().mockResolvedValue({ status: 'denied' }),
        requestPermissionsAsync: jest.fn().mockResolvedValue({ status: 'denied' }),
        getExpoPushTokenAsync: jest.fn(),
        scheduleNotificationAsync: jest.fn(),
        setNotificationChannelAsync: jest.fn(),
        AndroidImportance: { MAX: 'MAX' },
      }));

    const token = await registerForPushNotificationsAsync();

    expect(token).toBeUndefined();
    expect(Notifications.getExpoPushTokenAsync).not.toHaveBeenCalled();
    expect(Notifications.setNotificationChannelAsync).not.toHaveBeenCalled();
  });

  it('propagates error if getExpoPushTokenAsync throws', async () => {
    setOS('android');

    const { Notifications, registerForPushNotificationsAsync } =
      loadWithExpoNotificationsMock(() => ({
        getPermissionsAsync: jest.fn().mockResolvedValue({ status: 'granted' }),
        requestPermissionsAsync: jest.fn(),
        getExpoPushTokenAsync: jest.fn().mockRejectedValue(new Error('Token failure')),
        scheduleNotificationAsync: jest.fn(),
        setNotificationChannelAsync: jest.fn(),
        AndroidImportance: { MAX: 'MAX' },
      }));

    await expect(registerForPushNotificationsAsync()).rejects.toThrow('Token failure');
    expect(Notifications.getExpoPushTokenAsync).toHaveBeenCalledWith(
      expect.objectContaining({ projectId: expect.any(String) })
    );
    expect(Notifications.setNotificationChannelAsync).not.toHaveBeenCalled();
  });
});

describe('sendNotification', () => {
  it('schedules a local notification with title, body, and 1s trigger', async () => {
    const { Notifications, sendNotification } =
      loadWithExpoNotificationsMock(() => ({
        getPermissionsAsync: jest.fn(),
        requestPermissionsAsync: jest.fn(),
        getExpoPushTokenAsync: jest.fn(),
        scheduleNotificationAsync: jest.fn(),
        setNotificationChannelAsync: jest.fn(),
        AndroidImportance: { MAX: 'MAX' },
      }));

    await sendNotification('Hello', 'World');
    expect(Notifications.scheduleNotificationAsync).toHaveBeenCalledWith({
      content: { title: 'Hello', body: 'World' },
      trigger: { seconds: 1 },
    });
  });
});
