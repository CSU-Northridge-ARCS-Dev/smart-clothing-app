jest.useFakeTimers()

import React from 'react';
import { render } from '@testing-library/react-native';
import {fireEvent } from '@testing-library/react-native';
import { act } from 'react-test-renderer';
import { getByText, getByProps, waitFor } from '@testing-library/react-native';
import {NavigationContainer} from '@react-navigation/native';
import {createStackNavigator} from '@react-navigation/stack'; 
import configureStore from '../../src/store.js';
import {Provider as StoreProvider } from 'react-redux'; 
import {PaperProvider}  from "react-native-paper";
import HomeScreen from '../../src/screens/HomeScreen/index.jsx'
import SettingsScreen from '../../src/screens/Settings/index.jsx'



// Mock Firebase Authentication
jest.mock('../../firebaseConfig.js', () => ({
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
        },
        email: 'test1@gmail.com',
        password: 'password123'
      },
    },
  }));

  jest.mock('../../src/utils/localStorage.js', () => ({
    AsyncStorage: jest.fn(),
    storeUID: jest.fn(),
    getUID: jest.fn(),
  }));

  jest.mock('firebase/auth', () => ({
    initializeApp: jest.fn(),
    registerVersion: jest.fn(),
    getAuth: jest.fn(),
    getDatabase: jest.fn(),
    signInWithEmailAndPassword: jest.fn(() => Promise.resolve({ 
      user: {
            uid: 'nvQpwMHj7eUKfsyEhVloGM7hvji2',
            email: 'test1@gmail.com',
            password: 'password123'
          } 
        })),
  }))

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


// Create a StackNavigator with your Sign-In and Dashboard screens
const Stack = createStackNavigator();

// A test component that includes navigation
const TestComponent1 = () => (
  <NavigationContainer>
    <Stack.Navigator initialRouteName="Dashboard">
      <Stack.Screen name="Dashboard" component={HomeScreen} />
      <Stack.Screen name="Settings" component={SettingsScreen} />
    </Stack.Navigator>
  </NavigationContainer>
);

const TestComponent2 = () => (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Settings">
        <Stack.Screen 
            name="Settings" 
            component={SettingsScreen} 
            initialParams={{ previousScreenTitle: 'Dashboard' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );


describe('Dashboard to Settings Integration Test', () => {
    let store;

    it('Should navigate from Dashboard to Settings Screen', async() => {
        store = configureStore();

        const { getAllByTestId, getByText } = render(
            <StoreProvider store={store}>
            <PaperProvider> 
                <TestComponent1 />
            </PaperProvider>
            </StoreProvider>
        );

        const dropDownMenu = getAllByTestId('icon-button');
        await act(() => {
            fireEvent.press(dropDownMenu[0])
        });

        const menuItem = getAllByTestId('menu-item');
        await act(() => {
            fireEvent.press(menuItem[1])
        });

        await waitFor(() => {
            expect(getByText('Settings')).toBeTruthy();
        });
    });


    it('Should navigate from main Settings Screen to Update Email Screen', async() => {
        store = configureStore();

        const { getByText, getAllByText } = render(
            <StoreProvider store={store}>
            <PaperProvider> 
                <TestComponent2 />
            </PaperProvider>
            </StoreProvider>
        );

        const updateEmailTextElement = getByText('UPDATE EMAIL');
        const updateEmailView = updateEmailTextElement.parent || updateEmailTextElement;

        //console.log(updateEmailView.length);
        await act(() => {
            fireEvent.press(updateEmailView);
        });

        const updateEmailElements = getAllByText('Update Email');
        const confirmEmailElements = getAllByText('Confirm Email');
        const passwordElement = getAllByText('Password');

        await waitFor(() => {
            expect(updateEmailElements[0]).toBeTruthy();
        });
        await waitFor(() => {
            expect(confirmEmailElements[0]).toBeTruthy();
        });
        await waitFor(() => {
            expect(passwordElement[0]).toBeTruthy();
        });

    });


    it('Should navigate from main Settings Screen to Change Password Screen', async() => {
        store = configureStore();

        const { getByText, getAllByText } = render(
            <StoreProvider store={store}>
            <PaperProvider> 
                <TestComponent2 />
            </PaperProvider>
            </StoreProvider>
        );

        const changePasswordTextElement = getByText('CHANGE PASSWORD');
        const changePasswordView = changePasswordTextElement.parent || changePasswordTextElement;

        await act(() => {
            fireEvent.press(changePasswordView);
        });

        const currentPasswordElements = getAllByText('Current Password');
        const newPasswordElements = getAllByText('New Password');
        const confirmPasswordElements = getAllByText('Confirm Password');

        await waitFor(() => {
            expect(currentPasswordElements[0]).toBeTruthy();
        });
        await waitFor(() => {
            expect(newPasswordElements[0]).toBeTruthy();
        });
        await waitFor(() => {
            expect(confirmPasswordElements[0]).toBeTruthy();
        });
    });


    // it('Should navigate from main Settings Screen to Delete Data Screen', async() => {
    //     store = configureStore();

    //     const { getByText, getAllByText } = render(
    //         <StoreProvider store={store}>
    //         <PaperProvider> 
    //             <TestComponent2 />
    //         </PaperProvider>
    //         </StoreProvider>
    //     );

    //     const deleteDataTextElement = getByText('DELETE DATA');
    //     const deleteDataView = deleteDataTextElement.parent || deleteDataTextElement;

    //     await act(() => {
    //         fireEvent.press(deleteDataView);
    //     });

    //     const deleteDataElements = getAllByText('Delete Data');

    //     await waitFor(() => {
    //         expect(deleteDataElements[0]).toBeTruthy();
    //     });
    // });


    it('Should navigate from main Settings Screen to Delete Account Screen', async() => {
        store = configureStore();

        const { getByText, getAllByText } = render(
            <StoreProvider store={store}>
            <PaperProvider> 
                <TestComponent2 />
            </PaperProvider>
            </StoreProvider>
        );

        const deleteAccountTextElement = getByText('DELETE ACCOUNT');
        const deleteAccountView = deleteAccountTextElement.parent || deleteAccountTextElement;

        await act(() => {
            fireEvent.press(deleteAccountView);
        });

        const deleteAccountPrompt = getAllByText('Are you sure you want to delete your account? Once you delete your account, you cannot recover it.');

        await waitFor(() => {
            expect(deleteAccountPrompt[0]).toBeTruthy();
        });
    });
});