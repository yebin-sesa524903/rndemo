import {combineReducers} from "redux";
import AirBottleListReducer from "./airBottleListReducer";
import AirBottleDetailReducer from "./airBottleDetailReducer";

export default combineReducers({
    AirBottleListReducer,
    AirBottleDetailReducer,
});
