import { SET_ALERT, REMOVE_ALERT } from "./constants";
import { v4 as uuidv4 } from "uuid";

export const setAlert = (msg, actionType) => (dispatch) => {
  const id = uuidv4();
  dispatch({
    type: SET_ALERT,
    payload: {
      id,
      msg,
      actionType,
    },
  });
};