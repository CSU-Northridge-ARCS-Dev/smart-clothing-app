// import React from 'react';
// import { render, fireEvent, waitFor } from '@testing-library/react-native';
// import { NavigationContainer } from '@react-navigation/native';
// import { createStackNavigator } from '@react-navigation/stack';
// import HomeScreen from '../../src/screens/HomeScreen/index.jsx';
// import ProfileScreen from '../../src/screens/Profile/index.jsx';

// const Stack = createStackNavigator();

// describe('Home to Profile Navigation', () => {
//   let store;

//   it('navigates from Home to Profile screen', async () => {
//     const { findByText } = render(
//       <NavigationContainer>
//         <Stack.Navigator initialRouteName="Home">
//           <Stack.Screen name="Home" component={HomeScreen} />
//           <Stack.Screen name="Profile" component={ProfileScreen} />
//         </Stack.Navigator>
//       </NavigationContainer>
//     );

//     // Replace 'Profile' with the actual text or identifier triggering the navigation
//     const profileButton = await findByText('Profile');
//     fireEvent.press(profileButton);

//     // Check if the Profile screen is rendered after navigation
//     await waitFor(() => {
//       expect(findByText('Edit Profile')).toBeTruthy();
//     });
//   });

// });
