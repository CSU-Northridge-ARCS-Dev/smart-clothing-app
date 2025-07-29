/**
 * @file notifications.unit.test.js
 */

// ---- global mocks (must come BEFORE the util is imported) ----

jest.mock('@env', () => ({ EXPO_PROJECT_ID: 'test-project-id' }), { virtual: true });

jest.mock('expo-constants', () => ({
  expoConfig: { extra: { eas: { projectId: 'test-proj-123' } } },
  isDevice: true,
}), { virtual: true });

// ✅ Real mock, not empty
jest.mock('expo-notifications', () => ({
  getPermissionsAsync: jest.fn(),
  requestPermissionsAsync: jest.fn(),
  getExpoPushTokenAsync: jest.fn(),
  scheduleNotificationAsync: jest.fn(),
  setNotificationChannelAsync: jest.fn(),
  AndroidImportance: { MAX: 'MAX' },
}), { virtual: true });

import { Platform } from 'react-native';

let Notifications; // <-- acquire AFTER reset
let registerForPushNotificationsAsync;
let sendNotification;

beforeEach(() => {
  jest.resetModules();
  jest.isolateModules(() => {
    // same instance the util will import
    Notifications = require('expo-notifications');
    ({ registerForPushNotificationsAsync, sendNotification } =
      require('../../../src/utils/notifications'));
  });
});


describe('../../../src/utils/notifications', () => {
  const originalOS = Platform.OS;

  const setPlatformOS = (os) => {
    Object.defineProperty(Platform, 'OS', {
      configurable: true,
      get: () => os,
    });
  };

  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, 'log').mockImplementation(() => {}); // silence logs
  });

  afterEach(() => {
    Object.defineProperty(Platform, 'OS', {
      configurable: true,
      get: () => originalOS,
    });
    console.log.mockRestore();
  });

  describe('registerForPushNotificationsAsync', () => {
    it('returns token and sets Android channel when permission already granted', async () => {
      setPlatformOS('android');

      Notifications.getPermissionsAsync.mockResolvedValue({ status: 'granted' });
      Notifications.getExpoPushTokenAsync.mockResolvedValue({
        data: 'ExponentPushToken[abc123]',
      });

      const token = await registerForPushNotificationsAsync();

      expect(Notifications.getPermissionsAsync).toHaveBeenCalledTimes(1);
      expect(Notifications.requestPermissionsAsync).not.toHaveBeenCalled();

      // Do not assert the literal value; allow inlined envs
      expect(Notifications.getExpoPushTokenAsync).toHaveBeenCalledWith(
        expect.objectContaining({ projectId: expect.any(String) })
      );
      expect(token).toBe('ExponentPushToken[abc123]');

      expect(Notifications.setNotificationChannelAsync).toHaveBeenCalledWith('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
      });
    });

    it('requests permission then returns token when granted (iOS) and does not set Android channel', async () => {
      setPlatformOS('ios');

      Notifications.getPermissionsAsync.mockResolvedValue({ status: 'undetermined' });
      Notifications.requestPermissionsAsync.mockResolvedValue({ status: 'granted' });
      Notifications.getExpoPushTokenAsync.mockResolvedValue({
        data: 'ExponentPushToken[xyz987]',
      });

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
      setPlatformOS('android');

      Notifications.getPermissionsAsync.mockResolvedValue({ status: 'denied' });
      Notifications.requestPermissionsAsync.mockResolvedValue({ status: 'denied' });

      const token = await registerForPushNotificationsAsync();

      expect(token).toBeUndefined();
      expect(Notifications.getExpoPushTokenAsync).not.toHaveBeenCalled();
      expect(Notifications.setNotificationChannelAsync).not.toHaveBeenCalled();
    });

    it('propagates error if getExpoPushTokenAsync throws', async () => {
      setPlatformOS('android');

      Notifications.getPermissionsAsync.mockResolvedValue({ status: 'granted' });
      Notifications.getExpoPushTokenAsync.mockRejectedValue(new Error('Token failure'));

      await expect(registerForPushNotificationsAsync()).rejects.toThrow('Token failure');

      expect(Notifications.getExpoPushTokenAsync).toHaveBeenCalledWith(
        expect.objectContaining({ projectId: expect.any(String) })
      );
      expect(Notifications.setNotificationChannelAsync).not.toHaveBeenCalled();
    });
  });

  describe('sendNotification', () => {
    it('schedules a local notification with title, body, and 1s trigger', async () => {
      await sendNotification('Hello', 'World');

      expect(Notifications.scheduleNotificationAsync).toHaveBeenCalledWith({
        content: { title: 'Hello', body: 'World' },
        trigger: { seconds: 1 },
      });
    });
  });
});
