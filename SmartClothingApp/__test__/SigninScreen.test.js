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
describe('SigninScreen Error Alerts', () => {
  // renders SigninScreen with mock navigation prop and get instance of component's rendered tree
  let component;
  let instance;

  // Render SigninScreen with mock navigation prop and get the instance of the component's rendered tree
  beforeEach(() => {
    component = renderer.create(<SigninScreen navigation={{ navigate: jest.fn() }} />);
    instance = component.root;
  });

  // Clean up after each test by resetting the alert spy
  afterEach(() => {
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

    // Track for any Alerts
    jest.spyOn(Alert, 'alert');
    // Simulate pressing sign in button
    act(() => {
      let button = instance.findByProps({ ID: 'signInButton' });
      button.props.onPress();
    });

    // Ensure expected alert error message is displayed
    expect(Alert.alert).toHaveBeenCalledWith("Authentication Error", 
    "Please correct the following errors:\n\n" + 
    "Enter valid email.\n"+""
      ); 

    // Ensure appropriate error message is displayed in HelperText
    let emailErrorText = instance.findByProps({ testID: 'emailError' }).props.children;
    let passwordErrorText = instance.findByProps({ testID: 'passwordError' }).props.children;
    expect(emailErrorText).toEqual('Enter valid email.');
    expect(passwordErrorText).toEqual('');
  });

   

  // Test Case 3:
  it('displays HelperText and Alert error for an invalid empty password input', async() => {
    let emailInput = instance.findByProps({ label: 'Email' });
    let passwordInput = instance.findByProps({ label: 'Password' });
    
    await waitFor(() => {
      emailInput.props.onChangeText("Example@gmail.com");
      passwordInput.props.onChangeText('');
    });

    jest.spyOn(Alert, 'alert');
    act(() => {
      let button = instance.findByProps({ ID: 'signInButton' });
      button.props.onPress();
    });

    expect(Alert.alert).toHaveBeenCalledWith("Authentication Error", 
    "Please correct the following errors:\n\n" + ""+
    "Password cannot be empty"
    ); 
    
    const emailErrorText = instance.findByProps({ testID: 'emailError' }).props.children;
    const passwordErrorText = instance.findByProps({ testID: 'passwordError' }).props.children;
    expect(emailErrorText).toEqual('');
    expect(passwordErrorText).toEqual('Password cannot be empty');
  });



  // Test Case 4:
  it('displays HelperText and Alert error for an invalid passowrd below 6 characters', async () => {
    let emailInput = instance.findByProps({ label: 'Email' });
    let passwordInput = instance.findByProps({ label: 'Password' });

    await waitFor(() => {
      emailInput.props.onChangeText("Example@gmail.com");
      passwordInput.props.onChangeText('short');
    });

    jest.spyOn(Alert, 'alert');
    act(() => {
       let button = instance.findByProps({ ID: 'signInButton' });
       button.props.onPress();
    });

    expect(Alert.alert).toHaveBeenCalledWith("Authentication Error", 
    "Please correct the following errors:\n\n" + ""+
    "Password length cannot be less than 6."
    ); 

    const emailErrorText = instance.findByProps({ testID: 'emailError' }).props.children;
    const passwordErrorText = instance.findByProps({ testID: 'passwordError' }).props.children;
    expect(emailErrorText).toEqual('');
    expect(passwordErrorText).toEqual('Password length cannot be less than 6.');
  });



  // Test Case 5:
  it('displays HelperText and Alert error for both invalid passowrd and invalid email', async () => {
    let emailInput = instance.findByProps({ label: 'Email' });
    let passwordInput = instance.findByProps({ label: 'Password' });
    
    await waitFor(() => {
      emailInput.props.onChangeText("Invalid-Email");
      passwordInput.props.onChangeText('short');
    });

    jest.spyOn(Alert, 'alert');
    act(() => {
       let button = instance.findByProps({ ID: 'signInButton' });
       button.props.onPress();
    });

    expect(Alert.alert).toHaveBeenCalledWith("Authentication Error", 
    "Please correct the following errors:\n\n" + 
    "Enter valid email.\n" +
    "Password length cannot be less than 6."
    ); 

    const emailErrorText = instance.findByProps({ testID: 'emailError' }).props.children;
    const passwordErrorText = instance.findByProps({ testID: 'passwordError' }).props.children;
    expect(emailErrorText).toEqual('Enter valid email.');
    expect(passwordErrorText).toEqual('Password length cannot be less than 6.');
  });


  // Test Case 6: Successful sign-in without errors
  it('successfully signs in without errors', async () => {
    // Find the TextInput components based on their labels
    let emailInput = instance.findByProps({ label: 'Email' });
    let passwordInput = instance.findByProps({ label: 'Password' });
    // Simulate user input for email and password
    await waitFor(() => {
      emailInput.props.onChangeText('valid@gmail.com');
      passwordInput.props.onChangeText('password123');
    });
    // Ensure that Alert.alert is not called (no errors expected)
    expect(Alert.alert).not.toHaveBeenCalled();
  });
});
