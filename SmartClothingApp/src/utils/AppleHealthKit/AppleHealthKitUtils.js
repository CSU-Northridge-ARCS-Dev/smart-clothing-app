import { NativeModules } from 'react-native';
const { Controller } = NativeModules;

import { convertToReadableFormat, getDayFromISODate } from '../dateConversions';
import { sendSleepData, sendHeartRateData } from '../../actions/userActions';

import {doc, collection, addDoc} from "firebase/firestore";
import { auth, database } from '../../../firebaseConfig';

/**
 * INITIALIZATION AND AUTHORIZATION
 */

// Request read access to health data
export const findHealthData = async () => {

  if (Controller) {
    try {
      const result = await Controller.findHealthData();
      if (result) {
        console.log('Authorization request succeeded.');
        return true;
      } else {
        console.log('Authorization request failed.');
        return false;
      }
    } catch (error) {
      console.error('Error calling native method:', error);
      return false;
    }
  } else {
    console.error('Controller is not available.');
    return false;
  }
};

export const requestHealthKitAuthorization = async () => {
  try {
    console.log("running requestHK method");
    await Controller.requestAuthorization();
    console.log("result:", Controller.requestAuthorization());

    
  } catch (error) {
    console.error('An unexpected error occurred while requesting authorization:', error);
  }
};

/**
 * DATA QUERIES
 */

// ONLY CALLED ONCE AFTER SIGNING UP.
// Fetch all health data over the past year and store them in the database.
export const performInitialDataSync = async () => {
  const userId = auth.currentUser.uid;
  const user = doc(database, "Users", userId);

  // Fetch needed health collections.
  const heartRateDataCollection = collection(user, "HeartRateData");
  const sleepDataCollection = collection(user, "SleepData");
  const activityDataCollection = collection(user, "ActivityData");

  console.log("Performing initial query...");

  // Define start date (5 years ago) and end date (now).
  const startDate = new Date(new Date().setFullYear(new Date().getFullYear() - 5)).toISOString();
  const endDate = new Date().toISOString();

  try {
    // Heart data.
    console.log("Fetching heart rate data...");
    const heartRateData = await getHeartRateData(startDate, endDate);
    console.log("Heart rate data fetched!");

    // Sleep data.
    console.log("Fetching sleep data...");
    const sleepData = await getSleepData(startDate, endDate);
    console.log("Sleep data fetched!");

    // Activity rings data.
    console.log("Fetching activity rings data...");
    const activityRingsData = await getActivityRingsData(startDate, endDate);
    console.log("Activity rings data fetched!");

    // Upload to Firestore.
    console.log("Uploading data...");
    for (const data of heartRateData) {
      await addDoc(heartRateDataCollection, data);
    }
    console.log("Heart rate data uploaded!");
    for (const data of sleepData) {
      await addDoc(sleepDataCollection, data);
    }
    console.log("Sleep data uploaded!");
    for (const data of activityRingsData) {
      await addDoc(activityDataCollection, data);
    }
    console.log("Activity rings data uploaded!");
    console.log("All uploads complete!!!");

  } catch (error) {
    console.error(error);
  }
}

/**
 * Fetch heart rate data from a given range of ISO datetimes.
 * 
 * @param {string} startDate 
 * @param {string} endDate 
 */
export const getHeartRateData = async (startDate, endDate) => {
  try {
    const heartRateData = await Controller.readHeartRateData(startDate, endDate);
    console.log("Heart rate data recieved:", heartRateData);

    // await sendHeartRateData(heartRateData);
    
    // Process and format heart rate data
    heartRateData.forEach(data => {
      const timestamp = new Date(data.date);
      const heartRate = data.heartRate;
      console.log("Timestamp:", timestamp, "Heart rate:", heartRate);

      return {heartRate, timestamp};
      
      // Perform further processing as needed
    });
  } catch (error) {
    console.error("An unexpected error occurred while reading heart rate data:", error);
  }
};

