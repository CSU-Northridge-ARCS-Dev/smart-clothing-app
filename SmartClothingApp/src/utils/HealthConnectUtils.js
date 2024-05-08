import { readSampleData } from "../services/HealthConnectServices/HealthConnectServices";

export const getHeartRateData = async (startDate, endDate) => {
  try {
    const heartRateData = await readSampleData(
      "HeartRate",
      new Date(startDate),
      new Date(endDate)
    );
    // console.log("Heart rate data recieved:", heartRateData);

    // await sendHeartRateData(heartRateData);
    // Process and format heart rate data
    let dataArray = [];
    heartRateData.forEach((data) => {
      data.samples.forEach((sample) => {
        dataArray.push(sample);
      });
      // console.log("Timestamp:", timestamp, "Heart rate:", heartRate);
    });
    // Perform further processing as needed
    return dataArray;
  } catch (error) {
    console.error(
      "An unexpected error occurred while reading heart rate data:",
      error
    );
  }
};
