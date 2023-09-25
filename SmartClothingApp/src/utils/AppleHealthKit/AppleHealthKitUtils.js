import { NativeModules } from 'react-native';

// Define the function to check HealthKit availability
export const checkHealthKitAvailability = () => {
 const { MyHealthKitModule } = NativeModules;
 
  if (MyHealthKitModule) {
    return MyHealthKitModule.isHealthDataAvailable()
      .then(result => {
        if (result) {
          console.log('HealthKit is available.');
          // Add your HealthKit code here.
          return true;
        } else {
          console.log('HealthKit is not available.');
          return false;
        }
      })
      .catch(error => {
        console.error(error);
        return false;
      });
  } else {
    console.error('MyHealthKitModule is not available.');
    return false;
  }
};
//export default checkHealthKitAvailability;
