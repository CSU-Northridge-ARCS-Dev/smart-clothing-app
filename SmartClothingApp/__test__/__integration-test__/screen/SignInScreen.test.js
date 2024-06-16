import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import SigninScreen from '../../screens/SigninScreen';
import { startLoginWithEmail } from '../../actions/userActions';

jest.mock('../../actions/userActions');

const mockStore = configureStore([]);

describe('SigninScreen Integration Test', () => {
  let store;

  beforeEach(() => {
    store = mockStore({
      user: {
        isAuthenticated: false,
        error: null,
      },
    });
  });

  it('should update email and password fields', () => {
    const { getByPlaceholderText } = render(
      <Provider store={store}>
        <SigninScreen />
      </Provider>
    );

    const emailInput = getByPlaceholderText('Email');
    const passwordInput = getByPlaceholderText('Password');

    fireEvent.changeText(emailInput, 'test@example.com');
    fireEvent.changeText(passwordInput, 'password123');

    expect(emailInput.props.value).toBe('test@example.com');
    expect(passwordInput.props.value).toBe('password123');
  });

  it('should display error message for invalid email', () => {
    const { getByPlaceholderText, getByText } = render(
      <Provider store={store}>
        <SigninScreen />
      </Provider>
    );

    const emailInput = getByPlaceholderText('Email');
    const signInButton = getByText('Sign In');

    fireEvent.changeText(emailInput, 'invalid-email');
    fireEvent.press(signInButton);

    const errorMessage = getByText('Enter valid email.');
    expect(errorMessage).toBeTruthy();
  });

  it('should dispatch startLoginWithEmail action on valid input', async () => {
    const { getByPlaceholderText, getByText } = render(
      <Provider store={store}>
        <SigninScreen />
      </Provider>
    );

    const emailInput = getByPlaceholderText('Email');
    const passwordInput = getByPlaceholderText('Password');
    const signInButton = getByText('Sign In');

    fireEvent.changeText(emailInput, 'test@example.com');
    fireEvent.changeText(passwordInput, 'password123');
    fireEvent.press(signInButton);

    await waitFor(() => {
      expect(startLoginWithEmail).toHaveBeenCalledWith('test@example.com', 'password123');
    });
  });

  it('should navigate to ForgotPasswordScreen on button press', () => {
    const navigation = { navigate: jest.fn() };

    const { getByText } = render(
      <Provider store={store}>
        <SigninScreen navigation={navigation} />
      </Provider>
    );

    const forgotButton = getByText('Forgot your Username/Password ?');
    fireEvent.press(forgotButton);

    expect(navigation.navigate).toHaveBeenCalledWith('Forgot');
  });

  it('should toggle lock status on icon press', () => {
    const { getByPlaceholderText, getByTestId } = render(
      <Provider store={store}>
        <SigninScreen />
      </Provider>
    );

    const passwordInput = getByPlaceholderText('Password');
    const lockIcon = getByTestId('lock-icon');

    fireEvent.press(lockIcon);
    expect(passwordInput.props.secureTextEntry).toBe(false);

    fireEvent.press(lockIcon);
    expect(passwordInput.props.secureTextEntry).toBe(true);
  });
});
