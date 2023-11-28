import { NativeModules } from 'react-native';

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
  }
};

export const getActivityRingsData = async () => {
  const { MyHealthKitModule } = NativeModules;
  try {
    const activityRingsData = await MyHealthKitModule.fillActivityRings();
    console.log('Activity Rings Data:', activityRingsData);

    const { Move } = activityRingsData;
    console.log('Move:', Move);
    //console.log('Exercise:', Exercise);
   // console.log('Stand:', Stand);
    //return { Move, Exercise, Stand };
  } catch (error) {
    console.error(' Error retrieving activity rings data:', error);
    // Handle the error appropriately (e.g., show a message to the user)
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
    console.log('Sleep Data:', sleepData);

    // Define the order of keys
    const keyOrder = ['Deep', 'Core', 'Awake', 'Asleep', 'In Bed', 'Rem'];

    // Process sleepData as needed
    const processedSleepData = sleepData.map((dataPoint, index) => {
      const label = keyOrder[index] || 'Unknown'; // Use the corresponding key or 'Unknown' if not available

      return {
        label,
        startTime: dataPoint.startDate,
        endTime: dataPoint.endDate
      };
    });

    const sleepLabels = processedSleepData.map(dataPoint => dataPoint.label);
    const startTimes = processedSleepData.map(dataPoint => dataPoint.startTime);
    const endTimes = processedSleepData.map(dataPoint => dataPoint.endTime);

    console.log('Sleep Labels:', sleepLabels);
    console.log('Start Times:', startTimes);
    console.log('End Times:', endTimes);

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






