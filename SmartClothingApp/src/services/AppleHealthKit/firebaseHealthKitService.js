import {
  collection,
  addDoc,
  setDoc,
  doc,
  updateDoc,
  getDoc,
  getDocs,
  where,
  query,
  getFirestore,
  deleteDoc,
  orderBy,
  limit
} from "firebase/firestore";
import { auth, database } from "../../../firebaseConfig";

import { useState } from "react";

import {
  getHeartRateData,
  getSleepData,
  getActivityRingsData,
} from "../../utils/AppleHealthKit/AppleHealthKitUtils";
// TODO this will replace the top functions.
import HealthKitService from "./healthKitService";

/**
 * Service class for Firestore queries on Apple Health Kit data.
 *
 */
export default class FirebaseHealthKitService {
  static instance = null; // Ensure only one instance exists ever.

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
      this.activityRingsDataCollection = collection(
        this.user,
        "ActivityRingsData"
      );
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
        collection(
          doc(database, "Users", auth.currentUser.uid),
          "HeartRateData"
        ),
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
        collection(doc(database, "Users", auth.currentUser.uid), "SleepData"),
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
    console.log("Data received: ", heartRateData);
    this.heartRateDataCollection = collection(
      doc(database, "Users", auth.currentUser.uid),
      "HeartRateData"
    );
    console.log("Heart rate data collection: ", this.heartRateDataCollection);
    for (const data of heartRateData) {
      try {
        await addDoc(this.heartRateDataCollection, data);
      } catch (error) {
        console.error("Error uploading heart rate doc: ", error);
      }
      console.log("Doc added for heart rate data");
    }
  }

  /**
   * Upload each sleep data object as a document in the collection.
   *
   * @param {Array<object>} sleepData
   * @returns {Promise<null>}
   */
  static async uploadSleepData(sleepData) {
    console.log("Data received: ", sleepData);
    this.sleepDataCollection = collection(
      doc(database, "Users", auth.currentUser.uid),
      "SleepData"
    );
    console.log("Sleep data collection: ", this.sleepDataCollection);
    for (const data of sleepData) {
      try {
        await addDoc(this.sleepDataCollection, data);
      } catch (error) {
        console.error("Error uploading sleep data doc: ", error);
      }
      console.log("Doc added for sleep data");
    }
  }

  /**
   * Upload each activity rings data object as a document in the collection.
   *
   * @param {Array<object>} activityRingsData
   * @returns {Promise<null>}
   */
  static async uploadActivityRingsData(activityRingsData) {
    console.log("Data received: ", activityRingsData);
    this.activityRingsDataCollection = collection(
      doc(database, "Users", auth.currentUser.uid),
      "ActivityRingsData"
    );
    console.log("Activity rings collection:", this.activityRingsDataCollection)
    for (const data of activityRingsData) {
      try {
        await addDoc(this.activityRingsDataCollection, data);
      } catch (error) {
        console.error("Error uploading activity rings doc: ", error);
      }
      console.log("Doc added for activity rings data");
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
    // const startDate = new Date(
    //   new Date().setFullYear(new Date().getFullYear() - 5)
    // ).toISOString();
    // const endDate = new Date().toISOString();

    // Define start date (1 week ago) and end date (now).
    const startDate = new Date(new Date().setDate(new Date().getDate() - 7)).toISOString();
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
      const hrStartDate = await this.#getLatestDateFromCollection("HeartRateData");
      console.log("hrStartDate: ", hrStartDate);
      const heartRateData = await getHeartRateData(hrStartDate, today);
      console.log("Fetching of heart rate data complete");
      this.uploadHeartRateData(heartRateData);
      console.log("Uploading of heart rate data complete!");

      // Update sleep data.
      console.log("Uploading sleep data...");
      const sStartDate = await this.#getLatestDateFromCollection("SleepData");
      console.log("sStartDate: ", sStartDate)
      const sleepData = await getSleepData(sStartDate, today);
      console.log("Fetching of sleep data complete");
      this.uploadSleepData(sleepData);
      console.log("Uploading of sleep data complete!");

      // Update activity rings data.
      console.log("Uploading activity rings data...");
      const arStartDate = await this.#getLatestDateFromCollection("ActivityRingsData");
      console.log("arStartDate: ", arStartDate);
      const activityRingsData = await getActivityRingsData(arStartDate, today);
      console.log("Fetching of activity rings data complete");
      this.uploadActivityRingsData(activityRingsData);
      console.log("Uploading of activity rings data complete!");

      console.log("All updates successful!");
    } catch (error) {
      console.error("Error updating health data: ", error);
    }
  }

  // TODO needs unit testing, fix hacks.
  /**
   * Fetch the ISO string of a given collection's latest document.
   *
   * @param {string} collectionName
   * @returns {Promise<string|null>}
   */
  static async #getLatestDateFromCollection(collectionName) {
    try {
      // TODO fix later, quick hack.
      let latestDoc = null;
      if (collectionName === "SleepData") {
        latestDoc = query(collection(doc(database, "Users", auth.currentUser.uid), "SleepData"), orderBy("endDate", "desc"), limit(1));
      } else if (collectionName === "ActivityRingsData") {
        latestDoc = query(collection(doc(database, "Users", auth.currentUser.uid), "ActivityRingsData"), orderBy("date", "desc"), limit(1));
      } else if (collectionName === "HeartRateData") {
        latestDoc = query(collection(doc(database, "Users", auth.currentUser.uid), "HeartRateData"), orderBy("date", "desc"), limit(1));
      }
      console.log(`LATEST DOC FROM ${collectionName}`, latestDoc);
      const snapshot = await getDocs(latestDoc);
      const fetchedData = [];
      snapshot.forEach((doc) => {
        fetchedData.push({ ...doc.data() });
      });
      console.log(`Fetched data from update:`, fetchedData);
      if (fetchedData.length == 0) {
        return new Date().toISOString();
      }
      const latestDate = (collectionName !== "SleepData") ? fetchedData[0].date : fetchedData[0].endDate;
      console.log(`latestDate: ${latestDate}`);
      return latestDate;
    } catch (error) {
      console.error("Error fetching latest document date: ", error);
      return new Date().toISOString();
    }
  }
}
