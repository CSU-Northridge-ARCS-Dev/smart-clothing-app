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

// Call the function to retrieve heart rate data
export const getHeartRateData = async () => {
  const { MyHealthKitModule } = NativeModules;
  //console.log("Was this function called?");
  if (MyHealthKitModule) {
    try {
      const heartRateData = await MyHealthKitModule.readHeartRateData();
      console.log('Heart Rate Data:', heartRateData); // Log the data
    } catch (error) {
      console.error('Error retrieving heart rate data:', error);
    }
  } else {
    console.error('MyHealthKitModule is not available.');
  }
};