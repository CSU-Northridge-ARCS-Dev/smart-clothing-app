/**
 * Integration tests for the Sign-In Screen in the Smart Clothing App.
 * 
 * This test file includes integration tests that simulate user interactions with the Sign-In screen.
 * These tests cover the process of filling out the email and password fields, handling various 
 * validation scenarios, and dispatching the appropriate Redux actions for user authentication.
 * 
 * Mocks:
 * - Firebase Authentication methods (signInWithEmailAndPassword, auth.currentUser)
 * - Firebase Firestore methods (setDoc, collection, etc.)
 * - AsyncStorage for local storage interactions
 * - Redux action for user login (startLoginWithEmail)
 * 
 * The test suite mocks external dependencies and uses Redux to test the Sign-In functionality
 * in a React Native environment.
 *
 * @file SignInScreen.test.js
 * 
 * Credit: Carlos Figueroa (github @cfiguer055)
 *         Harshit _ (github @_)
 */
import React from 'react';
import { render, fireEvent, waitFor, cleanup  } from '@testing-library/react-native';
import { Provider } from 'react-redux';
//import configureStore from 'redux-mock-store';
import configureMockStore from 'redux-mock-store';
import { act } from 'react-test-renderer';
import thunk from 'redux-thunk';
import SigninScreen from '../../../../src/screens/SigninScreen';
import { startLoginWithEmail } from '../../../../src/actions/userActions';


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

// jest.mock('expo-notifications', () => ({
//   setNotificationHandler: jest.fn(),
//   addNotificationReceivedListener: jest.fn(),
//   addNotificationResponseReceivedListener: jest.fn(),
//   getLastNotificationResponseAsync: jest.fn().mockResolvedValue(null),
//   scheduleNotificationAsync: jest.fn().mockResolvedValue('mocked-notification-id'),
// }));
jest.mock('expo-notifications', () => ({
  setNotificationHandler: jest.fn(),
  addNotificationReceivedListener: jest.fn(() => ({ remove: jest.fn() })),
  addNotificationResponseReceivedListener: jest.fn(() => ({ remove: jest.fn() })),
  getLastNotificationResponseAsync: jest.fn().mockResolvedValue(null),
  scheduleNotificationAsync: jest.fn().mockResolvedValue('mocked-notification-id'),
}));




const middlewares = [thunk];
//const mockStore = configureStore(middlewares);
const createMockStore = configureMockStore([thunk]);


/**
 * Integration test suite for the Sign-In Screen.
 * 
 * This test suite simulates user interaction with the Sign-In screen, including:
 * - Text input handling for email and password fields
 * - Validation messages for invalid or empty inputs
 * - Dispatching the `startLoginWithEmail` action on valid input submission
 * - Navigation to other screens like Forgot Password and Sign-Up
 *
 * @test {SignInScreen Integration}
 */
