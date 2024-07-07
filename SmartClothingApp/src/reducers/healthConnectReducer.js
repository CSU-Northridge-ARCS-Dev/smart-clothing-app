import {
    INITIAL_HEALTH_DATA_SYNC,
    SET_PERMISSIONS,
    SET_SDK_STATUS,
    SET_HEALTH_CONNECT_INITIALIZED,
    SET_HEALTH_CONNECT_MODAL_VISIBLE,
    SET_HEALTH_SYNC_LOADING_SCREEN,
} from '../actions/types';


const initialState = {
    onAccountCreation: false,
    permissions: false,
    sdkStatus: null,
    isHealthConnectInitialized: false,
    healthConnectModalVisible: false,
    healthConnectLoadingScreen: false,
  };
  

const healthConnectReducer = (state = initialState, action) => {
    console.log('[healthConnectReducer] Initial state:', state);
    console.log("[healthConnectReducer] Action received:", action)
    switch (action.type) {
        case INITIAL_HEALTH_DATA_SYNC:
            console.log("[healthConnectReducer] Handling INITIAL_HEALTH_DATA_SYNC");
            return {
                ...state,
                onAccountCreation: action.payload.onAccountCreation,
            };
        case SET_PERMISSIONS:
            console.log("[healthConnectReducer] Handling SET_PERMISSIONS");
            return {
                ...state,
                permissions: action.payload.permissions,
            };
        case SET_SDK_STATUS:
            console.log("[healthConnectReducer] Handling SET_SDK_STATUS");
            return {
                ...state,
                sdkStatus: action.payload.status,
            };
        case SET_HEALTH_CONNECT_INITIALIZED:
            console.log("[healthConnectReducer] Handling SET_HEALTH_CONNECT_INITIALIZED");
            return {
                ...state,
                isHealthConnectInitialized: action.payload.initialized,
            };
        case SET_HEALTH_CONNECT_MODAL_VISIBLE:
            console.log("[healthConnectReducer] Handling SET_HEALTH_CONNECT_MODAL_VISIBLE");
            return {
                ...state,
                healthConnectModalVisible: action.payload.visible,
            };
        case SET_HEALTH_SYNC_LOADING_SCREEN:
            console.log("[healthConnectReducer] Handling SET_HEALTH_SYNC_LOADING_SCREEN");
            return {
                ...state,
                healthConnectLoadingScreen: action.payload.visible,
            };
        default:
            return state;
    }
};

export default healthConnectReducer;