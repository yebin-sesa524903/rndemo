'use strict';

import assetData from './assetsReducer.js';
import assetTickets from './assetTicketsReducer.js';
import buildHierarchyData from './hierarchyReducer.js';
import hierarchyBindData from './hierarchyBindReducer.js';
import buildingHealthy from './buildingHealthyReducer.js';
import scan from './scanReducer.js';
import roomDetailData from './roomReducer.js';
import panelDetailData from './panelReducer.js';
import deviceDetailData from './deviceReducer.js';
import dashboardDatas from './deviceDashReducer.js';
import deviceRuntimSetting from './deviceRuntimSettingReducer.js';
import deviceRealtime from './deviceRealtimeReducer.js';
import logs from './logsReducer.js';
import assetLog from './logEditReducer.js';
import historyData from './historyReducer.js';
import plans from './plansReducer';
import ocrData from './ocrReducer.js';
import contacts from './contactsReducer';
import { combineReducers } from 'redux';
import circuitDetailData from './circuitReducer';
import buildingData from './buildingReducer';
import switchBoxData from "./switchBoxReducer";
import switchBoxEdit from './switchBoxEditReducer';
import floor from "./floorReducer";
export default combineReducers({
  assetData,buildHierarchyData,hierarchyBindData,buildingData,switchBoxEdit,
  scan,roomDetailData,panelDetailData,circuitDetailData,deviceDetailData,
  deviceRuntimSetting,deviceRealtime,dashboardDatas,logs,assetLog,historyData,
  assetTickets,buildingHealthy,plans,ocrData,contacts,switchBoxData,floor
})
