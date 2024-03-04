import { NativeModules } from 'react-native';
import { sendSleepData } from '../../actions/userActions';

// Define the function to check HealthKit availability
export const checkHealthKitAvailability = async () => {
  const { MyHealthKitModule } = NativeModules;

  if (MyHealthKitModule) {
    try {
      const isAvailable = await MyHealthKitModule.isHealthDataAvailable();
      if (isAvailable) {
        console.log('HealthKit is available.');
        return true;
      } else {
        console.log('HealthKit is not available.');
        return false;
      }
    } catch (error) {
      console.error(error);
      return false;
    }
  } else {
    console.error('MyHealthKitModule is not available.');
    return false;
  }
};

// Request read access to heart rate data
export const requestHealthKitAuthorization = async () => {
  const { MyHealthKitModule } = NativeModules;

  if (MyHealthKitModule) {
    const result = await MyHealthKitModule.requestHealthKitAuthorization();
    if (result) {
      console.log('Authorization request succeeded.');
      return true;
    } else {
      console.log('Authorization request failed.');
      return false;
    }
  } else {
    console.error('MyHealthKitModule is not available.');
    return false;
  }
};

export const getHeartRateData = async () => {
  const { MyHealthKitModule } = NativeModules;
  try {
    const heartRateData = await MyHealthKitModule.readHeartRateData();
    console.log('Heart Rate Data:', heartRateData);

    // Process heartRateData as needed
    const heartRates = heartRateData.map(dataPoint => dataPoint.heartRate);
    const dateTimes = heartRateData.map(dataPoint => dataPoint.date);

    console.log('Heart Rates:', heartRates);
    console.log('Date/Times:', dateTimes);

    return { heartRates, dateTimes };
  } catch (error) {
    console.error('Error retrieving heart rate data:', error);
    // Handle the error appropriately (e.g., show a message to the user)
    throw error;
  }
};


export const getActiveEnergyData = async () => {
  const { MyHealthKitModule } = NativeModules;
  try {
    const activeEnergyData = await MyHealthKitModule.readActiveEnergyData();
    console.log('Active Energy Data:', activeEnergyData);
    
    // Process activeEnergyData as needed
    const activeEnergies = activeEnergyData.map(dataPoint => dataPoint.activeEnergy);
    const dateTimes = activeEnergyData.map(dataPoint => dataPoint.date);
    
    console.log('Active Energies:', activeEnergies);
    console.log('Date/Times:', dateTimes);
    
    return { activeEnergies, dateTimes };
  } catch (error) {
    console.error('Error retrieving active energy data:', error);
    // Handle the error appropriately (e.g., show a message to the user)
  }
};

export const getSleepData = async () => {
  const { MyHealthKitModule } = NativeModules;
  try {
    const sleepData = await MyHealthKitModule.readSleepData();
    console.log('Raw sleep Data:', sleepData);

    await sendSleepData(sleepData);
    
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


export const getRestingHeartRateData = async () => {
  try {
    const { MyHealthKitModule } = NativeModules;
    const restingHeartRateData = await MyHealthKitModule.readRestingHeartRateData();
    console.log('Resting Heart Rate Data:', restingHeartRateData);

    // Process restingHeartRateData as needed
    const heartRates = restingHeartRateData.map(dataPoint => dataPoint.heartRateValue);
    const dateTimes = restingHeartRateData.map(dataPoint => dataPoint.date);

    console.log('Resting Heart Rates:', heartRates);
    console.log('Date/Times:', dateTimes);

    return { heartRates, dateTimes };
  } catch (error) {
    console.error('Error retrieving resting heart rate data:', error);
    // Handle the error appropriately (e.g., show a message to the user)
  }
};


export const getHeartRateVariabilityData = async () => {
  try {
    const MyHealthKitModule = NativeModules.MyHealthKitModule; // Make sure to replace 'MyHealthKitModule' with the actual name of your HealthKit module
    const hrvData = await MyHealthKitModule.readHeartRateVariabilityData();
    console.log('Heart Rate Variability Data:', hrvData);

    // Process hrvData as needed
    const hrvValues = hrvData.map(dataPoint => dataPoint.hrvValue);
    const dateTimes = hrvData.map(dataPoint => dataPoint.date);

    console.log('HRV Values:', hrvValues);
    console.log('Date/Times:', dateTimes);

    return { hrvValues, dateTimes };
  } catch (error) {
    console.error('Error retrieving heart rate variability data:', error);
    // Handle the error appropriately (e.g., show a message to the user)
    throw error; // You can re-throw the error if you want to handle it further up the call stack
  }
};

// export const getActivityRingsData = async () => {
    //   const { MyHealthKitModule } = NativeModules;
    //   try {
    //     const activityRingsData = await MyHealthKitModule.fillActivityRings();
    //     console.log('Activity Rings Data:', activityRingsData);
    
    //     const { Move } = activityRingsData;
    //     console.log('Move:', Move);
    //     //console.log('Exercise:', Exercise);
    //    // console.log('Stand:', Stand);
    //     //return { Move, Exercise, Stand };
    //   } catch (error) {
    //     console.error(' Error retrieving activity rings data:', error);
    //     // Handle the error appropriately (e.g., show a message to the user)
    //   }
    // };

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