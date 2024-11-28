/**
 * Unit tests for the userReducer in the Smart Clothing App.
 * 
 * This test file includes test cases for actions related to user authentication and profile management.
 * The reducer manages the user state, including login, signup, profile updates, user metrics data,
 * and email updates. These tests ensure that each action properly updates the state according to the
 * dispatched action type and payload.
 * 
 * Mocks:
 * - None needed for this test file as it is purely testing the reducer logic.
 *
 * The reducer handles the following state changes:
 * - Updating user information on login and signup
 * - Handling logout and resetting the state
 * - Updating the user's profile and metrics data
 * - Updating the user's email after a successful email change
 * 
 * @file userReducer.unit.test.js
 * 
 * Credit: Carlos Figueroa (github @cfiguer055)
 */

import userReducer from '../../../src/reducers/userReducer';
import * as types from '../../../src/actions/types';

// Mock the global Date object
//const MOCKED_DATE = new Date(2023, 0, 1); // Mocked date as January 1st, 2023
//global.Date = jest.fn(() => MOCKED_DATE);

/**
 * Unit tests for the userReducer.
 * 
 * Test suite: User Reducer
 *
 * This suite tests the `userReducer`, validating that it correctly handles the following actions:
 * - LOGIN_WITH_EMAIL: Logs in a user and updates their information in the state.
 * - SIGNUP_WITH_EMAIL: Signs up a new user and stores their data in the state.
 * - LOGOUT: Logs out a user and resets the state.
 * - UPDATE_PROFILE: Updates the user's first and last names.
 * - UPDATE_USER_METRICS_DATA: Updates user metrics like gender, height, weight, etc.
 * - UPDATE_EMAIL_SUCCESS: Updates the user's email after a successful change.
 *
 * The tests ensure that the reducer correctly updates the user state based on the given actions
 * and payloads.
 *
 * @test {userReducer}
 */
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

  /**
   * Test case: Should return the initial state
   *
   * This test verifies that the `userReducer` returns the initial state when no valid action
   * is provided.
   *
   * @test {userReducer}
   */
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

  /**
   * Test case: Should handle LOGIN_WITH_EMAIL action
   *
   * This test ensures that the reducer correctly updates the state with the user's information
   * when the `LOGIN_WITH_EMAIL` action is dispatched.
   *
   * @test {userReducer}
   */
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

  /**
   * Test case: Should handle SIGNUP_WITH_EMAIL action
   *
   * This test ensures that the reducer correctly updates the state with the user's information
   * when the `SIGNUP_WITH_EMAIL` action is dispatched.
   *
   * @test {userReducer}
   */
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

  /**
   * Test case: Should handle LOGOUT action
   *
   * This test ensures that the reducer resets the state upon logging out, clearing user information
   * and resetting the user metrics data while retaining the `dob` field.
   *
   * @test {userReducer}
   */
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

  /**
   * Test case: Should handle UPDATE_PROFILE action
   *
   * This test verifies that the reducer updates the user's first and last names correctly
   * when the `UPDATE_PROFILE` action is dispatched.
   *
   * @test {userReducer}
   */
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

  /**
   * Test case: Should handle UPDATE_USER_METRICS_DATA action
   *
   * This test ensures that the reducer updates the user's metrics data, such as gender, height,
   * weight, and sports, when the `UPDATE_USER_METRICS_DATA` action is dispatched.
   *
   * @test {userReducer}
   */
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

  /**
   * Test case: Should handle UPDATE_EMAIL_SUCCESS action
   *
   * This test ensures that the reducer updates the user's email when the `UPDATE_EMAIL_SUCCESS`
   * action is dispatched.
   *
   * @test {userReducer}
   */
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