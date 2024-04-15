import {combineReducers} from "redux";
import spareOutStoreDetailReducer from "./spareOutStoreDetailReducer";
import spareOutStoreListReducer from "./spareOutStoreListReducer";
import spareOutStoreNewReducer from "./spareOutStoreNewReducer";


export default combineReducers({
    spareOutStoreDetailReducer,
    spareOutStoreListReducer,
    spareOutStoreNewReducer
})
