/**
 * Integration tests for Sign-Up to Dashboard navigation flow in the Smart Clothing App.
 * 
 * This test file includes integration tests that simulate user interactions with the app's
 * sign-up and navigation system. These tests cover the process of signing up from the Sign-Up 
 * screen and navigating to the Dashboard screen. They validate that the navigation stack works 
 * as expected, the correct screens are rendered, and the appropriate user actions trigger navigation.
 * 
 * Mocks:
 * - Firebase Authentication methods (createUserWithEmailAndPassword, auth.currentUser)
 * - Firebase Firestore methods (getDoc, collection, doc, etc.)
 * - AsyncStorage for local storage interactions
 * 
 * The test suite mocks external dependencies and uses the React Navigation Stack Navigator
 * to simulate navigation behavior in a React Native environment.
 *
 * @file SignupToHome.test.js
 * 
 * Credit: Carlos Figueroa (github @cfiguer055)
 *         Harshit _ (github @_)
 */
jest.useFakeTimers()

import React, {useState} from 'react';
import { render } from '@testing-library/react-native';
import {fireEvent } from '@testing-library/react-native';
import { act } from 'react-test-renderer';
import { getByText, getByProps, waitFor } from '@testing-library/react-native';
import {NavigationContainer} from '@react-navigation/native';
import {createStackNavigator} from '@react-navigation/stack'; 
import configureStore from '../../../../src/store.js';
import rootReducer from '../../../../src/store.js'; 
import AppRouter from '../../../../src/navigation/index.js';
import {Provider as StoreProvider } from 'react-redux'; 
import {PaperProvider}  from "react-native-paper";



// Mock Firebase and AsyncStorage
jest.mock('../../../../firebaseConfig.js', () => ({
    auth: {
      signupWithEmail: jest.fn(() => Promise.resolve()),
      startUpdateProfile: jest.fn(() => Promise.resolve()),
      startLoadUserData: jest.fn(() => Promise.resolve()),
      startUpdateUserData: jest.fn(() => Promise.resolve()),
      updateUserMetricsData: jest.fn(() => Promise.resolve()),
      currentUser: {
        uid: {
          "email": "test100@gmail.com", 
          "firstName": "LordTest",
          "lastName": "Smith", 
          "uuid": "nvQpwMHj7eUKfsyEhVloGM7hvji2"
          //uuid: null
        },
        email: 'test100@gmail.com',
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
  clearMetrics: jest.fn()
}));

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(() => Promise.resolve('mocked_value')),
  setItem: jest.fn(() => Promise.resolve()),
  removeItem: jest.fn(() => Promise.resolve()),
  clear: jest.fn(() => Promise.resolve()),
}));


// jest.mock('../../src/actions/toastActions.js', () => ({
//     toastError: jest.fn(() => Promise.resolve()),
// }))
  
jest.mock('firebase/auth', () => ({
    initializeApp: jest.fn(),
    updateProfile: jest.fn(() => Promise.resolve({ 
        firstName: "LordTest",
        lastName: "Smith", 
      })),
    registerVersion: jest.fn(),
    getAuth: jest.fn(),
    getDatabase: jest.fn(),
    createUserWithEmailAndPassword: jest.fn(() => Promise.resolve({ 
      user: {
            //uid: null,
            uid: 'nvQpwMHj7eUKfsyEhVloGM7hvji2',
            email: 'test100@gmail.com',
            password: 'password123'
          } 
    })),
}))

// jest.mock('../../src/actions/appActions', () => ({
//     userMetricsDataModalVisible: jest.fn().mockReturnValue({
//         visibility: true,
//         isFromSignUpScreen: true,
//     }),
// }));
jest.mock('../../../../src/actions/appActions.js', () => {
    return {
      ...jest.requireActual('../../src/actions/appActions.js'), // if you want to keep the original implementations of other functions
      userMetricsDataModalVisible: jest.fn((visibility, isFromSignUpScreen = true) => {
        return {
          type: 'USER_METRICS_DATA_MODAL_VISIBLE',
          payload: {
            visibility,
            isFromSignUpScreen,
          },
        };
      })
    };
  });

  
  
