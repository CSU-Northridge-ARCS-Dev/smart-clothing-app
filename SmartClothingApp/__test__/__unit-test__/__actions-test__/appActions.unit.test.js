/**
 * Unit tests for app actions in the Smart Clothing App.
 * 
 * This test file includes test cases for actions related to app-level state management,
 * such as managing user metrics modal visibility, updating activity ring data, and
 * updating heart rate and sleep data date ranges. These tests ensure that each action
 * is dispatched correctly and that the appropriate payloads are passed to reducers.
 * 
 * Mocks:
 * - Firebase Firestore methods (getDoc, setDoc, etc.)
 * - AsyncStorage (local storage mock)
 * - Firebase Authentication methods (updateEmail, updateProfile, etc.)
 * 
 * Global mocks and setup are done via jest to simulate database, authentication,
 * and local storage services.
 *
 * Thunks for async actions are tested to verify proper dispatch behavior, with 
 * mock data and conditions ensuring each action triggers as expected.
 * 
 * @file appActions.unit.test.js
 * 
 * Credit: Carlos Figueroa (github @cfiguer055)
 */

import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import {
    userMetricsDataModalVisible,
    updateActivityRingsData,
    updateHeartRateDateRangeData,
    updateSleepDataDateRangeData,
    updateActivityRings,
    updateHeartRateDateRange,
    updateSleepDataDateRange,
    coachNotificationPermissionsModalVisible,
  } from '../../../src/actions/appActions.js'; 
import {
  USER_METRICS_DATA_MODAL_VISIBLE,
  UPDATE_ACTIVITY_RINGS_DATA,
  UPDATE_HEART_RATE_DATE_RANGE,
  UPDATE_SLEEP_DATA_DATE_RANGE,
  COACH_NOTIFICATION_PERMISSIONS_MODAL_VISIBLE,
} from '../../../src/actions/types.js';





// Middleware and store setup
const middlewares = [thunk];
const mockStore = configureMockStore(middlewares);

// Mock Firebase dependencies and AsyncStorage
jest.mock('../../../src/utils/localStorage.js', () => ({
    AsyncStorage: jest.fn(),
  }));

jest.mock('firebase/firestore', () => ({
    collection: jest.fn(),
    addDoc: jest.fn(),
    setDoc: jest.fn(),
    doc: jest.fn(),
    updateDoc: jest.fn(),
    getDoc: jest.fn(),
    //updateEmail: jest.fn(),
}));

jest.mock('../../../firebaseConfig.js', () => ({
    auth: {
      //signOut: jest.fn(() => Promise.resolve()),
      currentUser: {
        displayName: 'John Doe',
      },
    },
  }));

jest.mock('firebase/auth', () => ({
    createUserWithEmailAndPassword: jest.fn(),
    updateEmail: jest.fn(),
    signInWithEmailAndPassword: jest.fn(),
    updateProfile: jest.fn(), 
    sendPasswordResetEmail: jest.fn(),
    auth: {
      updateEmail: jest.fn(),
    },
}));



/**
 * Unit tests for app actions in Smart Clothing app.
 * 
 * Test suite: User Metrics Actions
 *
 * This suite tests all the actions related to user metrics in the app. It verifies that actions
 * like toggling the metrics modal visibility, updating activity rings, and updating date ranges
 * for heart rate and sleep data behave as expected.
 *
 * This suite of tests validates the Redux actions for the app, including those that:
 * - Modify the visibility of user metrics modals, update activity rings, and update
 *   date ranges for heart rate and sleep data.
 * - It ensures that each action is dispatched correctly, and the reducers will be updated
 *   as expected.
 *
 * Mocks are set up for Firebase Firestore and AsyncStorage to simulate database interactions.
 *
 * @test {userMetricsDataModalVisible} Action to update user metrics modal visibility.
 * @test {updateActivityRingsData} Action to update activity rings data.
 * @test {updateHeartRateDateRangeData} Action to update heart rate data range.
 */
