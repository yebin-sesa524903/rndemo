import {combineReducers} from "redux";
import spareRepertoryListReducer from "./spareRepertoryListReducer";
import spareRepertoryDetailReducer from "./spareRepertoryDetailReducer";

export default combineReducers({
    spareRepertoryListReducer,
    spareRepertoryDetailReducer,
})
