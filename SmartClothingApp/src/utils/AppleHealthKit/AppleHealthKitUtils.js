import { NativeModules } from 'react-native';
const { Controller } = NativeModules;

import { convertToReadableFormat, getDayFromISODate } from '../dateConversions';
import { sendSleepData, sendHeartRateData } from '../../actions/userActions';

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

export const readHeartRateData = async () => {
  try {
    const heartRateData = await Controller.readHeartRateData();
    console.log("Heart rate data:", heartRateData);

    await sendHeartRateData(heartRateData);
    
    // Process heart rate data
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

export const getRestingHeartRateData = async () => {
  try {
    const restingHeartRateData = await Controller.readRestingHeartRateData();
    console.log('Resting heart rate Data:', restingHeartRateData);

    // Process resting heart rate data
    const processedRestingHeartRateData = restingHeartRateData.map(data => {
      const heartRateValue = data.heartRateValue;
      const date = new Date(data.date);
      console.log("Resting Heart Rate Value:", heartRateValue, "Date:", date);
      return { heartRateValue, date };
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


export const getHeartRateVariabilityData = async () => {
  try {
    const readHeartRateVariabilityData = await Controller.readHeartRateVariabilityData();
    console.log('Heart rate variability Data:', readHeartRateVariabilityData);

    // Process resting heart rate data
    readHeartRateVariabilityData.forEach(data => {
      // console.log("data", data)
      const timestamp = data.date;
      const heartRateVariability = data.heart_rate_value;
      console.log("Timestamp..:", timestamp, "Heart rate varaibility:", heartRateVariability);

      return {heartRateVariability, timestamp};

  }); 
} catch (error) {
    console.error('Error retrieving resting heart rate variability data:', error);
    // Handle the error appropriately (e.g., show a message to the user)
    throw error; // You can re-throw the error if you want to handle it further up the call stack
  }
};

export const getSleepData = async () => {
  const { Controller } = NativeModules;
  try {
    const sleepData = await Controller.readSleepData();
    // console.log('Raw sleep Data:', sleepData);
    console.log("----------");
    console.log("SLEEP DATA");
    console.log("----------");

    console.log("Sleep data sent!");
    await sendSleepData(sleepData);
    
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

export const getActivityRingsData = async () => {
  const { Controller } = NativeModules;

  try {
    const activityRingsData = await Controller.readActivityRingsData();
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