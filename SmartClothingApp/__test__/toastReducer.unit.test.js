import toastReducer from '../src/reducers/toastReducer'; 
import { ToastTypes } from '../src/actions/types.js';


describe('toastReducer', () => {
  const initialState = {
    error: false,
    message: '',
    show: false,
  };

  it('should return the initial state', () => {
    expect(toastReducer(undefined, {})).toEqual(initialState);
  });

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