jest.mock('firebase/firestore', () => ({
    collection: jest.fn(() => ({ add: jest.fn() })),
    addDoc: jest.fn(),
    setDoc: jest.fn(() => Promise.resolve()),
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
jest.mock('../../../../src/actions/appActions', () => ({
  userMetricsDataModalVisible: jest.fn().mockReturnValue({
    type: 'USER_METRICS_DATA_MODAL_VISIBLE',
    payload: {
      visibility: true,
      isFromSignUpScreen: true,
  }}),
}));
// jest.mock('../../src/actions/appActions', () => ({
//   userMetricsDataModalVisible: jest.fn().mockReturnValue({
//     visibility: true,
//     isFromSignUpScreen: true,
//   }),
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




/**
 * Integration test suite for navigating from Sign-Up to the Dashboard.
 * 
 * This test suite simulates the complete flow of user navigation from the Sign-Up screen
 * to the Dashboard screen, testing the overall app flow and ensuring the navigation
 * system behaves correctly upon successful sign-up.
 *
 * @test {Sign-Up to Dashboard Integration}
 */
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


  /**
   * Test case: Should navigate from Sign-In to Sign-Up and then to the Dashboard screen after successful sign-up
   *
   * This test validates the app flow from the Sign-In screen to the Sign-Up screen, and then to 
   * the Dashboard screen upon successful sign-up. It checks that user interactions with the 
   * Sign-Up form are handled correctly, the Terms of Service checkbox is toggled, and the 
   * appropriate navigation occurs once sign-up is complete.
   *
   * @test {SignUp to Dashboard Navigation}
   */
  it('should navigate from Sign-In to Sign-Up to Dashboard', async () => {
  
    const store = configureStore();
    
    // Wrap TestComponent with Providers and render
      const { getAllByTestId, getByText, getAllByRole, getByTestId } = render(
          <StoreProvider store={store}>
          <PaperProvider >
              <TestComponent />
          </PaperProvider>
          </StoreProvider>
      );
  
      // 1) Start in Sign In Screen

      // Find "Don't have an account? Sign Up"
      var buttons = getAllByRole('button');
      //console.log(buttons.length);
      const dontHaveAccountLink =  buttons[2];
  
      // Click "Don't have an account? Sign Up"
      await act(() => {
          fireEvent.press(dontHaveAccountLink);
      });
  
      // Navigates to SignUp after successful login
      await waitFor(() => {
          expect(getByText('Sign Up')).toBeTruthy();
      });


      // 2) SignUp renders here:


      //console.log(inputFields.length);
      const firstNameInput = getByTestId('first-name-input');
      const lastNameInput = getByTestId('last-name-input');
      const emailInput = getByTestId('email-input');
      const passwordInput = getByTestId('password-input');
      const confirmPasswordInput = getByTestId('confirm-password-input');



      // Find SignUp Button
      const signUpButton = getByTestId('sign-up-button');

      // buttons = getAllByTestId('button');
      // //console.log(buttons.length);
      // var signUpButton =  buttons[1];


      // Enter credentials and press Sign In Button
      await act(() => {
          fireEvent.changeText(firstNameInput, 'LordTest');
      });
      await act(() => {
          fireEvent.changeText(lastNameInput, 'Smith');
      });
      await act(() => {
          fireEvent.changeText(emailInput, 'test100@gmail.com');
      });
      await act(() => {
          fireEvent.changeText(passwordInput, 'password123');
      });
      await act(() => {
          fireEvent.changeText(confirmPasswordInput, 'password123');
      });

      // Find TOS Checkmark 
      const tosCheckbox = getAllByRole('checkbox')[0];
      await act(() => {
        fireEvent.press(tosCheckbox);
      });

      //var userAgreements = getAllByRole('checkbox');
      // console.log(userAgreements.length);
      // await act(() => {
      //     userAgreements.forEach(checkbox => fireEvent.press(checkbox));
      // });
      // expect(userAgreements[0].props.accessibilityState.checked).toBe(false);
      // await act(() => {
      //     fireEvent.press(userAgreements[0])
      // });
      // console.log(userAgreements.length);

      // TOS Modal opens up, check the Terms of Service checkbox
      const tosModalCheckbox = getAllByRole('checkbox')[0];
      await act(() => {
        fireEvent.press(tosModalCheckbox);
      });
      // var userAgreements = getAllByRole('checkbox');
      // // console.log(userAgreements.length);
      // await act(() => {
      //     fireEvent.press(userAgreements[0])
      // });
      // await waitFor(() => {
      //     expect(userAgreements[0].props.accessibilityState.checked).toBe(true);
      // });
      // await act(() => {
      //     fireEvent.press(userAgreements[1])
      // });

      // buttons = getAllByTestId('button');
      // //console.log(buttons.length);
      // signUpButton =  buttons[1];

      await act(() => {
          fireEvent.press(signUpButton);
      });
  
      // Navigates to Dashboard after successful login
      await waitFor(() => {
          expect(getByText('Dashboard')).toBeTruthy();
      });
  }, 10000);
});