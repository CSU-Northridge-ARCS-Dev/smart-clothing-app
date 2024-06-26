import {
  collection,
  addDoc,
  setDoc,
  doc,
  updateDoc,
  getDoc,
  getDocs,
  where,
  query,
  getFirestore,
  deleteDoc,
  orderBy,
  limit,
} from "firebase/firestore";
import { getLatestDateFromCollection, updateWithLatestData } from '../../../src/services/HealthConnectServices/HealthConnectServices';
import { getHeartRateData } from '../../../src/utils/HealthConnectUtils';
import { sendHeartRateData } from '../../../src/actions/userActions';
import { initialize } from "react-native-health-connect";


jest.mock('../../../src/utils/localStorage.js', () => ({
  AsyncStorage: jest.fn(),
  storeUID: jest.fn(),
  storeMetrics: jest.fn()
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

jest.mock('firebase/app', () => ({
  initializeApp: jest.fn(),
}))

jest.mock('firebase/auth', () => ({
  //initializeApp: jest.fn(),
  getAuth: jest.fn(),
  //getReactNativePersistence
}));

jest.mock('firebase/firestore', () => ({
  getFirestore: jest.fn(),
}));

jest.mock('../../../src/services/HealthConnectServices/HealthConnectServices', () => ({
  // initializeHealthConnect: jest.fn(),
  // checkAvailability: jest.fn(),
  // requestJSPermissions: jest.fn(),
  // grantedPermissions: jest.fn(),
  // insertSampleData: jest.fn(),
  readSampleData: jest.fn(),
  // readSampleDataSingle: jest.fn(),
  // aggregateSampleData: jest.fn(),
}));

jest.mock('../../../src/utils/HealthConnectUtils', () => ({
  getHeartRateData: jest.fn(),
  sendHeartRateData: jest.fn(),
}));

describe('FirebaseHealthConnectServices', () => {
  it('should return the latest document date for HeartRateDataHC collection', async () => { });

  it('should handle error when fetching latest document date fails', async () => { });

  it('should successfully fetch and upload heart rate data for the latest date range', async () => { });

  it('should log an error if the heart rate data fetching fails', async () => { });

  it('should not proceed to upload heart rate data if fetching fails', async () => { });

  it('should log all updates successfully when data updates complete without errors', async () => { });

  it('should handle errors gracefully when updating health data fails', async () => { });
});
