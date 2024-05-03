import { readSampleData } from "../services/HealthConnectServices/HealthConnectServices";

export const getHeartRateData = async (startDate, endDate) => {
  try {
    const heartRateData = await readSampleData("HeartRate", startDate, endDate);
    // console.log("Heart rate data recieved:", heartRateData);

    // await sendHeartRateData(heartRateData);
    // Process and format heart rate data
    heartRateData.forEach((data) => {
      console.log("sample", data.samples);
      // console.log("Timestamp:", timestamp, "Heart rate:", heartRate);
      const result = data.map(object);
      console.log(result);
      return data.samples;

      // Perform further processing as needed
    });
  } catch (error) {
    console.error(
      "An unexpected error occurred while reading heart rate data:",
      error
    );
  }
};
