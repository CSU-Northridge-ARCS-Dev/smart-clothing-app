import { USER_METRICS_DATA_MODAL_VISIBLE } from "./types";

export const userMetricsDataModalVisible = (visibility) => {
  return {
    type: USER_METRICS_DATA_MODAL_VISIBLE,
    payload: visibility,
  };
};