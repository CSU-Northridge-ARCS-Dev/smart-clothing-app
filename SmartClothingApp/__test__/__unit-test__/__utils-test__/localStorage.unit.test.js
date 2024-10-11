/**
 * Unit tests for local storage utility functions in the Smart Clothing App.
 * 
 * This test file includes test cases for functions that interact with AsyncStorage to
 * securely store and retrieve user-related data, such as user UID and user metrics data.
 * These tests ensure that each function works correctly and handles both successful
 * and failed AsyncStorage operations.
 * 
 * Mocks:
 * - AsyncStorage methods (setItem, getItem) from "@react-native-async-storage/async-storage"
 * 
 * AsyncStorage is mocked globally in this test suite to simulate storage interactions,
 * enabling the validation of the store and retrieval processes.
 *
 * @file localStorage.unit.test.js
 * 
 * Credit: Carlos Figueroa (github @cfiguer055)
 */

// Import the functions and AsyncStorage
import { storeUID, getUID, storeMetrics, getMetrics } from '../../../src/utils/localStorage.js'; // Update the path to where your functions are located
import AsyncStorage from '@react-native-async-storage/async-storage';

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  setItem: jest.fn(),
  getItem: jest.fn(),
}));


/**
 * Unit tests for AsyncStorage operations in the Smart Clothing App.
 * 
 * Test suite: AsyncStorage Operations
 *
 * This suite tests the storage and retrieval of user data (UID and metrics) using AsyncStorage.
 * Each function is tested for successful interactions and for handling errors during
 * AsyncStorage operations.
 *
 * @test {storeUID} Function to store the UID.
 * @test {getUID} Function to retrieve the UID.
 * @test {storeMetrics} Function to store user metrics data.
 * @test {getMetrics} Function to retrieve user metrics data.
 */
