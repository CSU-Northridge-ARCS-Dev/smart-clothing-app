jest.useFakeTimers()

import React, {useState} from 'react';
import { render } from '@testing-library/react-native';
import {fireEvent } from '@testing-library/react-native';
import { act } from 'react-test-renderer';
import { getByText, getByProps, waitFor } from '@testing-library/react-native';
import {NavigationContainer} from '@react-navigation/native';
import {createStackNavigator} from '@react-navigation/stack'; 
import configureStore from '../../src/store.js';
import rootReducer from '../../src/store.js'; 
import AppRouter from '../../src/navigation/index.js';
import {Provider as StoreProvider } from 'react-redux'; 
import {PaperProvider}  from "react-native-paper";



// Mock Firebase Authentication
jest.mock('../../firebaseConfig.js', () => ({
    auth: {
      signupWithEmail: jest.fn(() => Promise.resolve()),
      startUpdateProfile: jest.fn(() => Promise.resolve()),
      startLoadUserData: jest.fn(() => Promise.resolve()),
      startUpdateUserData: jest.fn(() => Promise.resolve()),
      updateUserMetricsData: jest.fn(() => Promise.resolve()),
      currentUser: {
        uid: {
          "email": "test100@gmail.com", 
          "firstName": "LordTest",
          "lastName": "Smith", 
          "uuid": "nvQpwMHj7eUKfsyEhVloGM7hvji2"
          //uuid: null
        },
        email: 'test100@gmail.com',
        password: 'password123'
      },
    },
}));

jest.mock('../../src/utils/localStorage.js', () => ({
  AsyncStorage: jest.fn(),
}));

// jest.mock('../../src/actions/toastActions.js', () => ({
//     toastError: jest.fn(() => Promise.resolve()),
// }))
  
jest.mock('firebase/auth', () => ({
    initializeApp: jest.fn(),
    updateProfile: jest.fn(() => Promise.resolve({ 
        firstName: "LordTest",
        lastName: "Smith", 
      })),
    registerVersion: jest.fn(),
    getAuth: jest.fn(),
    getDatabase: jest.fn(),
    createUserWithEmailAndPassword: jest.fn(() => Promise.resolve({ 
      user: {
            //uid: null,
            uid: 'nvQpwMHj7eUKfsyEhVloGM7hvji2',
            email: 'test100@gmail.com',
            password: 'password123'
          } 
    })),
}))

// jest.mock('../../src/actions/appActions', () => ({
//     userMetricsDataModalVisible: jest.fn().mockReturnValue({
//         visibility: true,
//         isFromSignUpScreen: true,
//     }),
// }));
jest.mock('../../src/actions/appActions.js', () => {
    return {
      ...jest.requireActual('../../src/actions/appActions.js'), // if you want to keep the original implementations of other functions
      userMetricsDataModalVisible: jest.fn((visibility, isFromSignUpScreen = true) => {
        return {
          type: 'USER_METRICS_DATA_MODAL_VISIBLE',
          payload: {
            visibility,
            isFromSignUpScreen,
          },
        };
      })
    };
  });

  
  
jest.mock('firebase/firestore', () => ({
    collection: jest.fn(() => ({ add: jest.fn() })),
    addDoc: jest.fn(),
    setDoc: jest.fn(),
    doc: jest.fn(() => ({ setDoc: jest.fn() })),
    updateDoc: jest.fn(),
    getDoc: jest.fn().mockReturnValue({
      exists: jest.fn().mockReturnValue(true), // Mock 'exists' as a function
      data: jest.fn().mockReturnValue({
        height: "1111",
        weight: "11",
        age: "111",
        gender: "male",
        sports: "running",
      }), // Mock 'data' as a function
    }),
}))

