import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { EXPO_PROJECT_ID } from '@env'; // Ensure this line is correct and .env file has EXPO_CLIENT_ID
import { Alert, Platform } from 'react-native';


//  DELETE if implemented to Server-side
export const sendNotification = async (title, body) => {
  await Notifications.scheduleNotificationAsync({
    content: {
      title: title,
      body: body,
    },
    trigger: null,
  });
};

export const registerForPushNotificationsAsync = async () => {
  let token;
  if (Device.isDevice) {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    if (finalStatus !== 'granted') {
      console.log('Failed to get push token for push notification!');
      return;
    }
    token = (await Notifications.getExpoPushTokenAsync({ projectId: EXPO_PROJECT_ID })).data;
    console.log(token);
    console.log('Expo Push Token:', token);
  } else {
    console.log('Must use physical device for Push Notifications');
  }

  if (Platform.OS === 'android') {
    Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
    });
  } else if (Platform.OS === 'ios') {
    // iOS-specific code
    const iosSettings = {
      allowAlert: true,
      allowBadge: true,
      allowSound: true,
      allowAnnouncements: true, // Enable critical alerts
    };
    
    await Notifications.setNotificationSettingsAsync(iosSettings);
    console.log('iOS-specific notification settings applied');
  }

  return token;
};
