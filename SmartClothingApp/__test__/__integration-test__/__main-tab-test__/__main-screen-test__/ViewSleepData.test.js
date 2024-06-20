import React from 'react';
import ViewSleepData from '../../../../src/screens/ViewSleepData/index.jsx'; 
import configureStore from '../../../../src/store.js';
import { Provider } from 'react-redux';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import renderer from 'react-test-renderer';
import { render, waitFor } from '@testing-library/react-native';


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



jest.mock('@shopify/react-native-skia', () => require('../../../__mocks__/@shopify__react-native-skia'));

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

  jest.mock('react-native-vector-icons/MaterialIcons', () => require('../../../__mocks__/react-native-vector-icons').MaterialIcons);
  jest.mock('react-native-vector-icons/FontAwesome5', () => require('../../../__mocks__/react-native-vector-icons').FontAwesome5);
  jest.mock('@shopify/react-native-skia', () => require('../../../__mocks__/@shopify__react-native-skia'));
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




// Mocking the route and navigation props passed to the component
const mockRoute = {
    params: {
      previousScreenTitle: 'Test Title'
    },
  };


describe('ViewSleepData', () => {
    let component;
    let instance;
    let store;

    beforeEach(() => {
        store = configureStore();

        component = renderer.create(
            <Provider store={store}>
                <SafeAreaProvider>
                    <ViewSleepData route={mockRoute} />
                </SafeAreaProvider>
            </Provider>);

        instance = component.root;
    });
    afterEach(() => {
        jest.clearAllMocks();
    });
    
    //add test cases to know if the return data is correct

    it('renders correctly based on route params', async () => {
        const { toJSON, debug } = render(
            <Provider store={store}>
                <SafeAreaProvider>
                    <ViewSleepData route={mockRoute} />
                </SafeAreaProvider>
            </Provider>
        );
    
        await waitFor(() => {
            expect(toJSON()).toMatchSnapshot();
            debug(); // Optional: Use this for debugging if needed
        });
    });

    // it('renders correctly based on route params', async () => {
    //     // component = renderer.create(<ViewSleepData route={mockRoute} />).toJSON();
    //     // instance = component.root;

    //     const { toJSON } = render(
    //         <Provider store={store}>
    //           <SafeAreaProvider>
    //             <ViewSleepData route={mockRoute} />
    //           </SafeAreaProvider>
    //         </Provider>
    //       );
        
    //       await waitFor(() => {
    //         expect(toJSON()).toMatchSnapshot();
    //       });

    //     expect(component).toMatchSnapshot();
    // });

    it('renders correctly when previousScreenTitle is missing', () => {
        const mockRouteWithoutTitle = { params: {} };
        component = renderer.create(
            <Provider store={store}>
                <SafeAreaProvider>
                    <ViewSleepData route={mockRouteWithoutTitle} />
                </SafeAreaProvider>
            </Provider>
        ).toJSON();
        expect(component).toMatchSnapshot();
    });


});
    
// it('Check for the presence of stages and their descriptions', () => {
//   // Assuming you want to test the dynamic color assignment, ensure the colors are correctly determined
//     // This might require knowing the expected output or mocking the data and functions inside the component
    
//     // Check for the presence of stages and their descriptions
//     const stages = ['Awake', 'REM', 'Core', 'Deep'];
//     stages.forEach(stage => {
//       expect(getAllByText(stage).length).toBeGreaterThan(0);
//     });
//   });