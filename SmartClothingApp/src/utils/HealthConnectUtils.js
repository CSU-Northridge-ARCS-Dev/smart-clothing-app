import { readSampleData } from "../services/HealthConnectServices/HealthConnectServices.js";

// refactor later into a single function
export const getHeartRateData = async (startDate, endDate) => {
  console.log("hr start", startDate);
  console.log("hr end", endDate);

  try {
    const fetchedData = await readSampleData(
      "HeartRate",
      new Date(startDate),
      new Date(endDate)
    );

    console.log("fetched from get", fetchedData);

    // console.log("Heart rate data recieved:", heartRateData);

    // await sendHeartRateData(heartRateData);
    // Process and format heart rate data
    let dataArray = [];
    fetchedData.forEach((data) => {
      data.samples.forEach((sample) => {
        dataArray.push(sample);
      });
      // console.log("Timestamp:", timestamp, "Heart rate:", heartRate);
    });
    // Perform further processing as needed
    //console.log("test hr", dataArray);
    return dataArray;
  } catch (error) {
    console.error("An unexpected error occurred while reading data:", error);
  }
};

export const getSleepData = async (startDate, endDate) => {
  try {
    const fetchedData = await readSampleData(
      "SleepSession",
      new Date(startDate),
      new Date(endDate)
    );

    // console.log("Heart rate data recieved:", heartRateData);

    // await sendHeartRateData(heartRateData);
    // Process and format heart rate data
    let dataArray = [];
    fetchedData.forEach((data) => {
      data.stages.forEach((stage) => {
        console.log("stage", stage);
        dataArray.push(stage);
      });
      // console.log("Timestamp:", timestamp, "Heart rate:", heartRate);
    });
    // Perform further processing as needed
    return dataArray;
  } catch (error) {
    console.error("An unexpected error occurred while reading data:", error);
  }
};
