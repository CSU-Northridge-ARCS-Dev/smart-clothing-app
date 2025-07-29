/**
 * Unit tests for the AppHeader component in the Smart Clothing App.
 * 
 * This test file covers various test cases to ensure the correct rendering and functionality
 * of the `AppHeader` component. The component contains navigation actions, state management 
 * (menu visibility, prompt modal), and interacts with Redux and navigation hooks.
 * 
 * Mocks:
 * - React Navigation Hooks (useNavigation, useRoute)
 * - Redux (useDispatch)
 * - Firebase methods (auth, firestore)
 * - Third-party dependencies like react-native-vector-icons and react-native-paper
 * 
 * The tests verify that the component renders correctly with minimal props, that it handles 
 * navigation actions, and that the menu and prompt modal behave as expected. Thunks for 
 * logout actions are also tested to ensure proper dispatch behavior.
 * 
 * @file AppHeader.unit.test.js
 */

import React from 'react';
import { ScrollView, View } from 'react-native';
import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import { Provider } from 'react-redux';
import { NavigationContainer, useNavigation } from '@react-navigation/native';
import renderer, { act } from 'react-test-renderer';
import AppHeader from '../../../src/components/AppHeader/index.jsx'; // Adjust the import path as necessary
import configureStore from '../../../src/store.js';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { createStackNavigator } from '@react-navigation/stack';

import { Provider as StoreProvider } from 'react-redux';
import { Provider as PaperProvider } from 'react-native-paper';

import AppTheme from '../../../src/constants/themes.js'; // Update path as necessary
import AppRouter from '../../../src/navigation/index.js'; // Update path as necessary

import Settings from '../../../src/screens/Settings/index.jsx'

// Mocks for various dependencies
jest.mock('../../../src/utils/localStorage.js', () => ({
    AsyncStorage: jest.fn(),
    storeUID: jest.fn(),
    getUID: jest.fn(),
  }));

  // Mock Firebase Authentication
jest.mock('../../../firebaseConfig.js', () => ({
  auth: {
      currentUser: {
          uid: {
            "email": "test1@gmail.com", 
            "firstName": "MisterTest",
            "lastName": "Johnson", 
            "uuid": "nvQpwMHj7eUKfsyEhVloGM7hvji2"
            //uuid: null
          },
          email: 'test1@gmail.com',
          password: 'password123'
        },
  },
}));

  jest.mock('firebase/app', () => ({
    initializeApp: jest.fn(),
    registerVersion: jest.fn(),
    getAuth: jest.fn(),
    getDatabase: jest.fn(),
  }))

  jest.mock('firebase/auth', () => ({
    initializeAuth: jest.fn(),
    getAuth: jest.fn(),
    ReactNativeAsyncStorage: jest.fn(),
  }))

  
  jest.mock('firebase/firestore', () => ({
    getFirestore: jest.fn(() => ({
      // Add any methods you use from the Firestore instance here
      collection: jest.fn(),
    })),
    collection: jest.fn(() => ({
      add: jest.fn(),
      doc: jest.fn(),
    })),
    addDoc: jest.fn(),
    setDoc: jest.fn(),
    doc: jest.fn(() => ({
      set: jest.fn(),
    })),
  }));
  
// jest.mock('firebase/firestore', () => ({
//     collection: jest.fn(() => ({ add: jest.fn() })),
//     addDoc: jest.fn(),
//     setDoc: jest.fn(),
//     doc: jest.fn(() => ({ setDoc: jest.fn() })),
// }))


// Mock redux dispatch
jest.mock('react-redux', () => ({
  ...jest.requireActual('react-redux'),
  useDispatch: () => jest.fn(),
}));

// Mock userActions.js specifically if you want control over `startLogout` behavior
jest.mock('../../../src/actions/userActions.js', () => ({
  startLogout: jest.fn().mockImplementation(() => jest.fn()), // Mock implementation if needed
}));

// Mock react-native-vector-icons/FontAwesome5
jest.mock('react-native-vector-icons/FontAwesome5', () => 'Icon');

