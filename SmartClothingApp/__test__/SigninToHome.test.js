jest.useFakeTimers()

import React from 'react';
//import { auth } from '../../firebaseConfig.js';
import { auth } from '../firebaseConfig.js';
import { render, fireEvent } from '@testing-library/react-native';
import { act } from 'react-test-renderer';
import { Provider } from 'react-redux'; 
import { getByText, getByProps, waitFor } from '@testing-library/react-native';
import { NavigationContainer } from '@react-navigation/native'; // Import NavigationContainer
import { createStackNavigator } from '@react-navigation/stack'; // Import StackNavigator
import SigninScreen from '../src/screens/SigninScreen/index.jsx'; // Import the component to be tested
import HomeScreen from '../src/screens/HomeScreen/index.jsx';
import { startLoginWithEmail } from '../src/actions/userActions.js'; 
import configureStore from '../src/store.js';

import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';

const middlewares = [thunk];
const mockStore = configureMockStore(middlewares);

// Mock Firebase Authentication
jest.mock('../firebaseConfig.js', () => ({
  auth: {
    loginWithEmail: jest.fn(() => Promise.resolve()),
    startLoginWithEmail: jest.fn(() => Promise.resolve()),
    startLoadUserData: jest.fn(() => Promise.resolve()),
    startUpdateUserData: jest.fn(() => Promise.resolve()),
    updateUserMetricsData: jest.fn(() => Promise.resolve()),
    currentUser: {
      uid: null,
      email: 'test1@gmail.com',
      password: 'password123'
    },
  },
  //database:
}));

jest.mock('firebase/auth', () => ({
  initializeApp: jest.fn(),
  registerVersion: jest.fn(),
  getAuth: jest.fn(),
  getDatabase: jest.fn(),
  signInWithEmailAndPassword: jest.fn(() => Promise.resolve({ 
    user: {
          uid: null,
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



// Create a StackNavigator with your Sign-In and Dashboard screens
const Stack = createStackNavigator();

// A test component that includes navigation
const TestComponent = () => (
  <NavigationContainer>
    <Stack.Navigator initialRouteName="SignIn">
      <Stack.Screen name="SignIn" component={SigninScreen} />
      <Stack.Screen name="Dashboard" component={HomeScreen} />
    </Stack.Navigator>
  </NavigationContainer>
);


describe('MyComponent Integration Test', () => {
  it('should navigate from Sign-In to Dashboard', async () => {

    const store = mockStore({});

    const { getAllByTestId, getByText } = render(
      <Provider store={store}> {/* Wrap your component with the Redux Provider */}
        <TestComponent />
      </Provider>
    );

    // Interaction code specific to the Sign-In screen
    // const emailInput =  getByTestId('text-input-outlined', { index: 0 });
    // const passwordInput =  getByTestId('text-input-outlined', { index: 1 });
    // const signInButton =  getByTestId('button', { index: 1 });

    const inputFields = getAllByTestId('text-input-outlined');
    const buttons = getAllByTestId('button');

    const emailInput =  inputFields[0];
    const passwordInput =  inputFields[1];
    const signInButton =  buttons[1];

    // Simulate user input for email and password
    // await waitFor(() => {
    //   emailInput.props.onChangeText('valid-email@gmail.com'); 
    //   passwordInput.props.onChangeText('password123');
    // });

    fireEvent.changeText(emailInput, 'test1@gmail.com');
    fireEvent.changeText(passwordInput, 'password123');

    await act(() => {
      fireEvent.press(signInButton);
    });

    //expect(getByText('Dashboard')).toBeTruthy();
    await waitFor(() => {
      expect(getByText('Dashboard')).toBeTruthy();
    });
  });
});
