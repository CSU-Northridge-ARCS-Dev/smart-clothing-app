// import { AppRegistry } from 'react-native';
// import App from './App';
// import { name as appName } from './app.json';

// // Set the notification handler at the top of the entry file
// // Notifications.setNotificationHandler({
// //   handleNotification: async () => ({
// //     shouldShowAlert: true,
// //     shouldPlaySound: true,
// //     shouldSetBadge: false,
// //   }),
// // });

// AppRegistry.registerComponent(appName, () => App);









import { registerRootComponent } from 'expo';

import App from './App';

// registerRootComponent calls AppRegistry.registerComponent('main', () => App);
// It also ensures that whether you load the app in Expo Go or in a native build,
// the environment is set up appropriately
registerRootComponent(App);