import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import {
    userMetricsDataModalVisible,
    updateActivityRings,
    updateHeartRateDateRangeData,
    updateSleepDataDateRangeData,
  } from '../src/actions/appActions.js'; 
import {
  USER_METRICS_DATA_MODAL_VISIBLE,
  UPDATE_ACTIVITY_RINGS_DATA,
  UPDATE_HEART_RATE_DATE_RANGE,
  UPDATE_SLEEP_DATA_DATE_RANGE,
} from '../src/actions/types.js';

console.log(userMetricsDataModalVisible);

const middlewares = [thunk];
const mockStore = configureMockStore(middlewares);

jest.mock('../src/utils/localStorage.js', () => ({
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

jest.mock('../firebaseConfig.js', () => ({
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



describe('User Metrics Actions', () => {
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

    await store.dispatch(updateActivityRings());
    expect(store.getActions()).toContainEqual(expectedActions[0]);

    // Restore the original implementation
    Math.random.mockRestore();
  }, 10000);


  // it('should dispatch actions to update activity rings data', async () => {
  //   const store = mockStore({});
  //   const day = 'Monday';
  //   const ringData = { ring1: '1.0', ring2: '1.5', ring3: '0.5' };

  //   // Mock the random value generator if necessary or ensure predictable output for tests
  //   jest.spyOn(Math, 'random').mockReturnValue(0.5);

  //   const expectedActions = [
  //     {
  //       type: UPDATE_ACTIVITY_RINGS_DATA,
  //       payload: { day, rings: ringData },
  //     },
  //   ];

  //   await store.dispatch(updateActivityRings());
  //   expect(store.getActions()).toContainEqual(expectedActions[0]);

  //   // Restore the original implementation
  //   Math.random.mockRestore();
  // }, 10000);

  it('should create an action to update heart rate date range', () => {
    const startDate = '2024-01-01';
    const endDate = '2024-01-07';
    const expectedAction = {
      type: UPDATE_HEART_RATE_DATE_RANGE,
      payload: { startDate, endDate },
    };
    expect(updateHeartRateDateRangeData(startDate, endDate)).toEqual(expectedAction);
  });

  it('should create an action to update sleep data date range', () => {
    const startDate = '2024-01-01';
    const endDate = '2024-01-07';
    const expectedAction = {
      type: UPDATE_SLEEP_DATA_DATE_RANGE,
      payload: { startDate, endDate },
    };
    expect(updateSleepDataDateRangeData(startDate, endDate)).toEqual(expectedAction);
  });
});
