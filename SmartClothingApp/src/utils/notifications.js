import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { EXPO_PROJECT_ID } from '@env'; // Ensure this line is correct and .env file has EXPO_PROJECT_ID
import { Alert, Platform } from 'react-native';
import Constants from 'expo-constants';

// Notifications.setNotificationHandler({
//   handleNotification: async () => ({
//     shouldShowAlert: true,   // ← show banner / alert
//     shouldShowBanner: true,
//     shouldPlaySound: true,
//     shouldSetBadge: false,
//   }),
// });

//  DELETE if implemented to Server-side
// export const sendNotification = async (title, body) => {
//   await Notifications.scheduleNotificationAsync({
//     content: {
//       title: title,
//       body: body,
//     },
//     trigger: null,
//   });
// };

export const sendNotification = async (title, body) => {
  console.log("sendNotification called with: ", body);
  await Notifications.scheduleNotificationAsync({
    content: { title, body },
    trigger: { seconds: 1 },   // 1‑second delay
  });
};


export const registerForPushNotificationsAsync = async () => {
  let token;
  // if (Device.isDevice) {
  //   const { status: existingStatus } = await Notifications.getPermissionsAsync();
  //   let finalStatus = existingStatus;
  //   if (existingStatus !== 'granted') {
  //     const { status } = await Notifications.requestPermissionsAsync();
  //     finalStatus = status;
  //     console.log('requestPermission for Notification: ' + status);
  //   }
  //   if (finalStatus !== 'granted') {
  //     console.log('Failed to get push token for push notification!');
  //     return;
  //   }
  //   console.log('EXPO_PROJECT_ID:', EXPO_PROJECT_ID); 

  //   token = (await Notifications.getExpoPushTokenAsync({ projectId: EXPO_PROJECT_ID })).data;
  //   console.log(token);
  //   console.log('Expo Push Token:', token);
  // } else {
  //   console.log('Must use physical device for Push Notifications');
  // }

    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
      console.log('requestPermission for Notification: ' + status);
    }
    if (finalStatus !== 'granted') {
      console.log('Failed to get push token for push notification!');
      return;
    }


    // const projectId = 
    //   Constants?.expoConfig?.extra?.eas?.projectId ?? Constants?.easConfig?.projectId;
    // if (!projectId) {
    //   //handleRegistrationError('Project ID not found');
    //   console.log('Project ID not found');
    // }
    // try {
    //   const pushTokenString = (
    //     await Notifications.getExpoPushTokenAsync({
    //       projectId,
    //     })
    //   ).data;
    //   console.log(pushTokenString);
    //   token = pushTokenString;
    //   return pushTokenString;
    // } catch (e) {
    //   //handleRegistrationError(`${e}`);
    //   console.log(e);
    // }
    
    console.log('EXPO_PROJECT_ID:', EXPO_PROJECT_ID); 

    token = (await Notifications.getExpoPushTokenAsync({ projectId: EXPO_PROJECT_ID })).data;
    console.log(token);
    console.log('Expo Push Token:', token);



  if (Platform.OS === 'android') {
    Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
    });
  }

  return token;
};
