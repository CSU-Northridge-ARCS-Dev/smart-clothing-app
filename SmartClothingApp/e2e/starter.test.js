
jest.mock('../src/utils/localStorage.js', () => ({
  AsyncStorage: jest.fn(),
  storeUID: jest.fn(),
}));

jest.mock('../firebaseConfig.js', () => ({
  auth: {
    loginWithEmail: jest.fn(() => Promise.resolve()),
    startLoginWithEmail: jest.fn(() => Promise.resolve()),
    startLoadUserData: jest.fn(() => Promise.resolve()),
    startUpdateUserData: jest.fn(() => Promise.resolve()),
    updateUserMetricsData: jest.fn(() => Promise.resolve()),
    currentUser: {
      uid: {
        "email": "test1@gmail.com", 
        "firstName": "MisterTest",
        "lastName": "Johnson", 
        "uuid": "nvQpwMHj7eUKfsyEhVloGM7hvji2"
        //uuid: null
      },
      email: 'test1@gmail.com',
      password: 'password123'
    },
  },
}));

jest.mock('firebase/auth', () => ({
  initializeApp: jest.fn(),
  registerVersion: jest.fn(),
  getAuth: jest.fn(),
  getDatabase: jest.fn(),
  signInWithEmailAndPassword: jest.fn(() => Promise.resolve({ 
    user: {
          //uid: null,
          uid: 'nvQpwMHj7eUKfsyEhVloGM7hvji2',
          email: 'test1@gmail.com',
          password: 'password123'
        } 
      })),
}));

// jest.mock('firebase/firestore', () => ({
//   collection: jest.fn(() => ({ add: jest.fn() })),
//   addDoc: jest.fn(),
//   setDoc: jest.fn(),
//   doc: jest.fn(() => ({ setDoc: jest.fn() })),
//   updateDoc: jest.fn(),
//   getDoc: jest.fn().mockReturnValue({
//     exists: jest.fn().mockReturnValue(true), // Mock 'exists' as a function
//     data: jest.fn().mockReturnValue({
//       height: "6541",
//       weight: "55",
//       age: "666",
//       gender: "male",
//       sports: "running",
//       dob: {
//         seconds: 1627852800, // Example timestamp for July 2, 2021
//         nanoseconds: 0, // Firestore Timestamps include nanoseconds, but it's often okay to mock them as 0 in tests
//       },
//     }), // Mock 'data' as a function
//   }),
// }));
jest.mock('firebase/firestore', () => ({
  collection: jest.fn(() => ({ add: jest.fn() })),
  addDoc: jest.fn(),
  setDoc: jest.fn(),
  doc: jest.fn(() => ({ setDoc: jest.fn() })),
}))




describe('Sign in flow', () => {
  beforeAll(async () => {
    await device.launchApp({ 
      newInstance: true ,
      launchArgs: { isDetoxTest: true }
    });
  });

  it('should allow a user to sign in', async () => {
    // Wait for email input to be visible
    await waitFor(element(by.id('email-input')))
      .toBeVisible()
      .withTimeout(50000);
    await element(by.id('email-input')).tap();
    await element(by.id('email-input')).typeText('dummynode1@gmail.com');

     // Scroll down to ensure password input is visible
    await waitFor(element(by.id('password-input')))
     .toBeVisible()
     .whileElement(by.id('scrollViewId')) // Replace with your ScrollView's testID
     .scroll(400, 'down');

    await element(by.id('password-input')).tap();
    await element(by.id('password-input')).typeText('smartclothingapp');

    // To close the keyboard (temp until figure out how to disable log warnings)
    if (device.getPlatform() === 'android') {
      await device.pressBack();
    }

    // Wait for the Sign In button to be visible
    await waitFor(element(by.id('sign-in-button')))
      .toBeVisible()
      .withTimeout(5000);
    await element(by.id('sign-in-button')).tap();

    //Wait for the greeting text to be visible on the home screen
    await waitFor(element(by.id('greeting-text')))
      .toBeVisible()
      .withTimeout(50000);

    const attributes = await element(by.id('greeting-text')).getAttributes();
    console.log(attributes); 
    
    await expect(element(by.id('greeting-text'))).toHaveText('Hello, Dummy');

      

  });
});
