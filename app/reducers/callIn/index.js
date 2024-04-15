import {combineReducers} from "redux";
import CallInListReducer from "./callInListReducer";
import CallInDetailReducer from "./callInDetailReducer";

export default combineReducers({
    CallInListReducer,
    CallInDetailReducer,
});
