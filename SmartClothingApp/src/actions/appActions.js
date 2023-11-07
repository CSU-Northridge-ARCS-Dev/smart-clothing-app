import {
  USER_METRICS_DATA_MODAL_VISIBLE,
  UPDATE_ACTIVITY_RINGS_DATA,
} from "./types";

export const userMetricsDataModalVisible = (
  visibility,
  isFromSignUpScreen = false
) => {
  return {
    type: USER_METRICS_DATA_MODAL_VISIBLE,
    payload: {
      visibility,
      isFromSignUpScreen,
    },
  };
};

export const updateActivityRingsData = (day, ringData) => {
  return {
    type: UPDATE_ACTIVITY_RINGS_DATA,
    payload: { day, rings: ringData },
  };
};

export const fetchActivityRingsData = () => {
  return async (dispatch) => {
    try {
      const response = await fetch("your-api-endpoint-here");
      const data = await response.json();


      dispatch(updateActivityRingsData(data));
    } catch (error) {

    }
  };
};
