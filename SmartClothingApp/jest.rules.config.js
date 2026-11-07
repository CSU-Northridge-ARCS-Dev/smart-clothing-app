// Firestore rules tests. They run against the local emulator through
// `npm run test:rules`, so they are kept out of the main jest-expo run.
module.exports = {
  testEnvironment: "node",
  testMatch: ["<rootDir>/__test__/__rules-test__/**/*.test.js"],
  transform: {},
  testTimeout: 20000,
};
