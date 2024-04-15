import { combineReducers } from 'redux'
import AcidBucketListReducer from "./acidBucketListReducer";
import AcidBucketDetailReducer from "./acidBucketDetailReducer";


export default combineReducers({
    AcidBucketListReducer, AcidBucketDetailReducer,
})
