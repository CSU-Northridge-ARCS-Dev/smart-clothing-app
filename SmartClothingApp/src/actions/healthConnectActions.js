import {
    INITIAL_HEALTH_DATA_SYNC,
    SET_PERMISSIONS,
    SET_SDK_STATUS,
    SET_HEALTH_CONNECT_INITIALIZED,
    SET_MODAL_VISIBLE,
  } from "./types";

export const initialHealthDataSync = (onAccountCreation) => {
    return {
    type: INITIAL_HEALTH_DATA_SYNC,
    payload: { onAccountCreation },
    };
};

export const setPermissions = (permissions) => {
    return {
        type: SET_PERMISSIONS,
        payload: permissions,
    };
};

export const setSdkStatus = (status) => {
    return {
        type: SET_SDK_STATUS,
        payload: status,
    }
}

export const setHealthConnectInitialized = (initialized) => {
    return {
        type: SET_HEALTH_CONNECT_INITIALIZED,
        payload: initialized,
    }
}

export const setModalVisible = (visible) => {
    return {
        type: SET_MODAL_VISIBLE,
        payload: visible,
    }
} 