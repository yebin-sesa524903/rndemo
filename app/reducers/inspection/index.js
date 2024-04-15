import {combineReducers} from "redux";
import InspectionListReducer from "./inspectionListReducer";
import InspectionDetailReducer from "./inspectionDetailReducer";

export default combineReducers({
    InspectionListReducer,
    InspectionDetailReducer
});
