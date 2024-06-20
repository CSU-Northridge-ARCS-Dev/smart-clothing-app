// Import the functions and AsyncStorage
import { storeUID, getUID, storeMetrics, getMetrics } from '../src/utils/localStorage.js'; // Update the path to where your functions are located
import AsyncStorage from '@react-native-async-storage/async-storage';

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  setItem: jest.fn(),
  getItem: jest.fn(),
}));

describe('AsyncStorage', () => {
  beforeEach(() => {
    // Clear mock counts and results before each test
    jest.clearAllMocks();
  });

  describe('storeUID', () => {
    it('should store the UID successfully', async () => {
      const uid = '12345';
      await storeUID(uid);
      
      // Expect setItem to have been called once and with the correct arguments
      expect(AsyncStorage.setItem).toHaveBeenCalledTimes(1);
      expect(AsyncStorage.setItem).toHaveBeenCalledWith('uid', uid);
    });

    it('should handle the error if storing fails', async () => {
      const error = new Error('storage error');
      AsyncStorage.setItem.mockImplementation(() => Promise.reject(error));
      console.error = jest.fn(); // Mock console.error to check if it has been called later

      await storeUID('12345');
      
      // Expect console.error to have been called with the correct arguments
      expect(console.error).toHaveBeenCalledWith('Error storing user uid:', error);
    });
  });

  describe('getUID', () => {
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

  // describe('storeMetrics', () => {
  //   it('should store the metrics successfully', async () => {
  //     const metrics = { weight: 70, height: 175 }; // example metrics data
  //     await storeMetrics(metrics);

  //     expect(AsyncStorage.setItem).toHaveBeenCalledTimes(1);
  //     expect(AsyncStorage.setItem).toHaveBeenCalledWith('metricsData', JSON.stringify(metrics));
  //   });

  //   it('should handle the error if storing fails', async () => {
  //     const error = new Error('storage error');
  //     AsyncStorage.setItem.mockImplementation(() => Promise.reject(error));
  //     console.error = jest.fn();

  //     await storeMetrics({ weight: 70, height: 175 });

  //     expect(console.error).toHaveBeenCalledWith('Error storing user metrics:', error);
  //   });
  // });

  // describe('getMetrics', () => {
  //   it('should return the metrics if they exist', async () => {
  //     const metrics = { weight: 70, height: 175 };
  //     AsyncStorage.getItem.mockResolvedValue(JSON.stringify(metrics));

  //     const storedMetrics = await getMetrics();

  //     expect(AsyncStorage.getItem).toHaveBeenCalledTimes(1);
  //     expect(AsyncStorage.getItem).toHaveBeenCalledWith('metricsData');
  //     expect(storedMetrics).toEqual(metrics);
  //   });

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