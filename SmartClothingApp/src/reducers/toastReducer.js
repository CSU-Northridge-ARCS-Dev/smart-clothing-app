import { ToastTypes } from "../actions/types";

const initialState = {
  error: false,
  message: "",
  show: false,
};

const toastReducer = (state = initialState, action) => {
  switch (action.type) {
    case ToastTypes.SHOW_TOAST:
      return {
        ...state,
        error: false,
        message: action.payload,
        show: true,
      };
    case ToastTypes.SHOW_ERROR_TOAST:
      return {
        ...state,
        error: true,
        message: action.payload,
        show: true,
      };
    case ToastTypes.DISCARD_TOAST:
      return {
        ...state,
        show: false,
      };
    default:
      return state;
  }
};

export default toastReducer;
