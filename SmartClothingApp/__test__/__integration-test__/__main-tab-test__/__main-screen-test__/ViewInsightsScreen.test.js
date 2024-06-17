import React, {useState} from 'react';
import ViewInsights from '../../../../src/screens/ViewInsights/index.jsx'; 
import DateToolbar from '../../../../src/components/DateToolbar/DateToolbar.jsx';
import DateTimePicker, {
    DateTimePickerAndroid,
  } from "@react-native-community/datetimepicker";
import configureStore from '../../../../src/store.js';
import { Provider } from 'react-redux';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import renderer from 'react-test-renderer';
import { render, waitFor, fireEvent } from '@testing-library/react-native';
import { Provider as ReduxProvider } from 'react-redux';
import { Provider as PaperProvider } from 'react-native-paper';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';


jest.mock('../../../../src/utils/localStorage.js', () => ({
    AsyncStorage: jest.fn(),
}));

jest.mock('firebase/firestore', () => ({
    collection: jest.fn(() => ({ add: jest.fn() })),
    addDoc: jest.fn(),
    setDoc: jest.fn(),
    doc: jest.fn(() => ({ setDoc: jest.fn() })),
}))

// Mock Firebase Authentication
jest.mock('../../../../firebaseConfig.js', () => ({
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

jest.mock('firebase/auth', () => ({
    initializeApp: jest.fn(),
    registerVersion: jest.fn(),
    getAuth: jest.fn(),
    getDatabase: jest.fn(),
}))



jest.mock('@shopify/react-native-skia', () => require('../../../__mocks__/@shopify__react-native-skia.js'));

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
  jest.mock('../../../../src/components/visualizations/ActivityChart/ActivityChart.jsx', () => {
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




  const MyComponent = ({ forceShowDatePicker }) => {
    const [showDatePicker, setShowDatePicker] = useState(false);

    // Decide whether to show the DatePicker based on internal state or prop
    const shouldShowDatePicker = forceShowDatePicker !== undefined ? forceShowDatePicker : showDatePicker;

    return (
        <>
        {shouldShowDatePicker && (
            <DateTimePicker
            testID="date-time-picker"
            // other props
            />
        )}
        {/* other component content */}
        </>
    );
};


// Mocking the route and navigation props passed to the component
const mockRoute = {
    params: {
      previousScreenTitle: 'Test Title'
    },
  };


jest.mock('@react-native-community/datetimepicker', () => 'DateTimePicker');



const Stack = createStackNavigator();

describe('ViewInsights', () => {
  let component;
  let store;

  beforeEach(() => {
    // Prevents console log warning 
    jest.spyOn(console, 'error').mockImplementation((message) => {
      if (message.includes('Warning: An update to')) {
        return;
      }
      console.error(message);
    });

    jest.useFakeTimers();

    store = configureStore();

    jest.mock('@react-native-community/datetimepicker', () => 'DateTimePicker');

  });
  afterEach(() => {
      jest.clearAllMocks();
  });
  

  it('renders correctly', () => {
    let component;
    component = renderer.create(
      <ReduxProvider store={store}>
        <PaperProvider>
          <NavigationContainer>
            <Stack.Navigator>
              <Stack.Screen
                name="ViewInsights"
                component={ViewInsights}
                initialParams={{ previousScreenTitle: 'Test Title' }}
              />
            </Stack.Navigator>
          </NavigationContainer>
        </PaperProvider>
      </ReduxProvider>
      );

    expect(component.toJSON()).toMatchSnapshot(); 
  });

  it('renders DateTimePicker when forced by prop', () => {
      const { getByTestId } = render(<MyComponent forceShowDatePicker={true} />);
      expect(getByTestId('date-time-picker')).toBeTruthy();
    });
    
      
    
});