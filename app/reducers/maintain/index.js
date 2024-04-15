import {combineReducers} from "redux";
import MaintainListReducer from "./maintainListReducer";
import MaintainDetailReducer from "./maintainDetailReducer";


export default combineReducers({
    MaintainListReducer,
    MaintainDetailReducer,
})
