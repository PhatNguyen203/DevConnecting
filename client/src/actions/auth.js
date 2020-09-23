import axios from "axios";
import { setAlert } from "./alert";
import { REGISTER_SUCCESS, REGISTER_FAIL } from "./constants";

//register new user: return valid token
export const register = ({ name, email, password }) => async (dispatch) => {
  const header = {
    headers: {
      "Content-Type": "application/json",
    },
  };
  const body = JSON.stringify({ name, email, password });
  try {
    const res = await axios.post("/api/users", body, header);
    dispatch({
      type: REGISTER_SUCCESS,
      payload: res.data,
    });
  } catch (error) {
    const errors = error.response.errors;
    if (errors) {
      errors.foreach((err) => setAlert(err.msg, "danger"));
    }
    dispatch({
      type: REGISTER_FAIL,
    });
  }
};
