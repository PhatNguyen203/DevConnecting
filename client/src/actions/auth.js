import axios from "axios";
import { setAlert } from "./alert";
import {
  REGISTER_SUCCESS,
  REGISTER_FAIL,
  USER_LOADED,
  AUTH_ERROR,
  USER_LOGIN,
  LOGIN_FAIL,
  USER_LOGOUT,
  CLEAR_PROFILE,
} from "./constants";
import setAuthToken from "../util/setAuthToken";

//load user
export const loadUser = () => async (dispatch) => {
  if (localStorage.token) {
    setAuthToken(localStorage.token);
  }
  try {
    const res = await axios.get("/api/auth");
    dispatch({
      type: USER_LOADED,
      payload: res.data,
    });
  } catch (error) {
    dispatch({
      type: AUTH_ERROR,
    });
  }
};

//register new user
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
    dispatch(loadUser());
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

//user login
export const login = (email, password) => async (dispatch) => {
  const header = {
    headers: {
      "Content-Type": "application/json",
    },
  };
  const body = JSON.stringify({ email, password });
  try {
    const res = await axios.post("/api/auth", body, header);

    dispatch({
      type: USER_LOGIN,
      payload: res.data,
    });

    dispatch(loadUser());
  } catch (error) {
    const errors = error.response.errors;
    if (errors) {
      errors.forEach((error) => dispatch(setAlert(error.msg, "danger")));
    }

    dispatch({
      type: LOGIN_FAIL,
    });
  }
};

//user logout
export const logout = () => (dispatch) => {
  dispatch({ type: CLEAR_PROFILE });
  dispatch({ type: USER_LOGOUT });
};