describe('AsyncStorage', () => {
  beforeEach(() => {
    // Clear mock counts and results before each test
    jest.clearAllMocks();
  });

  /**
   * Test case: Should store the UID successfully
   *
   * This test ensures that the `storeUID` function stores the user UID into AsyncStorage
   * by calling `setItem` with the correct key and value.
   * 
   * @test {storeUID}
   */
  describe('storeUID', () => {
    it('should store the UID successfully', async () => {
      const uid = '12345';
      await storeUID(uid);
      
      // Expect setItem to have been called once and with the correct arguments
      expect(AsyncStorage.setItem).toHaveBeenCalledTimes(1);
      expect(AsyncStorage.setItem).toHaveBeenCalledWith('uid', uid);
    });

    /**
     * Test case: Should handle error when storing UID fails
     *
     * This test ensures that the `storeUID` function correctly handles any errors
     * encountered while storing the UID in AsyncStorage, and logs the error to the console.
     * 
     * @test {storeUID}
     */
    it('should handle the error if storing fails', async () => {
      const error = new Error('storage error');
      AsyncStorage.setItem.mockImplementation(() => Promise.reject(error));
      console.error = jest.fn(); // Mock console.error to check if it has been called later

      await storeUID('12345');
      
      // Expect console.error to have been called with the correct arguments
      expect(console.error).toHaveBeenCalledWith('Error storing user uid:', error);
    });
  });


  /**
   * Test case: Should return the stored UID
   *
   * This test ensures that the `getUID` function retrieves the stored UID from AsyncStorage
   * by calling `getItem` with the correct key, and returns the correct UID.
   * 
   * @test {getUID}
   */
  describe('getUID', () => {

    /**
     * Test case: Should return the stored UID if it exists
     *
     * This test ensures that the `getUID` function retrieves the stored UID from AsyncStorage
     * when it exists. It verifies that `getItem` is called with the correct key, and the
     * correct UID is returned.
     * 
     * @test {getUID}
     */
    it('should return the UID if it exists', async () => {
      const uid = '12345';
      AsyncStorage.getItem.mockResolvedValue(uid);

      const storedUID = await getUID();
      
      // Expect getItem to have been called once and with the correct key
      expect(AsyncStorage.getItem).toHaveBeenCalledTimes(1);
      expect(AsyncStorage.getItem).toHaveBeenCalledWith('uid');
      // Check that the returned UID matches the expected value
      expect(storedUID).toBe(uid);
    });

    /**
     * Test case: Should handle error when retrieving UID fails
     *
     * This test ensures that the `getUID` function correctly handles any errors encountered
     * while retrieving the UID from AsyncStorage, and logs the error to the console.
     * 
     * @test {getUID}
     */
    it('should handle the error if retrieving fails', async () => {
      const error = new Error('retrieval error');
      AsyncStorage.getItem.mockImplementation(() => Promise.reject(error));
      console.error = jest.fn(); // Mock console.error to check if it has been called later

      const storedUID = await getUID();
      
      // Expect getItem to have been called and console.error to have been called with the correct arguments
      expect(AsyncStorage.getItem).toHaveBeenCalledTimes(1);
      expect(console.error).toHaveBeenCalledWith('Error getting user UID:', error);
      // Check that the returned UID is undefined due to the error
      expect(storedUID).toBeUndefined();
    });
  });

  /**
   * Test case: Should store the user metrics data
   *
   * This test ensures that the `storeMetrics` function stores the user metrics data into AsyncStorage
   * by calling `setItem` with the correct key and stringified data.
   * 
   * @test {storeMetrics}
   */
  // describe('storeMetrics', () => {

    /**
     * Test case: Should store the metrics data successfully
     *
     * This test ensures that the `storeMetrics` function stores the user metrics data
     * into AsyncStorage by calling `setItem` with the correct key and the stringified
     * metrics data.
     * 
     * @test {storeMetrics}
     */
  //   it('should store the metrics successfully', async () => {
  //     const metrics = { weight: 70, height: 175 }; // example metrics data
  //     await storeMetrics(metrics);

  //     expect(AsyncStorage.setItem).toHaveBeenCalledTimes(1);
  //     expect(AsyncStorage.setItem).toHaveBeenCalledWith('metricsData', JSON.stringify(metrics));
  //   });

    /**
     * Test case: Should handle error when storing metrics fails
     *
     * This test ensures that the `storeMetrics` function correctly handles any errors
     * encountered while storing metrics data in AsyncStorage, and logs the error to the console.
     * 
     * @test {storeMetrics}
     */
  //   it('should handle the error if storing fails', async () => {
  //     const error = new Error('storage error');
  //     AsyncStorage.setItem.mockImplementation(() => Promise.reject(error));
  //     console.error = jest.fn();

  //     await storeMetrics({ weight: 70, height: 175 });

  //     expect(console.error).toHaveBeenCalledWith('Error storing user metrics:', error);
  //   });
  // });


    /**
   * Test case: Should retrieve the stored user metrics data
   *
   * This test ensures that the `getMetrics` function retrieves the stored user metrics data
   * from AsyncStorage by calling `getItem` with the correct key, parses the stringified data,
   * and returns the correct metrics object.
   * 
   * @test {getMetrics}
   */
  // describe('getMetrics', () => {

    /**
     * Test case: Should return the stored metrics data if they exist
     *
     * This test ensures that the `getMetrics` function retrieves the stored user metrics data
     * from AsyncStorage by calling `getItem` with the correct key, parsing the stringified data,
     * and returning the correct metrics object.
     * 
     * @test {getMetrics}
     */
  //   it('should return the metrics if they exist', async () => {
  //     const metrics = { weight: 70, height: 175 };
  //     AsyncStorage.getItem.mockResolvedValue(JSON.stringify(metrics));

  //     const storedMetrics = await getMetrics();

  //     expect(AsyncStorage.getItem).toHaveBeenCalledTimes(1);
  //     expect(AsyncStorage.getItem).toHaveBeenCalledWith('metricsData');
  //     expect(storedMetrics).toEqual(metrics);
  //   });

    /**
     * Test case: Should handle error when retrieving metrics data fails
     *
     * This test ensures that the `getMetrics` function correctly handles any errors encountered
     * while retrieving metrics data from AsyncStorage, and logs the error to the console.
     * 
     * @test {getMetrics}
     */
  //   it('should handle the error if retrieving fails', async () => {
  //     const error = new Error('retrieval error');
  //     AsyncStorage.getItem.mockImplementation(() => Promise.reject(error));
  //     console.error = jest.fn();

  //     const storedMetrics = await getMetrics();

  //     expect(AsyncStorage.getItem).toHaveBeenCalledTimes(1);
  //     expect(console.error).toHaveBeenCalledWith('Error getting user metrics:', error);
  //     expect(storedMetrics).toBeFalsy();
  //   });
  // });
});