jest.useFakeTimers()

import React, {useState} from 'react';
import { render } from '@testing-library/react-native';
import {fireEvent } from '@testing-library/react-native';
import { act } from 'react-test-renderer';
import { getByText, getByProps, waitFor } from '@testing-library/react-native';
import {NavigationContainer} from '@react-navigation/native';
import {createStackNavigator} from '@react-navigation/stack'; 
import configureStore from '../../src/store.js';
import rootReducer from '../../src/store.js'; 
import AppRouter from '../../src/navigation/index.js';
import {Provider as StoreProvider } from 'react-redux'; 
import {PaperProvider}  from "react-native-paper";




jest.mock('../../src/utils/localStorage.js', () => ({
  AsyncStorage: jest.fn(),
}));

// Mock Firebase Authentication
jest.mock('../../firebaseConfig.js', () => ({
  auth: {
    loginWithEmail: jest.fn(() => Promise.resolve()),
    startLoginWithEmail: jest.fn(() => Promise.resolve()),
    startLoadUserData: jest.fn(() => Promise.resolve()),
    startUpdateUserData: jest.fn(() => Promise.resolve()),
    updateUserMetricsData: jest.fn(() => Promise.resolve()),
    currentUser: {
      uid: {
        "email": "test1@gmail.com", 
        "firstName": "MisterTest",
        "lastName": "Johnson", 
        "uuid": "nvQpwMHj7eUKfsyEhVloGM7hvji2"
        //uuid: null
      },
      email: 'test1@gmail.com',
      password: 'password123'
    },
  },
}));

jest.mock('firebase/auth', () => ({
  initializeApp: jest.fn(),
  registerVersion: jest.fn(),
  getAuth: jest.fn(),
  getDatabase: jest.fn(),
  signInWithEmailAndPassword: jest.fn(() => Promise.resolve({ 
    user: {
          //uid: null,
          uid: 'nvQpwMHj7eUKfsyEhVloGM7hvji2',
          email: 'test1@gmail.com',
          password: 'password123'
        } 
      })),
}))

jest.mock('../../src/utils/localStorage.js', () => ({
  storeUID: jest.fn(),
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



// Create a StackNavigator with your Sign-In and Dashboard screens
const Stack = createStackNavigator();

// Create Test Component - Mimics App.js - no navigation, instead uses AuthStack to go between sign-in page and home-screen
function TestComponent() {
  return (
    <NavigationContainer>
      <AppRouter />
    </NavigationContainer>
  );
}


describe('SignUpToHome Integration Test', () => {
  it('should navigate from Sign-In to Dashboard', async () => {

    // Configure Redux Store with Combined Reducer
    const store = configureStore(rootReducer, {
      user: {
        "uuid": null
      },
    });

    // Wrap TestComponent with Providers and render
    const { getAllByTestId, getByText } = render(
      <StoreProvider store={store}>
        <PaperProvider >
          <TestComponent />
        </PaperProvider>
      </StoreProvider>
    );

    // Find Inputs and Buttons 
    const inputFields = getAllByTestId('text-input-outlined');
    const buttons = getAllByTestId('button');

    const emailInput =  inputFields[0];
    const passwordInput =  inputFields[1];
    const signInButton =  buttons[1];

    // Enter credentials and press Sign In Button
    await act(() => {
      fireEvent.changeText(emailInput, 'test1@gmail.com');
    });
    await act(() => {
      fireEvent.changeText(passwordInput, 'password123');
    });
    await act(() => {
      fireEvent.press(signInButton);
    });

    // Navigates to Dashboard after successful login
    await waitFor(() => {
      expect(getByText('Dashboard')).toBeTruthy();
    });
  });
});