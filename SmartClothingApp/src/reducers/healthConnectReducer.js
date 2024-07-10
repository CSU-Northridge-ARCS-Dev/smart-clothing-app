import {
    START_HEALTH_CONNECT_SETUP,
    ANDROID_SDK_STATUS,
    HEALTH_CONNECT_PERMISSIONS,
    HEALTH_CONNECT_INITIALIZED,
    HEALTH_CONNECT_MODAL_VISIBLE,
    HEALTH_CONNECT_SYNC,
    LOGOUT,
} from '../actions/types';


const initialState = {
    onUserAuthenticated: false,
    sdkStatus: null,
    permissions: false,
    isHealthConnectInitialized: false,
    healthConnectModalVisible: false,
    healthConnectLoadingScreen: false,
  };
  

const healthConnectReducer = (state = initialState, action) => {
    console.log('[healthConnectReducer] Initial state:', state);
    console.log("[healthConnectReducer] Action received:", action)
    switch (action.type) {
        case START_HEALTH_CONNECT_SETUP:
            console.log("[healthConnectReducer] Handling START_HEALTH_CONNECT_SETUP");
            return {
                ...state,
                onUserAuthenticated: action.payload.onUserAuthenticated,
            };
        case ANDROID_SDK_STATUS:
            console.log("[healthConnectReducer] Handling ANDROID_SDK_STATUS");
            return {
                ...state,
                sdkStatus: action.payload.status,
            };
        case HEALTH_CONNECT_PERMISSIONS:
            console.log("[healthConnectReducer] Handling HEALTH_CONNECT_PERMISSIONS");
            return {
                ...state,
                permissions: action.payload.permissions,
            };
        case HEALTH_CONNECT_INITIALIZED:
            console.log("[healthConnectReducer] Handling HEALTH_CONNECT_INITIALIZED");
            return {
                ...state,
                isHealthConnectInitialized: action.payload.initialized,
            };
        case HEALTH_CONNECT_MODAL_VISIBLE:
            console.log("[healthConnectReducer] Handling HEALTH_CONNECT_MODAL_VISIBLE");
            return {
                ...state,
                healthConnectModalVisible: action.payload.visible,
            };
        case HEALTH_CONNECT_SYNC:
            console.log("[healthConnectReducer] Handling HEALTH_CONNECT_SYNC");
            return {
                ...state,
                syncStatus: action.payload.syncStatus,
            };
        case LOGOUT: 
            console.log("[healthConnectReducer] Handling LOGOUT");
            return initialState;
        default:
            return state;
    }
};

export default healthConnectReducer;