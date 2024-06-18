// userActions.integration.test.js
import React from 'react';
import renderer, { act } from 'react-test-renderer';
import { ScrollView, View } from 'react-native';
import { Provider as StoreProvider } from 'react-redux';
import { Provider as PaperProvider } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { SafeAreaView } from "react-native";
import { NavigationContainer, useNavigation } from '@react-navigation/native';


import { render, screen, fireEvent, waitFor, getByText } from '@testing-library/react-native';
import { Provider } from 'react-redux';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import App from '../../App'; // Assuming App is the root component
import AppHeader from '../../src/components/AppHeader';
import ProfileScreen from '../../src/screens/Profile';

import AppTheme from '../../src/constants/themes'; 

import {
  startLogout,
  startUpdateProfile,
  startUpdateUserData,
  startLoadUserData,
} from '../../src/actions/userActions';

const middlewares = [thunk];
const mockStore = configureMockStore(middlewares);


jest.mock('../../src/utils/localStorage.js', () => ({
    AsyncStorage: jest.fn(),
    storeUID: jest.fn(),
    getUID: jest.fn(),
  }));

jest.mock('../../firebaseConfig', () => ({
  auth: {
    signOut: jest.fn(() => Promise.resolve()),
    currentUser: {
      displayName: 'John Doe',
    },
  },
}));

jest.mock('../../firebaseConfig', () => ({
    auth: {
        signOut: jest.fn(() => Promise.resolve()),
        currentUser: {
            displayName: 'John Doe',
        },
    }
  }));

jest.mock('firebase/auth', () => ({
  createUserWithEmailAndPassword: jest.fn(),
  updateEmail: jest.fn(),
  signInWithEmailAndPassword: jest.fn(),
  updateProfile: jest.fn(() => Promise.resolve()),
  sendPasswordResetEmail: jest.fn(),
}));

// jest.mock('firebase/firestore', () => ({
//   collection: jest.fn(),
//   addDoc: jest.fn(),
//   setDoc: jest.fn(),
//   doc: jest.fn(),
//   updateDoc: jest.fn(),
//   getDoc: jest.fn(),
// }));
jest.mock('firebase/firestore', () => ({
    collection: jest.fn(() => ({ add: jest.fn() })),
    addDoc: jest.fn(),
    setDoc: jest.fn(),
    doc: jest.fn(() => ({ setDoc: jest.fn() })),
    updateDoc: jest.fn(),
    getDoc: jest.fn(),
  }));


jest.mock('react-native-vector-icons/MaterialIcons', () => require('../__mocks__/react-native-vector-icons.js').MaterialIcons);
jest.mock('react-native-vector-icons/FontAwesome5', () => require('../__mocks__/react-native-vector-icons.js').FontAwesome5);
jest.mock('@shopify/react-native-skia', () => require('../__mocks__/@shopify__react-native-skia.js'));
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

// Mocks ViewSleepData 
jest.mock('d3', () => ({
  scaleLinear: jest.fn().mockReturnValue({
    domain: jest.fn().mockReturnThis(),
    range: jest.fn().mockReturnThis(),
    ticks: jest.fn().mockReturnValue([0, 50, 100, 150, 200]),
  }),
  tickStep: jest.fn().mockReturnValue(50),
  ticks: jest.fn().mockReturnValue([0, 50, 100, 150, 200]),
}));

jest.mock('expo-font');
jest.mock('../../assets', () => ({
  AppFontsResource: {},
}));

jest.mock('@react-navigation/native', () => {
    const actualNav = jest.requireActual('@react-navigation/native');
    return {
      ...actualNav,
      useNavigation: () => ({
        navigate: jest.fn(),
        goBack: jest.fn(),
      }),
      useRoute: () => ({
        //name: 'Previous Screen',
        params: {
            previousScreenTitle: 'Home',
          },
      }),
    };
  });







