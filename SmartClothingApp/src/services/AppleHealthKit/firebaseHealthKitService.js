import {doc, collection, addDoc, CollectionReference} from "firebase/firestore";
import { auth, database } from '../../../firebaseConfig';

import { getHeartRateData, getSleepData, getActivityRingsData } from "../../utils/AppleHealthKit/AppleHealthKitUtils";
// TODO this will replace the top functions.
import HealthKitService from "./healthKitService";

/**
 * Service class for Firestore queries on Apple Health Kit data.
 * 
 */
export default class FirebaseHealthKitService {
    static instance = null;  // Ensure only one instance exists ever.

    // Should only be called after user signup or login!
    constructor() {
        if (!FirebaseHealthKitService.instance) {
            FirebaseHealthKitService.instance = this;

            // User meta.
            this.userId = auth.currentUser.uid;
            this.user = doc(database, "Users", this.userId);

            // Health data collections.
            this.heartRateDataCollection = collection(this.user, "HeartRateData");
            this.sleepDataCollection = collection(this.user, "SleepData");
            this.activityRingsDataCollection = collection(this.user, "ActivityRingsData");
        }
        return FirebaseHealthKitService.instance;
    }

    /////////////
    // QUERIES //
    /////////////

    /**
     * Fetch heart rate data via a given time range in ISO.
     * 
     * @param {string} startDate 
     * @param {string} endDate 
     * @returns {Promise<Array>}
     */
    static async queryHeartRateData(startDate, endDate) {
        try {
            // Create a query to filter documents within the date range
            const dataQuery = query(
                collection(userRef, "HeartRateData"),
                where("date", ">=", startDate),
                where("date", "<=", endDate)
            );

            // Execute query to get the result.
            const dataSnapshot = await getDocs(dataQuery);

            // Get the documents.
            const fetchedData = [];
            dataSnapshot.forEach((doc) => {
                fetchedData.push({ ...doc.data() });
            });

            return fetchedData;
        } catch (error) {
            console.error("Error fetching heart rate data: ", error);
            return [];
        }
    }

    /**
     * Fetch sleep data via a given time range in ISO.
     * 
     * @param {string} startDate 
     * @param {string} endDate 
     * @returns {Promise<Array>}
     */
    static async querySleepData(startDate, endDate) {
        try {
            // Create a query to filter documents within the date range.
            const dataQuery = query(
                collection(userRef, "SleepData"),
                where("startDate", ">=", startDate),
                where("startDate", "<=", endDate),
                orderBy("startDate", "asc")
            );

            // Execute the query to get the result
            const dataSnapshot = await getDocs(dataQuery);

            // Get the documents.
            const fetchedData = [];
            dataSnapshot.forEach((doc) => {
                const data = doc.data();
                if (data.endDate >= startDate && data.endDate <= endDate) {
                    fetchedData.push({ ...data });
                }
            });

            return fetchedData;
        } catch (error) {
            console.error("Error fetching sleep data: ", error);
            return [];
        }
    }

    // TODO
    /**
     * Fetch activity rings data via a given time range in ISO.
     * 
     * @param {string} startDate 
     * @param {string} endDate 
     * @returns {Promise<Array>}
     */
    static async queryActivityRingsData(startDate, endDate) {
        try {
            const fetchedData = [];
            return fetchedData;
        } catch (error) {
            console.error("Error fetching activity rings darta: ", error);
            return [];
        }
    }

    /////////////
    // UPLOADS //
    /////////////

    /**
     * Upload each heart rate data object as a document in the collection.
     * 
     * @param {Array<object>} heartRateData
     * @returns {Promise<null>}
     */
    static async uploadHeartRateData(heartRateData) {
        for (const data of heartRateData) {
            await addDoc(this.heartRateDataCollection, data);
        }
    }

    /**
     * Upload each sleep data object as a document in the collection.
     * 
     * @param {Array<object>} sleepData
     * @returns {Promise<null>}
     */
    static async uploadSleepData(sleepData) {
        for (const data of sleepData) {
            await addDoc(this.sleepDataCollection, data);
        }
    }