jest.mock('react-native-vector-icons/MaterialIcons', () => require('../__mocks__/react-native-vector-icons').MaterialIcons);
jest.mock('react-native-vector-icons/FontAwesome5', () => require('../__mocks__/react-native-vector-icons').FontAwesome5);
jest.mock('@shopify/react-native-skia', () => require('../__mocks__/@shopify__react-native-skia'));
jest.mock('../../src/components/visualizations/ActivityRings/Ring.jsx', () => {
  return jest.fn(({ ring, center, strokeWidth, scale }) => (
    <div>
      Mock Ring Component - {ring.size}, {center.x}, {center.y}, {strokeWidth}, {scale}
    </div>
  ));
});
jest.mock('victory-native', () => {
  // Mock the specific components and functionalities you use
  const MockBar = () => <div>Mock Bar</div>;
  const MockCartesianChart = () => <div>Mock CartesianChart</div>;
  const MockUseChartPressState = () => ({ /* Mock return value */ });

  return {
    Bar: MockBar,
    CartesianChart: MockCartesianChart,
    useChartPressState: MockUseChartPressState,
  };
});
jest.mock('../../src/actions/appActions', () => ({
  userMetricsDataModalVisible: jest.fn().mockReturnValue({
    type: 'USER_METRICS_DATA_MODAL_VISIBLE',
    payload: {
      visibility: true,
      isFromSignUpScreen: true,
  }}),
}));
// jest.mock('../../src/actions/appActions', () => ({
//   userMetricsDataModalVisible: jest.fn().mockReturnValue({
//     visibility: true,
//     isFromSignUpScreen: true,
//   }),
// }));
  
  
  
  // Create a StackNavigator with your Sign-In and Dashboard screens
const Stack = createStackNavigator();
  
// Create Test Component - Mimics App.js - no navigation, instead uses AuthStack to go between sign-in page and home-screen
function TestComponent() {
    return (
      <NavigationContainer>
        <AppRouter />
      </NavigationContainer>
    );
}


describe('SignUpToHome Integration Test', () => {
    it('should navigate from Sign-In to Sign-Up to Dashboard', async () => {
  
        const store = configureStore();
    
        // Wrap TestComponent with Providers and render
        const { getAllByTestId, getByText, getAllByRole } = render(
            <StoreProvider store={store}>
            <PaperProvider >
                <TestComponent />
            </PaperProvider>
            </StoreProvider>
        );
    
        // 1) Start in Sign In Screen

        // Find "Don't have an account? Sign Up"
        var buttons = getAllByTestId('button');
        console.log(buttons.length);
        const dontHaveAccountLink =  buttons[2];
    
        // Click "Don't have an account? Sign Up"
        await act(() => {
            fireEvent.press(dontHaveAccountLink);
        });
    
        // Navigates to SignUp after successful login
        await waitFor(() => {
            expect(getByText('Sign Up')).toBeTruthy();
        });


        // 2) SignUp renders here:

        // Find Inputs
        const inputFields = getAllByTestId('text-input-outlined');
        console.log(inputFields.length);
        const firstNameInput =  inputFields[0];
        const lastNameInput =  inputFields[1];
        const emailInput = inputFields[2]; 
        const passwordInput = inputFields[3];  
        const confirmPasswordInput =  inputFields[4];



        // Find "Don't have an account? Sign Up"
        buttons = getAllByTestId('button');
        console.log(buttons.length);
        var signUpButton =  buttons[1];


        // Enter credentials and press Sign In Button
        await act(() => {
            fireEvent.changeText(firstNameInput, 'LordTest');
        });
        await act(() => {
            fireEvent.changeText(lastNameInput, 'Smith');
        });
        await act(() => {
            fireEvent.changeText(emailInput, 'test100@gmail.com');
        });
        await act(() => {
            fireEvent.changeText(passwordInput, 'password123');
        });
        await act(() => {
            fireEvent.changeText(confirmPasswordInput, 'password123');
        });

        // Find TOS Checkmark 
        var userAgreements = getAllByRole('checkbox');
        // console.log(userAgreements.length);
        // await act(() => {
        //     userAgreements.forEach(checkbox => fireEvent.press(checkbox));
        // });
        expect(userAgreements[0].props.accessibilityState.checked).toBe(false);
        await act(() => {
            fireEvent.press(userAgreements[0])
        });
        // console.log(userAgreements.length);

        var userAgreements = getAllByRole('checkbox');
        // console.log(userAgreements.length);
        await act(() => {
            fireEvent.press(userAgreements[0])
        });
        await waitFor(() => {
            expect(userAgreements[0].props.accessibilityState.checked).toBe(true);
        });
        // await act(() => {
        //     fireEvent.press(userAgreements[1])
        // });
        buttons = getAllByTestId('button');
        console.log(buttons.length);
        signUpButton =  buttons[1];

        await act(() => {
            fireEvent.press(signUpButton);
        });
    
        // Navigates to Dashboard after successful login
        await waitFor(() => {
            expect(getByText('Dashboard')).toBeTruthy();
        });
    });
});