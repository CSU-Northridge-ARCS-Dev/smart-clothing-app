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
  limit,
} from "firebase/firestore";
import { auth, database } from "../../../firebaseConfig";

import { useState } from "react";

import { readSampleData } from "./HealthConnectServices";
import { getHeartRateData } from "../../utils/HealthConnectUtils";
import { sendHeartRateData } from "../../actions/userActions";

async function getLatestDateFromCollection(collectionName) {
  try {
    // TODO fix later, quick hack.
    let latestDoc = null;
    if (collectionName === "SleepDataHC") {
      latestDoc = query(
        collection(doc(database, "Users", auth.currentUser.uid), "SleepDataHC"),
        orderBy("endDate", "desc"),
        limit(1)
      );
    } else if (collectionName === "ActivityRingsData") {
      latestDoc = query(
        collection(
          doc(database, "Users", auth.currentUser.uid),
          "ActivityRingsData"
        ),
        orderBy("date", "desc"),
        limit(1)
      );
    } else if (collectionName === "HeartRateDataHC") {
      latestDoc = query(
        collection(
          doc(database, "Users", auth.currentUser.uid),
          "HeartRateDataHC"
        ),
        orderBy("time", "desc"),
        limit(1)
      );
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
    const latestDate =
      collectionName !== "SleepDataHC"
        ? fetchedData[0].time
        : fetchedData[0].endDate;
    console.log(`latestDate: ${latestDate}`);
    return new Date(latestDate);
  } catch (error) {
    console.error("Error fetching latest document date: ", error);
    return new Date().toISOString();
  }
}

export async function updateWithLatestData() {
  console.log("Performing fetching of latest data...");

  const nextDate = new Date();

  try {
    // Update heart rate data.
    console.log("Updating heart rate data...");
    const hrStartDate = await getLatestDateFromCollection("HeartRateDataHC");
    hrStartDate.setMinutes(hrStartDate.getMinutes() + 1);

    console.log("hrStartDate: ", hrStartDate);
    console.log("nextDate", nextDate);
    const heartRateData = await getHeartRateData(hrStartDate, nextDate);
    console.log("Fetching of heart rate data complete");
    await sendHeartRateData(heartRateData);
    console.log("Uploading of heart rate data complete!");

    // Update sleep data.
    // console.log("Uploading sleep data...");
    // const sStartDate = await getLatestDateFromCollection("SleepDataHC");
    // console.log("sStartDate: ", sStartDate);
    // const sleepData = await getSleepData(sStartDate, today);
    // console.log("Fetching of sleep data complete");
    // this.uploadSleepData(sleepData);
    // console.log("Uploading of sleep data complete!");

    // Update activity rings data.
    // console.log("Uploading activity rings data...");
    // const arStartDate = await getLatestDateFromCollection("ActivityRingsData");
    // console.log("arStartDate: ", arStartDate);
    // const activityRingsData = await getActivityRingsData(arStartDate, today);
    // console.log("Fetching of activity rings data complete");
    // this.uploadActivityRingsData(activityRingsData);
    // console.log("Uploading of activity rings data complete!");

    console.log("All updates successful!");
  } catch (error) {
    console.error("Error updating health data: ", error);
  }
}