describe('SigninScreen/Auth Integration Test', () => {
  let store;

//   beforeEach(() => {
//     store = mockStore({});

//     // Prevents 'wrap act()' console log warning 
//     jest.spyOn(console, 'error').mockImplementation((message) => {
//       if (message.includes('Warning: An update to')) {
//         return; // Exit gracefully
//       }
//       // Use the original implementation without recursion
//       process.stderr.write(`Error: ${message}\n`);
//     });

//     // jest.spyOn(console, 'error').mockImplementation((message) => {
//     //   if (message.includes('Warning: An update to')) {
//     //     return;
//     //   }
//     //   console.error(message);
//     // });

//     jest.useFakeTimers();
//   });

//  // Clean up after each test by resetting the alert spy
//  afterEach(() => {
//     jest.clearAllTimers();
//     jest.clearAllMocks();
//     cleanup();
//   });

  let errorSpy;
  beforeEach(() => {
    jest.useFakeTimers('modern'); // ✅ modern fake timers
    store = createMockStore({});
  });

  afterEach(() => {
    jest.runOnlyPendingTimers(); // ensure timers are drained
    jest.useRealTimers();        // reset timer mocks
    jest.clearAllTimers();       // cleanup
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
        <SigninScreen />
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
   * Test case: Should dispatch `startLoginWithEmail` action on valid input
   *
   * This test checks that the `startLoginWithEmail` action is dispatched when the user
   * enters a valid email and password and presses the sign-in button. It also verifies
   * that no validation error messages are shown.
   *
   * @test {Valid Input Dispatches Login Action}
   */
  it('should dispatch startLoginWithEmail action on valid input', async () => {
    const { getByTestId, queryByText } = render(
      <Provider store={store}>
        <SigninScreen />
      </Provider>
    );

    const emailInput = getByTestId('email-input');
    const passwordInput = getByTestId('password-input');
    const signInButton = getByTestId('sign-in-button');

    await act(() => {
      fireEvent.changeText(emailInput, 'test@example.com');
    });
    await act(() => {
      fireEvent.changeText(passwordInput, 'password123');
    });
    await act(() => {
      fireEvent.press(signInButton);
    });


    const errorMessage1 = queryByText('Enter valid email.');
    expect(errorMessage1).toBeFalsy();

    const errorMessage2 = queryByText('Password cannot be empty');
    expect(errorMessage2).toBeFalsy();

    const errorMessage3 = queryByText('Password length cannot be less than 6.');
    expect(errorMessage3).toBeFalsy();

    await waitFor(() => {
      expect(startLoginWithEmail).toHaveBeenCalledWith('test@example.com', 'password123');
    });
  });

  /**
   * Test case: Should not dispatch `startLoginWithEmail` action on empty email
   *
   * This test ensures that when the email field is left empty, an error message is shown
   * and the `startLoginWithEmail` action is not dispatched.
   *
   * @test {Empty Email Field}
   */
  it('should not dispatch startLoginWithEmail action on empty email', async () => {
    const { getByTestId, queryByText } = render(
      <Provider store={store}>
        <SigninScreen />
      </Provider>
    );
  
    const emailInput = getByTestId('email-input');
    const passwordInput = getByTestId('password-input');
    const signInButton = getByTestId('sign-in-button');
  
    await act(() => {
      fireEvent.changeText(emailInput, '');
    });
    await act(() => {
      fireEvent.changeText(passwordInput, 'password123');
    });
    await act(() => {
      fireEvent.press(signInButton);
    });
  

    const errorMessage1 = queryByText('Enter valid email.');
    expect(errorMessage1).toBeTruthy();

    const errorMessage2 = queryByText('Password cannot be empty');
    expect(errorMessage2).toBeFalsy();

    const errorMessage3 = queryByText('Password length cannot be less than 6.');
    expect(errorMessage3).toBeFalsy();

    await waitFor(() => {
      expect(startLoginWithEmail).not.toHaveBeenCalled();
    });
  });

  /**
   * Test case: Should not dispatch startLoginWithEmail action on invalid email format
   *
   * This test checks that when an invalid email format is entered, the appropriate
   * validation error message is displayed, and the `startLoginWithEmail` action is 
   * not dispatched.
   *
   * @test {Invalid Email Format}
   */
  it('should not dispatch startLoginWithEmail action on invalid email format', async () => {
    const { getByTestId, queryByText } = render(
      <Provider store={store}>
        <SigninScreen />
      </Provider>
    );
  
    const emailInput = getByTestId('email-input');
    const passwordInput = getByTestId('password-input');
    const signInButton = getByTestId('sign-in-button');
  
    await act(() => {
      fireEvent.changeText(emailInput, 'invalid-email');
    });
    await act(() => {
      fireEvent.changeText(passwordInput, 'password123');
    });
    await act(() => {
      fireEvent.press(signInButton);
    });


    const errorMessage1 = queryByText('Enter valid email.');
    expect(errorMessage1).toBeTruthy();

    const errorMessage2 = queryByText('Password cannot be empty');
    expect(errorMessage2).toBeFalsy();

    const errorMessage3 = queryByText('Password length cannot be less than 6.');
    expect(errorMessage3).toBeFalsy();
  
    await waitFor(() => {
      expect(startLoginWithEmail).not.toHaveBeenCalled();
    });
  });

  /**
   * Test case: Should not dispatch startLoginWithEmail action on empty password
   *
   * This test checks that when the password field is left empty, the appropriate validation 
   * error message is displayed, and the `startLoginWithEmail` action is not dispatched.
   *
   * @test {Empty Password Field}
   */
  it('should not dispatch startLoginWithEmail action on empty password', async () => {
    const { getByTestId, queryByText } = render(
      <Provider store={store}>
        <SigninScreen />
      </Provider>
    );
  
    const emailInput = getByTestId('email-input');
    const passwordInput = getByTestId('password-input');
    const signInButton = getByTestId('sign-in-button');
  
    await act(() => {
      fireEvent.changeText(emailInput, 'test@example.com');
    });
    await act(() => {
      fireEvent.changeText(passwordInput, '');
    });
    await act(() => {
      fireEvent.press(signInButton);
    });

    const errorMessage1 = queryByText('Enter valid email.');
    expect(errorMessage1).toBeFalsy();

    const errorMessage2 = queryByText('Password cannot be empty');
    expect(errorMessage2).toBeTruthy();

    const errorMessage3 = queryByText('Password length cannot be less than 6.');
    expect(errorMessage3).toBeFalsy();
  
    await waitFor(() => {
      expect(startLoginWithEmail).not.toHaveBeenCalled();
    });
  });

  /**
   * Test case: Should not dispatch startLoginWithEmail action on short password
   *
   * This test checks that when the password entered is shorter than the required length,
   * the appropriate validation error message is displayed, and the `startLoginWithEmail` action 
   * is not dispatched.
   *
   * @test {Short Password}
   */
  it('should not dispatch startLoginWithEmail action on short password', async () => {
    const { getByTestId, queryByText } = render(
      <Provider store={store}>
        <SigninScreen />
      </Provider>
    );
  
    const emailInput = getByTestId('email-input');
    const passwordInput = getByTestId('password-input');
    const signInButton = getByTestId('sign-in-button');
  
    await act(() => {
      fireEvent.changeText(emailInput, 'test@example.com');
    });
    await act(() => {
      fireEvent.changeText(passwordInput, 'pass');
    });
    await act(() => {
      fireEvent.press(signInButton);
    });
  
    const errorMessage1 = queryByText('Enter valid email.');
    expect(errorMessage1).toBeFalsy();

    const errorMessage2 = queryByText('Password cannot be empty');
    expect(errorMessage2).toBeFalsy();

    const errorMessage3 = queryByText('Password length cannot be less than 6.');
    expect(errorMessage3).toBeTruthy();

    await waitFor(() => {
      expect(startLoginWithEmail).not.toHaveBeenCalled();
    });
  });

  /**
   * Test case: Should not dispatch startLoginWithEmail action on empty email and password
   *
   * This test checks that when both the email and password fields are left empty, the 
   * appropriate validation error messages are displayed, and the `startLoginWithEmail` action 
   * is not dispatched.
   *
   * @test {Empty Email and Password}
   */
  it('should not dispatch startLoginWithEmail action on empty email and empty password', async () => {
    const { getByTestId, queryByText } = render(
      <Provider store={store}>
        <SigninScreen />
      </Provider>
    );

    const emailInput = getByTestId('email-input');
    const passwordInput = getByTestId('password-input');
    const signInButton = getByTestId('sign-in-button');

    await act(() => {
      fireEvent.changeText(emailInput, '');
    });
    await act(() => {
      fireEvent.changeText(passwordInput, '');
    });
    await act(() => {
      fireEvent.press(signInButton);
    });

    const errorMessage1 = queryByText('Enter valid email.');
    expect(errorMessage1).toBeTruthy();

    const errorMessage2 = queryByText('Password cannot be empty');
    expect(errorMessage2).toBeTruthy();

    const errorMessage3 = queryByText('Password length cannot be less than 6.');
    expect(errorMessage3).toBeFalsy();

    await waitFor(() => {
      expect(startLoginWithEmail).not.toHaveBeenCalled();
    });
  });

  /**
   * Test case: Should not dispatch startLoginWithEmail action on invalid email and empty password
   *
   * This test checks that when an invalid email format is entered and the password field is empty,
   * the appropriate validation error messages are displayed, and the `startLoginWithEmail` action 
   * is not dispatched.
   *
   * @test {Invalid Email and Empty Password}
   */
  it('should not dispatch startLoginWithEmail action for invalid email format and empty password', async () => {
    const { getByTestId, queryByText } = render(
      <Provider store={store}>
        <SigninScreen />
      </Provider>
    );

    const emailInput = getByTestId('email-input');
    const passwordInput = getByTestId('password-input');
    const signInButton = getByTestId('sign-in-button');

    await act(() => {
      fireEvent.changeText(emailInput, 'invalid-email-format');
    });
    await act(() => {
      fireEvent.changeText(passwordInput, '');
    });
    await act(() => {
      fireEvent.press(signInButton);
    });

    const errorMessage1 = queryByText('Enter valid email.');
    expect(errorMessage1).toBeTruthy();

    const errorMessage2 = queryByText('Password cannot be empty');
    expect(errorMessage2).toBeTruthy();

    const errorMessage3 = queryByText('Password length cannot be less than 6.');
    expect(errorMessage3).toBeFalsy();

    await waitFor(() => {
      expect(startLoginWithEmail).not.toHaveBeenCalled();
    });
  });

  /**
   * Test case: Should not dispatch startLoginWithEmail action on empty email and short password
   *
   * This test checks that when the email field is left empty and the password is shorter 
   * than the required length, the appropriate validation error messages are displayed, and 
   * the `startLoginWithEmail` action is not dispatched.
   *
   * @test {Empty Email and Short Password}
   */
  it('should not dispatch startLoginWithEmail action for empty email and short password', async () => {
    const { getByTestId, queryByText } = render(
      <Provider store={store}>
        <SigninScreen />
      </Provider>
    );

    const emailInput = getByTestId('email-input');
    const passwordInput = getByTestId('password-input');
    const signInButton = getByTestId('sign-in-button');

    await act(() => {
      fireEvent.changeText(emailInput, '');
    });
    await act(() => {
      fireEvent.changeText(passwordInput, 'pass');
    });
    await act(() => {
      fireEvent.press(signInButton);
    });

    const errorMessage1 = queryByText('Enter valid email.');
    expect(errorMessage1).toBeTruthy();

    const errorMessage2 = queryByText('Password cannot be empty');
    expect(errorMessage2).toBeFalsy();

    const errorMessage3 = queryByText('Password length cannot be less than 6.');
    expect(errorMessage3).toBeTruthy();

    await waitFor(() => {
      expect(startLoginWithEmail).not.toHaveBeenCalled();
    });
  });

  /**
   * Test case: Should not dispatch startLoginWithEmail action on invalid email and short password
   *
   * This test checks that when an invalid email format is entered and the password is shorter 
   * than the required length, the appropriate validation error messages are displayed, and the 
   * `startLoginWithEmail` action is not dispatched.
   *
   * @test {Invalid Email and Short Password}
   */
  it('should not dispatch startLoginWithEmail action for invalid email format and short password', async () => {
    const { getByTestId, queryByText } = render(
      <Provider store={store}>
        <SigninScreen />
      </Provider>
    );

    const emailInput = getByTestId('email-input');
    const passwordInput = getByTestId('password-input');
    const signInButton = getByTestId('sign-in-button');

    await act(() => {
      fireEvent.changeText(emailInput, 'invalid-email-format');
    });
    await act(() => {
      fireEvent.changeText(passwordInput, 'pass');
    });
    await act(() => {
      fireEvent.press(signInButton);
    });

    const errorMessage1 = queryByText('Enter valid email.');
    expect(errorMessage1).toBeTruthy();

    const errorMessage2 = queryByText('Password cannot be empty');
    expect(errorMessage2).toBeFalsy();

    const errorMessage3 = queryByText('Password length cannot be less than 6.');
    expect(errorMessage3).toBeTruthy();

    await waitFor(() => {
      expect(startLoginWithEmail).not.toHaveBeenCalled();
    });
  });




  // Additional test cases follow the same format, including tests for invalid email format,
  // short passwords, empty password fields, and other validation scenarios.

  /**
   * Test case: Should navigate to the Forgot Password screen on button press
   *
   * This test checks that pressing the "Forgot Password" button triggers navigation
   * to the Forgot Password screen.
   *
   * @test {Forgot Password Navigation}
   */
  it('should navigate to ForgotPasswordScreen on button press', async () => {
    const navigation = { navigate: jest.fn() };

    const { getByTestId } = render(
      <Provider store={store}>
        <SigninScreen navigation={navigation} />
      </Provider>
    );

    const forgotButton = getByTestId('forgot-button');

    await act(() => {
      fireEvent.press(forgotButton);
    });

    expect(navigation.navigate).toHaveBeenCalledWith('Forgot');
  });

  /**
   * Test case: Should navigate to the Sign-Up screen on button press
   *
   * This test checks that pressing the "Sign-Up" button triggers navigation
   * to the Sign-Up screen.
   *
   * @test {Sign-Up Navigation}
   */
  it('should navigate to SignUp on button press', async () => {
    const navigation = { navigate: jest.fn() };

    const { getByTestId } = render(
      <Provider store={store}>
        <SigninScreen navigation={navigation} />
      </Provider>
    );

    const signUpButton = getByTestId('sign-up-button');

    await act(() => {
      fireEvent.press(signUpButton);
    });

    expect(navigation.navigate).toHaveBeenCalledWith('SignUp');
  });

  /**
   * Test case: Should toggle the visibility of the password field when the lock icon is pressed
   *
   * This test checks that pressing the lock icon toggles the secure text entry property
   * of the password input field, allowing users to show or hide their password.
   *
   * @test {Toggle Password Visibility}
   */ 
  it('should toggle lock status on icon press', async () => {
    const { getByTestId } = render(
      <Provider store={store}>
        <SigninScreen />
      </Provider>
    );

    const passwordInput = getByTestId('password-input');
    const lockIcon = getByTestId('lock-icon');

    await act(() => {
      fireEvent.press(lockIcon);
    });
    expect(passwordInput.props.secureTextEntry).toBe(false);

    await act(() => {
      fireEvent.press(lockIcon);
    });
    expect(passwordInput.props.secureTextEntry).toBe(true);
  });

  
});
