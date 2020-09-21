import { combineReducers } from "redux";
import alert from "./alert";

//NOTE: rootreducers combining all reducers created
export default combineReducers({ alert });