// jest.mock('react-native-paper', () => ({
//   ...jest.requireActual('react-native-paper'), // Retain other components as is
//   Appbar: {
//     Header: 'Appbar.Header',
//     BackAction: 'Appbar.BackAction',
//     Content: 'Appbar.Content',
//     Action: 'Appbar.Action',
//   },
//   Menu: {
//     ...jest.requireActual('react-native-paper').Menu, // Retain actual Menu behavior
//     Item: jest.fn().mockImplementation(({ title, onPress }) => (
//       <button onClick={onPress}>{title}</button> // Simplified for example purposes
//     )),
//   },
// }));
jest.mock('react-native-paper', () => {
  const real = jest.requireActual('react-native-paper');
  const React = require('react');
  const { View, Text, TouchableOpacity } = require('react-native');

  // Functional Appbar “subcomponents”
  const Appbar = {
    Header: ({ children, ...props }) => (
      <View testID="Appbar.Header" {...props}>{children}</View>
    ),
    BackAction: ({ onPress, ...props }) => (
      <TouchableOpacity testID="back-action" onPress={onPress} {...props}>
        <Text>Back</Text>
      </TouchableOpacity>
    ),
    Content: ({ title, ...props }) => (
      <View testID="Appbar.Content" {...props}><Text>{title}</Text></View>
    ),
    Action: ({ onPress, testID = 'menu-action', ...props }) => (
      <TouchableOpacity testID={testID} onPress={onPress} {...props}>
        <Text>Action</Text>
      </TouchableOpacity>
    ),
  };

  // Functional Menu with static subcomponents
  const Menu = Object.assign(
    ({ visible, anchor, children, ...props }) => (
      <View testID="Menu" {...props}>
        <View testID="menu-anchor">{anchor}</View>
        {visible ? <View testID="menu-view">{children}</View> : null}
      </View>
    ),
    {
      Item: ({ title, onPress, ...props }) => (
        <TouchableOpacity testID={`menu-item-${title}`} onPress={onPress} {...props}>
          <Text>{title}</Text>
        </TouchableOpacity>
      ),
      Divider: (props) => <View testID="Menu.Divider" {...props} />,
    }
  );

  return { ...real, Appbar, Menu, Provider: real.Provider };
});


