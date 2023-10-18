import React from 'react';
//import { auth } from '../../firebaseConfig.js';
import { auth } from '../firebaseConfig.js';
import { render, fireEvent } from '@testing-library/react-native';
import { Provider } from 'react-redux'; 
import { getByText, getByProps, waitFor } from '@testing-library/react-native';
import { NavigationContainer } from '@react-navigation/native'; // Import NavigationContainer
import { createStackNavigator } from '@react-navigation/stack'; // Import StackNavigator
import SigninScreen from '../src/screens/SigninScreen/index.jsx'; // Import the component to be tested
import HomeScreen from '../src/screens/HomeScreen/index.jsx';
import { startLoginWithEmail } from '../src/actions/userActions.js'; 
import configureStore from '../src/store';


// Mock Firebase Authentication
jest.mock('../firebaseConfig.js', () => ({
  auth: {
    loginWithEmail: jest.fn(),
    currentUser: {
      email: "test1@gmail.com",
      password: "password123",
    },
  },
}));

jest.mock('firebase/auth', () => ({
  initializeApp: jest.fn(),
  registerVersion: jest.fn(),
  getAuth: jest.fn(),
  getDatabase: jest.fn(),
}))

jest.mock('firebase/firestore', () => ({
  collection: jest.fn(),
  addDoc: jest.fn(),
  setDoc: jest.fn(),
  doc: jest.fn(),
  updateDoc: jest.fn(),
  getDoc: jest.fn(),
}))



// Create a StackNavigator with your Sign-In and Dashboard screens
const Stack = createStackNavigator();

// A test component that includes navigation
const TestComponent = () => (
  <NavigationContainer>
    <Stack.Navigator initialRouteName="SignIn">
      <Stack.Screen name="SignIn" component={SigninScreen} />
      <Stack.Screen name="Dashboard" component={HomeScreen} />
    </Stack.Navigator>
  </NavigationContainer>
);

describe('MyComponent Integration Test', () => {

  let store;

  beforeAll(() => {
    store = configureStore(); // Create the Redux store
  });
  

  it('should navigate from Sign-In to Dashboard', async () => {
    const { findByProps } = render(
      <Provider store={store}> {/* Wrap your component with the Redux Provider */}
        <TestComponent />
      </Provider>
    );

    // Interaction code specific to the Sign-In screen
    const emailInput = await findByProps({ label: 'Email' });
    const passwordInput = await findByProps({ label: 'Password' });
    const signInButton = await getByProps({ ID: 'signInButton' });

    // Simulate user input for email and password
    await waitFor(() => {
      emailInput.props.onChangeText('valid-email@gmail.com'); 
      passwordInput.props.onChangeText('password123');
      fireEvent.press(signInButton);
    });


    await waitFor(() => {
      expect(getByText('Dashboard')).toBeTruthy();
    });
  });
});
