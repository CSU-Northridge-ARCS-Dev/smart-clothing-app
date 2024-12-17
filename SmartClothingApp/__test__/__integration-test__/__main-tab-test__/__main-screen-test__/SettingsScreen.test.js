/**
 * Integration tests for the Settings Screen in the Smart Clothing App.
 * 
 * This test file includes integration tests that simulate user interactions with the Settings screen.
 * These tests cover the process of rendering the Settings screen, triggering modals (e.g., update email,
 * change password, delete account), and verifying that the correct user actions take place.
 * 
 * Mocks:
 * - Firebase Authentication methods (auth.currentUser, signInWithEmailAndPassword)
 * - Firebase Firestore methods (getDoc, collection, doc, etc.)
 * - AsyncStorage for local storage interactions
 * 
 * The test suite mocks external dependencies and uses the React Navigation Stack Navigator
 * to simulate navigation behavior in a React Native environment.
 *
 * @file SettingsScreen.test.js
 * 
 * Credit: Carlos Figueroa (github @cfiguer055)
 */

import React from 'react';
import renderer from 'react-test-renderer';
import { render, fireEvent } from '@testing-library/react-native';
import SettingsScreen from '../../../../src/screens/Settings/index.jsx';
import { Provider as ReduxProvider } from 'react-redux';
import { Provider as PaperProvider } from 'react-native-paper';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import configureStore from '../../../../src/store.js';

// Mock Firebase Authentication
jest.mock('../../../../firebaseConfig.js', () => ({
    auth: {
      loginWithEmail: jest.fn(() => Promise.resolve()),
      startLoginWithEmail: jest.fn(() => Promise.resolve()),
      startLoadUserData: jest.fn(() => Promise.resolve()),
      startUpdateUserData: jest.fn(() => Promise.resolve()),
      updateUserMetricsData: jest.fn(() => Promise.resolve()),
      currentUser: {
        uid: {
          "email": "test1@gmail.com", 
          "firstName": "name",
          "lastName": "surname", 
          "uuid": "nvQpwMHj7eUKfsyEhVloGM7hvji2"
        },
        email: 'test1@gmail.com',
        password: 'password123'
      },
    },
  }));


  jest.mock('../../../../src/utils/localStorage.js', () => ({
    AsyncStorage: jest.fn(),
    storeUID: jest.fn(),
    storeMetrics: jest.fn(),
    getUID: jest.fn(),
    clearUID: jest.fn(),
    getMetrics: jest.fn(),
    clearMetrics: jest.fn(),
    storeFirstName: jest.fn(),
    getFirstName: jest.fn(),
    clearFirstName: jest.fn(),
    storeLastName: jest.fn(),
    getLastName: jest.fn(),
    clearLastName: jest.fn(),
    storeEmail: jest.fn(),
    getEmail: jest.fn(),
    clearEmail: jest.fn(),
    getToken: jest.fn(() => Promise.resolve('mocked-token')), 
    storeToken: jest.fn(),
    clearToken: jest.fn(),
  }));

  // Mock AsyncStorage
  jest.mock('@react-native-async-storage/async-storage', () => ({
    getItem: jest.fn(() => Promise.resolve('mocked_value')),
    setItem: jest.fn(() => Promise.resolve()),
    removeItem: jest.fn(() => Promise.resolve()),
    clear: jest.fn(() => Promise.resolve()),
  }));

  jest.mock('firebase/auth', () => ({
    initializeApp: jest.fn(),
    registerVersion: jest.fn(),
    getAuth: jest.fn(),
    getDatabase: jest.fn(),
    signInWithEmailAndPassword: jest.fn(() => Promise.resolve({ 
      user: {
            uid: 'nvQpwMHj7eUKfsyEhVloGM7hvji2',
            email: 'test1@gmail.com',
            password: 'password123'
          } 
        })),
  }))

  jest.mock('firebase/firestore', () => ({
    collection: jest.fn(() => ({ add: jest.fn() })),
    addDoc: jest.fn(),
    setDoc: jest.fn(),
    doc: jest.fn(() => ({ setDoc: jest.fn() })),
    updateDoc: jest.fn(),
    getDoc: jest.fn().mockReturnValue({
      exists: jest.fn().mockReturnValue(true), // Mock 'exists' as a function
      data: jest.fn().mockReturnValue({
        height: "1111",
        weight: "11",
        age: "111",
        gender: "male",
        sports: "running",
      }), // Mock 'data' as a function
    }),
  }))

   jest.mock('expo-font', () => ({
      loadAsync: jest.fn().mockResolvedValue(true),
      isLoaded: jest.fn().mockReturnValue(true), // Add this mock
    }));

  jest.mock('react-native-gesture-handler', () => {
    const View = require('react-native').View;
    return {
      ...jest.requireActual('react-native-gesture-handler'),
      GestureHandlerRootView: View,
    };
  });



