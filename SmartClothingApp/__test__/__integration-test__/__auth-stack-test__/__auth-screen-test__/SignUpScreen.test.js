/**
 * Integration tests for the Sign-Up Screen in the Smart Clothing App.
 * 
 * This test file includes integration tests that simulate user interactions with the Sign-Up screen.
 * These tests cover the process of filling out the sign-up form, handling various validation scenarios,
 * and dispatching the appropriate Redux actions for user registration and Firebase authentication.
 * 
 * Mocks:
 * - Firebase Authentication methods (createUserWithEmailAndPassword, auth.currentUser)
 * - Firebase Firestore methods (setDoc, collection, etc.)
 * - AsyncStorage for local storage interactions
 * - Redux action for user sign-up (startSignupWithEmail)
 * 
 * The test suite mocks external dependencies and uses Redux to test the Sign-Up functionality
 * in a React Native environment.
 *
 * @file SignUpScreen.test.js
 * 
 * Credit: Carlos Figueroa (github @cfiguer055)
 *         Harshit _ (github @_)
 */
import React from 'react';
import { render, fireEvent, waitFor, cleanup, act } from '@testing-library/react-native';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import SignupScreen from '../../../../src/screens/SignupScreen';
import { startSignupWithEmail } from '../../../../src/actions/userActions';

/**
 * Mocks the localStorage utility functions and Firebase Firestore methods.
 * These mocks simulate database and storage interactions for the test cases.
 */
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
  storeUID: jest.fn(),
  clearUID: jest.fn(),
}));

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(() => Promise.resolve('mocked_value')),
  setItem: jest.fn(() => Promise.resolve()),
  removeItem: jest.fn(() => Promise.resolve()),
  clear: jest.fn(() => Promise.resolve()),
}));

jest.mock('firebase/firestore', () => ({
  collection: jest.fn(() => ({ add: jest.fn() })),
  addDoc: jest.fn(),
  setDoc: jest.fn(),
}));

jest.mock('../../../../firebaseConfig.js', () => ({
  auth: {
    loginWithEmail: jest.fn(() => Promise.resolve()),
    currentUser: {
      uid: {
        "email": "test1@gmail.com", 
        "firstName": "MisterTest",
        "lastName": "Johnson", 
        "uuid": "nvQpwMHj7eUKfsyEhVloGM7hvji2"
      },
      email: 'test1@gmail.com',
      password: 'password123'
    },
  },
}));

jest.mock('firebase/auth', () => ({
  createUserWithEmailAndPassword: jest.fn(),
  updateEmail: jest.fn(),
  signInWithEmailAndPassword: jest.fn(),
  updateProfile: jest.fn(), 
  sendPasswordResetEmail: jest.fn(),
}));

// jest.mock('../../../../src/actions/userActions.js', () => ({
//   startSignupWithEmail: jest.fn((email, password, fname, lname) => {
//     return () => Promise.resolve();
//   }),
// }));

jest.mock('../../../../src/actions/userActions.js', () => ({
  //startSignupWithEmail: jest.fn(() => jest.fn()),  // Return a function from the mock
  //startSignupWithEmail: jest.fn(() => Promise.resolve()),
  startSignupWithEmail: jest.fn(() => (dispatch) => Promise.resolve()),
  setAuthError: jest.fn(),
}));

jest.mock('react-native-vector-icons/FontAwesome5', () => 'Icon');
jest.mock('react-native-vector-icons/MaterialIcons', () => 'Icon');

jest.mock('expo-font', () => ({
  loadAsync: jest.fn().mockResolvedValue(true),
  isLoaded: jest.fn().mockReturnValue(true), // Add this mock
}));

jest.mock('@react-navigation/native', () => {
    const actualNav = jest.requireActual('@react-navigation/native');
    return {
      ...actualNav,
      useNavigation: () => ({
        navigate: jest.fn(),
        goBack: jest.fn(),
      }),
      useRoute: () => ({
        //name: 'Previous Screen',
        params: {
            previousScreenTitle: 'Home',
          },
      }),
    };
  });


jest.mock('@expo/vector-icons', () => {
  const React = require('react');
  const MockIcon = ({ name, size, color }) =>
    React.createElement('svg', { name, size, color });
  return {
    AntDesign: MockIcon,
    FontAwesome: MockIcon,
    Ionicons: MockIcon,
    MaterialIcons: MockIcon,
    MaterialCommunityIcons: MockIcon,
    Entypo: MockIcon,
    Feather: MockIcon,
    // Add other icon sets here if needed
  };
});

jest.mock('expo-asset', () => ({
  Asset: {
    loadAsync: jest.fn().mockResolvedValue([]),
  },
}));

jest.mock('../../../../src/hooks/useAppFonts', () => ({
  useAppFonts: jest.fn(() => true),
}));

jest.mock('react-native-paper', () => {
  const mock = jest.requireActual('react-native-paper');
  return {
    ...mock,
    Provider: ({ children }) => <>{children}</>,
  };
});

