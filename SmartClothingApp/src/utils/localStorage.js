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
    console.log("getUID: ", uid);
    return uid;
  } catch (error) {
    console.error("Error getting user UID:", error);
  }
};

// Clear the uid 
export const clearUID = async () => {
  try {
    await AsyncStorage.removeItem("uid");
    console.log("User UID cleared successfully");
  } catch (error) {
    console.error("Error clearing user UID", error);
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

// Store the token securely
export const storeToken = async (token) => {
  try {
    await AsyncStorage.setItem("authToken", token);
    console.log("Token stored successfully!", token);
  } catch (error) {
    console.error("Error storing token:", error);
  }
};

// Get the token securely
export const getToken = async () => {
  try {
    const token = await AsyncStorage.getItem("authToken");
    return token;
  } catch (error) {
    console.error("Error getting token:", error);
  }
};

// Clear the token securely
export const clearToken = async () => {
  try {
    await AsyncStorage.removeItem("authToken");
    console.log("Token cleared successfully!");
  } catch (error) {
    console.error("Error clearing token:", error);
  }
};

// Clear user metrics
export const clearMetrics = async () => {
  try {
    await AsyncStorage.removeItem("metricsData");
    console.log("User metrics cleared successfully")
  } catch (error) {
    console.error("Error clearing user metrics", error);
  }
};

// Store first name
export const storeFirstName = async (firstName) => {
  try {
    await AsyncStorage.setItem("firstName", firstName);
    console.log("First name stored successfully!", firstName);
  } catch (error) {
    console.error("Error storing first name:", error);
  }
};

// Get first name
export const getFirstName = async () => {
  try {
    const firstName = await AsyncStorage.getItem("firstName");
    return firstName;
  } catch (error) {
    console.error("Error getting first name:", error);
  }
};

// Clear first name
export const clearFirstName = async () => {
  try {
    await AsyncStorage.removeItem("firstName");
    console.log("First name cleared successfully");
  } catch (error) {
    console.error("Error clearing first name", error);
  }
};

// Store last name
export const storeLastName = async (lastName) => {
  try {
    await AsyncStorage.setItem("lastName", lastName);
    console.log("Last name stored successfully!", lastName);
  } catch (error) {
    console.error("Error storing last name:", error);
  }
};

// Get last name
export const getLastName = async () => {
  try {
    const lastName = await AsyncStorage.getItem("lastName");
    return lastName;
  } catch (error) {
    console.error("Error getting last name:", error);
  }
};

// Clear last name
export const clearLastName = async () => {
  try {
    await AsyncStorage.removeItem("lastName");
    console.log("Last name cleared successfully");
  } catch (error) {
    console.error("Error clearing last name", error);
  }
};

// Store email
export const storeEmail = async (email) => {
  try {
    await AsyncStorage.setItem("email", email);
    console.log("Email stored successfully!", email);
  } catch (error) {
    console.error("Error storing email:", error);
  }
};

// Get email
export const getEmail = async () => {
  try {
    const email = await AsyncStorage.getItem("email");
    return email;
  } catch (error) {
    console.error("Error getting email:", error);
  }
};

// Clear email
export const clearEmail = async () => {
  try {
    await AsyncStorage.removeItem("email");
    console.log("Email cleared successfully");
  } catch (error) {
    console.error("Error clearing email", error);
  }
};