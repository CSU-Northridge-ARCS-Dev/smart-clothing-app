import { auth } from '../firebaseConfig.js';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import {
  startLogout,
  startUpdateProfile,
  startUpdateUserData,
  startLoadUserData,
} from '../src/actions/userActions.js'; // Adjust the path accordingly
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
} from 'firebase/auth';
import {
  collection,
  addDoc,
  setDoc,
  doc,
  updateDoc,
  getDoc,
} from 'firebase/firestore';

const middlewares = [thunk];
const mockStore = configureMockStore(middlewares);

jest.mock('firebase/firestore', () => ({
  collection: jest.fn(),
  addDoc: jest.fn(),
  setDoc: jest.fn(),
  doc: jest.fn(),
  updateDoc: jest.fn(),
  getDoc: jest.fn(),
}));

jest.mock('../firebaseConfig.js', () => ({
  auth: {
    signOut: jest.fn(() => Promise.resolve()),
    currentUser: {
      displayName: 'John Doe',
    },
  },
}));

jest.mock('firebase/auth', () => ({
  createUserWithEmailAndPassword: jest.fn(),
  signInWithEmailAndPassword: jest.fn(),
  updateProfile: jest.fn(() => Promise.resolve()), // Mock the updateProfile function
  sendPasswordResetEmail: jest.fn(),
}));

describe('Async Auth Actions', () => {
  it('dispatches LOGOUT action when startLogout is called', async () => {
    const expectedActions = [
      {
        type: 'LOGOUT',
      },
      {
        payload: 'User logged out!',
        type: 'showErrorToast',
      },
    ];

    const store = mockStore({});
    await store.dispatch(startLogout());

    expect(store.getActions()).toEqual(expectedActions);
    expect(auth.signOut).toHaveBeenCalled();
  });

  it('logs error when startLogout fails', async () => {
    const consoleLogSpy = jest.spyOn(console, 'log');
    consoleLogSpy.mockImplementation(() => {});

    // Mocking signOut to simulate an error
    auth.signOut.mockRejectedValue(new Error('Error logging out!'));
    const store = mockStore({});
    await store.dispatch(startLogout());

    const consoleLogCalls = consoleLogSpy.mock.calls;
    consoleLogCalls.forEach((call) => {
      console.log('Captured log:', call[0]);
    });

    consoleLogSpy.mockRestore();
  });

  it('dispatches UPDATE_PROFILE action when startUpdateProfile is called successfully', async () => {
    const expectedActions = [
      {
        type: 'UPDATE_PROFILE',
        payload: ['John', 'Doe'],
      },
    ];

    const store = mockStore({});
    await store.dispatch(startUpdateProfile('John', 'Doe'));

    expect(store.getActions()).toEqual(expectedActions);
  });

  it('logs error when startUpdateProfile fails', async () => {
    const consoleErrorSpy = jest.spyOn(console, 'error');
    consoleErrorSpy.mockImplementation(() => {});

    // Mocking updateProfile to simulate an error
    updateProfile.mockRejectedValue(new Error('Error updating profile!'));

    const store = mockStore({});
    await store.dispatch(startUpdateProfile('John', 'Doe'));

    const consoleErrorCalls = consoleErrorSpy.mock.calls;
    consoleErrorCalls.forEach((call) => {
      console.error('Captured error:', call[0]);
    });

    consoleErrorSpy.mockRestore();
  });

  it('logs error and dispatches action when startUpdateUserData fails', async () => {
    const consoleErrorSpy = jest.spyOn(console, 'error');
    consoleErrorSpy.mockImplementation(() => {});

    // Mocking setDoc to simulate an error
    const errorMessage = 'Error adding user data to database!';
    setDoc.mockRejectedValue(new Error(errorMessage));

    const store = mockStore({});
    await store.dispatch(startUpdateUserData({ /* your user metrics data here */ }));

    // Check that the error is logged
    const consoleErrorCalls = consoleErrorSpy.mock.calls;
    consoleErrorCalls.forEach((call) => {
      console.error('Captured error:', call[0]);
      expect(call[0].message).toBe(errorMessage);
    });

    consoleErrorSpy.mockRestore();
  });

  it('logs error when startLoadUserData fails', async () => {
    const consoleErrorSpy = jest.spyOn(console, 'error');
    consoleErrorSpy.mockImplementation(() => {});

    // Mocking getDoc to simulate an error
    const userDocRef = doc(collection, 'Users', 'user123');
    getDoc.mockRejectedValue(new Error('Error loading user data from database!'));

    const store = mockStore({});
    await store.dispatch(startLoadUserData());

    const consoleErrorCalls = consoleErrorSpy.mock.calls;
    consoleErrorCalls.forEach((call) => {
      console.error('Captured error:', call[0]);
    });

    consoleErrorSpy.mockRestore();
  });
});