jest.mock('expo-asset', () => ({
  Asset: {
    loadAsync: jest.fn().mockResolvedValue([]),
  },
}));


// jest.mock('expo-font', () => ({
//   loadAsync: jest.fn().mockResolvedValue(true),
// }));

jest.mock('expo-notifications', () => ({
  setNotificationHandler: jest.fn(),
  addNotificationReceivedListener: jest.fn(),
  addNotificationResponseReceivedListener: jest.fn(),
  getLastNotificationResponseAsync: jest.fn().mockResolvedValue(null),
  scheduleNotificationAsync: jest.fn().mockResolvedValue('mocked-notification-id'),
  requestPermissionsAsync: jest.fn(() => Promise.resolve({ granted: true })),
  getExpoPushTokenAsync: jest.fn(() =>
    Promise.resolve({ data: 'mocked-expo-push-token' })
  ),
}));

jest.mock('../../../../src/utils/notifications.js', () => ({
  registerForPushNotificationsAsync: jest.fn(() => Promise.resolve('mocked-expo-push-token')),
  sendNotification: jest.fn(),
}));



const middlewares = [thunk];
const mockStore = configureStore(middlewares);

/**
 * Integration test suite for the Sign-Up Screen.
 * 
 * This test suite simulates user interaction with the Sign-Up screen, including:
 * - Text input handling for first name, last name, email, password, and confirm password fields
 * - Validation messages for invalid or empty inputs
 * - Dispatching the `startSignupWithEmail` action on valid input submission
 * 
 * @test {SignUpScreen Integration}
 */
