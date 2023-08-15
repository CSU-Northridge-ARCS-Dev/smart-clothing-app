import { ToastTypes } from "./types";

const toastError = (message) => {
  return {
    type: ToastTypes.SHOW_ERROR_TOAST,
    payload: message,
  };
};
const toastInfo = (message) => {
  return {
    type: ToastTypes.SHOW_TOAST,
    payload: message,
  };
};
const toastDiscard = () => {
  return {
    type: ToastTypes.DISCARD_TOAST,
  };
};

export { toastError, toastInfo, toastDiscard };
