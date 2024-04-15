
import {combineReducers} from "redux";
import qhReducer from "./qhReducer";
import skReducer from "./skReducer";
import dkReducer from "./dkReducer";
import jxkReducer from "./jxkReducer";
import cwReducer from "./cwReducer";

export default combineReducers({
  qhReducer,
  skReducer,
  dkReducer,
  jxkReducer,
  cwReducer,
})