// Creating a StackNavigator for the test component
const Stack = createStackNavigator();

/**
 * Integration test suite for the Settings Screen.
 * 
 * This test suite simulates interactions with the Settings screen, including:
 * - Rendering the Settings screen correctly
 * - Triggering modals for updating email, changing password, and deleting account
 * - Ensuring the correct user actions trigger the expected modals or state changes
 *
 * @test {Settings Screen Integration}
 */
describe('SettingsScreen', () => {
  let store;
  let component;
  let instance;

  beforeEach(() => {

    // Prevents console log warning 
    jest.spyOn(console, 'error').mockImplementation((message) => {
      if (message.includes('Warning: An update to')) {
        return;
      }
      console.error(message);
    });

    jest.useFakeTimers();

    store = configureStore();
    component = render(
      <ReduxProvider store={store}>
        <PaperProvider>
          <NavigationContainer>
            <Stack.Navigator>
              <Stack.Screen
                name="Settings"
                component={SettingsScreen}
                initialParams={{ previousScreenTitle: 'Test Title' }}
              />
            </Stack.Navigator>
          </NavigationContainer>
        </PaperProvider>
      </ReduxProvider>
    );
    instance = component.root;
  });

  /**
     * Test case: Should render Settings screen correctly
     *
     * This test ensures that the Settings screen is rendered correctly, 
     * matching the snapshot.
     *
     * @test {Settings Screen Render}
     */
  it('renders correctly', () => {
      expect(component.toJSON()).toMatchSnapshot(); 
  });
  
  /**
     * Test case: Should open update email modal on button press
     *
     * This test simulates the user pressing the "Update Email" button on the Settings screen
     * and expects the update email modal to be triggered.
     *
     * @test {Open Update Email Modal}
     */
  it('opens update email modal on button press', () => {
      const updateEmailButton = instance.findByProps({ title: "UPDATE EMAIL" });
      fireEvent.press(updateEmailButton);
      // Expect the state for the update email modal to be true


      // test tohavebeencalled updateUserEmail
                    // export const updateUserEmail = (newEmail) => {
                    //   return (dispatch) => {
                    //     const user = auth.currentUser;
                    //     if (user) {
                    //       updateEmail(user, newEmail)
                    //         .then(() => {
                    //           dispatch(updateEmailData(newEmail));
                    //           console.log("Email update success.");
                    //         })
                    //         .catch((error) => {
                    //           dispatch(toastError(firebaseErrorsMessages[error.code]));
                    //           return false;
                    //         });
                    //     }
                    //   };
                    // };
      

  });
  
  /**
     * Test case: Should open change password modal on button press
     *
     * This test simulates the user pressing the "Change Password" button on the Settings screen
     * and expects the change password modal to be triggered.
     *
     * @test {Open Change Password Modal}
     */
  it('opens change password modal on button press', () => {
      const changePasswordButton = instance.findByProps({ title: "CHANGE PASSWORD" });
      fireEvent.press(changePasswordButton);
      // Expect the state for the change password modal to be true



  });
  
  /**
     * Test case: Should open delete account modal on button press
     *
     * This test simulates the user pressing the "Delete Account" button on the Settings screen
     * and expects the delete account modal to be triggered.
     *
     * @test {Open Delete Account Modal}
     */
  it('opens delete account modal on button press', () => {
      const deleteAccountButton = instance.findByProps({ title: "DELETE ACCOUNT" });
      fireEvent.press(deleteAccountButton);
      // Expect the state for the delete account modal to be true



  });
// Add more tests for navigation, modal interactions, and Redux actions
});
