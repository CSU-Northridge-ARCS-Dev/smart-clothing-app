import {
    INITIAL_HEALTH_DATA_SYNC,
    SET_PERMISSIONS,
    SET_SDK_STATUS,
    SET_HEALTH_CONNECT_INITIALIZED,
    SET_MODAL_VISIBLE,
  } from './types';
  
  const initialState = {
    onAccountCreation: false,
    permissions: false,
    sdkStatus: null,
    isHealthConnectInitialized: false,
    modalVisible: false,
  };
  
  const healthConnectReducer = (state = initialState, action) => {
    switch (action.type) {
      case INITIAL_HEALTH_DATA_SYNC:
        return {
          ...state,
          onAccountCreation: action.payload.onAccountCreation,
        };
      case SET_PERMISSIONS:
        return {
          ...state,
          permissions: action.payload.permissions,
        };
      case SET_SDK_STATUS:
        return {
          ...state,
          sdkStatus: action.payload.sdkStatus,
        };
      case SET_HEALTH_CONNECT_INITIALIZED:
        return {
          ...state,
          isHealthConnectInitialized: action.payload.isHealthConnectInitialized,
        };
      case SET_MODAL_VISIBLE:
        return {
          ...state,
          modalVisible: action.payload.modalVisible,
        };
      default:
        return state;
    }
  };
  
  export default healthConnectReducer;