describe('User Metrics Actions', () => {
  
  /**
   * Test case: Should create an action to toggle user metrics data modal visibility
   *
   * This test validates that the `userMetricsDataModalVisible` action creator produces
   * the correct action object when passed the visibility state and sign-up screen flag.
   * @test {userMetricsDataModalVisible}
   */
  it('should create an action to toggle user metrics data modal visibility', () => {
    const expectedAction = {
      type: USER_METRICS_DATA_MODAL_VISIBLE,
      payload: {
        visibility: true,
        isFromSignUpScreen: true,
      },
    };
    expect(userMetricsDataModalVisible(true, true)).toEqual(expectedAction);
  });
  
  /**
   * Test case: Should create an action to update activity ring data for a specific day
   *
   * This test ensures that `updateActivityRingsData` generates an action with the correct
   * payload, including the day of the week and the activity ring data (ring1, ring2, ring3).
   * @test {updateActivityRingsData}
   */
  it('should create an action to toggle activity ring data', () => {
    const day = "Monday"
    const ringData = { ring1: '1.0', ring2: '1.0', ring3: '1.0' };
    
    const expectedAction = {
      type: UPDATE_ACTIVITY_RINGS_DATA,
      payload: {
        day: day,
        rings: ringData
      }
    }

    expect(updateActivityRingsData(day, ringData)).toEqual(expectedAction);
  });

  /**
   * Test case: Should create an action to update heart rate date range
   *
   * This test validates that the `updateHeartRateDateRangeData` action creator produces
   * the correct action object with the start and end dates for the heart rate data.
   * @test {updateHeartRateDateRangeData}
   */
  it('should create an action to update heart rate date range', () => {
    const startDate = '2024-01-01';
    const endDate = '2024-01-07';
    const expectedAction = {
      type: UPDATE_HEART_RATE_DATE_RANGE,
      payload: { startDate, endDate },
    };
    expect(updateHeartRateDateRangeData(startDate, endDate)).toEqual(expectedAction);
  });

  /**
   * Test case: Should create an action to update sleep data date range
   *
   * This test ensures that `updateSleepDataDateRangeData` correctly dispatches an action
   * with the provided start and end dates for the sleep data.
   * @test {updateSleepDataDateRangeData}
   */
  it('should create an action to update sleep data date range', () => {
    const startDate = '2024-01-01';
    const endDate = '2024-01-07';
    const expectedAction = {
      type: UPDATE_SLEEP_DATA_DATE_RANGE,
      payload: { startDate, endDate },
    };
    expect(updateSleepDataDateRangeData(startDate, endDate)).toEqual(expectedAction);
  });

  it('should create an action to toggle coach notification permissions modal visibility (true)', () => {
    const expectedAction = {
      type: COACH_NOTIFICATION_PERMISSIONS_MODAL_VISIBLE,
      payload: { visibility: true },
    };
    expect(coachNotificationPermissionsModalVisible(true)).toEqual(expectedAction);
  });

  it('should create an action to toggle coach notification permissions modal visibility (false)', () => {
    const expectedAction = {
      type: COACH_NOTIFICATION_PERMISSIONS_MODAL_VISIBLE,
      payload: { visibility: false },
    };
    expect(coachNotificationPermissionsModalVisible(false)).toEqual(expectedAction);
  });




  /**
   * Test case: Should dispatch actions to update activity rings data for each day of the week
   *
   * This test simulates the `updateActivityRings` thunk, which dispatches activity ring data
   * for each day of the week. It ensures that all actions are dispatched with the correct
   * data after the asynchronous operation completes.
   * @test {updateActivityRings}
   */
  it('should dispatch actions to update activity rings data', async () => {
    const store = mockStore({});
    const daysOfWeek = [
      'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'
    ];

    const ringData = { ring1: '1.0', ring2: '1.0', ring3: '1.0' };

    // Mock the random value generator if necessary or ensure predictable output for tests
    jest.spyOn(Math, 'random').mockReturnValue(0.5);

    const expectedActions = daysOfWeek.map(day => ({
      type: UPDATE_ACTIVITY_RINGS_DATA,
      payload: {
        day,
        rings: ringData
      }
    }));

    // Dispatch the thunk action
    await store.dispatch(updateActivityRings());
    const actions = store.getActions();

    // Verify that each action is dispatched correctly
    expectedActions.forEach((expectedAction, index) => {
      expect(actions[index]).toEqual(expectedAction);
    });

    // Restore Math.random to its original implementation
    Math.random.mockRestore();
  }, 10000);

  /**
   * Test case: Should dispatch actions to update heart rate data date range
   *
   * This test validates the `updateHeartRateDateRange` thunk, ensuring that the start and
   * end dates for the heart rate data are correctly dispatched.
   * @test {updateHeartRateDateRange}
   */

  it('should dispatch actions to update heart rate data date range', async () => {
    const store = mockStore({});

    const startDate = new Date(2024, 6, 9)
    const endDate = new Date(2024, 6, 15)

    const expectedAction = {
      type: UPDATE_HEART_RATE_DATE_RANGE,
      payload: {
        startDate: startDate,
        endDate: endDate
      }
    }

    await store.dispatch(updateHeartRateDateRange(startDate, endDate));
    const actions = store.getActions();

    expect(actions[0]).toEqual(expectedAction);

  }, 10000);

  /**
   * Test case: Should dispatch actions to update sleep data date range
   *
   * This test ensures that `updateSleepDataDateRange` correctly dispatches the action
   * with the provided start and end dates for the sleep data.
   * @test {updateSleepDataDateRange}
   */
  it('should dispatch actions to update sleep data date range', async () => {
    const store = mockStore({});

    const startDate = new Date(2024, 6, 9)
    const endDate = new Date(2024, 6, 15)

    const expectedAction = {
      type: UPDATE_SLEEP_DATA_DATE_RANGE,
      payload: {
        startDate: startDate,
        endDate: endDate
      }
    }

    await store.dispatch(updateSleepDataDateRange(startDate, endDate));
    const actions = store.getActions();

    expect(actions[0]).toEqual(expectedAction);

  }, 10000);
});
