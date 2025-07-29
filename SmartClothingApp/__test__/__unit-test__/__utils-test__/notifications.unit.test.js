/**
 * @file notifications.unit.test.js
 */

// Mock BEFORE imports that reach the SUT
jest.mock('expo-constants', () => ({
  expoConfig: { extra: { eas: { projectId: 'test-proj-123' } } },
  isDevice: true,
}));

// This pulls from __mocks__/expo-notifications.js
jest.mock('expo-notifications');

import { Platform } from 'react-native';
const originalOS = Platform.OS;
const setOS = os =>
  Object.defineProperty(Platform, 'OS', { configurable: true, get: () => os });

let Notifications;
let registerForPushNotificationsAsync;
let sendNotification;

beforeEach(() => {
  // Fresh module graph so SUT + test share the same mock instance
  jest.resetModules();

  // Re-require the mock and the SUT *after* reset
  Notifications = require('expo-notifications');
  ({ registerForPushNotificationsAsync, sendNotification } =
    require('../../../src/utils/notifications'));

  jest.clearAllMocks();
});

afterEach(() => {
  Object.defineProperty(Platform, 'OS', {
    configurable: true,
    get: () => originalOS,
  });
});

describe('registerForPushNotificationsAsync', () => {
//   it('returns token and sets Android channel when permission already granted', async () => {
//     setOS('android');

//     Notifications.getPermissionsAsync.mockResolvedValue({ status: 'granted' });
//     Notifications.getExpoPushTokenAsync.mockResolvedValue({
//       data: 'ExponentPushToken[abc123]',
//     });

//     const token = await registerForPushNotificationsAsync();

//     expect(Notifications.getPermissionsAsync).toHaveBeenCalledTimes(1);
//     expect(Notifications.requestPermissionsAsync).not.toHaveBeenCalled();
//     expect(Notifications.getExpoPushTokenAsync).toHaveBeenCalledWith(
//       expect.objectContaining({ projectId: expect.any(String) })
//     );
//     expect(token).toBe('ExponentPushToken[abc123]');
//     expect(Notifications.setNotificationChannelAsync).toHaveBeenCalledWith(
//       'default',
//       expect.any(Object)
//     );
//   });

//   it('requests permission then returns token (iOS) and does not set Android channel', async () => {
//     setOS('ios');

//     Notifications.getPermissionsAsync.mockResolvedValue({ status: 'undetermined' });
//     Notifications.requestPermissionsAsync.mockResolvedValue({ status: 'granted' });
//     Notifications.getExpoPushTokenAsync.mockResolvedValue({
//       data: 'ExponentPushToken[xyz987]',
//     });

//     const token = await registerForPushNotificationsAsync();

//     expect(Notifications.getPermissionsAsync).toHaveBeenCalled();
//     expect(Notifications.requestPermissionsAsync).toHaveBeenCalled();
//     expect(Notifications.getExpoPushTokenAsync).toHaveBeenCalledWith(
//       expect.objectContaining({ projectId: expect.any(String) })
//     );
//     expect(token).toBe('ExponentPushToken[xyz987]');
//     expect(Notifications.setNotificationChannelAsync).not.toHaveBeenCalled();
//   });

  it('returns undefined and does not fetch token when permission denied', async () => {
    setOS('android');

    Notifications.getPermissionsAsync.mockResolvedValue({ status: 'denied' });
    Notifications.requestPermissionsAsync.mockResolvedValue({ status: 'denied' });

    const token = await registerForPushNotificationsAsync();

    expect(token).toBeUndefined();
    expect(Notifications.getExpoPushTokenAsync).not.toHaveBeenCalled();
    expect(Notifications.setNotificationChannelAsync).not.toHaveBeenCalled();
  });

//   it('propagates error if getExpoPushTokenAsync throws', async () => {
//     setOS('android');

//     Notifications.getPermissionsAsync.mockResolvedValue({ status: 'granted' });
//     Notifications.getExpoPushTokenAsync.mockRejectedValue(new Error('Token failure'));

//     await expect(registerForPushNotificationsAsync()).rejects.toThrow('Token failure');
//     expect(Notifications.getExpoPushTokenAsync).toHaveBeenCalledWith(
//       expect.objectContaining({ projectId: expect.any(String) })
//     );
//     expect(Notifications.setNotificationChannelAsync).not.toHaveBeenCalled();
//   });
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
