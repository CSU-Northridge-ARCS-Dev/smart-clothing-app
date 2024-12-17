/**
 * Unit tests for user actions in the Smart Clothing App.
 * 
 * This test file includes test cases for user authentication, profile updates,
 * user data, email/password management, and more. Firebase Firestore and 
 * Firebase Authentication methods are mocked, and thunks are tested to ensure
 * proper dispatching of actions.
 * 
 * Mocks:
 * - Firebase Firestore methods (getDoc, setDoc, etc.)
 * - Firebase Authentication methods (createUserWithEmailAndPassword, signInWithEmailAndPassword, etc.)
 * - LocalStorage methods (storeUID, storeMetrics)
 * 
 * Global mocks and setup are done via jest to simulate database and authentication
 * services.
 *
 * @file userActions.unit.test.js
 * 
 * Credit: Carlos Figueroa (github @cfiguer055)
 *         Harshit _____ (github @___)
 */
import { auth, database } from '../../../firebaseConfig.js';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { firebaseErrorsMessages } from '../../../src/utils/firebaseErrorsMessages.js';
import { render, waitFor } from "@testing-library/react"
import flushPromises from 'flush-promises';
import { 
  storeUID, 
  storeMetrics, 
  getUID, 
  clearUID, 
  clearMetrics, 
  getMetrics, 
  storeFirstName,
  getFirstName,
  clearFirstName,
  storeLastName,
  getLastName,
  clearLastName,
  storeEmail,
  getEmail,
  clearEmail,
} from "../../../src/utils/localStorage.js";
import { 
  setDoc, 
  getDoc, 
  getDocs,
  doc,
  collection,
  addDoc,
  updateDoc,
  query,
  where,
  orderBy,
  deleteDoc,
} from 'firebase/firestore';
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
  reauthenticate,
  querySleepData,
  queryHeartRateData,
  deleteAccount,
  logout,
  restoreUUID
} from '../../../src/actions/userActions.js'; 
import { 
  LOGIN_WITH_EMAIL,
  SIGNUP_WITH_EMAIL,
  LOGOUT,
  UPDATE_PROFILE,
  UPDATE_USER_METRICS_DATA,
  UPDATE_EMAIL_SUCCESS,
  UPDATE_PASSWORD_SUCCESS,
} from '../../../src/actions/types.js';
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
import { toastError } from "../../../src/actions/toastActions.js";
import { 
  userMetricsDataModalVisible 
} from '../../../src/actions/appActions.js';
import { type } from '@testing-library/react-native/build/user-event/type/type.js';
import 'react-native-gesture-handler/jestSetup';


/**
 * Mocks the localStorage utility functions and Firebase Firestore methods.
 * These mocks simulate database and storage interactions for the test cases.
 */
jest.mock('../../../src/utils/localStorage.js', () => ({
  AsyncStorage: jest.fn(),
  storeUID: jest.fn(),
  storeMetrics: jest.fn(),
  getUID: jest.fn(),
  clearUID: jest.fn(),
  getMetrics: jest.fn(),
  clearMetrics: jest.fn(),
  storeFirstName: jest.fn(),
  getFirstName: jest.fn(),
  clearFirstName: jest.fn(),
  storeLastName: jest.fn(),
  getLastName: jest.fn(),
  clearLastName: jest.fn(),
  storeEmail: jest.fn(),
  getEmail: jest.fn(),
  clearEmail: jest.fn(),
}));

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(() => Promise.resolve('mocked_value')),
  setItem: jest.fn(() => Promise.resolve()),
  removeItem: jest.fn(() => Promise.resolve()),
  clear: jest.fn(() => Promise.resolve()),
}));

jest.mock('firebase/firestore', () => ({
  collection: jest.fn(),
  addDoc: jest.fn(),
  setDoc: jest.fn(),
  doc: jest.fn(),
  updateDoc: jest.fn(),
  query: jest.fn(),
  where: jest.fn(),
  orderBy: jest.fn(),
  getDoc: jest.fn(),
  getDocs: jest.fn(),
  updateEmail: jest.fn(),
  deleteDoc: jest.fn(),
}));

