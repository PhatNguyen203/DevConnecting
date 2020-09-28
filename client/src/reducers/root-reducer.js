import { combineReducers } from "redux";
import alert from "./alert";
import auth from "./auth";
import profile from "./profile";

//NOTE: rootreducers combining all reducers created
export default combineReducers({
  alert,
  auth,
  profile,
});
