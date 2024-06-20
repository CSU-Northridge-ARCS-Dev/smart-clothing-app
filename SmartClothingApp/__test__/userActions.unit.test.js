import { auth } from '../firebaseConfig.js';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { setDoc, getDoc, doc } from 'firebase/firestore';
import { firebaseErrorsMessages } from '../src/utils/firebaseErrorsMessages.js';
import { render, waitFor } from "@testing-library/react"
import flushPromises from 'flush-promises';
import { storeUID, storeMetrics } from "../src/utils/localStorage.js";
import {
  startSignupWithEmail,
  startLoginWithEmail,
  startLogout,
  startUpdateProfile,
  startUpdateUserData,
  startLoadUserData,
  updateUserEmail,
  startSnedPasswordReserEmail,
  updateUserPassword,
} from '../src/actions/userActions.js'; 
import { 
  LOGIN_WITH_EMAIL,
  SIGNUP_WITH_EMAIL,
  LOGOUT,
  UPDATE_PROFILE,
  UPDATE_USER_METRICS_DATA,
  UPDATE_EMAIL_SUCCESS,
  UPDATE_PASSWORD_SUCCESS,
} from '../src/actions/types';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
  sendPasswordResetEmail,
  updateEmail,
  EmailAuthProvider,
  reauthenticateWithCredential,
  updatePassword,
  signOut,
} from 'firebase/auth';
import { toastError } from "../src/actions/toastActions.js";
import { 
  userMetricsDataModalVisible 
} from '../src/actions/appActions';


jest.mock('../src/utils/localStorage.js', () => ({
  AsyncStorage: jest.fn(),
  storeUID: jest.fn(),
  storeMetrics: jest.fn()
}));

jest.mock('firebase/firestore', () => ({
  collection: jest.fn(),
  addDoc: jest.fn(),
  setDoc: jest.fn(),
  doc: jest.fn(),
  updateDoc: jest.fn(),
  getDoc: jest.fn(),
  updateEmail: jest.fn(),
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
  updateEmail: jest.fn(),
  signInWithEmailAndPassword: jest.fn(),
  updateProfile: jest.fn(() => Promise.resolve()), // Mock the updateProfile function
  sendPasswordResetEmail: jest.fn(),
  EmailAuthProvider: jest.fn(),
  reauthenticateWithCredential: jest.fn(),
  updatePassword: jest.fn(),
  storeUID: jest.fn(),
  signOut: jest.fn(),
  auth: {
    updateEmail: jest.fn(),
  },
}));

jest.mock('../src/actions/appActions', () => ({
  userMetricsDataModalVisible: jest.fn(() => ({
    type: 'USER_METRICS_DATA_MODAL_VISIBLE',
    payload: { visibility: true, isFromSignUpScreen: true },
  })),
}));

jest.mock('../src/actions/toastActions', () => ({
  toastError: jest.fn((message) => ({
    type: 'showErrorToast',
    payload: message,
  })),
  toastInfo: jest.fn((message) => ({
    type: 'showToast',
    payload: message,
  })),
  toastDiscard: jest.fn(() => ({
    type: 'discardToast',
  })),
}));







const middlewares = [thunk];
const mockStore = configureMockStore(middlewares);


