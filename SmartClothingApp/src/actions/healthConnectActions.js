import {
    INITIAL_HEALTH_DATA_SYNC,
    SET_PERMISSIONS,
    SET_SDK_STATUS,
    SET_HEALTH_CONNECT_INITIALIZED,
    SET_HEALTH_CONNECT_MODAL_VISIBLE,
    SET_HEALTH_SYNC_LOADING_SCREEN,
} from "./types";
import {
    initializeHealthConnect,
    checkSdkStatus,
    checkDevicePermissions,
    requestJSPermissions,
    getSdkAvailabilityStatus,
  } from "../services/HealthConnectServices/HealthConnectServices";


export const initialHealthDataSync = (onAccountCreation) => {
    return {
      type: INITIAL_HEALTH_DATA_SYNC,
      payload: { onAccountCreation },
    };
};

export const setPermissions = (permissions) => {
    return {
        type: SET_PERMISSIONS,
        payload: { permissions },
    };
};

export const setSdkStatus = (status) => {
    return {
        type: SET_SDK_STATUS,
        payload: { status },
    }
};
             
export const setHealthConnectInitialized = (initialized) => {
    return {
        type: SET_HEALTH_CONNECT_INITIALIZED,
        payload: { initialized },
    }
};

export const setHealthConnectModalVisible = (visible) => ({
    type: SET_HEALTH_CONNECT_MODAL_VISIBLE, // Updated
    payload: { visible },
});

export const setHealthConnectLoadingScreen = (visible) => {
    return {
        type: SET_HEALTH_SYNC_LOADING_SCREEN,
        payload: { visible },
    }
};


// Thunk actions
export const checkAvailability = () => async (dispatch) => {
    console.log("\n[healthConnectActions] checkAvailability called");
    try {
        const status = await checkSdkStatus();
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
                dispatch(setPermissions(false));
                dispatch(setHealthConnectModalVisible(true));
                console.log("[healthConnectActions] Permissions are not granted, setting modal visible");
            } else {
                dispatch(setPermissions(true));
                dispatch(setHealthConnectModalVisible(false));
                console.log("[healthConnectActions] Permissions are granted");
                console.log("[healthConnectActions] Updating health data... [to be implemented]");



            }
        } else {
            dispatch(setPermissions(false));
            dispatch(setHealthConnectModalVisible(true));
            console.log("[healthConnectActions] SDK is not available, setting modal visible");
        }
    } catch (error) {
        console.error("[healthConnectActions] Error checking availability:", error);
    }
  };
  
  export const requestPermissions = () => async (dispatch) => {
    console.log("\n[healthConnectActions] requestPermissions called");
    try {
        const permissions = await requestJSPermissions();
        console.log("[healthConnectActions] Permissions requested:", permissions);

        dispatch(setPermissions(permissions.length > 0));
        console.log("[healthConnectActions] Permissions granted");

        if (permissions.length > 0) {
            dispatch(setHealthConnectInitialized(true));
            dispatch(setHealthConnectModalVisible(false));
            console.log("[healthConnectActions] Health Connect Initialized and modal hidden");
            }
    } catch (error) {
        console.error("[healthConnectActions] Error requesting permissions:", error);
    }
  };


// Thunk actions
// export const checkAvailability = () => {
//     return async (dispatch) => {
//       console.log("\n[healthConnectActions] checkAvailability called");
//       try {
//         const status = await checkSdkStatus();
//         await dispatch(setSdkStatus(status));
//         console.log("[healthConnectActions] SDK status set");
  
//         console.log("[healthConnectActions] status: ", status);
//         //console.log("[healthConnectActions] getSdkAvailabilityStatus.SDK_AVAILABLE, ", getSdkAvailabilityStatus());
  
//         const confirmStatus = await getSdkAvailabilityStatus();
//         if (status === confirmStatus) {
//           console.log("[healthConnectActions] SDK is available");
//           const isInitialized = await initializeHealthConnect();
//           console.log("[healthConnectActions] isInitialized == ", isInitialized);
  
//           await dispatch(setHealthConnectInitialized(isInitialized));
//           console.log("[healthConnectActions] Health Connect Initialized");
  
//           const permissions = await checkDevicePermissions();
//           console.log("[healthConnectActions] permissions == ", permissions);
//           console.log("[healthConnectActions] permissions.length == ", permissions.length);
  
//           if (!permissions || permissions.length === 0) {
//             await dispatch(setPermissions(false));
//             await dispatch(setHealthConnectModalVisible(true));
//             console.log("[healthConnectActions] Permissions are not granted, setting modal visible");
//           } else {
//             dispatch(setPermissions(true));
//             dispatch(setHealthConnectModalVisible(false));
//             console.log("[healthConnectActions] Permissions are granted");
//             console.log("[healthConnectActions] Updating health data... [to be implemented]");
//           }
//         } else {
//           dispatch(setPermissions(false));
//           dispatch(setHealthConnectModalVisible(true));
//           console.log("[healthConnectActions] SDK is not available, setting modal visible");
//         }
//       } catch (error) {
//         console.error("[healthConnectActions] Error checking availability:", error);
//       }
//     };
//   };
  
//   export const requestPermissions = () => {
//     return async (dispatch) => {
//       console.log("\n[healthConnectActions] requestPermissions called");
//       try {
//         const permissions = await requestJSPermissions();
//         console.log("[healthConnectActions] Permissions requested:", permissions);
  
//         dispatch(setPermissions(permissions.length > 0));
//         console.log("[healthConnectActions] Permissions granted");
  
//         if (permissions.length > 0) {
//           dispatch(setHealthConnectInitialized(true));
//           dispatch(setHealthConnectModalVisible(false));
//           console.log("[healthConnectActions] Health Connect Initialized and modal hidden");
//         }
//       } catch (error) {
//         console.error("[healthConnectActions] Error requesting permissions:", error);
//       }
//     };
//   };
  

