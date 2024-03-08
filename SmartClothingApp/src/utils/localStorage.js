import AsyncStorage from "@react-native-async-storage/async-storage";

// Store the uid securely
export const storeUID = async (uid) => {
  try {
    await AsyncStorage.setItem("uid", uid);
    console.log("User UID stored successfully!", uid);
  } catch (error) {
    console.error("Error storing user uid:", error);
  }
};

// Get the uid securely
export const getUID = async () => {
  try {
    const uid = await AsyncStorage.getItem("uid");
    return uid;
  } catch (error) {
    console.error("Error getting user UID:", error);
  }
};

// store user metrics data
export const storeMetrics = async (metrics) => {
  try {
    await AsyncStorage.setItem("metricsData", JSON.stringify(metrics));
    console.log("User metrics stored successfully!", metrics);
  } catch (error) {
    console.error("Error storing user metrics:", error);
  }
};

// Get the user metrics
export const getMetrics = async () => {
  try {
    const metrics = await AsyncStorage.getItem("metricsData");
    return JSON.parse(metrics);
  } catch (error) {
    console.error("Error getting user metrics:", error);
    return false;
  }
};
