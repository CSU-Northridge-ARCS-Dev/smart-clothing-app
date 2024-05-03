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

//need to be put into utils
const getLastYearDate = () => {
  const today = new Date();
  return new Date(today.getFullYear() - 1, today.getMonth(), today.getDate());
};

const getLastWeekDate = () => {
  return new Date(new Date().getTime() - 7 * 24 * 60 * 60 * 1000);
};

const getLastTwoWeeksDate = () => {
  return new Date(new Date().getTime() - 2 * 7 * 24 * 60 * 60 * 1000);
};

const getTodayDate = () => {
  return new Date();
};
//

export const initializeHealthConnect = async () => {
  const result = await initialize();
  console.log({ result });
  setIsHealthConnectInitialized(result);
  return result;
};

export const checkAvailability = async () => {
  const status = await getSdkStatus();
  setSdkStatus(status);
  console.log({ status });
  if (status === SdkAvailabilityStatus.SDK_AVAILABLE) {
    console.log("SDK is available");

    const isInitialized = await setIsHealthConnectInitialized();
    if (!isInitialized) {
      await initializeHealthConnect();
    }

    console.log("Hit health connect initialized");
    console.log("Hit initialized");
    const permissions = grantedPermissions();
    console.log("Hit granted permissions");
    if (!permissions || permissions.length === 0) {
      requestJSPermissions();
      console.log("recieved permissions");
    }
  }

  if (status === SdkAvailabilityStatus.SDK_UNAVAILABLE) {
    console.log("SDK is not available");
    setModalVisible(true);
  }

  if (
    status === SdkAvailabilityStatus.SDK_UNAVAILABLE_PROVIDER_UPDATE_REQUIRED
  ) {
    console.log("SDK is not available, provider update required");
    setModalVisible(true);
  }
};

export const requestJSPermissions = () => {
  requestPermission([
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
  ]).then((permissions) => {
    console.log("Granted permissions on request ", { permissions });
  });
};

export const grantedPermissions = () => {
  getGrantedPermissions().then((permissions) => {
    console.log("Granted permissions ", { permissions });
    return permissions;
  });
};

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
  startDate = new Date(startDate);
  endDate = new Date(endDate);
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
