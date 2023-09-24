jest.useFakeTimers()

import { act } from 'react-test-renderer'; 
import React from 'react';
import { Text, TextInput, ScrollView } from 'react-native';
import { HelperText } from 'react-native-paper';
import renderer from 'react-test-renderer';
import SigninScreen from '../src/screens/SigninScreen/index.jsx';

// Mock dependencies or Redux actions as needed
jest.mock('react-redux', () => ({
  useDispatch: jest.fn(),
  useSelector: jest.fn(),
}));
// mocks userActions.js module 
//    functions: setLoginWithEmail and SetAuthError 
jest.mock('../src/actions/userActions.js', () => ({
  startLoginWithEmail: jest.fn(),
  setAuthError: jest.fn(),
}));

// Test Suite
describe('SigninScreen Component', () => {
  // Test Case 1: if component renders correctly
  it('renders correctly', () => {
    // renders SigninScreen with mocked navigation prop and converts it to JSON to save Snapshot
    const tree = renderer.create(<SigninScreen navigation={{ navigate: jest.fn() }} />).toJSON();
    expect(tree).toMatchSnapshot(); // compares last Snapshot to detect changes in component code
  });


  // renders SigninScreen with mock navigation prop and get instance of component's rendered tree
  const component = renderer.create(<SigninScreen navigation={{ navigate: jest.fn() }} />);
  const instance = component.root;

  // Test Case 2: 
  it('displays an error message for an invalid email input', () => {

    // Find the TextInput components based on their labels
    const emailInput = instance.findByProps({ label: 'Email' });
    const passwordInput = instance.findByProps({ label: 'Password' });
    
    // Simulate user input for email and password
    act(() => {
      emailInput.props.onChangeText('invalid-email');
      passwordInput.props.onChangeText('password123');
    });
    
    // Ensure that the error message is displayed
    const emailErrorText = instance.findByProps({ testID: 'emailError' }).props.children;
    expect(emailErrorText).toEqual('Email is invalid!');

  });


  // Test Case 3:
  it('displays an error message for an invalid password input', () => {

    // Find the TextInput components based on their labels
    const emailInput = instance.findByProps({ label: 'Email' });
    const passwordInput = instance.findByProps({ label: 'Password' });
    
    // Simulate user input for email and password
    act(() => {
      emailInput.props.onChangeText('test@example.com');
      passwordInput.props.onChangeText('');
    });
    
    // Ensure that the error message is displayed for the password input
    const passwordErrorText = instance.findByProps({ testID: 'passwordError' }).props.children;
    expect(passwordErrorText).toEqual('Password cannot be empty');

  });
});