    /**
     * Upload each activity rings data object as a document in the collection.
     * 
     * @param {Array<object>} activityRingsData
     * @returns {Promise<null>}
     */
    static async uploadActivityRingsData(activityRingsData) {
        for (const data of activityRingsData) {
            await addDoc(this.activityRingsDataCollection, data);
        }
    }

    //////////////////////////////////////
    // DATA SYNCING (QUERY + UPLOAD) //
    //////////////////////////////////////

    /**
     * Fetch all health data over the past year and store them in the database.
     * 
     * @returns {Promise<null>}
     */
    static async performInitialDataSync() {
        console.log("Performing initial data sync...");

        // Define start date (5 years ago) and end date (now).
        const startDate = new Date(new Date().setFullYear(new Date().getFullYear() - 5)).toISOString();
        const endDate = new Date().toISOString();

        try {
            // Fetch and upload heart data.
            console.log("Fetching heart rate data...");
            const heartRateData = await getHeartRateData(startDate, endDate);
            console.log("Heart rate data fetched!");
            this.uploadHeartRateData(heartRateData);
            console.log("Uploading of heart rate data complete!");
        
            // Fetch and upload sleep data.
            console.log("Fetching sleep data...");
            const sleepData = await getSleepData(startDate, endDate);
            console.log("Sleep data fetched!");
            this.uploadSleepData(sleepData);
            console.log("Uploading of sleep data complete!");
        
            // Fetch and upload activity rings data.
            console.log("Fetching activity rings data...");
            const activityRingsData = await getActivityRingsData(startDate, endDate);
            console.log("Activity rings data fetched!");
            this.uploadActivityRingsData(activityRingsData);
            console.log("Uploading of activity rings data complete!");
        
            console.log("All uploads complete!");
        
        } catch (error) {
            console.error(error);
        }
    }

    /**
     * Query for the latest health data and then upload to firebase.
     * 
     * @returns {Promise<null>}
     */
    static async updateWithLatestData() {
        console.log("Performing fetching of latest data...");

        const today = new Date().toISOString();

        try {
            // Update heart rate data.
            console.log("Updating heart rate data...");
            const hrStartDate = this.#getLatestDateFromCollection(this.heartRateDataCollection);
            const heartRateData = await getHeartRateData(hrStartDate, today);
            console.log("Fetching of heart rate data complete");
            this.uploadHeartRateData(heartRateData);
            console.log("Uploading of heart rate data complete!");

            // Update sleep data.
            console.log("Uploading sleep data...");
            const sStartDate = this.#getLatestDateFromCollection(this.sleepDataCollection);
            const sleepData = await getSleepData(sStartDate, today);
            console.log("Fetching of sleep data complete");
            this.uploadSleepData(sleepData);
            console.log("Uploading of sleep data complete!");

            // Update activity rings data.
            console.log("Uploading activity rings data...");
            const arStartDate = this.#getLatestDateFromCollection(this.activityRingsDataCollection);
            const activityRingsData = await getActivityRingsData(arStartDate, today);
            console.log("Fetching of activity rings data complete");
            this.uploadActivityRingsData(activityRingsData);
            console.log("Uploading of activity rings data complete!");

            console.log("All updates successful!");

        } catch (error) {
            console.error("Error updating health data: ", error);
        }
    }

    // TODO needs unit testing.
    /**
     * Fetch the ISO string of a given collection's latest document.
     * 
     * @param {CollectionReference} collection 
     * @returns {Promise<string|null>}
     */
    static async #getLatestDateFromCollection(collection) {
        try {
            const snapshot = await collection
                .orderBy('date', 'desc')
                .limit(1)
                .get();
            return snapshot.empty ? null : snapshot.docs[0].data().date.toDate().toISOString();
        } catch (error) {
            console.error("Error fetching latest document date: ", error);
            return null;
        }
    }
}