import * as SecureStore from "expo-secure-store";

// Fitbit OAuth tokens live only on the phone. This is the only module
// that touches SecureStore; everything else goes through these helpers.
const FITBIT_TOKENS_KEY = "fitbitTokens";

// Returns { accessToken, refreshToken, expiresAt, fitbitUserId } or null.
export const getFitbitTokens = async () => {
  try {
    const value = await SecureStore.getItemAsync(FITBIT_TOKENS_KEY);
    if (!value) return null;
    const tokens = JSON.parse(value);
    return tokens && tokens.accessToken && tokens.refreshToken ? tokens : null;
  } catch (e) {
    console.log("Error reading Fitbit tokens: ", e);
    return null;
  }
};

export const setFitbitTokens = async (tokens) => {
  const { accessToken, refreshToken, expiresAt, fitbitUserId } = tokens;
  await SecureStore.setItemAsync(
    FITBIT_TOKENS_KEY,
    JSON.stringify({ accessToken, refreshToken, expiresAt, fitbitUserId })
  );
};

export const clearFitbitTokens = async () => {
  try {
    await SecureStore.deleteItemAsync(FITBIT_TOKENS_KEY);
  } catch (e) {
    console.log("Error clearing Fitbit tokens: ", e);
  }
};
