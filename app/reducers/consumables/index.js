import {combineReducers} from "redux";
import ConsumablesDetailReducer from "./consumablesDetailReducer";
import ConsumablesListReducer from "./consumablesListReducer";
import ConsumablesSpareListReducer from "./consumablesSpareListReducer";

export default combineReducers({
    ConsumablesListReducer,
    ConsumablesDetailReducer,
    ConsumablesSpareListReducer
})
