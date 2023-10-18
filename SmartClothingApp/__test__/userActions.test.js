// Mock auth module
import { auth } from '../firebaseConfig.js';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { startLogout } from '../src/actions/userActions.js'; // Adjust the path accordingly

const middlewares = [thunk];
const mockStore = configureMockStore(middlewares);

jest.mock('../firebaseConfig.js', () => ({
  auth: {
    signOut: jest.fn(() => Promise.resolve()),
    currentUser: null, // Mocking currentUser as null for simplicity
  },
}));

jest.mock('firebase/auth', () => ({
  createUserWithEmailAndPassword: jest.fn(),
  signInWithEmailAndPassword: jest.fn(),
  updateProfile: jest.fn(),
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
});
