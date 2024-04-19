import { NativeModules } from "react-native";

// TODO change name Controller to HealthKitManager.
const { Controller } = NativeModules;

// IN PROGRESS.

/**
 * Service class for interacting with Apple's HealthKit.
 * 
 * Methods it provides:
 * - request read access to health data
 * - request authorization
 * - query heart rate data
 * - query sleep data
 * - query activity rings data
 * - query all data and store in database
 */
export default class HealthKitService {

    /**
     * Check to see if HealthKit is available on user's device. Called first before
     * requestAuthorization().
     * 
     * @returns boolean
     */
    static async requestHKAvailability() {
        try {
            const result = await Controller.findHealthData();
            if (!result) {
                console.log("Health Kit is not available!");
                return false;
            }
            console.log("Health Kit is available!");
            return true;

        } catch (error) {
            console.error("Error calling native method: findHealthData()", error);
            return false;
        }
    }

    /**
     * Request user permission for app to access Apple Health Kit data.
     * 
     * @returns null
     */
    static async requestAuthorization() {
        try {
            const result = await Controller.requestAuthorization();
            console.log("Authorization requested: " , result);
        } catch (error) {
            console.error("Unexpected error ocurred while requested authorization - Permission denied?");
        }
    }
}