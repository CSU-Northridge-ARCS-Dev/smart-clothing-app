import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { startLogout } from '../src/actions/userActions.js'; // Adjust the path accordingly

const middlewares = [thunk];
const mockStore = configureMockStore(middlewares);

// Mock auth module
jest.mock('../firebaseConfig.js', () => ({
  auth: {
    signOut: jest.fn(() => Promise.resolve()),
    currentUser: null, // Mocking currentUser as null for simplicity
  },
}));

describe('Async Auth Actions', () => {
  it('dispatches LOGOUT action when startLogout is called', async () => {
    const expectedActions = [{ type: 'LOGOUT' }];

    const store = mockStore({});
    await store.dispatch(startLogout());

    expect(store.getActions()).toEqual(expectedActions);
    expect(auth.signOut).toHaveBeenCalled();
  });
});
