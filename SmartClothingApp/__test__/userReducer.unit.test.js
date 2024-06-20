import userReducer from '../src/reducers/userReducer';
import * as types from '../src/actions/types';

// Mock the global Date object
//const MOCKED_DATE = new Date(2023, 0, 1); // Mocked date as January 1st, 2023
//global.Date = jest.fn(() => MOCKED_DATE);

describe('userReducer', () => {
  const initialState = {
    uuid: null,
    firstName: null,
    lastName: null,
    email: null,
    authError: null,
    userMetricsData: {
      gender: "No Data",
      dob: new Date(),
      height: "No Data",
      weight: "No Data",
      sports: "No Data",
    },
  };

  it('should return the initial state', () => {
    const state = userReducer(undefined, {});
    const expectedState = {
      ...initialState,
      userMetricsData: {
        ...initialState.userMetricsData,
        dob: state.userMetricsData.dob // Use the date from the state returned by the reducer
      }
    };
    expect(state).toEqual(expectedState);
  });

  it('should handle LOGIN_WITH_EMAIL', () => {
    const action = {
      type: types.LOGIN_WITH_EMAIL,
      payload: {
        uuid: '123',
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com'
      }
    };

    const expectedState = {
      ...initialState,
      uuid: '123',
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@example.com'
    };

    expect(userReducer(initialState, action)).toEqual(expectedState);
  });

  it('should handle SIGNUP_WITH_EMAIL', () => {
    const action = {
      type: types.SIGNUP_WITH_EMAIL,
      payload: {
        uuid: 'abc123',
        firstName: 'Jane',
        lastName: 'Smith',
        email: 'jane.smith@example.com'
      }
    };

    const expectedState = {
      ...initialState,
      uuid: 'abc123',
      firstName: 'Jane',
      lastName: 'Smith',
      email: 'jane.smith@example.com'
    };

    expect(userReducer(initialState, action)).toEqual(expectedState);
  });

  it('should handle LOGOUT', () => {
    const loggedInState = {
      ...initialState,
      uuid: 'abc123',
      firstName: 'Jane',
      lastName: 'Smith',
      email: 'jane.smith@example.com'
    };

    const action = {
      type: types.LOGOUT
    };
    
    const expectedState = {
      ...initialState,
      reAuth: null,
      userMetricsData: {
        ...initialState.userMetricsData,
        dob: loggedInState.userMetricsData.dob // Ensure the dob is matched with the current state
      }
    };

    expect(userReducer(loggedInState, action)).toEqual(expectedState);
  });

  it('should handle UPDATE_PROFILE', () => {
    const action = {
      type: types.UPDATE_PROFILE,
      payload: ['UpdatedFirstName', 'UpdatedLastName']
    };

    const expectedState = {
      ...initialState,
      firstName: 'UpdatedFirstName',
      lastName: 'UpdatedLastName'
    };

    expect(userReducer(initialState, action)).toEqual(expectedState);
  });

  it('should handle UPDATE_USER_METRICS_DATA', () => {
    const userMetricsData = {
      gender: 'Female',
      dob: new Date('1990-01-01'),
      height: '170cm',
      weight: '60kg',
      sports: ['Running', 'Swimming']
    };

    const action = {
      type: types.UPDATE_USER_METRICS_DATA,
      payload: userMetricsData
    };

    const expectedState = {
      ...initialState,
      userMetricsData: userMetricsData
    };

    expect(userReducer(initialState, action)).toEqual(expectedState);
  });

  it('should handle UPDATE_EMAIL_SUCCESS', () => {
    const action = {
      type: types.UPDATE_EMAIL_SUCCESS,
      payload: 'new.email@example.com'
    };

    const stateBefore = {
      ...initialState,
      email: 'old.email@example.com',
      userMetricsData: {
        ...initialState.userMetricsData,
        dob: new Date() // Set the dob to match the dynamic date
      }
    };

    const expectedState = {
      ...stateBefore,
      user: {
        email: "new.email@example.com",
      },
    };

    expect(userReducer(stateBefore, action)).toEqual(expectedState);
  });

});