export const getRestingHeartRateData = async (startDate, endDate) => {
  try {
    const restingHeartRateData = await Controller.readRestingHeartRateData(startDate, endDate);
    console.log('Resting heart rate Data:', restingHeartRateData);

    // Process resting heart rate data
    const processedRestingHeartRateData = restingHeartRateData.map(data => {
      const restingHeartRateValue = data.restingHeartRateValue;
      const date = new Date(data.date);
      console.log("Resting Heart Rate Value:", restingHeartRateValue, "Date:", date);
      return { restingHeartRateValue, date };
    });

    const heartRateValues = processedRestingHeartRateData.map(dataPoint => dataPoint.heartRateValue);
    const dates = processedRestingHeartRateData.map(dataPoint => dataPoint.date);

    // Return the processed data
    return { heartRateValues, dates };
  } catch (error) {
    console.error('Error retrieving resting heart rate data:', error);
    // Handle the error appropriately (e.g., show a message to the user)
    throw error; // You can re-throw the error if you want to handle it further up the call stack
  }
};


export const getHeartRateVariabilityData = async (startDate, endDate) => {
  try {
    const readHeartRateVariabilityData = await Controller.readHeartRateVariabilityData(startDate, endDate);
    console.log('Heart rate variability Data:', readHeartRateVariabilityData);

    // Process resting heart rate data
    readHeartRateVariabilityData.forEach(data => {
      // console.log("data", data)
      const timestamp = data.date;
      const heartRateVariability = data.heartRateVariability;
      console.log("Timestamp..:", timestamp, "Heart rate varaibility:", heartRateVariability);

      return {heartRateVariability, timestamp};

  }); 
} catch (error) {
    console.error('Error retrieving resting heart rate variability data:', error);
    // Handle the error appropriately (e.g., show a message to the user)
    throw error; // You can re-throw the error if you want to handle it further up the call stack
  }
};

/**
 * Fetch sleep phases data from a given range of ISO datetimes.
 * 
 * @param {string} startDate 
 * @param {string} endDate
 */
export const getSleepData = async (startDate, endDate) => {
  const { Controller } = NativeModules;
  try {
    const sleepData = await Controller.readSleepData(startDate, endDate);
    // console.log('Raw sleep Data:', sleepData);
    console.log("----------");
    console.log("SLEEP DATA");
    console.log("----------");

    console.log("Sleep data sent!");
    // await sendSleepData(sleepData);
    
    // Process sleepData as needed. Keep datetimes in ISO.
    const processedSleepData = sleepData.map((dataPoint) => {
      const sleepItem = {
        sleepValue: dataPoint.sleepValue,
        startDate: dataPoint.startDate,
        endDate: dataPoint.endDate
      };
      console.log(`[${sleepItem.sleepValue.toUpperCase()}]: ${convertToReadableFormat(sleepItem.startDate)} - ${convertToReadableFormat(sleepItem.endDate)}`)
      return sleepItem
    });

    return processedSleepData;
  } catch (error) {
    console.error('Error retrieving sleep data:', error);
    // Handle the error appropriately (e.g., show a message to the user)
  }
};

/**
 * Fetch ring values and their goals over a given range of ISO datetimes.
 * 
 * @param {string} startDate 
 * @param {string} endDate 
 */
export const getActivityRingsData = async (startDate, endDate) => {
  const { Controller } = NativeModules;

  try {
    const activityRingsData = await Controller.readActivityRingsData(startDate, endDate);
    // console.log("Raw activity rings data: ", activityRingsData);
    console.log("--------------");
    console.log("ACTIVITY RINGS");
    console.log("--------------");

    // Extract individual energy burned, move, and stand data.
    const processedRingData = activityRingsData.map((dayData) => {
      // COMMENTED OUT just for the demo... TODO fix past 7 days data fetching.
      // if (getDayFromISODate(dayData.date) === "Friday" || getDayFromISODate(dayData.date) === "Saturday") {
      //   return {
      //     date: dayData.date,
      //     energyBurned: 0,
      //     energyBurnedGoal: 0,
      //     exerciseTime: 0,
      //     exerciseTimeGoal: 0,
      //     standHours: 0,
      //     standHoursGoal: 0
      //   }
      // }
      const currentData = {
        date: dayData.date,
        energyBurned: dayData.energyBurned,
        energyBurnedGoal: dayData.energyBurnedGoal,
        exerciseTime: dayData.exerciseTime,
        exerciseTimeGoal: dayData.exerciseTimeGoal,
        standHours: dayData.standHours,
        standHoursGoal: dayData.standHoursGoal
      }
      console.log(`${getDayFromISODate(dayData.date)}: ${JSON.stringify(currentData)}`);
      return currentData;
    })

    // Use the processed data to your desired purpose.

    return processedRingData;
  } catch (error) {
    console.error("Error retrieving activity ring data", error);
  }
}