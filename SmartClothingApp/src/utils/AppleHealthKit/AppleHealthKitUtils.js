import { NativeModules } from 'react-native';
const { Controller } = NativeModules;

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
    console.log('Raw sleep Data:', sleepData);

    // await sendSleepData(sleepData);
    
    // Process sleepData as needed. Keep datetimes in ISO.
    const processedSleepData = sleepData.map((dataPoint) => {
      const sleepItem = {
        label: dataPoint.sleepValue,
        startTime: dataPoint.startDate,
        endTime: dataPoint.endDate
      };
      console.log(`[${sleepItem.label.toUpperCase()}]: ${convertToReadableFormat(sleepItem.startTime)} - ${convertToReadableFormat(sleepItem.endTime)}`)
      return sleepItem
    });

    const sleepLabels = processedSleepData.map(dataPoint => dataPoint.label);
    const startTimes = processedSleepData.map(dataPoint => dataPoint.startTime);
    const endTimes = processedSleepData.map(dataPoint => dataPoint.endTime);

    // console.log('Sleep Labels:', sleepLabels);
    // console.log('Start Times:', startTimes);
    // console.log('End Times:', endTimes);

    return { sleepLabels, startTimes, endTimes };
  } catch (error) {
    console.error('Error retrieving sleep data:', error);
    // Handle the error appropriately (e.g., show a message to the user)
  }
};

export const getActivityRingsData = async () => {
  const { Controller } = NativeModules;

  try {
    const activityRingsData = await Controller.readActivityRingsData();
    console.log("Raw activity rings data: ", activityRingsData);

    // Extract individual energy burned, move, and stand data.
    const processedRingData = activityRingsData.map((dayData) => {
      return {
        date: dayData.date,
        energyBurned: dayData.energyBurned,
        energyBurnedGoal: dayData.energyBurnedGoal,
        exerciseTime: dayData.exerciseTime,
        exerciseTimeGoal: dayData.exerciseTimeGoal,
        standHours: dayData.standHours,
        standHoursGoal: dayData.standHoursGoal
      }
    })

    // Use the processed data to your desired purpose.

    return processedRingData;
  } catch (error) {
    console.error("Error retrieving activity ring data", error);
  }
}

// ISO to human readable datetime format.
function convertToReadableFormat(isoString) {
  const date = new Date(isoString);

  // Options for toLocaleString to display in desired format
  const options = {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true // Use 12-hour time format with AM/PM
  };

  // Convert to local string with specified options
  return date.toLocaleString('en-US', options);
}