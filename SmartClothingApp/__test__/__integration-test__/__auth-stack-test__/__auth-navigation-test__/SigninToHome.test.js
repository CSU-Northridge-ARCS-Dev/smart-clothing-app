jest.useFakeTimers()

import React, {useState} from 'react';
import { render } from '@testing-library/react-native';
import {fireEvent } from '@testing-library/react-native';
import { act } from 'react-test-renderer';
import { getByText, getByProps, waitFor, cleanup } from '@testing-library/react-native';
import {NavigationContainer} from '@react-navigation/native';
import {createStackNavigator} from '@react-navigation/stack'; 
import configureStore from '../../../../src/store.js';
import rootReducer from '../../../../src/store.js'; 
import AppRouter from '../../../../src/navigation/index.js';
import {Provider as StoreProvider } from 'react-redux'; 
import {PaperProvider}  from "react-native-paper";
import { getAllByRole, getByTestId } from '@testing-library/react';
import { getSdkStatus, SdkAvailabilityStatus } from 'react-native-health-connect';


jest.mock('../../../../src/utils/localStorage.js', () => ({
  AsyncStorage: jest.fn(),
}));

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

jest.mock('../../../../src/utils/localStorage.js', () => ({
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
      height: "6541",
      weight: "55",
      age: "666",
      gender: "male",
      sports: "running",
      dob: {
        seconds: 1627852800, // Example timestamp for July 2, 2021
        nanoseconds: 0, // Firestore Timestamps include nanoseconds, but it's often okay to mock them as 0 in tests
      },
    }), // Mock 'data' as a function
  }),
}))

jest.mock('react-native-vector-icons/MaterialIcons', () => require('../../../__mocks__/react-native-vector-icons.js').MaterialIcons);
jest.mock('react-native-vector-icons/FontAwesome5', () => require('../../../__mocks__/react-native-vector-icons.js').FontAwesome5);
jest.mock('@shopify/react-native-skia', () => require('../../../__mocks__/@shopify__react-native-skia.js'));
jest.mock('../../../../src/components/visualizations/ActivityRings/Ring.jsx', () => {
  return jest.fn(({ ring, center, strokeWidth, scale }) => (
    <div>
      Mock Ring Component - {ring.size}, {center.x}, {center.y}, {strokeWidth}, {scale}
    </div>
  ));
});
jest.mock('victory-native', () => {
  // Mock the specific components and functionalities you use
  const MockBar = () => <div>Mock Bar</div>;
  const MockCartesianChart = () => <div>Mock CartesianChart</div>;
  const MockUseChartPressState = () => ({ /* Mock return value */ });

  return {
    Bar: MockBar,
    CartesianChart: MockCartesianChart,
    useChartPressState: MockUseChartPressState,
  };
});
// jest.mock('../../src/actions/appActions', () => ({
//   userMetricsDataModalVisible: jest.fn().mockReturnValue({
//     type: 'USER_METRICS_DATA_MODAL_VISIBLE',
//     payload: {
//       visibility: false,
//       isFromSignUpScreen: false,
//   }}),
// }));

// Mocks ViewSleepData 
jest.mock('d3', () => ({
  scaleLinear: jest.fn().mockReturnValue({
    domain: jest.fn().mockReturnThis(),
    range: jest.fn().mockReturnThis(),
    ticks: jest.fn().mockReturnValue([0, 50, 100, 150, 200]),
  }),
  tickStep: jest.fn().mockReturnValue(50),
  ticks: jest.fn().mockReturnValue([0, 50, 100, 150, 200]),
}));

// Mock the react-native-health-connect module
jest.mock('react-native-health-connect', () => ({
  getSdkStatus: jest.fn(),
  SdkAvailabilityStatus: {
    SDK_AVAILABLE: 1,
    SDK_UNAVAILABLE: 2,
    SDK_UNAVAILABLE_PROVIDER_UPDATE_REQUIRED: 3,
  },
}));





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
  beforeEach(() => {
    // Prevents 'wrap act()' console log warning 
    jest.spyOn(console, 'error').mockImplementation((message) => {
      if (message.includes('Warning: An update to')) {
        return;
      }
      console.error(message);
    });

    jest.useFakeTimers();
  });

 // Clean up after each test by resetting the alert spy
 afterEach(() => {
    jest.clearAllTimers();
    jest.clearAllMocks();
    cleanup();
  });


  it('should navigate from Sign-In to Dashboard', async () => {

    // Configure Redux Store with Combined Reducer
    // const store = configureStore(rootReducer, {
    //   user: {
    //     "uuid": null
    //   },
    // });
    const store = configureStore();

    // Wrap TestComponent with Providers and render
    const { getAllByTestId, getByText, getAllByRole } = render(
      <StoreProvider store={store}>
        <PaperProvider >
          <TestComponent />
        </PaperProvider>
      </StoreProvider>
    );

    // Find Inputs and Buttons 
    const inputFields = getAllByTestId('text-input-outline');
    const buttons = getAllByRole('button');

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