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

const generateRandomValue = () => {
  return Math.random() * 2;
};

export const updateActivityRings = () => {
  return async (dispatch) => {
    const daysOfWeek = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ];

    for (const day of daysOfWeek) {
      const randomData = {
        ring1: generateRandomValue().toFixed(1),
        ring2: generateRandomValue().toFixed(1),
        ring3: generateRandomValue().toFixed(1),
      };

      // Simulate an async operation (e.g., fetching data)
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Dispatch the action to update the activity rings data
      dispatch(updateActivityRingsData(day, randomData));
    }
  };
};