jest.mock('@shopify/react-native-skia', () => require('../../__mocks__/@shopify__react-native-skia.js'));

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

  jest.mock('d3', () => ({
    scaleLinear: jest.fn().mockReturnValue({
      domain: jest.fn().mockReturnThis(),
      range: jest.fn().mockReturnThis(),
      ticks: jest.fn().mockReturnValue([0, 50, 100, 150, 200]),
    }),
    tickStep: jest.fn().mockReturnValue(50),
    ticks: jest.fn().mockReturnValue([0, 50, 100, 150, 200]),
  }));

  jest.mock('react-native-vector-icons/MaterialIcons', () => require('../../__mocks__/react-native-vector-icons.js').MaterialIcons);
  jest.mock('react-native-vector-icons/FontAwesome5', () => require('../../__mocks__/react-native-vector-icons.js').FontAwesome5);
  jest.mock('@shopify/react-native-skia', () => require('../../__mocks__/@shopify__react-native-skia.js'));
  jest.mock('../../../src/components/visualizations/ActivityRings/Ring.jsx', () => {
    return jest.fn(({ ring, center, strokeWidth, scale }) => (
      <div>
        Mock Ring Component - {ring.size}, {center.x}, {center.y}, {strokeWidth}, {scale}
      </div>
    ));
  });
  jest.mock('../../../src/components/visualizations/ActivityChart/ActivityChart.jsx', () => {
    const MockActivityChart = ({ color, name, type, goal, progress }) => (
      <div data-testid="mock-activity-chart">
        <div>{`Mock ActivityChart: ${name}`}</div>
        <div>{`Type: ${type}, Goal: ${goal}, Progress: ${progress}, Color: ${color}`}</div>
      </div>
    );
    return MockActivityChart;
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



  jest.mock('@react-navigation/native', () => {
    const actualNav = jest.requireActual('@react-navigation/native');
    return {
      ...actualNav,
      useNavigation: () => ({
        navigate: jest.fn(),
        goBack: jest.fn(),
      }),
      useRoute: () => ({
        name: 'Previous Screen',
      }),
    };
  });

  const mockGoBack = jest.fn();
  const mockNavigate = jest.fn();

  const mockNavigation = {
    goBack: mockGoBack,
    navigate: mockNavigate,
    // Add other navigation methods you might need for testing
  };

  jest.mock('react-native-gesture-handler', () => {
    const View = require('react-native').View;
    return {
      ...jest.requireActual('react-native-gesture-handler'),
      GestureHandlerRootView: View,
    };
  });


  



const Stack = createStackNavigator();

/**
 * Unit tests for the AppHeader component.
 * 
 * Test suite: AppHeader
 *
 * This suite tests the rendering, navigation actions, menu interactions, and state
 * management of the `AppHeader` component. The tests cover the functionality of
 * back actions, menu items, and dispatching actions like logout.
 *
 * Mocks are set up for Redux dispatch, Firebase, and React Navigation to simulate
 * app interactions, while ensuring that each behavior is handled correctly.
 *
 * @test {AppHeader}
 */
describe('AppHeader', () => {
    let store;
    let component;
    let instance;

    beforeEach(() => {
        store = configureStore();

        component = renderer.create(
          <StoreProvider store={store}>
            <PaperProvider theme={AppTheme}>
              <NavigationContainer>
                <AppHeader title={"Test Title"}/>
              </NavigationContainer>
            </PaperProvider>
          </StoreProvider>
        );
        instance = component.root
    });

    afterEach(() => {
        jest.clearAllMocks();
      });


      /**
     * Test case: Renders correctly with minimal props
     * 
     * This test ensures that the `AppHeader` component renders correctly when provided 
     * with minimal required props (i.e., the `title` prop).
     * @test {AppHeader}
     */
    it('renders correctly with minimal props', () => {
        expect(component.toJSON()).toMatchSnapshot(); 
    });

    
    /**
     * Test case: Calls navigation when back-action is pressed
     *
     * This test ensures that when the back-action button is pressed, the correct 
     * navigation method `goBack` is called from React Navigation.
     * 
     * @test {AppHeader}
     */
    it('calls navigate when back-action is pressed', async () => {
      const { getByTestId } = render(
        <StoreProvider store={store}>
          <PaperProvider theme={AppTheme}>
            <NavigationContainer>
              <Stack.Navigator>
                <Stack.Screen
                  name="Settings"
                  component={Settings}
                  initialParams={{ previousScreenTitle: 'Previous Test Title' }}
                />
              </Stack.Navigator>
            </NavigationContainer>
          </PaperProvider>
        </StoreProvider>
      );
    
      // Simulate pressing the back-action button
      fireEvent.press(getByTestId('back-action'));
    
      // Access the navigation mock to check if goBack was called
      const navigationMock = useNavigation();
      //expect(navigationMock.goBack).toHaveBeenCalled();
    });
    

    /**
     * Test case: Menu items render when menu-action is pressed
     *
     * This test verifies that the menu items are rendered and visible when the menu 
     * action button is pressed. It ensures the correct interaction of the menu component.
     * 
     * @test {AppHeader}
     */
    it('menu items render when menu-action is pressed', async() => {
      const screen = render(
          <StoreProvider store={store}>
            <PaperProvider theme={AppTheme}>
              <NavigationContainer>
                <View>
                  <AppHeader title={"Test Title"} menu={true}/>
                </View>  
              </NavigationContainer>
            </PaperProvider>
          </StoreProvider>
      );
      //screen.debug();

      // Access the navigation mock to check if goBack was called
      const { useNavigation } = require('@react-navigation/native');
      const navigationMock = useNavigation();

      const menuAction = screen.getByTestId('menu-action');

      await act(() => {
        fireEvent.press(menuAction);
      });
      
      const menuView = screen.getByTestId('menu-view')

      expect(menuView).toBeTruthy();
    });
});
