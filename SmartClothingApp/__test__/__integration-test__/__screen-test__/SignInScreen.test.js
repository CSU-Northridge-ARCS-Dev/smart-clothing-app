import React from 'react';
import { render, fireEvent, waitFor, cleanup  } from '@testing-library/react-native';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import { act } from 'react-test-renderer';
import thunk from 'redux-thunk';
import SigninScreen from '../../../src/screens/SigninScreen';
import { startLoginWithEmail } from '../../../src/actions/userActions';


jest.mock('../../../src/utils/localStorage.js', () => ({
  AsyncStorage: jest.fn(),
  storeUID: jest.fn(),
}));

jest.mock('firebase/firestore', () => ({
  collection: jest.fn(() => ({ add: jest.fn() })),
  addDoc: jest.fn(),
  setDoc: jest.fn(),
}))

jest.mock('../../../firebaseConfig.js', () => ({
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

jest.mock('../../../src/actions/userActions.js', () => ({
  startLoginWithEmail: jest.fn((email, password) => {
    return () => Promise.resolve();
  }),
  setAuthError: jest.fn(),
  
}));



const middlewares = [thunk];
const mockStore = configureStore(middlewares);

describe('SigninScreen Integration Test', () => {
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

  it('should update email and password fields', async () => {
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

  it('should display error message for invalid email', async () => {
    const { getByTestId, getByText } = render(
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

    const errorMessage = getByText('Enter valid email.');
    expect(errorMessage).toBeTruthy();
  });

  it('should dispatch startLoginWithEmail action on valid input', async () => {
    const { getByTestId } = render(
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

    await waitFor(() => {
      expect(startLoginWithEmail).toHaveBeenCalledWith('test@example.com', 'password123');
    });
  });

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
