//jest.useFakeTimers()

import React from 'react';
import { Alert } from 'react-native';
import { act } from 'react-test-renderer';
import renderer from 'react-test-renderer';
import { waitFor } from '@testing-library/react-native';
import SignupScreen from '../src/screens/SignupScreen/index.jsx';

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

  

// Test Suite - "Empty Pass" alert never shows up && HelperText always display errors in test (visibile=false when running APP)
describe('SignupScreen Error Alerts', () => {
  let component;
  let instance;

  // Render SignupScreen with mock navigation prop and get the instance of the component's rendered tree
  beforeEach(async() => {
    component = renderer.create(<SignupScreen navigation={{ navigate: jest.fn() }} />);
    instance = component.root;
  });

  // Clean up after each test by resetting the alert spy
  afterEach(() => {
    jest.clearAllMocks();
  });



  // Test Case 1
  if('renders correctly', () => {
    const tree = renderer.create(<SignupScreen navigation={{ navigate: jest.fn() }} />).toJSON();
    expect(tree).toMatchSnapshot();
  });



  // Test Case 2
  it('displays First Name alert error', async() => {
    let firstNameInput = instance.findByProps({ label: 'First Name' });
    let lastNameInput = instance.findByProps({ label: 'Last Name' });
    let emailInput = instance.findByProps({ label:'Email' });
    let passwordInput = instance.findByProps({ label:'Password' });
    let confirmPasswordInput = instance.findByProps({ label:'Confirm Password' });

    await waitFor(() => {
        firstNameInput.props.onChangeText('');
        lastNameInput.props.onChangeText('Sanchez');
        emailInput.props.onChangeText('Example123@Gmail.com');
        passwordInput.props.onChangeText('password123');
        confirmPasswordInput.props.onChangeText('password123');
    });

    jest.spyOn(Alert, 'alert');
    act(() => {
        let button = instance.findByProps({ children: 'Create Account' });
        button.props.onPress();
    });

    expect(Alert.alert).toHaveBeenCalledWith("Sign-up Error",
    "You must agree to the user agreement to create an account.\n\n" +
    "Please correct the following errors:\n" +
    "First name cannot be empty.\n"
    );

    // const firstNameTextError = instance.findByProps({ label: "First Name" }).props.children;
    // const lastNameTextError = instance.findByProps({ label: "Last Name" }).props.children;
    // expect(firstNameTextError).toEqual("Please enter first name.");
    // expect(lastNameTextError).toEqual("");
  });


  // Test Case 3
  it('displays First Name alert error', async() => {
    let firstNameInput = instance.findByProps({ label: 'First Name' });
    let lastNameInput = instance.findByProps({ label: 'Last Name' });
    let emailInput = instance.findByProps({ label:'Email' });
    let passwordInput = instance.findByProps({ label:'Password' });
    let confirmPasswordInput = instance.findByProps({ label:'Confirm Password' });

    await waitFor(() => {
        firstNameInput.props.onChangeText('Bob');
        lastNameInput.props.onChangeText('');
        emailInput.props.onChangeText('Example123@Gmail.com');
        passwordInput.props.onChangeText('password123');
        confirmPasswordInput.props.onChangeText('password123');
    });

    jest.spyOn(Alert, 'alert');
    act(() => {
        let button = instance.findByProps({ children: 'Create Account' });
        button.props.onPress();
    });

    expect(Alert.alert).toHaveBeenCalledWith("Sign-up Error",
    "You must agree to the user agreement to create an account.\n\n" +
    "Please correct the following errors:\n" +
    "Last name cannot be empty.\n"
    );
  });


  // Test Case 4
  it('displays First Name alert error', async() => {
    let firstNameInput = instance.findByProps({ label: 'First Name' });
    let lastNameInput = instance.findByProps({ label: 'Last Name' });
    let emailInput = instance.findByProps({ label:'Email' });
    let passwordInput = instance.findByProps({ label:'Password' });
    let confirmPasswordInput = instance.findByProps({ label:'Confirm Password' });

    await waitFor(() => {
        firstNameInput.props.onChangeText('Bob');
        lastNameInput.props.onChangeText('Sanchez');
        emailInput.props.onChangeText('invalid-email');
        passwordInput.props.onChangeText('password123');
        confirmPasswordInput.props.onChangeText('password123');
    });

    jest.spyOn(Alert, 'alert');
    act(() => {
        let button = instance.findByProps({ children: 'Create Account' });
        button.props.onPress();
    });

    expect(Alert.alert).toHaveBeenCalledWith("Sign-up Error",
    "You must agree to the user agreement to create an account.\n\n"+
    "Please correct the following errors:\n" +
    "Enter valid email.\n"
    );
  });


  // Test Case 4 - Empty Password gives 'Password length cannot be less than 6.' instead of 'Password cannot be empty'
  it('displays First Name alert error', async() => {
    let firstNameInput = instance.findByProps({ label: 'First Name' });
    let lastNameInput = instance.findByProps({ label: 'Last Name' });
    let emailInput = instance.findByProps({ label:'Email' });
    let passwordInput = instance.findByProps({ label:'Password' });
    let confirmPasswordInput = instance.findByProps({ label:'Confirm Password' });

    await waitFor(() => {
        firstNameInput.props.onChangeText('Bob');
        lastNameInput.props.onChangeText('Sanchez');
        emailInput.props.onChangeText('Example123@Gmail.com');
        passwordInput.props.onChangeText('');
        confirmPasswordInput.props.onChangeText('');
    });

    jest.spyOn(Alert, 'alert');
    act(() => {
        let button = instance.findByProps({ children: 'Create Account' });
        button.props.onPress();
    });

    expect(Alert.alert).toHaveBeenCalledWith("Sign-up Error",
    "You must agree to the user agreement to create an account.\n\n" +
    "Please correct the following errors:\n" +
    "Password length cannot be less than 6.\n"
    );
  });


  // Test Case 5 
  it('displays First Name alert error', async() => {
    let firstNameInput = instance.findByProps({ label: 'First Name' });
    let lastNameInput = instance.findByProps({ label: 'Last Name' });
    let emailInput = instance.findByProps({ label:'Email' });
    let passwordInput = instance.findByProps({ label:'Password' });
    let confirmPasswordInput = instance.findByProps({ label:'Confirm Password' });

    await waitFor(() => {
        firstNameInput.props.onChangeText('Bob');
        lastNameInput.props.onChangeText('Sanchez');
        emailInput.props.onChangeText('Example123@Gmail.com');
        passwordInput.props.onChangeText('123');
        confirmPasswordInput.props.onChangeText('123');
    });

    jest.spyOn(Alert, 'alert');
    act(() => {
        let button = instance.findByProps({ children: 'Create Account' });
        button.props.onPress();
    });

    expect(Alert.alert).toHaveBeenCalledWith("Sign-up Error",
    "You must agree to the user agreement to create an account.\n\n" +
    "Please correct the following errors:\n" +
    "Password length cannot be less than 6.\n"
    );
  });


  // Test Case 6
  it('displays First Name alert error', async() => {
    let firstNameInput = instance.findByProps({ label: 'First Name' });
    let lastNameInput = instance.findByProps({ label: 'Last Name' });
    let emailInput = instance.findByProps({ label:'Email' });
    let passwordInput = instance.findByProps({ label:'Password' });
    let confirmPasswordInput = instance.findByProps({ label:'Confirm Password' });

    await waitFor(() => {
        firstNameInput.props.onChangeText('Bob');
        lastNameInput.props.onChangeText('Sanchez');
        emailInput.props.onChangeText('Example123@Gmail.com');
        passwordInput.props.onChangeText('password');
        confirmPasswordInput.props.onChangeText('drowssap');
    });

    jest.spyOn(Alert, 'alert');
    act(() => {
        let button = instance.findByProps({ children: 'Create Account' });
        button.props.onPress();
    });

    expect(Alert.alert).toHaveBeenCalledWith("Sign-up Error",
    "You must agree to the user agreement to create an account.\n\n" +
    "Please correct the following errors:\n" +
    "Passwords did not match."
    );
  });


  // Test Case 7
  it('displays First Name alert error', async() => {
    let firstNameInput = instance.findByProps({ label: 'First Name' });
    let lastNameInput = instance.findByProps({ label: 'Last Name' });
    let emailInput = instance.findByProps({ label:'Email' });
    let passwordInput = instance.findByProps({ label:'Password' });
    let confirmPasswordInput = instance.findByProps({ label:'Confirm Password' });

    await waitFor(() => {
        firstNameInput.props.onChangeText('');
        lastNameInput.props.onChangeText('');
        emailInput.props.onChangeText('invalid-email');
        passwordInput.props.onChangeText('pass');
        confirmPasswordInput.props.onChangeText('drowssap');
    });

    jest.spyOn(Alert, 'alert');
    act(() => {
        let button = instance.findByProps({ children: 'Create Account' });
        button.props.onPress();
    });

    expect(Alert.alert).toHaveBeenCalledWith("Sign-up Error",
    "You must agree to the user agreement to create an account.\n\n" +
    "Please correct the following errors:\n" +
    "First name cannot be empty.\n" +
    "Last name cannot be empty.\n" +
    "Enter valid email.\n" +
    "Password length cannot be less than 6.\n" +
    "Passwords did not match."
    );
  });

});