describe('Async User Actions', () => {
  // ### User Actions

  beforeEach(() => {
    // Prevents console log warning 
    jest.spyOn(console, 'error').mockImplementation((message) => {
      if (message.includes('Warning: An update to')) {
        return;
      }
      console.error(message);
    });

    jest.useFakeTimers();

    jest.clearAllMocks();
  });

  describe('Authentication Actions', () => {
    it('should dispatch SIGNUP_WITH_EMAIL and userMetricsDataModalVisible on successful sign-up', async () => {
      const user = { uid: 'testUID', email: 'test@example.com' };
      const store = mockStore({});
      
      createUserWithEmailAndPassword.mockResolvedValue({ user });

      await store.dispatch(startSignupWithEmail('test@example.com', 'password123', 'John', 'Doe'));

      const actions = store.getActions();
      expect(actions[0]).toEqual(userMetricsDataModalVisible(true, true));
      expect(actions[1]).toEqual({
        type: SIGNUP_WITH_EMAIL,
        payload: { uuid: user.uid, firstName: 'John', lastName: 'Doe', email: user.email }
      });
    });

    it('should call startUpdateProfile with firstName and lastName on successful sign-up', async () => {
      const user = { uid: 'testUID', email: 'test@example.com' };
      const store = mockStore({});
      createUserWithEmailAndPassword.mockResolvedValue({ user });

      await store.dispatch(startSignupWithEmail('test@example.com', 'password123', 'John', 'Doe'));

      expect(updateProfile).toHaveBeenCalledWith(expect.anything(), { displayName: 'John Doe' });
    });

    it('should dispatch toastError with appropriate message on sign-up failure', async () => {
      const error = { code: "auth/email-already-in-use" };
      const store = mockStore({});

      createUserWithEmailAndPassword.mockRejectedValue(error);

      await store.dispatch(startSignupWithEmail('test@example.com', 'password123', 'John', 'Doe'));

      // Wait for all promises to resolve
      await flushPromises();

      const actions = store.getActions();
      console.log(actions);

      const expectedErrorsMessage = firebaseErrorsMessages[error.code] || "Email address already in use";
      // expect(actions[0]).toEqual(toastError(expectedErrorsMessage));

      expect(actions[0]).toEqual({
        type: 'showErrorToast',
        payload: expectedErrorsMessage,
      });
    });

    it('should dispatch LOGIN_WITH_EMAIL and startLoadUserData on successful login', async () => {
      const user = { uid: 'testUID', email: 'test@example.com', displayName: 'John Doe' };
      const store = mockStore({});
      
      signInWithEmailAndPassword.mockResolvedValue({ user });

      await store.dispatch(startLoginWithEmail('test@example.com', 'password123'));

      await flushPromises();

      const actions = store.getActions();

      expect(storeUID).toHaveBeenCalledWith(expect.anything());

      expect(actions[0]).toEqual({
        type: 'LOGIN_WITH_EMAIL',
        payload: {
          uuid: 'testUID',
          firstName: 'John',
          lastName: 'Doe',
          email: 'test@example.com'
        }
      });
    });

    it('should call storeUID with user UID on successful login', async () => {
      const user = { uid: 'testUID', email: 'test@example.com', displayName: 'John Doe' };
      const store = mockStore({});

      signInWithEmailAndPassword.mockResolvedValue({ user });

      await store.dispatch(startLoginWithEmail('test@example.com', 'password123'));

      expect(storeUID).toHaveBeenCalledWith(user.uid);
    });

    it('should dispatch toastError with appropriate message on login failure', async () => {
      const error = { code: 'auth/wrong-password' };
      const store = mockStore({});
      signInWithEmailAndPassword.mockRejectedValue(error);

      await store.dispatch(startLoginWithEmail('test@example.com', 'password123'));

      await flushPromises();

      const actions = store.getActions();

      const expectedErrorsMessage = firebaseErrorsMessages[error.code] || "Wrong password.";

      expect(actions[0]).toEqual(toastError(expectedErrorsMessage));
    });

    it('should dispatch LOGOUT and toastError on successful logout', async () => {
      const store = mockStore({});
      signOut.mockResolvedValue();

      await store.dispatch(startLogout());

      const actions = store.getActions();
      expect(actions[0]).toEqual({ type: LOGOUT });
      expect(actions[1]).toEqual(toastError('User logged out!'));
    });

  });




  // ### Profile Update Actions

  describe('Profile Update Actions', () => {
    it('should dispatch UPDATE_PROFILE on successful profile update', async () => {
      const store = mockStore({});
      
      updateProfile.mockResolvedValue();

      await store.dispatch(startUpdateProfile('John', 'Doe'));  

      const action = store.getActions();
      expect(action[0]).toEqual({
        type: UPDATE_PROFILE,
        payload: ['John', 'Doe'],
      }); 
    });

    it('should dispatch toastError with appropriate message on profile update failure', async () => {
      const error = { code: '' };
      const store = mockStore({});
      
      updateProfile.mockRejectedValue(new Error('Error updating profile!'));

      await store.dispatch(startUpdateProfile('John', 'Doe'));  

      await flushPromises();

      const action = store.getActions();
      expect(action[0]).toEqual(toastError('Error updating profile!')); 
    });
  });




  // ### User Data Actions

  describe('User Data Actions', () => {
    it('should call setDoc and dispatch UPDATE_USER_METRICS_DATA on successful user data update', async () => {
      const store = mockStore({});
      const userData = { metrics: 'some metrics data' };
      
      // Mock the doc and setDoc functions
      const mockDoc = jest.fn();
      doc.mockReturnValue(mockDoc);
      setDoc.mockResolvedValue();

      await store.dispatch(startUpdateUserData(userData));

      // Wait for all promises to resolve
      await flushPromises();

      const actions = store.getActions();

      expect(setDoc).toHaveBeenCalledWith(
        expect.anything(),
        userData
      );
      expect(storeMetrics).toHaveBeenCalledWith(userData);
      expect(actions[0]).toEqual({
        type: UPDATE_USER_METRICS_DATA,
        payload: userData
      });
    });

    it('should store user metrics data in local storage on successful user data update', async () => {
      const store = mockStore({});
      const userData = { metrics: 'some metrics data' };
      
      // Mock the doc and setDoc functions
      const mockDoc = jest.fn();
      doc.mockReturnValue(mockDoc);
      setDoc.mockResolvedValue();

      await store.dispatch(startUpdateUserData(userData));

      // Wait for all promises to resolve
      await flushPromises();

      expect(storeMetrics).toHaveBeenCalledWith(userData);
    });

    it('should log error message on user data update failure', async () => {
      const store = mockStore({});
      const userData = { metrics: 'some metrics data' };
      const error = new Error('Failed to update user data');
      
      // Mock the doc and setDoc functions
      const mockDoc = jest.fn();
      doc.mockReturnValue(mockDoc);
      setDoc.mockRejectedValue(error);

      await store.dispatch(startUpdateUserData(userData));

      // Wait for all promises to resolve
      await flushPromises();

      const actions = store.getActions();

      expect(setDoc).toHaveBeenCalledWith(
        expect.anything(),
        userData
      );
      expect(storeMetrics).not.toHaveBeenCalled();
      expect(actions).toEqual([]);
    });

    it('should call getDoc and dispatch UPDATE_USER_METRICS_DATA if user data exists', async () => {
      const store = mockStore({});
      const userData = { metrics: 'some metrics data' };

      // Mock the doc and getDoc functions
      const mockDoc = jest.fn();
      doc.mockReturnValue(mockDoc);
      getDoc.mockResolvedValue({
        exists: () => true,
        data: () => userData
      });

      await store.dispatch(startLoadUserData());

      // Wait for all promises to resolve
      await flushPromises();

      const actions = store.getActions();

      expect(getDoc).toHaveBeenCalledWith(mockDoc);
      expect(actions[0]).toEqual({
        type: UPDATE_USER_METRICS_DATA,
        payload: userData
      });
    });

    it('should log a message if user data does not exist', async () => {
      const store = mockStore({});
    
      // Mock the doc and getDoc functions
      const mockDoc = jest.fn();
      doc.mockReturnValue(mockDoc);
      getDoc.mockResolvedValue({
        exists: () => false,
      });

      // Spy on console.log
      const consoleLogSpy = jest.spyOn(console, 'log');

      await store.dispatch(startLoadUserData());

      // Wait for all promises to resolve
      await flushPromises();

      expect(getDoc).toHaveBeenCalledWith(mockDoc);
      expect(consoleLogSpy).toHaveBeenCalledWith("User data doesn't exist in the database!");

      // Clean up the spy
      consoleLogSpy.mockRestore();
    });

    it('should log error message on user data load failure', async () => {
      const store = mockStore({});
      const error = new Error('Failed to load user data');

      // Mock the doc and getDoc functions
      const mockDoc = jest.fn();
      doc.mockReturnValue(mockDoc);
      getDoc.mockRejectedValue(error);

      await store.dispatch(startLoadUserData());

      // Wait for all promises to resolve
      await flushPromises();

      const actions = store.getActions();

      expect(getDoc).toHaveBeenCalledWith(mockDoc);
      expect(actions).toEqual([]);
    });
  });




  // ### Email and Password Actions

  describe('Email and Password Actions', () => {
    it('should call updateEmail and dispatch UPDATE_EMAIL_SUCCESS on successful email update', async () => {
      const store = mockStore({});
      const newEmail = 'newemail@example.com';

      // Mock the updateEmail function to resolve
      updateEmail.mockResolvedValue();

      await store.dispatch(updateUserEmail(newEmail));

      // Wait for all promises to resolve
      await flushPromises();

      const actions = store.getActions();

      expect(updateEmail).toHaveBeenCalledWith(auth.currentUser, newEmail);
      expect(actions[0]).toEqual({
        type: UPDATE_EMAIL_SUCCESS,
        payload: newEmail,
      });
    });

    it('should dispatch toastError with appropriate message on email update failure', async () => {
      const store = mockStore({});
      const newEmail = 'newemail@example.com';
      const error = { code: "auth/email-already-in-use" };

      // Mock the updateEmail function to reject
      updateEmail.mockRejectedValue(error);

      await store.dispatch(updateUserEmail(newEmail));

      // Wait for all promises to resolve
      await flushPromises();

      const actions = store.getActions();

      expect(updateEmail).toHaveBeenCalledWith(auth.currentUser, newEmail);
      expect(actions[0]).toEqual(toastError(firebaseErrorsMessages[error.code]));
    });

    it('should call sendPasswordResetEmail and log success message', async () => {
      const email = 'test@example.com';

      // Mock the sendPasswordResetEmail function to resolve
      sendPasswordResetEmail.mockResolvedValue();

      // Spy on console.log
      const consoleLogSpy = jest.spyOn(console, 'log');

      await startSnedPasswordReserEmail(email);

      // Wait for all promises to resolve
      await flushPromises();

      expect(sendPasswordResetEmail).toHaveBeenCalledWith(auth, email);
      expect(consoleLogSpy).toHaveBeenCalledWith("###### Password reset email sent!");

      // Clean up the spy
      consoleLogSpy.mockRestore();
    });

    it('should log error message on password reset email failure', async () => {
      const email = 'test@example.com';
      const error = new Error('Failed to send password reset email');

      // Mock the sendPasswordResetEmail function to reject
      sendPasswordResetEmail.mockRejectedValue(error);

      // Spy on console.log
      const consoleLogSpy = jest.spyOn(console, 'log');

      await startSnedPasswordReserEmail(email);

      // Wait for all promises to resolve
      await flushPromises();

      expect(sendPasswordResetEmail).toHaveBeenCalledWith(auth, email);
      expect(consoleLogSpy).toHaveBeenCalledWith(error);
      expect(consoleLogSpy).toHaveBeenCalledWith(new Error('Failed to send password reset email'));

      // Clean up the spy
      consoleLogSpy.mockRestore();
    });

    it('should call updatePassword and log success message', async () => {
      const store = mockStore({});
      const newPassword = 'newPassword123';
      const user = { uid: 'testUID' };

      // Mock the currentUser
      auth.currentUser = user;

      // Mock the updatePassword function to resolve
      updatePassword.mockResolvedValue();

      // Spy on console.log
      const consoleLogSpy = jest.spyOn(console, 'log');

      await store.dispatch(updateUserPassword(newPassword));

      // Wait for all promises to resolve
      await flushPromises();

      expect(updatePassword).toHaveBeenCalledWith(user, newPassword);
      expect(consoleLogSpy).toHaveBeenCalledWith("Password update success");

      // Clean up the spy
      consoleLogSpy.mockRestore();
    });

    it('should dispatch toastError with appropriate message on password update failure', async () => {
      const store = mockStore({});
      const newPassword = 'pass';
      const user = { uid: 'testUID' };
      const error = { code: 'auth/weak-password' };

      // Mock the currentUser
      auth.currentUser = user;

      // Mock the updatePassword function to reject
      updatePassword.mockImplementation(() => {
        throw error; // Simulate synchronous error for testing
      });

      // Spy on console.log
      const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();

      await store.dispatch(updateUserPassword(newPassword));

      const actions = store.getActions();

      expect(updatePassword).toHaveBeenCalledWith(user, newPassword);
      expect(actions[0]).toEqual({
        type: 'showErrorToast',
        payload: firebaseErrorsMessages[error.code],
      });
      expect(consoleLogSpy).toHaveBeenCalledWith("Password update failure");

      // Clean up the spy
      consoleLogSpy.mockRestore();
      });
  });




  // ### Reauthentication Actions

  describe('Reauthentication Actions', () => {
    it('should call reauthenticateWithCredential and log success message on successful reauthentication', async () => {});

    it('should dispatch toastError with appropriate message on reauthentication failure', async () => {});

    it('should return false if currentPassword is not provided', async () => {});
  });




  // ### Data Query Actions

  describe('Data Query Actions', () => {
    it('should execute query with the correct date range for querySleepData', async () => {});

    it('should return the correct data within the specified date range for querySleepData', async () => {});

    it('should log error message on query failure for querySleepData', async () => {});

    it('should execute query with the correct date range for queryHeartRateData', async () => {});

    it('should return the correct data within the specified date range for queryHeartRateData', async () => {});

    it('should log error message on query failure for queryHeartRateData', async () => {});
  });




  // ### Account Deletion Actions

  describe('Account Deletion Actions', () => {
    it('should call delete and deleteDoc on successful account deletion', async () => {});

    it('should sign out and dispatch LOGOUT on successful account deletion', async () => {});

    it('should dispatch toastError with appropriate message on account deletion failure', async () => {});
  });
});

