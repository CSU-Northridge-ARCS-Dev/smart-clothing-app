// In-memory SecureStore. Call __reset() in beforeEach to start empty.
let store = {};

const mock = {
  getItemAsync: jest.fn(async (key) => (key in store ? store[key] : null)),
  setItemAsync: jest.fn(async (key, value) => {
    store[key] = value;
  }),
  deleteItemAsync: jest.fn(async (key) => {
    delete store[key];
  }),
  __reset: () => {
    store = {};
  },
};

module.exports = mock;
