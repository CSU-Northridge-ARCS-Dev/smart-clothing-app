/**
 * Integration tests for Home to Profile navigation flow in the Smart Clothing App.
 * 
 * This test file includes integration tests that simulate user interactions with the app's
 * navigation system. These tests cover the process of navigating from the Home screen to the
 * Profile screen and further navigating to edit personal and metrics data screens. They validate
 * that the navigation stack works as expected, the correct screens are rendered, and the appropriate
 * user actions trigger navigation.
 * 
 * Mocks:
 * - Firebase Authentication methods (auth.currentUser)
 * - Firebase Firestore methods (getDoc, collection, doc, etc.)
 * - AsyncStorage for local storage interactions
 * 
 * The test suite mocks external dependencies and uses the React Navigation Stack Navigator
 * to simulate navigation behavior in a React Native environment.
 *
 * @file HomeToProfile.test.js
 * 
 * Credit: Carlos Figueroa (github @cfiguer055)
 */

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
import { GestureHandlerRootView } from 'react-native-gesture-handler';



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
  storeMetrics: jest.fn(),
  getUID: jest.fn(),
  clearUID: jest.fn(),
  getMetrics: jest.fn(),
  clearMetrics: jest.fn(),
  storeFirstName: jest.fn(),
  getFirstName: jest.fn(),
  clearFirstName: jest.fn(),
  storeLastName: jest.fn(),
  getLastName: jest.fn(),
  clearLastName: jest.fn(),
  storeEmail: jest.fn(),
  getEmail: jest.fn(),
  clearEmail: jest.fn(),
  getToken: jest.fn(() => Promise.resolve('mocked-token')), 
  storeToken: jest.fn(),
  clearToken: jest.fn(),
}));

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(() => Promise.resolve('mocked_value')),
  setItem: jest.fn(() => Promise.resolve()),
  removeItem: jest.fn(() => Promise.resolve()),
  clear: jest.fn(() => Promise.resolve()),
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

  jest.mock('react-native-vector-icons/FontAwesome5', () => 'Icon');
  jest.mock('react-native-vector-icons/MaterialIcons', () => 'Icon');

  jest.mock('expo-font', () => ({
    loadAsync: jest.fn().mockResolvedValue(true),
    isLoaded: jest.fn().mockReturnValue(true), // Add this mock
  }));


  jest.mock('@expo/vector-icons', () => {
    const React = require('react');
    const MockIcon = ({ name, size, color }) =>
      React.createElement('svg', { name, size, color });
    return {
      AntDesign: MockIcon,
      FontAwesome: MockIcon,
      Ionicons: MockIcon,
      MaterialIcons: MockIcon,
      MaterialCommunityIcons: MockIcon,
      Entypo: MockIcon,
      Feather: MockIcon,
      // Add other icon sets here if needed
    };
  });

  jest.mock('expo-asset', () => ({
    Asset: {
      loadAsync: jest.fn().mockResolvedValue([]),
    },
  }));

  jest.mock('../../../../src/hooks/useAppFonts', () => ({
    useAppFonts: jest.fn(() => true),
  }));

  jest.mock('react-native-paper', () => {
    const mock = jest.requireActual('react-native-paper');
    return {
      ...mock,
      Provider: ({ children }) => <>{children}</>,
    };
  });

  jest.mock('expo-asset', () => ({
    Asset: {
      loadAsync: jest.fn().mockResolvedValue([]),
    },
  }));

  jest.mock('react-native-gesture-handler', () => {
    const View = require('react-native').View;
    return {
      Swipeable: View,
      DrawerLayout: View,
      State: {},
      PanGestureHandler: View,
      BaseButton: View,
      RectButton: View,
      BorderlessButton: View,
      FlatList: View,
      ScrollView: View,
      TextInput: View,
      TouchableOpacity: View,
      GestureHandlerRootView: View,
      default: {
        install: jest.fn(),
      },
    };
  });

  // jest.mock('expo-notifications', () => ({
  //   setNotificationHandler: jest.fn(),
  //   addNotificationReceivedListener: jest.fn(),
  //   addNotificationResponseReceivedListener: jest.fn(),
  //   getLastNotificationResponseAsync: jest.fn().mockResolvedValue(null),
  //   scheduleNotificationAsync: jest.fn().mockResolvedValue('mocked-notification-id'),
  // }));


  jest.mock('react-native-gesture-handler', () => {
    const View = require('react-native').View;
    return {
      ...jest.requireActual('react-native-gesture-handler'),
      GestureHandlerRootView: View,
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
    //<GestureHandlerRootView style={{ flex: 1 }}>
      <NavigationContainer>
        <Stack.Navigator initialRouteName="Profile">
          <Stack.Screen 
              name="Profile" 
              component={ProfileScreen} 
              initialParams={{ previousScreenTitle: 'Dashboard' }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    //</GestureHandlerRootView>
  );


  /**
 * Integration test suite for navigating from Home to Profile screens.
 * 
 * This test suite simulates the complete flow of user navigation from the Home screen
 * to the Profile screen, and navigating further into editing personal and metrics data screens.
 * It validates that the navigation system behaves correctly when interacting with menus and buttons.
 *
 * @test {Home to Profile Navigation}
 */
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


  /**
     * Test case: Should navigate from Home to Profile screen
     *
     * This test validates the navigation from the Home screen to the Profile screen by interacting 
     * with a menu and triggering the appropriate actions. It checks that the Profile screen is 
     * rendered after pressing the corresponding menu item.
     *
     * @test {Home to Profile Navigation}
     */
  it('Navigates from Home to Profile screen', async () => {
    //jest.setTimeout(60000);
    store = configureStore();

    const { getByTestId, getByText, debug, getAllByRole } = render(
        <StoreProvider store={store}>
        <PaperProvider> 
            <TestComponent1 />
        </PaperProvider>
        </StoreProvider>
    );

    debug();

    
    const dropDownMenu = getByTestId('menu-action');
    //console.log('Dropdown Menu TestID Found:', dropDownMenu);
    await act(() => {
        fireEvent.press(dropDownMenu);
        console.log('Dropdown menu pressed');
    });

    

    const profileButton = getByTestId('edit-profile-item');
    
    //const menuItem = getByTestId('edit-profile-item-title');
    
    // const menuItems = getAllByRole("menuitem");
    // console.log("menuItems", menuItems);
    // const profileButton = menuItems[0];
    // console.log("Profile Button", profileButton);
    await waitFor(() => {
        fireEvent.press(profileButton);
    });

    //await new Promise((resolve) => setTimeout(resolve, 1000));

    

    await waitFor(() => {
        expect(getByText('Profile')).toBeTruthy();
    });
    debug();
  }, 50000);

  /**
     * Test case: Should navigate from main Profile screen to Edit Personal Info screen
     *
     * This test validates the navigation from the Profile screen to the Edit Personal Info screen.
     * It checks that the user can navigate to the edit screen and that the correct input fields 
     * for first name and last name are displayed.
     *
     * @test {Profile to Edit Personal Info Navigation}
     */
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

  /**
     * Test case: Should navigate from main Profile screen to Metrics Data screen
     *
     * This test validates the navigation from the Profile screen to the Metrics Data screen.
     * It checks that the user can navigate to the metrics screen and that the correct input fields 
     * for age, height, weight, gender, and sports are displayed.
     *
     * @test {Profile to Metrics Data Navigation}
     */
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