describe('SignUpScreen/Auth Integration Test', () => {
  let store;
  const mockNavigation = { navigate: jest.fn() };

  beforeEach(() => {
    // Define an initial mock state with authError
    const initialState = {
      user: {
        authError: null, // Initial value for authError
      },
    };

    store = mockStore(initialState);

    //store = mockStore({});

    originalConsoleError = console.error; // Save the original console.error

    jest.spyOn(console, 'error').mockImplementation((message) => {
      if (message.includes('Warning: An update to')) {
        return; // Ignore this warning
      }
      originalConsoleError(message); // Call the original console.error
    });
    // Prevents 'wrap act()' console log warning 
    // jest.spyOn(console, 'error').mockImplementation((message) => {
    //   if (message.includes('Warning: An update to')) {
    //     return;
    //   }
    //   console.error(message);
    // });

    jest.useFakeTimers();
  });

  // Clean up after each test by resetting the alert spy
  afterEach(() => {
    jest.clearAllTimers();
    jest.clearAllMocks();
    cleanup();
  });

  /**
   * Test case: Successful Sign-Up.
   *
   * This test validates that users can enter valid details (first name, last name, email, password),
   * check the Terms of Service checkbox, and successfully submit the form to dispatch the sign-up action.
   * 
   * @test {Successful Sign-Up}
   */
  it('should dispatch startSignupWithEmail action on valid input', async () => {
    const { getByTestId, getAllByRole } = render(
      <Provider store={store}>
        <SignupScreen />
      </Provider>
    );

    const firstNameInput = getByTestId('first-name-input');
    const lastNameInput = getByTestId('last-name-input');
    const emailInput = getByTestId('email-input');
    const passwordInput = getByTestId('password-input');
    const confirmPasswordInput = getByTestId('confirm-password-input');
    const signUpButton = getByTestId('sign-up-button');
    const tosCheckbox = getAllByRole('checkbox')[0];

    // Fill out the sign-up form
    await act(() => {
      fireEvent.changeText(firstNameInput, 'John');
    });
    await act(() => {
      fireEvent.changeText(lastNameInput, 'Doe');
    });
    await act(() => {
      fireEvent.changeText(emailInput, 'test@example.com');
    });
    await act(() => {
      fireEvent.changeText(passwordInput, 'password123');
    });
    await act(() => {
      fireEvent.changeText(confirmPasswordInput, 'password123');
    });

    // Check the Terms of Service checkbox
    await act(() => {
      fireEvent.press(tosCheckbox);
    });

    // TOS Modal opens up, check the Terms of Service checkbox
    const tosModalCheckbox = getAllByRole('checkbox')[0];
    await act(() => {
      fireEvent.press(tosModalCheckbox);
    });

    // Press the sign-up button
    await act(() => {
      fireEvent.press(signUpButton);
    });

    // Ensure the sign-up action is dispatched
    await waitFor(() => {
      expect(startSignupWithEmail).toHaveBeenCalledWith('test@example.com', 'password123', 'John', 'Doe');
    });
  });

  /**
   * Test case: Should not dispatch action if the first-name-input is empty.
   *
   * This test checks that if the first name is left empty, the form will not submit and the action will not be dispatched.
   * 
   * @test {First Name Empty}
   */
  it('should not dispatch startSignupWithEmail action if first name is empty', async () => {
    const { getByTestId, getAllByRole } = render(
      <Provider store={store}>
        <SignupScreen />
      </Provider>
    );

    const firstNameInput = getByTestId('first-name-input');
    const lastNameInput = getByTestId('last-name-input');
    const emailInput = getByTestId('email-input');
    const passwordInput = getByTestId('password-input');
    const confirmPasswordInput = getByTestId('confirm-password-input');
    const signUpButton = getByTestId('sign-up-button');
    const tosCheckbox = getAllByRole('checkbox')[0];

    // Fill out the sign-up form except for the first name
    await act(() => {
      fireEvent.changeText(lastNameInput, 'Doe');
    });
    await act(() => {
      fireEvent.changeText(emailInput, 'test@example.com');
    });
    await act(() => {
      fireEvent.changeText(passwordInput, 'password123');
    });
    await act(() => {
      fireEvent.changeText(confirmPasswordInput, 'password123');
    });

    // Check the Terms of Service checkbox
    await act(() => {
      fireEvent.press(tosCheckbox);
    });

    // Press the sign-up button
    await act(() => {
      fireEvent.press(signUpButton);
    });

    // Ensure the action is not dispatched due to the empty first name
    await waitFor(() => {
      expect(startSignupWithEmail).not.toHaveBeenCalled();
    });
  });


  // Scenario: last-name-input empty ""
  it("should not dispatch startSignupWithEmail action if last name is empty", async () => {
    // Similar to first name empty case
    // Fill out the form with valid first name, email, password, and confirm password
    // Leave last name empty and ensure the action is not dispatched
  });


  // Scenario: invalid-email format "invalid-email"
  it("should not dispatch startSignupWithEmail action if email format is invalid", async () => {
    // Fill out the form with valid first name, last name, password, and confirm password
    // Input an invalid email format like "invalid-email"
    // Ensure the action is not dispatched and proper error message is shown
  });


  // Scenario: empty password ""
  it("should not dispatch startSignupWithEmail action if password is empty", async () => {
    // Fill out the form with valid first name, last name, and email
    // Leave the password and confirm password empty
    // Ensure the action is not dispatched and error message for empty password is shown
  });


  // Scenario: invalid password (too short "123")
  it("should not dispatch startSignupWithEmail action if password is too short", async () => {
    // Fill out the form with valid first name, last name, and email
    // Enter a password that's too short, e.g., "123"
    // Ensure the action is not dispatched and error message for invalid password length is shown
  });


  // Scenario: Passwords do not match
  it("should not dispatch startSignupWithEmail action if passwords do not match", async () => {
    // Fill out the form with valid first name, last name, email, and enter different values for password and confirm password
    // Ensure the action is not dispatched and an appropriate error message is shown
  });

  /**
   * Test case: Should not dispatch action if TOS checkbox is not pressed.
   *
   * This test ensures that if the Terms of Service checkbox is not checked, the form will not submit and the action will not be dispatched.
   * 
   * @test {TOS Checkbox Not Pressed}
   */
  it('should not dispatch startSignupWithEmail action if TOS checkbox is not pressed', async () => {
    const { getByTestId } = render(
      <Provider store={store}>
        <SignupScreen />
      </Provider>
    );

    const firstNameInput = getByTestId('first-name-input');
    const lastNameInput = getByTestId('last-name-input');
    const emailInput = getByTestId('email-input');
    const passwordInput = getByTestId('password-input');
    const confirmPasswordInput = getByTestId('confirm-password-input');
    const signUpButton = getByTestId('sign-up-button');

    // Fill out the sign-up form but don't check the TOS checkbox
    await act(() => {
      fireEvent.changeText(firstNameInput, 'John');
    });
    await act(() => {
      fireEvent.changeText(lastNameInput, 'Doe');
    });
    await act(() => {
      fireEvent.changeText(emailInput, 'test@example.com');
    });
    await act(() => {
      fireEvent.changeText(passwordInput, 'password123');
    });
    await act(() => {
      fireEvent.changeText(confirmPasswordInput, 'password123');
    });

    // Press the sign-up button without accepting the TOS
    await act(() => {
      fireEvent.press(signUpButton);
    });

    // Ensure the action is not dispatched due to TOS checkbox not being pressed
    await waitFor(() => {
      expect(startSignupWithEmail).not.toHaveBeenCalled();
    });
  });



  // Additional test case: Valid input but authError returned
  it("should display authError if startSignupWithEmail action fails", async () => {
    // Simulate an authError in the mock state
    // Fill out the form with valid data
    // Ensure the error is shown on the screen if the action fails
  });

  // Additional test case: Form submission disabled when isSubmitting is true
  it("should disable form submission when isSubmitting is true", async () => {
    // Set isSubmitting to true in the component state
    // Ensure the sign-up button is disabled while the form is submitting
  });
});
