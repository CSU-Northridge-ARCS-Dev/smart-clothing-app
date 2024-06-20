import { auth } from '../firebaseConfig.js';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { firebaseErrorsMessages } from '../src/utils/firebaseErrorsMessages.js';
import { render, waitFor } from "@testing-library/react"
import {
  startSignupWithEmail,
  startLoginWithEmail,
  startLogout,
  startUpdateProfile,
  startUpdateUserData,
  startLoadUserData,
  updateEmail as updateUserEmailAction, // Rename this import to avoid conflict
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
} from 'firebase/auth';
import { toastError } from "../src/actions/toastActions.js";
import { 
  userMetricsDataModalVisible 
} from '../src/actions/appActions';
import flushPromises from 'flush-promises';


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


function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}





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

    it('should dispatch toastError with appropriate message on sign-up failure', async () => {
      const error = { code: "auth/email-already-in-use" };
      const store = mockStore({});

      createUserWithEmailAndPassword.mockRejectedValue(error);
      //createUserWithEmailAndPassword.mockImplementation(() => Promise.reject({ code: "auth/email-already-in-use" }));
      // jest.spyOn(auth, 'createUserWithEmailAndPassword').mockImplementation(async (email, password) => {
      //   throw error;
      // });
      //createUserWithEmailAndPassword.mockRejectedValue(error);
      // const createUmockCreateUserWithEmailAndPassword = () => {
      //   throw error;
      // };
      // createUserWithEmailAndPassword.mockImplementation(createUmockCreateUserWithEmailAndPassword);

      await store.dispatch(startSignupWithEmail('test@example.com', 'password123', 'John', 'Doe'));

      const actions = store.getActions();
      console.log(actions);

      const expectedErrorMessage = firebaseErrorMessages[error.code] || "Email address already in use";
      // expect(actions[0]).toEqual(toastError(expectedErrorsMessage));

      expect(actions[0]).toThrow({
        type: 'showErrorToast',
        payload: expectedErrorMessage,
      });
    });

    it('should dispatch LOGIN_WITH_EMAIL and startLoadUserData on successful login', async () => {
      const user = { uid: 'testUID', email: 'test@example.com', displayName: 'John Doe' };
      const store = mockStore({});
      signInWithEmailAndPassword.mockResolvedValue({ user });

      await store.dispatch(startLoginWithEmail('test@example.com', 'password123'));

      const actions = store.getActions();
      expect(actions[0].type).toEqual(LOGIN_WITH_EMAIL);
      expect(actions[1].type).toEqual('UPDATE_USER_METRICS_DATA');
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

      const actions = store.getActions();
      expect(actions[0]).toEqual(toastError('The password is invalid or the user does not have a password.'));
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
      
    });

    it('should dispatch toastError with appropriate message on profile update failure', async () => {
      
    });
  });

  // ### User Data Actions

  describe('User Data Actions', () => {
    it('should call setDoc and dispatch UPDATE_USER_METRICS_DATA on successful user data update', async () => {
      
    });

    it('should store user metrics data in local storage on successful user data update', async () => {});

    it('should log error message on user data update failure', async () => {
      
    });

    it('should call getDoc and dispatch UPDATE_USER_METRICS_DATA if user data exists', async () => {});

    it('should log a message if user data does not exist', async () => {});

    it('should log error message on user data load failure', async () => {
      
    });

    
  });

  // ### Email and Password Actions

  describe('Email and Password Actions', () => {
    it('should call updateEmail and dispatch UPDATE_EMAIL_SUCCESS on successful email update', async () => {});

    it('should dispatch toastError with appropriate message on email update failure', async () => {});

    it('should call sendPasswordResetEmail and log success message', async () => {});

    it('should log error message on password reset email failure', async () => {});

    it('should call updatePassword and log success message', async () => {});

    it('should dispatch toastError with appropriate message on password update failure', async () => {});
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





// describe('Async Auth Actions', () => {

//   it('returns LOGIN_WITH_EMAIL and user ', async () => {

//   });

//   it('dispatches LOGOUT action when startLogout is called', async () => {
//     const expectedActions = [
//       {
//         type: 'LOGOUT',
//       },
//       {
//         payload: 'User logged out!',
//         type: 'showErrorToast',
//       },
//     ];
//     const store = mockStore({});
//     await store.dispatch(startLogout());
//     expect(store.getActions()).toEqual(expectedActions);
//     expect(auth.signOut).toHaveBeenCalled();
//   });

//   it('logs error when startLogout fails', async () => {
//     const consoleLogSpy = jest.spyOn(console, 'log');
//     consoleLogSpy.mockImplementation(() => {});
//     // Mocking signOut to simulate an error
//     auth.signOut.mockRejectedValue(new Error('Error logging out!'));
//     const store = mockStore({});
//     await store.dispatch(startLogout());
//     const consoleLogCalls = consoleLogSpy.mock.calls;
//     consoleLogCalls.forEach((call) => {
//       console.log('Captured log:', call[0]);
//     });
//     consoleLogSpy.mockRestore();
//   });

//   it('dispatches UPDATE_PROFILE action when startUpdateProfile is called successfully', async () => {
//     const expectedActions = [
//       {
//         type: 'UPDATE_PROFILE',
//         payload: ['John', 'Doe'],
//       },
//     ];
//     const store = mockStore({});
//     await store.dispatch(startUpdateProfile('John', 'Doe'));
//     expect(store.getActions()).toEqual(expectedActions);
//   });

//   it('logs error when startUpdateProfile fails', async () => {
//     const consoleErrorSpy = jest.spyOn(console, 'error');
//     consoleErrorSpy.mockImplementation(() => {});
//     // Mocking updateProfile to simulate an error
//     updateProfile.mockRejectedValue(new Error('Error updating profile!'));
//     const store = mockStore({});
//     await store.dispatch(startUpdateProfile('John', 'Doe'));
//     const consoleErrorCalls = consoleErrorSpy.mock.calls;
//     consoleErrorCalls.forEach((call) => {
//       console.error('Captured error:', call[0]);
//     });
//     consoleErrorSpy.mockRestore();
//   });

//   it('logs error and dispatches action when startUpdateUserData fails', async () => {
//     const consoleErrorSpy = jest.spyOn(console, 'error');
//     consoleErrorSpy.mockImplementation(() => {});
//     // Mocking setDoc to simulate an error
//     const errorMessage = 'Error adding user data to database!';
//     setDoc.mockRejectedValue(new Error(errorMessage));
//     const store = mockStore({});
//     await store.dispatch(startUpdateUserData({ /* your user metrics data here */ }));
//     // Check that the error is logged
//     const consoleErrorCalls = consoleErrorSpy.mock.calls;
//     consoleErrorCalls.forEach((call) => {
//       console.error('Captured error:', call[0]);
//       expect(call[0].message).toBe(errorMessage);
//     });
//     consoleErrorSpy.mockRestore();
//   });

//   it('logs error when startLoadUserData fails', async () => {
//     const consoleErrorSpy = jest.spyOn(console, 'error');
//     consoleErrorSpy.mockImplementation(() => {});
//     // Mocking getDoc to simulate an error
//     const userDocRef = doc(collection, 'Users', 'user123');
//     getDoc.mockRejectedValue(new Error('Error loading user data from database!'));
//     const store = mockStore({});
//     await store.dispatch(startLoadUserData());
//     const consoleErrorCalls = consoleErrorSpy.mock.calls;
//     consoleErrorCalls.forEach((call) => {
//       console.error('Captured error:', call[0]);
//     });
//     consoleErrorSpy.mockRestore();
//   });
  
//   it('dispatches UPDATE_USER_METRICS_DATA action when startUpdateUserData is called successfully', async () => {
//     // Mocking setDoc to simulate success
//     setDoc.mockResolvedValue();
//     const expectedActions = [
//       {
//         type: 'UPDATE_USER_METRICS_DATA',
//         payload: { /* your user metrics data here */ },
//       },
//     ];
//     const store = mockStore({});
//     await store.dispatch(startUpdateUserData({ /* your user metrics data here */ }));
//     expect(store.getActions()).toEqual(expectedActions);
//   });
  
// });