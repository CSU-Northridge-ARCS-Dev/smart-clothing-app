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
 * - Redux action for user sign-up (startLoginWithEmail)
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
import { render, fireEvent, waitFor, cleanup  } from '@testing-library/react-native';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import { act } from 'react-test-renderer';
import thunk from 'redux-thunk';
import SignupScreen from '../../../../src/screens/SignupScreen';
import { startLoginWithEmail } from '../../../../src/actions/userActions';


// Mocking AsyncStorage, Firebase, and other dependencies
jest.mock('../../../../src/utils/localStorage.js', () => ({
  AsyncStorage: jest.fn(),
  storeUID: jest.fn(),
}));

jest.mock('firebase/firestore', () => ({
  collection: jest.fn(() => ({ add: jest.fn() })),
  addDoc: jest.fn(),
  setDoc: jest.fn(),
}))

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
  createUserWithEmailAndPassword: jest.fn(),
  updateEmail: jest.fn(),
  signInWithEmailAndPassword: jest.fn(),
  updateProfile: jest.fn(), 
  sendPasswordResetEmail: jest.fn(),
  auth: {
    updateEmail: jest.fn(),
  },
}));

jest.mock('../../../../src/actions/userActions.js', () => ({
  startLoginWithEmail: jest.fn((email, password) => {
    return () => Promise.resolve();
  }),
  setAuthError: jest.fn(),
  
}));



const middlewares = [thunk];
const mockStore = configureStore(middlewares);

/**
 * Integration test suite for the Sign-Up Screen.
 * 
 * This test suite simulates user interaction with the Sign-Up screen, including:
 * - Text input handling for email and password fields
 * - Validation messages for invalid or empty inputs
 * - Dispatching the `startSignUpWithEmail` action on valid input submission
 * 
 * @test {SignUpScreen Integration}
 */
describe('SignunScreen/Auth Integration Test', () => {
  let store;

  beforeEach(() => {
    store = mockStore({});

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


  /**
   * Test case: Should allow changing text for email and password input fields
   *
   * This test validates that users can enter their email and password into the respective
   * input fields, and that the input values are correctly updated in the component state.
   *
   * @test {Input Text Change for Email and Password}
   */
  it('change text is enabled for input fields', async () => {
    const { getByTestId } = render(
      <Provider store={store}>
        <SignupScreen />
      </Provider>
    );

    const emailInput = getByTestId('email-input');
    const passwordInput = getByTestId('password-input');

    await act(() => {
      fireEvent.changeText(emailInput, 'test@example.com');
    });
    await act(() => {
      fireEvent.changeText(passwordInput, 'password123');
    });

    expect(emailInput.props.value).toBe('test@example.com');
    expect(passwordInput.props.value).toBe('password123');
  });

  /**
   * Test case: Should dispatch `startSignUpWithEmail` action on valid input
   *
   * This test checks that the `startSignUpWithEmail` action is dispatched when the user
   * enters a valid email and password and presses the sign-up button. It also verifies
   * that no validation error messages are shown.
   *
   * @test {Valid Input Dispatches Sign-Up Action}
   */
  it('should dispatch startSignUpWithEmail action on valid input', async () => {
    const { getByTestId, queryByText } = render(
      <Provider store={store}>
        <SignupScreen />
      </Provider>
    );

    const emailInput = getByTestId('email-input');
    const passwordInput = getByTestId('password-input');
    const signUpButton = getByTestId('sign-up-button');

    await act(() => {
      fireEvent.changeText(emailInput, 'test@example.com');
    });
    await act(() => {
      fireEvent.changeText(passwordInput, 'password123');
    });
    await act(() => {
      fireEvent.press(signUpButton);
    });


    const errorMessage1 = queryByText('Enter valid email.');
    expect(errorMessage1).toBeFalsy();

    const errorMessage2 = queryByText('Password cannot be empty');
    expect(errorMessage2).toBeFalsy();

    const errorMessage3 = queryByText('Password length cannot be less than 6.');
    expect(errorMessage3).toBeFalsy();

    await waitFor(() => {
      expect(startSignUpWithEmail).toHaveBeenCalledWith('test@example.com', 'password123');
    });
  });

  /**
   * Test case: Should not dispatch `startSignUpWithEmail` action on empty email
   *
   * This test ensures that when the email field is left empty, an error message is shown
   * and the `startSignUpWithEmail` action is not dispatched.
   *
   * @test {Empty Email Field}
   */
  it('should not dispatch startSignUpWithEmail action on empty email', async () => {
    const { getByTestId, queryByText } = render(
      <Provider store={store}>
        <SignupScreen />
      </Provider>
    );
  
    const emailInput = getByTestId('email-input');
    const passwordInput = getByTestId('password-input');
    const signUpButton = getByTestId('sign-up-button');
  
    await act(() => {
      fireEvent.changeText(emailInput, '');
    });
    await act(() => {
      fireEvent.changeText(passwordInput, 'password123');
    });
    await act(() => {
      fireEvent.press(signUpButton);
    });
  

    const errorMessage1 = queryByText('Enter valid email.');
    expect(errorMessage1).toBeTruthy();

    const errorMessage2 = queryByText('Password cannot be empty');
    expect(errorMessage2).toBeFalsy();

    const errorMessage3 = queryByText('Password length cannot be less than 6.');
    expect(errorMessage3).toBeFalsy();

    await waitFor(() => {
      expect(startSignUpWithEmail).not.toHaveBeenCalled();
    });
  });
});