import React from 'react';
import renderer from 'react-test-renderer';
import { render, fireEvent } from '@testing-library/react-native';
import SettingsScreen from '../src/screens/Settings/index.jsx';
import { Provider as ReduxProvider } from 'react-redux';
import { Provider as PaperProvider } from 'react-native-paper';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import configureStore from '../src/store.js';

// Mock Firebase Authentication
jest.mock('../firebaseConfig.js', () => ({
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

  jest.mock('../src/utils/localStorage.js', () => ({
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




const Stack = createStackNavigator();

describe('SettingsScreen', () => {
    let store;
    let component;
    let instance;

    beforeEach(() => {
        store = configureStore();
        component = renderer.create(
          <ReduxProvider store={store}>
            <PaperProvider>
              <NavigationContainer>
                <Stack.Navigator>
                  <Stack.Screen
                    name="Settings"
                    component={SettingsScreen}
                    initialParams={{ previousScreenTitle: 'Test Title' }}
                  />
                </Stack.Navigator>
              </NavigationContainer>
            </PaperProvider>
          </ReduxProvider>
        );
        instance = component.root;
      });

    it('renders correctly', () => {
        expect(component.toJSON()).toMatchSnapshot(); 
    });
    
    it('opens update email modal on button press', () => {
        const updateEmailButton = instance.findByProps({ title: "UPDATE EMAIL" });
        fireEvent.press(updateEmailButton);
        // Expect the state for the update email modal to be true
    });
    
    it('opens change password modal on button press', () => {
        const changePasswordButton = instance.findByProps({ title: "CHANGE PASSWORD" });
        fireEvent.press(changePasswordButton);
        // Expect the state for the change password modal to be true
    });
    
    it('opens delete account modal on button press', () => {
        const deleteAccountButton = instance.findByProps({ title: "DELETE ACCOUNT" });
        fireEvent.press(deleteAccountButton);
        // Expect the state for the delete account modal to be true
    });
  // Add more tests for navigation, modal interactions, and Redux actions
});
