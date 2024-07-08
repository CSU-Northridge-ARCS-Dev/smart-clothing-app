import {
  aggregateRecord,
  getGrantedPermissions,
  initialize,
  insertRecords,
  getSdkStatus,
  readRecords,
  requestPermission,
  revokeAllPermissions,
  SdkAvailabilityStatus,
  openHealthConnectSettings,
  openHealthConnectDataManagement,
  readRecord,
} from "react-native-health-connect";


export const initializeHealthConnect = async () => {
  console.log("\n\n[HealthConnectServices] Initializing Health Connect");
  const result = await initialize();
  console.log("[HealthConnectServices] Health Connect Initialized");
  console.log("[HealthConnectServices] Initialization result: ", result);
  return result;
};

export const checkSdkStatus = async () => {
  console.log("\n[HealthConnectServices] Checking SDK status");
  const status = await getSdkStatus();
  console.log("[HealthConnectServices] SDK status: ", status);
  return status;
};

export const getSdkAvailabilityStatus = async () => {
  console.log("\n\n[HealthConnectServices] Checking SDK availability status");
  const status = await SdkAvailabilityStatus.SDK_AVAILABLE;
  console.log("[HealthConnectServices] SDK availability status: ", status);
  return status;
};

export const checkDevicePermissions = async () => {
  console.log("\n\n[HealthConnectServices] Checking device permissions");
  try {
    const permissions = await getGrantedPermissions();
    console.log("[HealthConnectServices] Granted permissions: ", permissions);
    return permissions;
  } catch (error) {
    console.error("[HealthConnectServices] Error fetching granted permissions: ", error);
    return [];
  }
};

export const requestJSPermissions = async () => {
  try {
    const permissions = await requestPermission([
      {
        // if changing this, also change in app.json (located in the project root folder) and/or AndroidManifest.xml (located in android/app/src/main/AndroidManifest.xml)
        // need to add heart rate & sleep data
        accessType: "read",
        recordType: "Steps",
      },
      {
        accessType: "read",
        recordType: "HeartRate",
      },
      {
        accessType: "write",
        recordType: "Steps",
      },
      {
        accessType: "write",
        recordType: "HeartRate",
      },
      {
        accessType: "read",
        recordType: "SleepSession",
      },
      {
        accessType: "write",
        recordType: "SleepSession",
      },
    ]);

    console.log("Granted permissions on request ", { permissions });
    return permissions;
  } catch (error) {
    console.error("Error requesting permissions: ", error);
    return [];
  }
};

// export const requestJSPermissions = async () => {
//   await requestPermission([
//     {
//       // if changing this, also change in app.json (located in the project root folder) and/or AndroidManifest.xml (located in android/app/src/main/AndroidManifest.xml)
//       // need to add heart rate & sleep data
//       accessType: "read",
//       recordType: "Steps",
//     },
//     {
//       accessType: "read",
//       recordType: "HeartRate",
//     },
//     {
//       accessType: "write",
//       recordType: "Steps",
//     },
//     {
//       accessType: "write",
//       recordType: "HeartRate",
//     },
//     {
//       accessType: "read",
//       recordType: "SleepSession",
//     },
//     {
//       accessType: "write",
//       recordType: "SleepSession",
//     },
//     ]).then((permissions) => {
//       setPermissions(true);
//       console.log("Granted permissions on request ", { permissions });
//       console.log("Permissions status set to true");

//       return permissions;
//     });

// };






// end area that needs to be moved to a separate file

// sample data functions
// these functions are for testing purposes only; TO BE REMOVED
export const insertSampleData = () => {
  insertRecords([
    {
      recordType: "Steps",
      count: 1000,
      startTime: getLastWeekDate().toISOString(),
      endTime: getTodayDate().toISOString(),
    },
  ]).then((ids) => {
    console.log("Records inserted ", { ids });
  });
};

export const readSampleData = async (dataType, startDate, endDate) => {
  try {
    const data = await readRecords(dataType, {
      timeRangeFilter: {
        operator: "between",
        startTime: startDate.toISOString(),
        endTime: endDate.toISOString(),
      },
    });

    // const sleepData = await readRecords("SleepSession", {
    //   timeRangeFilter: {
    //     operator: "between",
    //     startTime: getLastYearDate().toISOString(),
    //     endTime: getTodayDate().toISOString(),
    //   },
    // });

    // Iterate over the result array
    // for (const record of heartRates) {
    //   await sendHeartRateData(record.samples);
    // }
    return data;
  } catch (error) {
    // Handle any errors
    console.error("Error reading sample data:", error);
  }
};

export const readSampleDataSingle = () => {
  readRecord("Steps", "a7bdea65-86ce-4eb2-a9ef-a87e6a7d9df2").then((result) => {
    console.log("Retrieved record: ", JSON.stringify({ result }, null, 2));
  });
};

export const aggregateSampleData = () => {
  aggregateRecord({
    recordType: "Steps",
    timeRangeFilter: {
      operator: "between",
      startTime: getLastWeekDate().toISOString(),
      endTime: getTodayDate().toISOString(),
    },
  }).then((result) => {
    console.log("Aggregated record: ", { result });
  });
};