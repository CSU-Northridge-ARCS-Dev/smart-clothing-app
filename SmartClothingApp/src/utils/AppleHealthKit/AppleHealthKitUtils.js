import { NativeModules, Permissions } from 'react-native';

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

    const { Move, Exercise, Stand } = activityRingsData;
    console.log('Move:', Move);
    //console.log('Exercise:', Exercise);
   // console.log('Stand:', Stand);
    //return { Move, Exercise, Stand };
  } catch (error) {
    console.error(' js: Error retrieving activity rings data:', error);
    // Handle the error appropriately (e.g., show a message to the user)
  }
};
// export const getVO2MaxData = async () => {
//   const { MyHealthKitModule } = NativeModules;

//   if (MyHealthKitModule) {
//     try {
//       const vo2MaxData = await MyHealthKitModule.readVO2MaxData();
//       console.log("hi");
//       console.log('VO2 Max Data:', vo2MaxData); // Log the data
      
//       // Separate VO2 max values and dates into separate arrays
//       const vo2MaxValues = vo2MaxData.map(dataPoint => dataPoint.vo2Max);
//       const dates = vo2MaxData.map(dataPoint => dataPoint.date);
      
//       console.log('VO2 Max Values:', vo2MaxValues);
//       console.log('Dates:', dates);
      
//       // You can return the data or use it as needed
//       return { vo2MaxValues, dates };
//     } catch (error) {
//       console.error('Error retrieving VO2 max data:', error);
//     }
//   } else {
//     console.error('MyHealthKitModule is not available.');
//   }
// };

// Call the Objective-C method
// export const readSleepAndHeartRateData = async () => {
//   const { MyHealthKitModule } = NativeModules;

//   if (MyHealthKitModule) {
//     try {
//       const sleepAndHeartRateData = await MyHealthKitModule.readSleepAndHeartRateData();
//       console.log('Sleep and Heart Rate Data:', sleepAndHeartRateData); // Log the data

//       // Separate sleep data and heart rate data
//       const sleepData = sleepAndHeartRateData.sleepData;
//       const heartRateData = sleepAndHeartRateData.heartRateData;

//       console.log('Sleep Data:', sleepData);
//       console.log('Heart Rate Data:', heartRateData);

//       // Return or process the data as needed
//       return { sleepData, heartRateData };
//     } catch (error) {
//       console.error('Error retrieving sleep and heart rate data:', error);
//     }
//   } else {
//     console.error('MyHealthKitModule is not available.');
//   }
// };


