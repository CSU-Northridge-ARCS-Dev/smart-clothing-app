import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import HomeScreen from '../../../../src/screens/HomeScreen/index.jsx';
import ProfileScreen from '../../../../src/screens/Profile/index.jsx';
import configureStore from '../../../../src/store.js';
import {Provider as StoreProvider } from 'react-redux'; 
import {PaperProvider}  from "react-native-paper";
import { render } from '@testing-library/react-native';
import {fireEvent } from '@testing-library/react-native';
import {waitFor } from '@testing-library/react-native';
import { act } from 'react-test-renderer';



const Stack = createStackNavigator();

// Mock Firebase Authentication
jest.mock('../../../../firebaseConfig.js', () => ({
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

jest.mock('firebase/auth', () => ({
    initializeApp: jest.fn(),
    registerVersion: jest.fn(),
    getAuth: jest.fn(),
    getDatabase: jest.fn(),
  }))

jest.mock('../../../../src/utils/localStorage.js', () => ({
    AsyncStorage: jest.fn(),
    storeUID: jest.fn(),
    getUID: jest.fn(),
  }));

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

jest.mock('react-native-vector-icons/MaterialIcons', () => require('../../../__mocks__/react-native-vector-icons.js').MaterialIcons);
  jest.mock('react-native-vector-icons/FontAwesome5', () => require('../../../__mocks__/react-native-vector-icons.js').FontAwesome5);
  jest.mock('@shopify/react-native-skia', () => require('../../../__mocks__/@shopify__react-native-skia.js'));
  jest.mock('../../../../src/components/visualizations/ActivityRings/Ring.jsx', () => {
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




  const TestComponent1 = () => (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Dashboard">
        <Stack.Screen name="Dashboard" component={HomeScreen} />
        <Stack.Screen name="Profile" component={ProfileScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );

  const TestComponent2 = () => (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Profile">
        <Stack.Screen 
            name="Profile" 
            component={ProfileScreen} 
            initialParams={{ previousScreenTitle: 'Dashboard' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );


describe('Home to Profile Navigation', () => {

  let store;

  beforeEach(() => {
    // Prevents 'wrap act()' console log warning 
    jest.spyOn(console, 'error').mockImplementation((message) => {
      if (message.includes('Warning: An update to')) {
        return;
      }
      console.error(message);
    });

    jest.useFakeTimers();
  });

  it('Navigates from Home to Profile screen', async () => {
    store = configureStore();

    const { getByTestId, getByText, debug } = render(
        <StoreProvider store={store}>
        <PaperProvider> 
            <TestComponent1 />
        </PaperProvider>
        </StoreProvider>
    );

    debug();

    const dropDownMenu = getByTestId('menu-action');
    await act(() => {
        fireEvent.press(dropDownMenu)
    });

    const menuItem = getByTestId('edit-profile-item');
    await act(() => {
        fireEvent.press(menuItem)
    });

    await waitFor(() => {
        expect(getByText('Profile')).toBeTruthy();
    });
  });

  it('Navigates from main Profile Screen to Edit Personal Info Screen', async () => {
    store = configureStore();

        const { getByText, getAllByText } = render(
            <StoreProvider store={store}>
            <PaperProvider> 
                <TestComponent2 />
            </PaperProvider>
            </StoreProvider>
        );

        const editPersonalTextElement = getByText('Edit Profile');
        const editPersonalView = editPersonalTextElement.parent || editPersonalTextElement;

        await act(() => {
            fireEvent.press(editPersonalView);
        });

        const editFirstNameElements = getAllByText('First Name');
        const editLastNameElements = getAllByText('Last Name');

        await waitFor(() => {
            expect(editFirstNameElements[0]).toBeTruthy();
        });
        await waitFor(() => {
            expect(editLastNameElements[0]).toBeTruthy();
        });
  });

  it('Navigates from main Profile Screen to Metrics Data Screen', async () => {
    store = configureStore();

    const { getByText, getAllByText } = render(
        <StoreProvider store={store}>
        <PaperProvider> 
            <TestComponent2 />
        </PaperProvider>
        </StoreProvider>
    );

    const editMetricsTextElement = getByText('Edit Profile');
    const editMetricsView = editMetricsTextElement.parent || editMetricsTextElement;

    await act(() => {
        fireEvent.press(editMetricsView);
    });

    const editFirstNameElements = getAllByText('Age');
    const editLastNameElements = getAllByText('Height');
    const editWeightElements = getAllByText('Weight');
    const editGenderElements = getAllByText('Gender');
    const editSportsElements = getAllByText('Sports');

    await waitFor(() => {
        expect(editFirstNameElements[0]).toBeTruthy();
    });
    await waitFor(() => {
        expect(editLastNameElements[0]).toBeTruthy();
    });
    await waitFor(() => {
        expect(editWeightElements[0]).toBeTruthy();
    });
    await waitFor(() => {
        expect(editGenderElements[0]).toBeTruthy();
    });
    await waitFor(() => {
        expect(editSportsElements[0]).toBeTruthy();
    });

  });
});