jest.mock('../../../firebaseConfig.js', () => ({
  auth: {
    signOut: jest.fn(() => Promise.resolve()),
    currentUser: {
      uid: 'testUID',
      displayName: 'John Doe',
      delete: jest.fn().mockResolvedValue(), 
      signOut: jest.fn().mockResolvedValue(),
    },
  },
  database: {},
}));

jest.mock('firebase/auth', () => ({
  createUserWithEmailAndPassword: jest.fn(),
  updateEmail: jest.fn(),
  signInWithEmailAndPassword: jest.fn(),
  updateProfile: jest.fn(() => Promise.resolve()), // Mock the updateProfile function
  sendPasswordResetEmail: jest.fn(),
  // EmailAuthProvider: jest.fn(),
  EmailAuthProvider: {
    credential: jest.fn(),
  },
  reauthenticateWithCredential: jest.fn(),
  updatePassword: jest.fn(),
  storeUID: jest.fn(),
  signOut: jest.fn(),
  auth: {
    updateEmail: jest.fn(),
  },
}));

jest.mock('../../../src/actions/appActions', () => ({
  userMetricsDataModalVisible: jest.fn(() => ({
    type: 'USER_METRICS_DATA_MODAL_VISIBLE',
    payload: { visibility: true, isFromSignUpScreen: true },
  })),
}));

