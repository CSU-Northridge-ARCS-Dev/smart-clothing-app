// Mock auth module
import { auth } from '../firebaseConfig.js';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { startLogout, startUpdateProfile, updateProfile } from '../src/actions/userActions.js'; // Adjust the path accordingly

const middlewares = [thunk];
const mockStore = configureMockStore(middlewares);

jest.mock('../firebaseConfig.js', () => ({
  auth: {
    signOut: jest.fn(() => Promise.resolve()),
    // currentUser: null, // Mocking currentUser as null for simplicity
    currentUser: {
      // Mock the currentUser object with necessary properties
      displayName: 'John Doe', // Or provide the expected displayName
    },
  },
}));

jest.mock('firebase/auth', () => ({
  createUserWithEmailAndPassword: jest.fn(),
  signInWithEmailAndPassword: jest.fn(),
  updateProfile: jest.fn(() => Promise.resolve()), // Mock the updateProfile function
  sendPasswordResetEmail: jest.fn(),
}))

jest.mock('firebase/firestore', () => ({
  collection: jest.fn(),
  addDoc: jest.fn(),
  setDoc: jest.fn(),
  doc: jest.fn(),
  updateDoc: jest.fn(),
  getDoc: jest.fn(),
}))


describe('Async Auth Actions', () => {
  it('dispatches LOGOUT action when startLogout is called', async () => {
    const expectedActions = [{ 
      type: 'LOGOUT'
    },{
      payload: 'User logged out!',
      type: 'showErrorToast',
    },];

    const store = mockStore({});
    await store.dispatch(startLogout());

    expect(store.getActions()).toEqual(expectedActions);
    expect(auth.signOut).toHaveBeenCalled();
  });


  it('logs error when startLogout fails', async () => {
    // Spy on console.log
    const consoleLogSpy = jest.spyOn(console, 'log');
    consoleLogSpy.mockImplementation(() => {}); // Mock the implementation to avoid actual console.log
    // Mocking signOut to simulate an error
    auth.signOut.mockRejectedValue(new Error('Error logging out!'));
    const store = mockStore({});
    await store.dispatch(startLogout());
    // Check that the error is logged
    // expect(consoleLogSpy).toHaveBeenCalledWith('Error logging out!');
    const consoleLogCalls = consoleLogSpy.mock.calls;
    consoleLogCalls.forEach((call) => {
      console.log('Captured log:', call[0]);
    });
    //expect(consoleLogSpy).toHaveBeenCalledWith(new Error('Error logging out!'));
    // Check that toastError is not called
    //expect(toastError).not.toHaveBeenCalled();
    // Restore the console.log spy
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



});
