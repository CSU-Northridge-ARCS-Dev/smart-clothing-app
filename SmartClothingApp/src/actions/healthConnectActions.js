import {
    START_HEALTH_CONNECT_SETUP,
    ANDROID_SDK_STATUS,
    HEALTH_CONNECT_PERMISSIONS,
    HEALTH_CONNECT_INITIALIZED,
    HEALTH_CONNECT_MODAL_VISIBLE,
    HEALTH_CONNECT_SYNC,
} from "./types";
import {
    initializeHealthConnect,
    checkSdkStatus,
    checkDevicePermissions,
    requestJSPermissions,
    getSdkAvailabilityStatus,
  } from "../services/HealthConnectServices/HealthConnectServices";
import { initialHealthDataSync } from "./appActions";


export const startHealthConnectSetup = (onUserAuthenticated) => {
    return {
      type: START_HEALTH_CONNECT_SETUP,
      payload: { onUserAuthenticated },
    };
};

export const setSdkStatus = (status) => {
    return {
        type: ANDROID_SDK_STATUS,
        payload: { status },  
    };
};

export const setHealthConnectPermissions = (permissions) => {
    return {
        type: HEALTH_CONNECT_PERMISSIONS,
        payload: { permissions },
    };
};
             
export const setHealthConnectInitialized = (initialized) => {
    return {
        type: HEALTH_CONNECT_INITIALIZED,
        payload: { initialized },
    }
};

export const setHealthConnectModalVisible = (visible) => ({
    type: HEALTH_CONNECT_MODAL_VISIBLE, // Updated
    payload: { visible },
});

export const setHCSyncLoadingStatus = (syncStatus) => {
    return {
        type: HEALTH_CONNECT_SYNC,
        payload: { syncStatus },
    }
};


// Thunk actions
/**
 * Initializes Health Connect with permissions check.
 * @returns {Function} The async function that initializes Health Connect and checks permissions.
 */
export const initHCWithPermissionsCheck = () => async (dispatch) => {
    console.log("\n[healthConnectActions] checkAvailability called");
    try {
        const status = await checkSdkStatus();
        console.log("[healthConnectActions] SDK status checked");

        dispatch(setSdkStatus(status));
        console.log("[healthConnectActions] SDK status set");

        console.log("[healthConnectActions] status: ", status);
        console.log("[healthConnectActions] getSdkAvailabilityStatus.SDK_AVAILABLE, ",  getSdkAvailabilityStatus());

        const confirmStatus = await getSdkAvailabilityStatus()
        if (status === confirmStatus) {
            console.log("[healthConnectActions] SDK is available");
            const isInitialized = await initializeHealthConnect();
            console.log("[healthConnectActions] isInitialized == ", isInitialized);

            dispatch(setHealthConnectInitialized(isInitialized));
            console.log("[healthConnectActions] Health Connect Initialized");

            const permissions = await checkDevicePermissions();
            console.log("[healthConnectActions] permissions == ", permissions);
            console.log("[healthConnectActions] permissions.length == ", permissions.length);

            if (!permissions || permissions.length === 0) {
                dispatch(setHealthConnectPermissions(false));
                dispatch(setHealthConnectModalVisible(true));
                console.log("[healthConnectActions] Permissions are not granted, setting modal visible");
            } else {
                dispatch(setHealthConnectPermissions(true));
                dispatch(setHealthConnectModalVisible(false));
                console.log("[healthConnectActions] Permissions are granted");
                console.log("[healthConnectActions] Updating health data... [to be implemented]");



            }
        } else {
            dispatch(setHealthConnectPermissions(false));
            dispatch(setHealthConnectModalVisible(true));
            console.log("[healthConnectActions] SDK is not available, setting modal visible");
        }
    } catch (error) {
        console.error("[healthConnectActions] Error checking availability:", error);
    }
  };
  
  
  /**
   * Requests health connect permissions and initializes the health connect functionality.
   * @returns {Function} An async function that dispatches actions based on the result of requesting permissions.
   */
  export const requestHCPermissions = () => async (dispatch) => {
    console.log("\n[healthConnectActions] requestPermissions called");
    try {
        const permissions = await requestJSPermissions();
        console.log("[healthConnectActions] Permissions requested:", permissions);

        if (permissions.length > 0) {
            dispatch(setHealthConnectPermissions(permissions.length > 0));
            console.log("[healthConnectActions] Permissions granted");

            //dispatch(setHealthConnectInitialized(true));
            dispatch(setHealthConnectModalVisible(false));
            console.log("[healthConnectActions] Health Connect Initialized and modal hidden");
        } else {
            // Cancel the request and set permissions to false
            dispatch(setHealthConnectModalVisible(false));
            // dispatch(setHealthConnectPermissions(false));
            // dispatch(setHCSyncLoadingStatus(false));
            dispatch(initialHealthDataSync(false));
            console.log("[healthConnectActions] Health Connect Permissions not set");
        }
    } catch (error) {
        console.error("[healthConnectActions] Error requesting permissions:", error);
    }
  };
