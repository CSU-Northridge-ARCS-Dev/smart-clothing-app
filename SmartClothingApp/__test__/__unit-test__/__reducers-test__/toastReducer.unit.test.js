/**
 * Unit tests for the toast reducer in the Smart Clothing App.
 * 
 * This test file includes test cases for the `toastReducer`, which manages the state
 * of toast notifications in the app. The reducer handles actions such as showing a toast,
 * showing an error toast, and discarding the toast. These tests ensure that the reducer
 * correctly updates the state based on the dispatched actions.
 * 
 * The toast reducer updates the state by showing error messages, non-error messages,
 * and managing visibility of the toast notifications. The tests validate that each
 * action appropriately alters the reducer state.
 * 
 * @file toastReducer.unit.test.js
 * 
 * Credit: Carlos Figueroa (github @cfiguer055)
 */
import toastReducer from '../../../src/reducers/toastReducer.js'; 
import { ToastTypes } from '../../../src/actions/types.js';

/**
 * Unit tests for the toastReducer.
 * 
 * Test suite: Toast Reducer
 *
 * This suite tests the `toastReducer`, validating that it correctly handles the following actions:
 * - SHOW_TOAST: Displays a non-error toast with a custom message.
 * - SHOW_ERROR_TOAST: Displays an error toast with a custom message.
 * - DISCARD_TOAST: Hides the toast without clearing the message.
 * 
 * The tests ensure that the reducer properly updates the state of toast notifications,
 * including handling both error and non-error messages.
 *
 * @test {toastReducer}
 */
describe('toastReducer', () => {
  const initialState = {
    error: false,
    message: '',
    show: false,
  };

  /**
   * Test case: Should return the initial state
   *
   * This test verifies that the reducer returns the initial state when no valid action
   * is dispatched. The state should remain unchanged.
   *
   * @test {toastReducer}
   */
  it('should return the initial state', () => {
    expect(toastReducer(undefined, {})).toEqual(initialState);
  });

  /**
   * Test case: Handles SHOW_TOAST action
   *
   * This test checks that when the `SHOW_TOAST` action is dispatched, the reducer updates
   * the state to display a non-error toast with the correct message, and sets `show` to true.
   *
   * @test {toastReducer}
   */
  it('handles SHOW_TOAST', () => {
    const action = { 
        type: ToastTypes.SHOW_TOAST, 
        payload: 'Test Message'
    };
    const expectedState = {
      ...initialState,
      message: 'Test Message',
      show: true,
    };
    expect(toastReducer(initialState, action)).toEqual(expectedState);
  });

  /**
   * Test case: Handles SHOW_ERROR_TOAST action
   *
   * This test checks that when the `SHOW_ERROR_TOAST` action is dispatched, the reducer updates
   * the state to display an error toast with the correct message, and sets `error` to true.
   *
   * @test {toastReducer}
   */
  it('handles SHOW_ERROR_TOAST', () => {
    const action = { type: ToastTypes.SHOW_ERROR_TOAST, payload: 'Error Message' };
    const expectedState = {
      ...initialState,
      error: true,
      message: 'Error Message',
      show: true,
    };
    expect(toastReducer(initialState, action)).toEqual(expectedState);
  });

  /**
   * Test case: Handles DISCARD_TOAST action
   *
   * This test ensures that when the `DISCARD_TOAST` action is dispatched, the reducer correctly
   * updates the state to hide the toast (`show` is set to false), but the message and error status
   * are preserved.
   *
   * @test {toastReducer}
   */
  it('handles DISCARD_TOAST', () => {
    // Using this instead of initial state because action.payload is not nullified and only show is turned to false to hide message
    const discardState = {
        error: false,
        message: 'Test Message',
        show: false,
      };

    // First, simulate showing a toast
    const intermediateState = toastReducer(initialState, { type: ToastTypes.SHOW_TOAST, payload: 'Test Message' });
    // Now, discard the toast
    const action = { type: ToastTypes.DISCARD_TOAST };
    expect(toastReducer(intermediateState, action)).toEqual(discardState);
  });
});