jest.mock('../../../src/actions/toastActions', () => ({
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

// Mock `@expo/vector-icons`
jest.mock('@expo/vector-icons', () => ({
  MaterialCommunityIcons: jest.fn(() => null),
}));

jest.mock('expo-font', () => ({
  loadAsync: jest.fn(() => Promise.resolve()),
}));

jest.mock('../../../src/hooks/useAppFonts', () => ({
  useAppFonts: jest.fn(() => true),
}));

jest.mock('react-native-paper', () => {
  const mock = jest.requireActual('react-native-paper');
  return {
    ...mock,
    Provider: ({ children }) => <>{children}</>,
  };
});






// Middleware and store setup
const middlewares = [thunk];
const mockStore = configureMockStore(middlewares);


/**
 * Unit tests for user actions in the Smart Clothing App.
 *
 * This suite of tests covers the core user actions, focusing on:
 * - User authentication (sign-up, login, logout)
 * - Profile updates and user data handling
 * - Email and password management (password resets, email updates)
 * 
 * The tests ensure proper dispatching of Redux actions and verify that interactions with
 * Firebase Firestore and Firebase Authentication behave as expected.
 *
 * Mocks are set up for Firebase Firestore, Firebase Authentication, and AsyncStorage 
 * to simulate interactions and isolate the tests from external dependencies.
 *
 * @test {startSignupWithEmail} Test for user sign-up with email and password.
 * @test {startLoginWithEmail} Test for user login with email and password.
 * @test {startUpdateProfile} Test for updating user profile information.
 * @test {startLoadUserData} Test for loading user data from Firestore.
 * @test {updateUserEmail} Test for updating the user's email address.
 * @test {updateUserPassword} Test for updating the user's password.
 * @test {reauthenticate} Test for re-authenticating the user before sensitive actions.
 */
describe('Async User Actions', () => {

  /**
   * Before each test case, reset mocks and set up timers.
   */
  beforeEach(() => {
    // Prevents console log warning 
    // jest.spyOn(console, 'error').mockImplementation((message) => {
    //   if (message.includes('Warning: An update to')) {
    //     return;
    //   }
    //   console.error(message);
    // });

    // Use fake timers for consistent timing in async tests
    jest.useFakeTimers();

    // Clear any previously set mock timers
    jest.clearAllTimers();

    // Reset all Jest mocks and spies
    jest.clearAllMocks();

    // Reset any module caches to prevent state leakage between tests
    jest.resetModules();
  });

  /**
   * Authentication Actions Test Suite
   */
  describe('Authentication Actions', () => {

    /**
     * Test for successful signup with email.
     * Verifies that userMetricsDataModalVisible and SIGNUP_WITH_EMAIL are dispatched.
     *
     * @test {startSignupWithEmail}
     */
    it('should dispatch SIGNUP_WITH_EMAIL and userMetricsDataModalVisible on successful sign-up', async () => {
      const user = { uid: 'testUID', email: 'test@example.com' };
      const store = mockStore({});
      
      // Mock createUserWithEmailAndPassword to resolve with user data
      createUserWithEmailAndPassword.mockResolvedValue({ user });

      // Mock setDoc to resolve successfully
      setDoc.mockResolvedValue();
      //storeUID.mockResolvedValue(user.uid);

      // Mock doc to return a function (it's typically called with parameters in Firestore setup)
      // doc.mockReturnValue(jest.fn());

      await store.dispatch(startSignupWithEmail('test@example.com', 'password123', 'John', 'Doe'));

      const actions = store.getActions();
      expect(actions[0]).toEqual(userMetricsDataModalVisible(true, true));
      expect(actions[1]).toEqual({
        type: SIGNUP_WITH_EMAIL,
        payload: { uuid: user.uid, firstName: 'John', lastName: 'Doe', email: user.email }
      });
    });

    /**
     * Test for profile update during sign-up.
     * Ensures that startUpdateProfile is called with correct parameters.
     *
     * @test {startSignupWithEmail}
     */
    it('should call startUpdateProfile with firstName and lastName on successful sign-up', async () => {
      const user = { uid: 'testUID', email: 'test@example.com' };
      const store = mockStore({});

      // Mock createUserWithEmailAndPassword to resolve with user data
      createUserWithEmailAndPassword.mockResolvedValue({ user });

      await store.dispatch(startSignupWithEmail('test@example.com', 'password123', 'John', 'Doe'));

      expect(updateProfile).toHaveBeenCalledWith(expect.anything(), { displayName: 'John Doe' });
    });

    /**
     * Test for handling sign-up failure.
     * Verifies that the correct error message is dispatched via toastError.
     *
     * @test {startSignupWithEmail}
     */
    it('should dispatch toastError with appropriate message on sign-up failure', async () => {
      const error = { code: "auth/email-already-in-use" };
      const store = mockStore({});
   
      // Mock createUserWithEmailAndPassword to reject with an error
      createUserWithEmailAndPassword.mockRejectedValue(error);
   
      // Mock setDoc to resolve successfully (not used here due to early failure)
      setDoc.mockResolvedValue();

      //storeUID.mockRejectedValue();
   
      // Mock doc to return a function 
      //doc.mockReturnValue(jest.fn());
   
      try {
        // Dispatch the signup action and wait for it to complete
        await store.dispatch(startSignupWithEmail('test@example.com', 'password123', 'John', 'Doe'));
        await flushPromises();
     } catch (err) {
        // Handle the expected error without failing the test
        expect(err).toEqual(error);  // Ensure the error is the expected one
     }
      
      // Now verify the dispatched actions
      const actions = store.getActions();
      console.log(actions);
   
      const expectedErrorsMessage = firebaseErrorsMessages[error.code] || "Email address already in use";
   
      expect(actions[0]).toEqual({
         type: 'showErrorToast',
         payload: expectedErrorsMessage,
      });
   });   

    /**
     * Test for successful login with email.
     * Verifies that LOGIN_WITH_EMAIL and startLoadUserData are dispatched.
     *
     * @test {startLoginWithEmail}
     */
    it('should dispatch LOGIN_WITH_EMAIL and startLoadUserData on successful login', async () => {
      const user = { uid: 'testUID', email: 'test@example.com', displayName: 'John Doe' };
      const store = mockStore({});
      
      signInWithEmailAndPassword.mockResolvedValue({ user });

      await store.dispatch(startLoginWithEmail('test@example.com', 'password123'));

      await flushPromises();

      const actions = store.getActions();

      expect(storeUID).toHaveBeenCalledWith(expect.anything());
      expect(storeFirstName).toHaveBeenCalledWith(expect.anything());
      expect(storeLastName).toHaveBeenCalledWith(expect.anything());
      expect(storeEmail).toHaveBeenCalledWith(expect.anything());

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

    /**
     * Test to check if user UID is stored on successful login.
     * Verifies that storeUID is called with correct user UID.
     *
     * @test {startLoginWithEmail}
     */
    it('should call storeUID with user UID on successful login', async () => {
      const user = { uid: 'testUID', email: 'test@example.com', displayName: 'John Doe' };
      const store = mockStore({});

      signInWithEmailAndPassword.mockResolvedValue({ user });

      await store.dispatch(startLoginWithEmail('test@example.com', 'password123'));

      expect(storeUID).toHaveBeenCalledWith(user.uid);
    });

    /**
     * Test for handling login failure.
     * Verifies that the correct error message is dispatched via toastError.
     *
     * @test {startLoginWithEmail}
     */
    // it('should dispatch toastError with appropriate message on login failure', async () => {
    //   const error = { code: 'auth/wrong-password' }; // Mock Firebase error
    //   const expectedErrorMessage = 'Wrong password.'; // Message mapped to 'auth/wrong-password'
    //   const store = mockStore({}); // Initialize mock Redux store

    //   signInWithEmailAndPassword.mockRejectedValue(error); // Simulate failure

    //   // Dispatch the login action
    //   await store.dispatch(startLoginWithEmail('test@example.com', 'password123'));

    //   // Get all dispatched actions
    //   const actions = store.getActions();

    //   // Assert the correct action is dispatched
    //   expect(actions).toContainEqual({
    //     type: 'showErrorToast',
    //     payload: expectedErrorMessage,
    //   });
    // });



    // it('should dispatch toastError with appropriate message on login failure', async () => {
    //   const error = { code: 'auth/wrong-password' };
    //   const store = mockStore({});
    //   signInWithEmailAndPassword.mockRejectedValue(error);

    //   await store.dispatch(startLoginWithEmail('test@example.com', 'password123'));

    //   await flushPromises();

    //   const actions = store.getActions();

    //   const expectedErrorMessage = firebaseErrorsMessages[error.code] || "Wrong password.";

    //   console.log('Actions:', actions);

    //   // Check if toastError action is dispatched
    //   //expect(actions).toContainEqual(toastError(expectedErrorMessage));
    //   //expect(actions[0]).toEqual(toastError(expectedErrorMessage));
    //   expect(actions).toContainEqual({
    //     type: 'showErrorToast',
    //     payload: expectedErrorMessage,
    //   });
    // });

    /**
     * Test for successful logout.
     * Verifies that LOGOUT and toastError actions are dispatched.
     *
     * @test {startLogout}
     */
    it('should dispatch LOGOUT and toastError on successful logout', async () => {
      const store = mockStore({});

      // Set up the mocks to resolve as expected
      signOut.mockResolvedValue();
      getUID.mockResolvedValueOnce('someUID').mockResolvedValueOnce(null); 
      clearUID.mockResolvedValue();
      clearMetrics.mockResolvedValue();

      await store.dispatch(startLogout());

      const actions = store.getActions();
      
      expect(actions[0]).toEqual({ type: LOGOUT });
      expect(actions[1]).toEqual(toastError('User logged out!'));
    });


    /**
     * Test for successful UUID restoration.
     * Verifies that loginWithEmail is dispatched with the stored UUID.
     *
     * @test {restoreUUID}
     */
    it('should dispatch loginWithEmail with stored UUID if UUID exists', async () => {
      const storedUID = 'testStoredUID';
      const store = mockStore({});

      // Mock getUID from AsyncStorage
      getUID.mockReturnValueOnce(storedUID);

      // Spy on console.log
      const consoleLogSpy = jest.spyOn(console, 'log');

      await store.dispatch(restoreUUID(storedUID));

      const actions = store.getActions();

      expect(actions[0]).toEqual({
        type: LOGIN_WITH_EMAIL,
        payload: {
          uuid: storedUID,
          firstName: null,
          lastName: null,
          email: null
        }
      });
      expect(consoleLogSpy).toHaveBeenCalledWith("UUID restored successfully:", storedUID);
    });

    /**
     * Test for missing UUID in AsyncStorage.
     * Verifies that no action is dispatched and a log message is printed.
     *
     * @test {restoreUUID}
     */
    it('should log a message if no UUID is found in AsyncStorage', async () => {
      const store = mockStore({});
      
      // Spy on console.log
      const consoleLogSpy = jest.spyOn(console, 'log');

      await store.dispatch(restoreUUID(null));

      const actions = store.getActions();

      expect(actions).toEqual([]);  // No actions should be dispatched
      expect(consoleLogSpy).toHaveBeenCalledWith("No UUID found in AsyncStorage.");

      // Clean up the spy
      consoleLogSpy.mockRestore();
    });

    /**
     * Test for error handling during UUID restoration.
     * Verifies that an error message is logged when an error occurs.
     *
     * @test {restoreUUID}
     */
    it('should log error message if an error occurs during UUID restoration', async () => {
      const store = mockStore({});
      
      // Mock getUID Fail
      getUID.mockImplementation(() => {
        throw error; // Simulate synchronous error for testing
      });

      // Spy on console.error
      const consoleErrorSpy = jest.spyOn(console, 'error');
    
      // Dispatch with a faulty UUID or simulate an error in restoration
      await store.dispatch(restoreUUID(null));
    
      // Check if no actions were dispatched due to the missing UUID
      const actions = store.getActions();
      expect(actions).toEqual([]);
    
      // Check if console.error was called
      expect(consoleErrorSpy).toHaveBeenCalledWith("Error restoring UUID:", expect.any(Error));
    
      consoleErrorSpy.mockRestore();
    });
    

  });




  // ### Profile Update Actions

  describe('Profile Update Actions', () => {

    /**
     * Test for successful profile update.
     * Verifies that the correct Redux action is dispatched.
     *
     * @test {startUpdateProfile}
     */
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
    
    /**
     * Test for profile update failure.
     * Verifies that the correct error message is dispatched via toastError.
     *
     * @test {startUpdateProfile}
     */
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

    /**
     * Test for successful user data update.
     * Verifies that setDoc and UPDATE_USER_METRICS_DATA are called and dispatched correctly.
     *
     * @test {startUpdateUserData}
     */
    it('should call setDoc and dispatch UPDATE_USER_METRICS_DATA on successful user data update', async () => {
      const store = mockStore({});
      const userData = { metrics: 'some metrics data' };
      
      // Mock the doc and setDoc functions
      const mockDoc = jest.fn();
      doc.mockReturnValue(mockDoc);
      //setDoc.mockResolvedValue();
      updateDoc.mockResolvedValue();
      storeMetrics.mockResolvedValue();

      await store.dispatch(startUpdateUserData(userData));

      // Wait for all promises to resolve
      await flushPromises();

      const actions = store.getActions();

      expect(updateDoc).toHaveBeenCalledWith(
        expect.anything(),
        userData
      );
      expect(storeMetrics).toHaveBeenCalledWith(userData);
      expect(actions[0]).toEqual({
        type: UPDATE_USER_METRICS_DATA,
        payload: userData
      });
    });

    /**
     * Test for storing user metrics in local storage after user data update.
     * Verifies that storeMetrics is called on successful user data update.
     *
     * @test {startUpdateUserData}
     */
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

    /**
     * Test for handling user data update failure.
     * Verifies that no actions are dispatched and an error is logged.
     *
     * @test {startUpdateUserData}
     */
    it('should log error message on user data update failure', async () => {
      const store = mockStore({});
      const userData = { metrics: 'some metrics data' };
      const error = new Error('Failed to update user data');
      
      // Mock the doc and setDoc functions
      const mockDoc = jest.fn();
      doc.mockReturnValue(mockDoc);
      //setDoc.mockRejectedValue(error);
      updateDoc.mockRejectedValue(error);

      await store.dispatch(startUpdateUserData(userData));

      // Wait for all promises to resolve
      await flushPromises();

      const actions = store.getActions();

      expect(updateDoc).toHaveBeenCalledWith(
        expect.anything(),
        userData
      );
      expect(storeMetrics).not.toHaveBeenCalled();
      expect(actions).toEqual([]);
    });

    /**
     * Test for loading user data if it exists.
     * Verifies that getDoc is called and the data is dispatched via UPDATE_USER_METRICS_DATA.
     *
     * @test {startLoadUserData}
     */
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

    /**
     * Test for missing user data.
     * Verifies that a log message is printed if the user data doesn't exist in the database.
     *
     * @test {startLoadUserData}
     */
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

    /**
     * Test for handling failure when loading user data.
     * Verifies that no actions are dispatched and an error is logged.
     *
     * @test {startLoadUserData}
     */
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
    
    /**
     * Test for updating user email.
     * Verifies that updateEmail and UPDATE_EMAIL_SUCCESS are called and dispatched correctly.
     *
     * @test {updateUserEmail}
     */
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

    /**
     * Test for email update failure.
     * Verifies that the correct error message is dispatched via toastError.
     *
     * @test {updateUserEmail}
     */
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

    /**
     * Test for sending password reset email.
     * Verifies that sendPasswordResetEmail is called and logs a success message.
     *
     * @test {startSnedPasswordReserEmail}
     */
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

    /**
     * Test for failure when sending password reset email.
     * Verifies that the correct error message is logged.
     *
     * @test {startSnedPasswordReserEmail}
     */
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

    /**
     * Test for successful password update.
     * Verifies that updatePassword is called and a success message is logged.
     *
     * @test {updateUserPassword}
     */
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

    /**
     * Test for password update failure.
     * Verifies that the correct error message is dispatched via toastError.
     *
     * @test {updateUserPassword}
     */
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
    
    /**
     * Test for successful reauthentication.
     * Verifies that reauthenticateWithCredential is called and a success message is logged.
     *
     * @test {reauthenticate}
     */
    it('should call reauthenticateWithCredential and log success message on successful reauthentication', async () => {
      const store = mockStore({});

      const currentPassword = 'newPassword123';

      // Mock the reauthenticateWithCredential function to resolve
      reauthenticateWithCredential.mockResolvedValue();

      // Spy on console.log
      const consoleLogSpy = jest.spyOn(console, 'log');

      const returnValue = await store.dispatch(reauthenticate(currentPassword));

      // Wait for all promises to resolve
      await flushPromises();

      expect(reauthenticateWithCredential).toHaveBeenCalledWith(auth.currentUser, EmailAuthProvider.credential(auth.currentUser.email, currentPassword));
      expect(consoleLogSpy).toHaveBeenCalledWith("Reauthentication success");
      expect(returnValue).toBe(true);

      // Clean up the spy
      consoleLogSpy.mockRestore();

    });

    /**
     * Test for reauthentication failure.
     * Verifies that the correct error message is dispatched via toastError.
     *
     * @test {reauthenticate}
     */
    it('should dispatch toastError with appropriate message on reauthentication failure', async () => {
      const store = mockStore({});
      const currentPassword = 'newPassword123';
      const user = { email: 'test@example.com', uid: 'testUID' };
      const error = { code: 'auth/wrong-password' };

      // Mock the currentUser
      auth.currentUser = user;

      // Mock the EmailAuthProvider.credential function
      const mockCredential = { providerId: 'password' };
      EmailAuthProvider.credential.mockReturnValue(mockCredential);

      // Mock the reauthenticateWithCredential function to reject
      reauthenticateWithCredential.mockRejectedValue(error);

      // Spy on console.log
      const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();

      const returnValue = await store.dispatch(reauthenticate(currentPassword));

      // Wait for all promises to resolve
      await flushPromises();

      const actions = store.getActions();

      expect(reauthenticateWithCredential).toHaveBeenCalledWith(auth.currentUser, mockCredential);
      expect(actions[0]).toEqual({
        type: 'showErrorToast',
        payload: firebaseErrorsMessages[error.code],
      });
      expect(consoleLogSpy).toHaveBeenCalledWith("Reauthentication failure");
      expect(returnValue).toBe(false);

      // Clean up the spy
      consoleLogSpy.mockRestore();

    });

    /**
     * Test for handling missing current password.
     * Verifies that a toastError is dispatched when no password is provided.
     *
     * @test {reauthenticate}
     */
    it('should return false if currentPassword is not provided', async () => {
      const store = mockStore({});

       // Spy on console.log
      const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();

      const returnValue = await store.dispatch(reauthenticate(''));

      const actions = store.getActions();

      expect(actions[0]).toEqual({
        type: 'showErrorToast',
        payload: 'Current password is required.', 
      });
      expect(returnValue).toBe(false);
    });
  });




  // ### Data Query Actions

  describe('Data Query Actions', () => {
    
    /**
     * Test for querying sleep data within a date range.
     * Verifies that the query is executed with the correct date range.
     *
     * @test {querySleepData}
     */
    it('should execute query with the correct date range for querySleepData', async () => {
      const startDate = new Date('2023-01-01');
      const endDate = new Date('2023-01-31');

      const mockCollectionRef = {};
      const mockQuery = {};
      const mockSnapshot = { forEach: jest.fn() };

      doc.mockReturnValue(mockCollectionRef);
      collection.mockReturnValue(mockCollectionRef);
      query.mockReturnValue(mockQuery);
      getDocs.mockResolvedValue(mockSnapshot);

      await querySleepData(startDate, endDate);

      // Wait for all promises to resolve
      await flushPromises();

      expect(doc).toHaveBeenCalledWith(expect.anything(), "Users", 'testUID');
      expect(collection).toHaveBeenCalledWith(mockCollectionRef, "SleepData");
      expect(query).toHaveBeenCalledWith(
        mockCollectionRef,
        where("startDate", ">=", startDate),
        where("startDate", "<=", endDate),
        orderBy("startDate", "asc")
      );
      expect(getDocs).toHaveBeenCalledWith(mockQuery);
    });

    /**
     * Test for retrieving sleep data within a date range.
     * Verifies that the correct data is returned based on the query.
     *
     * @test {querySleepData}
     */
    it('should return the correct data within the specified date range for querySleepData', async () => {
      const startDate = new Date('2023-01-01');
      const endDate = new Date('2023-01-31');

      const mockCollectionRef = {};
      const mockQuery = {};
      const mockData = [
        { startDate: new Date('2023-01-02'), endDate: new Date('2023-01-02'), data: 'testData1' },
        { startDate: new Date('2023-01-15'), endDate: new Date('2023-01-15'), data: 'testData2' },
      ];
      const mockSnapshot = {
        forEach: (callback) => mockData.forEach(doc => callback({ data: () => doc })),
      };

      doc.mockReturnValue(mockCollectionRef);
      collection.mockReturnValue(mockCollectionRef);
      query.mockReturnValue(mockQuery);
      getDocs.mockResolvedValue(mockSnapshot);

      const result = await querySleepData(startDate, endDate);

      expect(result).toEqual([
        { startDate: new Date('2023-01-02'), endDate: new Date('2023-01-02'), data: 'testData1' },
        { startDate: new Date('2023-01-15'), endDate: new Date('2023-01-15'), data: 'testData2' },
      ]);
    });

    /**
     * Test for handling query failure when fetching sleep data.
     * Verifies that an error message is logged when the query fails.
     *
     * @test {querySleepData}
     */
    it('should log error message on query failure for querySleepData', async () => {
      const startDate = new Date('2023-01-01');
      const endDate = new Date('2023-01-31');

      const errorMessage = "Error fetching data";
      console.error = jest.fn(); // Ensure this is the only mock of console.error

      getDocs.mockRejectedValue(new Error(errorMessage));

      const result = await querySleepData(startDate, endDate);

      expect(result).toEqual([]);
      expect(console.error).toHaveBeenCalledWith("Error fetching data: ", expect.any(Error));
    });

    /**
     * Test for querying heart rate data within a date range.
     * Verifies that the query is executed with the correct date range.
     *
     * @test {queryHeartRateData}
     */
    it('should execute query with the correct date range for queryHeartRateData', async () => {
      const startDate = new Date('2023-01-01');
      const endDate = new Date('2023-01-31');

      const mockCollectionRef = {};
      const mockQuery = {};
      const mockSnapshot = { forEach: jest.fn() };

      doc.mockReturnValue(mockCollectionRef);
      collection.mockReturnValue(mockCollectionRef);
      query.mockReturnValue(mockQuery);
      getDocs.mockResolvedValue(mockSnapshot);

      await queryHeartRateData(startDate, endDate);

      expect(doc).toHaveBeenCalledWith(database, "Users", 'testUID');
      expect(collection).toHaveBeenCalledWith(mockCollectionRef, "HeartRateData");
      expect(query).toHaveBeenCalledWith(
        mockCollectionRef,
        where("date", ">=", startDate),
        where("date", "<=", endDate)
      );
      expect(getDocs).toHaveBeenCalledWith(mockQuery);
    });

    /**
     * Test for retrieving heart rate data within a date range.
     * Verifies that the correct data is returned based on the query.
     *
     * @test {queryHeartRateData}
     */
    it('should return the correct data within the specified date range for queryHeartRateData', async () => {
      const startDate = new Date('2023-01-01');
      const endDate = new Date('2023-01-31');

      const mockCollectionRef = {};
      const mockQuery = {};
      const mockData = [
        { date: new Date('2023-01-02'), heartRate: 72 },
        { date: new Date('2023-01-15'), heartRate: 75 },
      ];
      const mockSnapshot = {
        forEach: (callback) => mockData.forEach(doc => callback({ data: () => doc })),
      };

      doc.mockReturnValue(mockCollectionRef);
      collection.mockReturnValue(mockCollectionRef);
      query.mockReturnValue(mockQuery);
      getDocs.mockResolvedValue(mockSnapshot);

      const result = await queryHeartRateData(startDate, endDate);

      expect(result).toEqual([
        { date: new Date('2023-01-02'), heartRate: 72 },
        { date: new Date('2023-01-15'), heartRate: 75 },
      ]);
    });

    /**
     * Test for handling query failure when fetching heart rate data.
     * Verifies that an error message is logged when the query fails.
     *
     * @test {queryHeartRateData}
     */
    it('should log error message on query failure for queryHeartRateData', async () => {
      const startDate = new Date('2023-01-01');
      const endDate = new Date('2023-01-31');

      const errorMessage = "Error fetching data";
      console.error = jest.fn(); // Ensure this is the only mock of console.error

      getDocs.mockRejectedValue(new Error(errorMessage));

      const result = await queryHeartRateData(startDate, endDate);

      expect(result).toEqual([]);
      expect(console.error).toHaveBeenCalledWith("Error fetching data: ", expect.any(Error));
    });
  });




  // ### Account Deletion Actions

  describe('Account Deletion Actions', () => {
    
    /**
     * Test for successful account deletion.
     * Verifies that delete and deleteDoc are called when the user account is deleted.
     *
     * @test {deleteAccount}
     */
    it('should call delete and deleteDoc on successful account deletion', async () => {
      auth.currentUser = {
        delete: jest.fn().mockResolvedValue(undefined),
        uid: 'testUID',
      };
      const storedUID = 'testStoredUID';

      const store = mockStore({});
      const user = auth.currentUser;
      //const user = { email: 'test@example.com', uid: 'testUID' };

      const mockDocRef = {};
      const database = {};

      doc.mockReturnValue(mockDocRef);
      clearUID.mockResolvedValue();
      clearMetrics.mockResolvedValue();
      user.delete.mockResolvedValue();
      deleteDoc.mockResolvedValue();
      //auth.signOut.mockRejectedValue();

      await store.dispatch(deleteAccount());

      // Wait for all promises to resolve
      await flushPromises();

      expect(doc).toHaveBeenCalledWith(database, "Users", 'testUID');
      expect(clearUID).toHaveBeenCalled();
      expect(clearMetrics).toHaveBeenCalled();
      expect(user.delete).toHaveBeenCalled();
      expect(deleteDoc).toHaveBeenCalledWith(mockDocRef);
      //expect(auth.signOut).toHaveBeenCalled();
    });

    /**
     * Test for signing out on successful account deletion.
     * Verifies that signOut is called and LOGOUT action is dispatched.
     *
     * @test {deleteAccount}
     */
    it('should sign out and dispatch LOGOUT on successful account deletion', async () => {
      auth.currentUser = {
        delete: jest.fn().mockResolvedValue(undefined),
        uid: 'testUID',
      };

      const store = mockStore({});
      const user = auth;

      const mockDocRef = {};
      const database = {};

      doc.mockReturnValue(mockDocRef);
      // user.delete.mockResolvedValue();
      deleteDoc.mockResolvedValue();
  
      await store.dispatch(deleteAccount());

      // Wait for all promises to resolve
      await flushPromises();
  
      const actions = store.getActions();
  
      expect(user.signOut).toHaveBeenCalled();
      expect(actions).toContainEqual({ type: 'LOGOUT' });
      expect(actions).toContainEqual(toastError("User account has been deleted"));
    });

    /**
     * Test for handling account deletion failure.
     * Verifies that the appropriate error message is dispatched via toastError.
     *
     * @test {deleteAccount}
     */
    it('should dispatch toastError with appropriate message on account deletion failure', async () => {
      auth.currentUser = {
        delete: jest.fn().mockResolvedValue(undefined),
        uid: 'testUID',
      };

      const store = mockStore({});
      const user = auth.currentUser;
      const errorMessage = "An error occurred";
  
      user.delete.mockRejectedValue(new Error(errorMessage));
  
      await store.dispatch(deleteAccount());
  
      const actions = store.getActions();
  
      expect(actions).toContainEqual(toastError(errorMessage));
      expect(console.error).toHaveBeenCalledWith("Error deleting account:", expect.any(Error));
    });
  });
});

