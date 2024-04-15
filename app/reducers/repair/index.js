import {combineReducers} from "redux";
import RepairDetailReducer from "./repairDetailReducer";
import RepairListReducer from "./repairListReducer";
import RepairAddReducer from "./repairAddReducer";


export default combineReducers({
    RepairDetailReducer,
    RepairListReducer,
    RepairAddReducer
});