describe('User Actions Integration Test', () => {
  let store;

  beforeEach(() => {
    jest.spyOn(console, 'error').mockImplementation((message) => {
        if (message.includes('Warning: An update to')) {
          return;
        }
        console.error(message);
      });
  
    jest.useFakeTimers();

  });

  it('should log out the user', async () => {
    const initialState = {
        auth: {
          uid: '123',
          displayName: 'John Doe',
        },
        user: {
          profile: {},
          metrics: {},
        },
      };
    
    store = mockStore(initialState);
    store.dispatch = jest.fn(store.dispatch);

    const { getByTestId, queryByText, debug  } = render(
        <Provider store={store}>
          <PaperProvider >
            <NavigationContainer>
                <View>
                    <AppHeader title={"Test Title"} menu = {true} />
                </View>
            </NavigationContainer>
          </PaperProvider>
        </Provider>
    );

    // debug(); // Log the rendered output to inspect the component tree

    const menuButton = getByTestId("menu-action");

    await act(() => {
        fireEvent.press(menuButton);
    });

    await waitFor(() => {
        expect(queryByText('Edit Profile')).not.toBeNull();
        expect(queryByText('Settings & Privacy')).not.toBeNull();
        expect(queryByText('Accessibility')).not.toBeNull();
        expect(queryByText('Logout')).not.toBeNull();
      });

    const signOutButton = getByTestId("sign-out-button")
    await act(() => {
        fireEvent.press(signOutButton);
    }); 

    let confirmSignOutButton
    await waitFor(() => {
        confirmSignOutButton = getByTestId("yes-sign-out-button")
    })
    await act(() => {
        fireEvent.press(confirmSignOutButton);
    }); 

    await waitFor(() => {
      expect(store.dispatch).toHaveBeenCalledWith(expect.any(Function));
      const actions = store.getActions();
      expect(actions).toContainEqual({ type: 'LOGOUT' });
      expect(actions).toContainEqual({ type: 'showErrorToast', payload: 'User logged out!' });
    });
  });


  it('should update the user profile', async () => {
    store.dispatch = jest.fn(store.dispatch);

    const initialState = {
        uuid: null,
        firstName: null,
        lastName: null,
        email: null,
        authError: null,
        user: {
            userMetricsData: {
                gender: "No Data",
                dob: new Date(),
                height: "No Data",
                weight: "No Data",
                sports: "No Data",
            },
        }
      };
    
    store = mockStore(initialState);
    store.dispatch = jest.fn(store.dispatch);

    const { getByTestId, queryByText, debug } = render(
        <Provider store={store}>
          <PaperProvider >
            <NavigationContainer>
                <View>
                    <ProfileScreen  route={{ params: { previousScreenTitle: 'Home' } }}/>
                </View>
            </NavigationContainer>
          </PaperProvider>
        </Provider>
    );

    debug(); 

    const editPersonalButton = getByTestId("edit-personal-button");
    await act(() => {
        fireEvent.press(editPersonalButton );
    });

    await waitFor(() => {
        expect(getByTestId("personal-modal-content")).not.toBeNull();
      });

    const firstNameInput = getByTestId("first-name-input");
    await act(() => {
      fireEvent.changeText(firstNameInput, 'John');
    });

    const lastNameInput = getByTestId("last-name-input");
    await act(() => {
      fireEvent.changeText(lastNameInput, 'Doe');
    });

    let savePersonalButton
    await waitFor(() => {
        savePersonalButton = getByTestId("save-personal-button");
    });
    await act(() => {
        fireEvent.press(savePersonalButton );
    });

    //const lastNadfameInput = getByTestId("last-ndfasdfasdame-input");

    await waitFor(() => {
        expect(store.dispatch).toHaveBeenCalledWith(expect.any(Function));
        const actions = store.getActions();
        expect(actions).toContainEqual({
          type: 'UPDATE_PROFILE',
          payload: ['John', 'Doe'],
        });
      });
  });


//   it('should update the user profile', async () => {
//     store.dispatch = jest.fn(store.dispatch);
    
//     render(
//       <Provider store={store}>
//         <App />
//       </Provider>
//     );

//     const updateProfileButton = screen.getByText(/update profile/i);
//     fireEvent.click(updateProfileButton);

//     await waitFor(() => {
//       expect(store.dispatch).toHaveBeenCalledWith(expect.any(Function));
//       const actions = store.getActions();
//       expect(actions).toContainEqual({
//         type: 'UPDATE_PROFILE',
//         payload: ['John', 'Doe'],
//       });
//     });
//   });

//   it('should update user data', async () => {
//     store.dispatch = jest.fn(store.dispatch);
    
//     render(
//       <Provider store={store}>
//         <App />
//       </Provider>
//     );

//     const updateUserDataButton = screen.getByText(/update user data/i);
//     fireEvent.click(updateUserDataButton);

//     await waitFor(() => {
//       expect(store.dispatch).toHaveBeenCalledWith(expect.any(Function));
//       const actions = store.getActions();
//       expect(actions).toContainEqual({
//         type: 'UPDATE_USER_METRICS_DATA',
//         payload: { /* your user metrics data here */ },
//       });
//     });
//   });

//   it('should load user data', async () => {
//     store.dispatch = jest.fn(store.dispatch);
    
//     render(
//       <Provider store={store}>
//         <App />
//       </Provider>
//     );

//     const loadUserDataButton = screen.getByText(/load user data/i);
//     fireEvent.click(loadUserDataButton);

//     await waitFor(() => {
//       expect(store.dispatch).toHaveBeenCalledWith(expect.any(Function));
//       const actions = store.getActions();
//       // You can add more detailed expectations here based on what the action does
//     });
//   });


});
