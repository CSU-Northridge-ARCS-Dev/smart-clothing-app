import React from 'react';
import { render, fireEvent, waitFor, cleanup  } from '@testing-library/react-native';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import { act } from 'react-test-renderer';
import thunk from 'redux-thunk';
import SigninScreen from '../../../../src/screens/SigninScreen';
import { startLoginWithEmail } from '../../../../src/actions/userActions';


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

describe('SigninScreen/Auth Integration Test', () => {
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
