import { AppRegistry } from 'react-native';
import App from './App';
import { registerRootComponent } from 'expo';
import { name as appName } from './app.json';
import * as Notifications from 'expo-notifications';

// Set the notification handler at the top of the entry file
// Notifications.setNotificationHandler({
//   handleNotification: async () => ({
//     shouldShowAlert: true,
//     shouldPlaySound: true,
//     shouldSetBadge: false,
//   }),
// });

//AppRegistry.registerComponent(appName, () => App);
registerRootComponent(App);
