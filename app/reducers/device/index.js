import { combineReducers } from 'redux'
import deviceList from './deviceList';
import deviceDetail from './deviceDetail';
import assetDetail from './assetDetail';

export default combineReducers({
  deviceList, deviceDetail, assetDetail
})
