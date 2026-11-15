import { Platform } from "react-native";
import {
  getSdkStatus,
  initialize,
  requestPermission,
  getGrantedPermissions,
  revokeAllPermissions,
  openHealthConnectSettings,
  SdkAvailabilityStatus,
} from "react-native-health-connect";

// Health Connect is the health store on an Android phone. The watch's own
// phone app (Google Health, Samsung Health) fills it, and this app only
// reads it. Nothing here touches Redux or Firebase.

// The record types the app reads
export const READ_RECORD_TYPES = [
  "Steps",
  "HeartRate",
  "RestingHeartRate",
  "SleepSession",
  "ExerciseSession",
  "Distance",
  "TotalCaloriesBurned",
];

// What the permission sheet asks for. ReadHealthDataHistory lets the app read
// further back than 30 days on phones that support it. Health Connect never
// reports it back as granted, so it isn't counted in getGranted.
export const PERMISSIONS = [
  ...READ_RECORD_TYPES.map((recordType) => ({
    accessType: "read",
    recordType,
  })),
  { accessType: "read", recordType: "ReadHealthDataHistory" },
];

// Where the phone's Health Connect can be installed or updated
export const HEALTH_CONNECT_STORE_URL =
  "market://details?id=com.google.android.apps.healthdata";

let initialized = false;

// A revoke only takes effect when the app next starts. Until then Health
// Connect still reports the old permissions.
let revokePending = false;

const ensureInitialized = async () => {
  if (!initialized) initialized = await initialize();
  return initialized;
};

// "available" | "update_needed" | "unavailable"
export const getStatus = async () => {
  if (Platform.OS !== "android") return "unavailable";
  try {
    const status = await getSdkStatus();
    if (
      status === SdkAvailabilityStatus.SDK_UNAVAILABLE_PROVIDER_UPDATE_REQUIRED
    ) {
      return "update_needed";
    }
    if (status !== SdkAvailabilityStatus.SDK_AVAILABLE) return "unavailable";
    return (await ensureInitialized()) ? "available" : "unavailable";
  } catch (error) {
    console.log("Health Connect status error: ", error);
    return "unavailable";
  }
};

const onlyReads = (permissions) =>
  (permissions || []).filter(
    (p) => p.accessType === "read" && READ_RECORD_TYPES.includes(p.recordType)
  );

// Opens the Health Connect permission sheet and returns the read permissions
// the athlete allowed. Once they have denied twice the sheet no longer opens
// and this returns an empty list straight away.
export const requestPermissions = async () => {
  await ensureInitialized();
  return onlyReads(await requestPermission(PERMISSIONS));
};

// The read permissions the app holds right now
export const getGranted = async () => {
  await ensureInitialized();
  return onlyReads(await getGrantedPermissions());
};

export const revoke = async () => {
  await ensureInitialized();
  await revokeAllPermissions();
  revokePending = true;
};

export const isRevokePending = () => revokePending;

export const openSettings = () => openHealthConnectSettings();
