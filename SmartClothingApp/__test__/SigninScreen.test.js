jest.useFakeTimers()

import React from 'react';
import { Alert } from 'react-native';
import { act } from 'react-test-renderer';
import { Text, TextInput, ScrollView } from 'react-native';
import { HelperText } from 'react-native-paper';
import renderer from 'react-test-renderer';
import { Button } from 'react-native-paper';
import { waitFor } from '@testing-library/react-native';
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

// Mock userActions.js module functions: startLoginWithEmail and setAuthError
jest.mock('../src/actions/userActions.js', () => ({
  startLoginWithEmail: jest.fn(),
  setAuthError: jest.fn(),
}));



// Test Suite
describe('SigninScreen Component', () => {
  // Mock Alert.alert to spy on it
  // jest.mock('react-native', () => {
  //   return {
  //     ...jest.requireActual('react-native'),
  //     Alert: {
  //       alert: jest.fn()
  //     },
  //   };
  // });

  // renders SigninScreen with mock navigation prop and get instance of component's rendered tree
  let component;
  let instance;

  beforeEach(() => {
    // Render SigninScreen with mock navigation prop and get the instance of the component's rendered tree
    component = renderer.create(<SigninScreen navigation={{ navigate: jest.fn() }} />);
    instance = component.root;
  });

  afterEach(() => {
    // Clean up after each test by resetting the alert spy
    jest.clearAllMocks();
  });

  // Test Case 1: if component renders correctly
  it('renders correctly', () => {
    // renders SigninScreen with mocked navigation prop and converts it to JSON to save Snapshot
    const tree = renderer.create(<SigninScreen navigation={{ navigate: jest.fn() }} />).toJSON();
    expect(tree).toMatchSnapshot(); // compares last Snapshot to detect changes in component code
  });


  // Test Case 2: 
  it('displays HelperText and Alert error for an invalid email input', async () => {
    // Find the TextInput components based on their labels
    let emailInput = instance.findByProps({ label: 'Email' });
    let passwordInput = instance.findByProps({ label: 'Password' });
    
    // Simulate user input for email and password
    await waitFor(() => {
      emailInput.props.onChangeText('invalid-email'); 
      passwordInput.props.onChangeText('password123');
    });

    jest.spyOn(Alert, 'alert');
    act(() => {
      let button = instance.findByProps({ ID: 'signInButton' });
      button.props.onPress();
    });

    // Check if Alert.alert was called with the expected arguments
    expect(Alert.alert).toHaveBeenCalledWith("Authentication Error", // Expected title
    "Please correct the following errors:\n\n" + // Expected message
    "Enter valid email.\n"+""
      ); 

    // Ensure that the error message is displayed
    let emailErrorText = instance.findByProps({ testID: 'emailError' }).props.children;
    let passwordErrorText = instance.findByProps({ testID: 'passwordError' }).props.children;
    expect(emailErrorText).toEqual('Enter valid email.');
    console.log(passwordErrorText)
    expect(passwordErrorText).toEqual('');
  });

   

  // Test Case 3:
  it('displays HelperText error for an invalid empty password input', async() => {
    // Find the TextInput components based on their labels
    let emailInput = instance.findByProps({ label: 'Email' });
    let passwordInput = instance.findByProps({ label: 'Password' });
    
    // Simulate user input for email and password
    await waitFor(() => {
      emailInput.props.onChangeText("Invalid@gmail.com");
      passwordInput.props.onChangeText('');
    });

    jest.spyOn(Alert, 'alert');
    act(() => {
      let button = instance.findByProps({ ID: 'signInButton' });
      button.props.onPress();
    });

    // Check if Alert.alert was called with the expected arguments
    expect(Alert.alert).toHaveBeenCalledWith("Authentication Error", // Expected title
    "Please correct the following errors:\n\n" + ""+// Expected message
    "Password cannot be empty"
    ); 
    
    // Ensure that the error message is displayed for the password input

    // Ensure that the error message is displayed for the password input
    const emailErrorText = instance.findByProps({ testID: 'emailError' }).props.children;
    const passwordErrorText = instance.findByProps({ testID: 'passwordError' }).props.children;
    expect(emailErrorText).toEqual('');
    expect(passwordErrorText).toEqual('Password cannot be empty');


  });
});
