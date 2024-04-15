import { combineReducers } from "redux";
import AbnormalListReducer from "./abnormalListReducer";
import AbnormalDetailReducer from "./abnormalDetailReducer";

export default combineReducers ({
    AbnormalListReducer,
    AbnormalDetailReducer
})