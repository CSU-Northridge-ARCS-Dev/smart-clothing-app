//jest.useFakeTimers()

import React from 'react';
import { Alert } from 'react-native';
import { act } from 'react-test-renderer';
import { Text, TextInput, ScrollView } from 'react-native';
import { HelperText } from 'react-native-paper';
import renderer from 'react-test-renderer';
import { Button } from 'react-native-paper';
import { waitFor } from '@testing-library/react-native';
import SigninScreen from '../src/screens/SigninScreen/index.jsx';
import { useDispatch } from 'react-redux';
import { startLoginWithEmail } from '../src/actions/userActions.js';



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

// Mock userActions.js module functions: startLoginWithEmail and setAuthError
jest.mock('../src/actions/userActions.js', () => ({
  startLoginWithEmail: jest.fn().mockResolvedValueOnce(), // Mock to resolve (successful sign-in)
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
    const helperTextElement = instance.findByType(HelperText);
    const errorElements = instance.findAllByProps({ type: 'error' });
    const firstErrorElement = errorElements[0];
    const firstEmailErrorText = firstErrorElement.props.children;

    // Password Text Field doesn't have HelperText anymore 
    // const secondErrorElement = errorElements[1];
    // const secondEmailErrorText = secondErrorElement.props.children;
    

    expect(firstEmailErrorText).toEqual('Email is invalid!');
    expect(helperTextElement.props.visible).toBe(true);
    //expect(secondEmailErrorText).toEqual('');
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
    
    // Ensure appropriate error message is displayed in HelperText
    const helperTextElement = instance.findByType(HelperText);
    const errorElements = instance.findAllByProps({ type: 'error' });
    const firstErrorElement = errorElements[0];
    const firstEmailErrorText = firstErrorElement.props.children;

    // Password Text Field doesn't have HelperText anymore 
    // const secondErrorElement = errorElements[1];
    // const secondEmailErrorText = secondErrorElement.props.children;
    
    expect(firstEmailErrorText).toEqual('Email is invalid!');
    expect(helperTextElement.props.visible).toBe(false);
    //expect(secondEmailErrorText).toEqual('Password cannot be empty');
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

    // Ensure appropriate error message is displayed in HelperText
    const helperTextElement = instance.findByType(HelperText);
    const errorElements = instance.findAllByProps({ type: 'error' });
    const firstErrorElement = errorElements[0];
    const firstEmailErrorText = firstErrorElement.props.children;

    // Password Text Field doesn't have HelperText anymore 
    // const secondErrorElement = errorElements[1];
    // const secondEmailErrorText = secondErrorElement.props.children;

    expect(firstEmailErrorText).toEqual('Email is invalid!');
    expect(helperTextElement.props.visible).toBe(false);
    //expect(secondEmailErrorText).toEqual('Password cannot be empty');
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

    // Ensure appropriate error message is displayed in HelperText
    const helperTextElement = instance.findByType(HelperText);
    const errorElements = instance.findAllByProps({ type: 'error' });
    const firstErrorElement = errorElements[0];
    const firstEmailErrorText = firstErrorElement.props.children;

    // Password Text Field doesn't have HelperText anymore 
    // const secondErrorElement = errorElements[1];
    // const secondEmailErrorText = secondErrorElement.props.children;

    expect(firstEmailErrorText).toEqual('Email is invalid!');
    expect(helperTextElement.props.visible).toBe(true);
    //expect(secondEmailErrorText).toEqual('Password cannot be empty');
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

//Test Case 7:
it('navigates to Forgot Password screen when "Forgot" button is pressed', async () => {
  // Mock the navigation object
  const mockNavigate = jest.fn();
  const navigation = { navigate: mockNavigate };

  // Render the component with the mocked navigation prop
  component = renderer.create(<SigninScreen navigation={navigation} />);
  instance = component.root;

  // Find the "Forgot" button by its label
  const forgotButton = instance.findByProps({ children: "Forgot your Username/Password ?" });

  // Simulate pressing the "Forgot" button
  act(() => {
    forgotButton.props.onPress();
  });

  // Ensure that navigation.navigate was called with the correct screen name
  expect(mockNavigate).toHaveBeenCalledWith('Forgot');
});


//Testcase 8
it('successfully signs in without errors', async () => {
  // Mock the navigation object
  const mockNavigate = jest.fn();
  const navigation = { navigate: mockNavigate };

  // Mock the useDispatch function
  const mockDispatch = jest.fn();
  const mockStartLoginWithEmail = jest.fn(); // Mock the startLoginWithEmail function

  // Set up useDispatch to return the mockDispatch function
  useDispatch.mockReturnValueOnce(mockDispatch);

  // Render the component with the mocked navigation prop
  component = renderer.create(<SigninScreen navigation={navigation} />);
  instance = component.root;

  // Find the TextInput components based on their labels
  const emailInput = instance.findByProps({ label: 'Email' });
  const passwordInput = instance.findByProps({ label: 'Password' });

  // Simulate user input for email and password
  await act(async () => {
    emailInput.props.onChangeText('valid@gmail.com');
    passwordInput.props.onChangeText('password123');
  });

  // Find the "Sign In" button
  const signInButton = instance.findByProps({ ID: 'signInButton' });

  // Mock the startLoginWithEmail function to resolve (successful sign-in)
  startLoginWithEmail.mockResolvedValueOnce();

  // Simulate pressing the "Sign In" button
  await act(async () => {
    signInButton.props.onPress();
  });

  // Ensure that navigation.navigate was not called (no navigation after successful sign-in)
  expect(mockNavigate).not.toHaveBeenCalled();

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
