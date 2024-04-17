'use strict';


export const ASSET_ME_LOAD_REQUEST = 'ASSET_ME_LOAD_REQUEST';
export const ASSET_ME_LOAD_SUCCESS = 'ASSET_ME_LOAD_SUCCESS';
export const ASSET_ME_LOAD_FAILURE = 'ASSET_ME_LOAD_FAILURE';

export function loadMyAssets(body) {
  return (dispatch, getState) => {
    return dispatch({
      types: [ASSET_ME_LOAD_REQUEST, ASSET_ME_LOAD_SUCCESS, ASSET_ME_LOAD_FAILURE],
      url: '/popapi/api/building/myBuildings',
      body
    });
  }
}

export const CREATE_BUILDING_REQUEST = 'CREATE_BUILDING_REQUEST';
export const CREATE_BUILDING_SUCCESS = 'CREATE_BUILDING_SUCCESS';
export const CREATE_BUILDING_FAILURE = 'CREATE_BUILDING_FAILURE';

export function createBuilding(body, sid) {
  return (dispatch, getState) => {
    return dispatch({
      types: [CREATE_BUILDING_REQUEST, CREATE_BUILDING_SUCCESS, CREATE_BUILDING_FAILURE],
      url: '/popapi/api/building/create',
      body, sid
    });
  }
}

export const LOAD_BUILDING_REQUEST = 'LOAD_BUILDING_REQUEST';
export const LOAD_BUILDING_SUCCESS = 'LOAD_BUILDING_SUCCESS';
export const LOAD_BUILDING_FAILURE = 'LOAD_BUILDING_FAILURE';

export function loadBuilding(buildingId) {
  return (dispatch, getState) => {
    return dispatch({
      types: [LOAD_BUILDING_REQUEST, LOAD_BUILDING_SUCCESS, LOAD_BUILDING_FAILURE],
      url: `/popapi/api/building/${buildingId}`,
      body: {}
    });
  }
}

export const LOAD_INDUSTRY_REQUEST = 'LOAD_INDUSTRY_REQUEST';
export const LOAD_INDUSTRY_SUCCESS = 'LOAD_INDUSTRY_SUCCESS';
export const LOAD_INDUSTRY_FAILURE = 'LOAD_INDUSTRY_FAILURE';

export function loadIndustry() {
  return (dispatch, getState) => {
    return dispatch({
      types: [LOAD_INDUSTRY_REQUEST, LOAD_INDUSTRY_SUCCESS, LOAD_INDUSTRY_FAILURE],
      url: `/popapi/api/building/industries`,
    });
  }
}

export const DELETE_BUILDING_REQUEST = 'DELETE_BUILDING_REQUEST';
export const DELETE_BUILDING_SUCCESS = 'DELETE_BUILDING_SUCCESS';
export const DELETE_BUILDING_FAILURE = 'DELETE_BUILDING_FAILURE';

export function deleteBuilding(id, index, name) {
  return (dispatch, getState) => {
    return dispatch({
      types: [DELETE_BUILDING_REQUEST, DELETE_BUILDING_SUCCESS, DELETE_BUILDING_FAILURE],
      url: `/popapi/api/building/delete/${id}`,
      body: {},
      index, name
    });
  }
}

export const UPDATE_BUILDING_REQUEST = 'UPDATE_BUILDING_REQUEST';
export const UPDATE_BUILDING_SUCCESS = 'UPDATE_BUILDING_SUCCESS';
export const UPDATE_BUILDING_FAILURE = 'UPDATE_BUILDING_FAILURE';

export function updateBuilding(id, name, address, loc, index) {
  return (dispatch, getState) => {
    return dispatch({
      types: [UPDATE_BUILDING_REQUEST, UPDATE_BUILDING_SUCCESS, UPDATE_BUILDING_FAILURE],
      url: `/popapi/api/building/update`,
      body: {
        "Name": name,
        "Location": address.Province,
        districts: address.Districts,
        "Id": id,
        ...loc
      },
      index
    });
  }
}

export const ASSET_ME_CHANGE_EXPAND = 'ASSET_ME_CHANGE_EXPAND';

export function changeMyAssetExpand(data) {
  return (dispatch, getState) => {
    return dispatch({
      type: ASSET_ME_CHANGE_EXPAND,
      data
    });
  }
}

export const ASSET_FILTER_BY_KEY_WORD = 'ASSET_FILTER_BY_KEY_WORD';

export function filterAssetByKeyWord(data) {
  return (dispatch, getState) => {
    return dispatch({
      type: ASSET_FILTER_BY_KEY_WORD,
      data
    });
  }
}

export const ASSET_CUSTOMER_LOAD_REQUEST = 'ASSET_CUSTOMER_LOAD_REQUEST';
export const ASSET_CUSTOMER_LOAD_SUCCESS = 'ASSET_CUSTOMER_LOAD_SUCCESS';
export const ASSET_CUSTOMER_LOAD_FAILURE = 'ASSET_CUSTOMER_LOAD_FAILURE';

export function loadCustomerAssets(customerId) {
  return (dispatch, getState) => {
    return dispatch({
      types: [ASSET_CUSTOMER_LOAD_REQUEST, ASSET_CUSTOMER_LOAD_SUCCESS, ASSET_CUSTOMER_LOAD_FAILURE],
      url: `/popapi/api/common/buildingtree/${customerId}/false`,
      data: { customerId }
    });
  }
}

export const CUSTOMER_ASSET_RESET = 'CUSTOMER_ASSET_RESET';
export function resetCustomerAssets(data) {
  return (dispatch, getState) => {
    return dispatch({
      type: CUSTOMER_ASSET_RESET,
      data
    });
  }
}

export const BIND_HIERARCHY_FILTER = 'BIND_HIERARCHY_FILTER';
export function filterBindHierarchy(data) {
  return (dispatch, getState) => {
    return dispatch({
      type: BIND_HIERARCHY_FILTER,
      data
    });
  }
}

export const BIND_HIERARCHY_CLEAR = 'BIND_HIERARCHY_CLEAR';
export function clearBindHierarchy(data) {
  return (dispatch, getState) => {
    return dispatch({
      type: BIND_HIERARCHY_CLEAR,
      data
    });
  }
}

export const BINDHIERARCHY_LOAD_REQUEST = 'BINDHIERARCHY_LOAD_REQUEST';
export const BINDHIERARCHY_LOAD_SUCCESS = 'BINDHIERARCHY_LOAD_SUCCESS';
export const BINDHIERARCHY_LOAD_FAILURE = 'BINDHIERARCHY_LOAD_FAILURE';

export function loadBindHierarchyById(buildingId, isFromScan, customerId, customerName) {
  return (dispatch, getState) => {
    return dispatch({
      types: [BINDHIERARCHY_LOAD_REQUEST, BINDHIERARCHY_LOAD_SUCCESS, BINDHIERARCHY_LOAD_FAILURE],
      url: `/popapi/api/building/${buildingId}/tree`,//{buildingId}/mobiletree
      body: { buildingId, isFromScan, customerId, customerName }
    });
  }
}

export const BUILDINGHIERARCHY_LOAD_REQUEST = 'BUILDINGHIERARCHY_LOAD_REQUEST';
export const BUILDINGHIERARCHY_LOAD_SUCCESS = 'BUILDINGHIERARCHY_LOAD_SUCCESS';
export const BUILDINGHIERARCHY_LOAD_FAILURE = 'BUILDINGHIERARCHY_LOAD_FAILURE';

export function loadHierarchyByBuildingId(buildingId, isFromScan, opt) {
  return (dispatch, getState) => {
    return dispatch({
      types: [BUILDINGHIERARCHY_LOAD_REQUEST, BUILDINGHIERARCHY_LOAD_SUCCESS, BUILDINGHIERARCHY_LOAD_FAILURE],
      url: `/popapi/api/building/${buildingId}/tree`,//{buildingId}/mobiletree
      body: { buildingId, isFromScan },
      opt
    });
  }
}

export const CONTACTS_LOAD_REQUEST = 'CONTACTS_LOAD_REQUEST';
export const CONTACTS_LOAD_SUCCESS = 'CONTACTS_LOAD_SUCCESS';
export const CONTACTS_LOAD_FAILURE = 'CONTACTS_LOAD_FAILURE';

export function loadContacts(buildingId) {
  return (dispatch, getState) => {
    return dispatch({
      types: [CONTACTS_LOAD_REQUEST, CONTACTS_LOAD_SUCCESS, CONTACTS_LOAD_FAILURE],
      url: `/popapi/api/common/HierarchyAdministrators/${buildingId}`,//{buildingId}/mobiletree
      hierarchyId: buildingId
    });
  }
}

export const BUILDING_CHANGE_ASSET_EXPAND = 'BUILDING_CHANGE_ASSET_EXPAND';
export function changeAssetExpand(data) {
  return (dispatch, getState) => {
    return dispatch({
      type: BUILDING_CHANGE_ASSET_EXPAND,
      data: data
    });
  }
}

export const BUILDING_ADD_ASSET = 'BUILDING_ADD_ASSET';
export function addAsset(data) {
  return (dispatch, getState) => {
    return dispatch({
      type: BUILDING_ADD_ASSET,
      data: data
    });
  }
}

export const CLEAR_HIERARCHY_CACHE = 'CLEAR_HIERARCHY_CACHE';
export function clearHierarchyCache(isFromScan) {
  return (dispatch, getState) => {
    return dispatch({
      type: CLEAR_HIERARCHY_CACHE,
      data: { isFromScan }
    });
  }
}

export const BUILDING_EXPANDED_CHANGE = 'BUILDING_EXPANDED_CHANGE';
export function changeBuildingHierarchyExpanded(buildingId, isFromScan) {
  return (dispatch, getState) => {
    return dispatch({
      type: BUILDING_EXPANDED_CHANGE,
      data: { buildingId, isFromScan }
    });
  }
}

export const BUILDING_SEARCH_CHANGE = 'BUILDING_SEARCH_CHANGE';
export function changeHierarchySearch(text, isFromScan) {
  return (dispatch, getState) => {
    return dispatch({
      type: BUILDING_SEARCH_CHANGE,
      data: { text, isFromScan }
    });
  }
}

export const ASSET_QR_PANEL_HIERARCHY_REQUEST = 'ASSET_QR_PANEL_HIERARCHY_REQUEST';
export const ASSET_QR_PANEL_HIERARCHY_SUCCESS = 'ASSET_QR_PANEL_HIERARCHY_SUCCESS';
export const ASSET_QR_PANEL_HIERARCHY_FAILURE = 'ASSET_QR_PANEL_HIERARCHY_FAILURE';

export function loadPanelHierarchy(panelId) {
  return (dispatch, getState) => {
    return dispatch({
      types: [ASSET_QR_PANEL_HIERARCHY_REQUEST, ASSET_QR_PANEL_HIERARCHY_SUCCESS, ASSET_QR_PANEL_HIERARCHY_FAILURE],
      url: `/popapi/api/panel/${panelId}`,
      data: { panelId }
    });
  }
}

export const ASSET_QR_ROOM_HIERARCHY_REQUEST = 'ASSET_QR_ROOM_HIERARCHY_REQUEST';
export const ASSET_QR_ROOM_HIERARCHY_SUCCESS = 'ASSET_QR_ROOM_HIERARCHY_SUCCESS';
export const ASSET_QR_ROOM_HIERARCHY_FAILURE = 'ASSET_QR_ROOM_HIERARCHY_FAILURE';

export function loadRoomHierarchy(roomId) {
  return (dispatch, getState) => {
    return dispatch({
      types: [ASSET_QR_ROOM_HIERARCHY_REQUEST, ASSET_QR_ROOM_HIERARCHY_SUCCESS, ASSET_QR_ROOM_HIERARCHY_FAILURE],
      url: `/popapi/api/room/${roomId}`,
      body: { roomId: roomId },
      data: { roomId }
    });
  }
}

export const ASSET_QR_Sp_UPDATE = 'ASSET_QR_Sp_UPDATE';

export function updateSpHttpInfo(data) {
  return (dispatch, getState) => {
    return dispatch({
      type: ASSET_QR_Sp_UPDATE,
      data
    });
  }
}

export const HIERARCHY_BIND_QR_REQUEST = 'HIERARCHY_BIND_QR_REQUEST';
export const HIERARCHY_BIND_QR_SUCCESS = 'HIERARCHY_BIND_QR_SUCCESS';
export const HIERARCHY_BIND_QR_FAILURE = 'HIERARCHY_BIND_QR_FAILURE';

export function bindAssetHierarchy(body) {
  return (dispatch, getState) => {
    return dispatch({
      types: [HIERARCHY_BIND_QR_REQUEST, HIERARCHY_BIND_QR_SUCCESS, HIERARCHY_BIND_QR_FAILURE],
      url: `/popapi/api/common/qrcode/bind`,
      body: body
    });
  }
}

export const ASSET_QR_REQUEST = 'ASSET_QR_REQUEST';
export const ASSET_QR_SUCCESS = 'ASSET_QR_SUCCESS';
export const ASSET_QR_FAILURE = 'ASSET_QR_FAILURE';

export function loadAssetWithQrcode(body, isFromPanelAdd, isBindQRCode) {
  return (dispatch, getState) => {
    return dispatch({
      types: [ASSET_QR_REQUEST, ASSET_QR_SUCCESS, ASSET_QR_FAILURE],
      url: `/popapi/api/common/qrcode/scan`,
      body: body,
      opt: { 'isFromPanelAdd': isFromPanelAdd, 'isBindQRCode': isBindQRCode }
    });
  }
}

export const DEVICE_QR_LOAD_REQUEST = 'DEVICE_QR_LOAD_REQUEST';
export const DEVICE_QR_LOAD_SUCCESS = 'DEVICE_QR_LOAD_SUCCESS';
export const DEVICE_QR_LOAD_FAILURE = 'DEVICE_QR_LOAD_FAILURE';

export function updateScanDeviceData(data) {
  let deviceId = data.DeviceId;
  return (dispatch, getState) => {
    return dispatch({
      types: [DEVICE_QR_LOAD_REQUEST, DEVICE_QR_LOAD_SUCCESS, DEVICE_QR_LOAD_FAILURE],
      url: `/popapi/api/device/${deviceId}`,
      body: { data }
    });
  }
}

export const PANEL_SAVE_ENV_REQUEST = 'PANEL_SAVE_ENV_REQUEST';
export const PANEL_SAVE_ENV_SUCCESS = 'PANEL_SAVE_ENV_SUCCESS';
export const PANEL_SAVE_ENV_FAILURE = 'PANEL_SAVE_ENV_FAILURE';

export function savePanelEnv(body) {
  return (dispatch, getState) => {
    return dispatch({
      types: [PANEL_SAVE_ENV_REQUEST, PANEL_SAVE_ENV_SUCCESS, PANEL_SAVE_ENV_FAILURE],
      url: `/popapi/api/panel/environment/save`,
      body
    });
  }
}
export const ROOM_SAVE_ENV_REQUEST = 'ROOM_SAVE_ENV_REQUEST';
export const ROOM_SAVE_ENV_SUCCESS = 'ROOM_SAVE_ENV_SUCCESS';
export const ROOM_SAVE_ENV_FAILURE = 'ROOM_SAVE_ENV_FAILURE';

export function saveRoomEnv(body) {
  return (dispatch, getState) => {
    return dispatch({
      types: [ROOM_SAVE_ENV_REQUEST, ROOM_SAVE_ENV_SUCCESS, ROOM_SAVE_ENV_FAILURE],
      url: `/popapi/api/room/environment/save`,
      body
    })
  }
}


export const ROOM_LOAD_REQUEST = 'ROOM_LOAD_REQUEST';
export const ROOM_LOAD_SUCCESS = 'ROOM_LOAD_SUCCESS';
export const ROOM_LOAD_FAILURE = 'ROOM_LOAD_FAILURE';

export function loadRoomDetail(roomId) {
  return (dispatch, getState) => {
    return dispatch({
      types: [ROOM_LOAD_REQUEST, ROOM_LOAD_SUCCESS, ROOM_LOAD_FAILURE],
      url: `/popapi/api/room/${roomId}`,
      body: { roomId }
    });
  }
}


export const PANEL_LOAD_REQUEST = 'PANEL_LOAD_REQUEST';
export const PANEL_LOAD_SUCCESS = 'PANEL_LOAD_SUCCESS';
export const PANEL_LOAD_FAILURE = 'PANEL_LOAD_FAILURE';

export function loadPanelDetail(panelId) {
  return (dispatch, getState) => {
    return dispatch({
      types: [PANEL_LOAD_REQUEST, PANEL_LOAD_SUCCESS, PANEL_LOAD_FAILURE],
      url: `/popapi/api/panel/${panelId}`,
      body: { panelId }
    });
  }
}

export const PANEL_GET_SENSORS_TEMP_REQUEST = 'PANEL_GET_SENSORS_TEMP_REQUEST';
export const PANEL_GET_SENSORS_TEMP_SUCCESS = 'PANEL_GET_SENSORS_TEMP_SUCCESS';
export const PANEL_GET_SENSORS_TEMP_FAILURE = 'PANEL_GET_SENSORS_TEMP_FAILURE';

export function getPanelSensorTemp(body) {
  return (dispatch, getState) => {
    return dispatch({
      types: [PANEL_GET_SENSORS_TEMP_REQUEST, PANEL_GET_SENSORS_TEMP_SUCCESS, PANEL_GET_SENSORS_TEMP_FAILURE],
      url: `/popapi/api/data/realtime/get/v2`,
      body
    });
  }
}

export const PANEL_GET_SENSORS_HISTORY_REQUEST = 'PANEL_GET_SENSORS_HISTORY_REQUEST';
export const PANEL_GET_SENSORS_HISTORY_SUCCESS = 'PANEL_GET_SENSORS_HISTORY_SUCCESS';
export const PANEL_GET_SENSORS_HISTORY_FAILURE = 'PANEL_GET_SENSORS_HISTORY_FAILURE';

export function getPanelSensorHistory(body) {
  return (dispatch, getState) => {
    return dispatch({
      types: [PANEL_GET_SENSORS_HISTORY_REQUEST, PANEL_GET_SENSORS_HISTORY_SUCCESS, PANEL_GET_SENSORS_HISTORY_FAILURE],
      url: `/popapi/api/data/historical`,
      body
    });
  }
}

export const SWITCH_BOX_LOAD_REQUEST = 'SWITCH_BOX_LOAD_REQUEST';
export const SWITCH_BOX_LOAD_SUCCESS = 'SWITCH_BOX_LOAD_SUCCESS';
export const SWITCH_BOX_LOAD_FAILURE = 'SWITCH_BOX_LOAD_FAILURE';

export function loadSwitchBoxDetail(panelId) {
  return (dispatch, getState) => {
    return dispatch({
      types: [SWITCH_BOX_LOAD_REQUEST, SWITCH_BOX_LOAD_SUCCESS, SWITCH_BOX_LOAD_FAILURE],
      url: `/popapi/api/panel/${panelId}`,
      body: { panelId }
    });
  }
}

export const BUILDING_INFO_LOAD_REQUEST = 'BUILDING_INFO_LOAD_REQUEST';
export const BUILDING_INFO_LOAD_SUCCESS = 'BUILDING_INFO_LOAD_SUCCESS';
export const BUILDING_INFO_LOAD_FAILURE = 'BUILDING_INFO_LOAD_FAILURE';

export function getBuildingInfo(panelId) {
  return (dispatch, getState) => {
    return dispatch({
      types: [BUILDING_INFO_LOAD_REQUEST, BUILDING_INFO_LOAD_SUCCESS, BUILDING_INFO_LOAD_FAILURE],
      url: `/popapi/api/panel/${panelId}/belongingbuilding`,
      body: { panelId }
    });
  }
}

export const CIRCUIT_LOAD_REQUEST = 'CIRCUIT_LOAD_REQUEST';
export const CIRCUIT_LOAD_SUCCESS = 'CIRCUIT_LOAD_SUCCESS';
export const CIRCUIT_LOAD_FAILURE = 'CIRCUIT_LOAD_FAILURE';

export function loadCircuitDetail(circuitId) {
  return (dispatch, getState) => {
    return dispatch({
      types: [CIRCUIT_LOAD_REQUEST, CIRCUIT_LOAD_SUCCESS, CIRCUIT_LOAD_FAILURE],
      // type:CIRCUIT_LOAD_SUCCESS,
      url: `/popapi/api/Circuit/${circuitId}`,
      // response:{},
      data: { circuitId }
    });
  }
}

export const CIRCUIT_LOAD_ALL_PARAMETERS_REQUEST = 'CIRCUIT_LOAD_ALL_PARAMETERS_REQUEST';
export const CIRCUIT_LOAD_ALL_PARAMETERS_SUCCESS = 'CIRCUIT_LOAD_ALL_PARAMETERS_SUCCESS';
export const CIRCUIT_LOAD_ALL_PARAMETERS_FAILURE = 'CIRCUIT_LOAD_ALL_PARAMETERS_FAILURE';

export function loadCircuitAllParameters(circuitId) {
  return (dispatch, getState) => {
    return dispatch({
      types: [CIRCUIT_LOAD_ALL_PARAMETERS_REQUEST, CIRCUIT_LOAD_ALL_PARAMETERS_SUCCESS, CIRCUIT_LOAD_ALL_PARAMETERS_FAILURE],
      // type:CIRCUIT_LOAD_SUCCESS,
      url: `/popapi/api/circuit/${circuitId}/allGroupParameters`,//`circuit/${circuitId}/allparameters`,
      // response:{},
      //data:{circuitId}
    });
  }
}

export const CIRCUIT_PARAM_EXPAND = 'CIRCUIT_PARAM_EXPAND';
export function expandCircuitParam(index) {
  return (dispatch, getState) => {
    return dispatch({
      type: CIRCUIT_PARAM_EXPAND,
      index
    })
  }
}

export const CIRCUIT_LOAD_RISK_HISTORY_DATA_REQUEST = 'CIRCUIT_LOAD_RISK_HISTORY_DATA_REQUEST';
export const CIRCUIT_LOAD_RISK_HISTORY_DATA_SUCCESS = 'CIRCUIT_LOAD_RISK_HISTORY_DATA_SUCCESS';
export const CIRCUIT_LOAD_RISK_HISTORY_DATA_FAILURE = 'CIRCUIT_LOAD_RISK_HISTORY_DATA_FAILURE';

export function loadCircuitRiskHistoryData(body) {
  return (dispatch, getState) => {
    return dispatch({
      types: [CIRCUIT_LOAD_RISK_HISTORY_DATA_REQUEST, CIRCUIT_LOAD_RISK_HISTORY_DATA_SUCCESS, CIRCUIT_LOAD_RISK_HISTORY_DATA_FAILURE],
      url: `/popapi/api/diagnose/buildinghealth/historicalData`,
      body
    });
  }
}

export const CIRCUIT_LOAD_SENSOR_DATA_REQUEST = 'CIRCUIT_LOAD_SENSOR_DATA_REQUEST';
export const CIRCUIT_LOAD_SENSOR_DATA_SUCCESS = 'CIRCUIT_LOAD_SENSOR_DATA_SUCCESS';
export const CIRCUIT_LOAD_SENSOR_DATA_FAILURE = 'CIRCUIT_LOAD_SENSOR_DATA_FAILURE';

export function loadCircuitSensorData(body) {
  return (dispatch, getState) => {
    return dispatch({
      types: [CIRCUIT_LOAD_SENSOR_DATA_REQUEST, CIRCUIT_LOAD_SENSOR_DATA_SUCCESS, CIRCUIT_LOAD_SENSOR_DATA_FAILURE],
      url: `/popapi/api/Circuit/thermalsensordata`,
      body
    });
  }
}

export const CIRCUIT_LOAD_MONITOR_DATA_REQUEST = 'CIRCUIT_LOAD_MONITOR_DATA_REQUEST';
export const CIRCUIT_LOAD_MONITOR_DATA_SUCCESS = 'CIRCUIT_LOAD_MONITOR_DATA_SUCCESS';
export const CIRCUIT_LOAD_MONITOR_DATA_FAILURE = 'CIRCUIT_LOAD_MONITOR_DATA_FAILURE';

export function loadCircuitMonitorData(body) {
  return (dispatch, getState) => {
    return dispatch({
      types: [CIRCUIT_LOAD_MONITOR_DATA_REQUEST, CIRCUIT_LOAD_MONITOR_DATA_SUCCESS, CIRCUIT_LOAD_MONITOR_DATA_FAILURE],
      url: `/popapi/api/Circuit/monitorparameterdata`,
      body
    });
  }
}

export const CIRCUIT_LOAD_REDDOT_DATA_REQUEST = 'CIRCUIT_LOAD_REDDOT_DATA_REQUEST';
export const CIRCUIT_LOAD_REDDOT_DATA_SUCCESS = 'CIRCUIT_LOAD_REDDOT_DATA_SUCCESS';
export const CIRCUIT_LOAD_REDDOT_DATA_FAILURE = 'CIRCUIT_LOAD_REDDOT_DATA_FAILURE';

export function loadCircuitRedDotData(id) {
  return (dispatch, getState) => {
    return dispatch({
      types: [CIRCUIT_LOAD_REDDOT_DATA_REQUEST, CIRCUIT_LOAD_REDDOT_DATA_SUCCESS, CIRCUIT_LOAD_REDDOT_DATA_FAILURE],
      url: `/popapi/api/circuit/${id}/alarms`,
    });
  }
}

export const CIRCUIT_LOAD_RUNTIME_SETTING_DATA_REQUEST = 'CIRCUIT_LOAD_RUNTIME_SETTING_DATA_REQUEST';
export const CIRCUIT_LOAD_RUNTIME_SETTING_DATA_SUCCESS = 'CIRCUIT_LOAD_RUNTIME_SETTING_DATA_SUCCESS';
export const CIRCUIT_LOAD_RUNTIME_SETTING_DATA_FAILURE = 'CIRCUIT_LOAD_RUNTIME_SETTING_DATA_FAILURE';

export function loadCircuitRuntimeSettingData(body) {
  return (dispatch, getState) => {
    return dispatch({
      types: [CIRCUIT_LOAD_RUNTIME_SETTING_DATA_REQUEST, CIRCUIT_LOAD_RUNTIME_SETTING_DATA_SUCCESS, CIRCUIT_LOAD_RUNTIME_SETTING_DATA_FAILURE],
      url: `/popapi/api/Circuit/runtimesettingparameterdata`,
      body
    });
  }
}

export const CIRCUIT_CHANGE_RISK_DATE = 'CIRCUIT_CHANGE_RISK_DATE';
export function changeCircuitRiskDate(date) {
  return (dispatch, getState) => {
    return dispatch({
      type: CIRCUIT_CHANGE_RISK_DATE,
      date
    })
  }
}

export const CIRCUIT_RESET = 'CIRCUIT_RESET';
export function resetCircuit() {
  return (dispatch, getState) => {
    return dispatch({
      type: CIRCUIT_RESET
    })
  }
}

export const DEVICE_EXIT = 'DEVICE_EXIT';

export function exitDeviceInfo(data) {
  return (dispatch, getState) => {
    return dispatch({
      type: DEVICE_EXIT,
    });
  }
}

export const DEVICE_LOAD_REQUEST = 'DEVICE_LOAD_REQUEST';
export const DEVICE_LOAD_SUCCESS = 'DEVICE_LOAD_SUCCESS';
export const DEVICE_LOAD_FAILURE = 'DEVICE_LOAD_FAILURE';

export function loadDeviceDetail(deviceId) {
  return (dispatch, getState) => {
    return dispatch({
      types: [DEVICE_LOAD_REQUEST, DEVICE_LOAD_SUCCESS, DEVICE_LOAD_FAILURE],
      url: `/popapi/api/device/${deviceId}`,
      body: { deviceId }
    });
  }
}

export const SCAN_EXIT = 'SCAN_EXIT';

export function exitScan(data) {
  return (dispatch, getState) => {
    return dispatch({
      type: SCAN_EXIT,
    });
  }
}

export const SCAN_RESET_ERROR = 'SCAN_RESET_ERROR';

export function resetScanError(data) {
  return (dispatch, getState) => {
    return dispatch({
      type: SCAN_RESET_ERROR,
    });
  }
}

export const MAINTEN_SELECT_CHANGED = 'MAINTEN_SELECT_CHANGED';

export function updateMaintenExpandInfo(data) {
  return (dispatch, getState) => {
    return dispatch({
      type: MAINTEN_SELECT_CHANGED,
      data
    });
  }
}

export const DEVICE_SETTING_REQUEST = 'DEVICE_SETTING_REQUEST';
export const DEVICE_SETTING_SUCCESS = 'DEVICE_SETTING_SUCCESS';
export const DEVICE_SETTING_FAILURE = 'DEVICE_SETTING_FAILURE';

export function loadDeviceRuntimeSetting(deviceId, datas, isCombox510Device) {
  return (dispatch, getState) => {
    return dispatch({
      types: [DEVICE_SETTING_REQUEST, DEVICE_SETTING_SUCCESS, DEVICE_SETTING_FAILURE],
      url: `/popapi/api/device/${deviceId}/runtimesettinggroupparameters`,
      data: { deviceId, datas, isCombox510Device }
    });
  }
}

export const DEVICE_DASHBOARD_REQUEST = 'DEVICE_DASHBOARD_REQUEST';
export const DEVICE_DASHBOARD_SUCCESS = 'DEVICE_DASHBOARD_SUCCESS';
export const DEVICE_DASHBOARD_FAILURE = 'DEVICE_DASHBOARD_FAILURE';

export function loadDashboardData(data) {
  return (dispatch, getState) => {
    return dispatch({
      types: [DEVICE_DASHBOARD_REQUEST, DEVICE_DASHBOARD_SUCCESS, DEVICE_DASHBOARD_FAILURE],
      url: `/popapi/api/data/parameter/calculate`,
      body: data
    });
  }
}

export const DASHBOARD_CONDITION_CHANGED = 'DASHBOARD_CONDITION_CHANGED';
export function dashsSearchCondiChange(data) {
  return (dispatch, getState) => {
    return dispatch({
      type: DASHBOARD_CONDITION_CHANGED,
      data
    });
  }
}

export const DEVICE_REALTIME_REQUEST = 'DEVICE_REALTIME_REQUEST';
export const DEVICE_REALTIME_SUCCESS = 'DEVICE_REALTIME_SUCCESS';
export const DEVICE_REALTIME_FAILURE = 'DEVICE_REALTIME_FAILURE';

export function loadDeviceRealtimeData(body) {
  return (dispatch, getState) => {
    return dispatch({
      types: [DEVICE_REALTIME_REQUEST, DEVICE_REALTIME_SUCCESS, DEVICE_REALTIME_FAILURE],
      url: `/popapi/api/data/realtime/get/v2`,
      body
    });
  }
}

export const DEVICE_SAVE_ENV_REQUEST = 'DEVICE_SAVE_ENV_REQUEST';
export const DEVICE_SAVE_ENV_SUCCESS = 'DEVICE_SAVE_ENV_SUCCESS';
export const DEVICE_SAVE_ENV_FAILURE = 'DEVICE_SAVE_ENV_FAILURE';

export function saveDeviceEnv(body) {
  return (dispatch, getState) => {
    return dispatch({
      types: [DEVICE_SAVE_ENV_REQUEST, DEVICE_SAVE_ENV_SUCCESS, DEVICE_SAVE_ENV_FAILURE],
      url: `/popapi/api/device/environment/save`,
      body
    })
  }
}

export const ASSET_TENDING_REQUEST = 'ASSET_TENDING_REQUEST';
export const ASSET_TENDING_SUCCESS = 'ASSET_TENDING_SUCCESS';
export const ASSET_TENDING_FAILURE = 'ASSET_TENDING_FAILURE';

export function loadTendingHistory(hierarchyId) {
  return (dispatch, getState) => {
    return dispatch({
      types: [ASSET_TENDING_REQUEST, ASSET_TENDING_SUCCESS, ASSET_TENDING_FAILURE],
      url: `/popapi/api/tickets/hierarchytickets/${hierarchyId}`,
      hierarchyId
    });

  }
}

export const ASSET_TICKETING_REQUEST = 'ASSET_TICKETING_REQUEST';
export const ASSET_TICKETING_SUCCESS = 'ASSET_TICKETING_SUCCESS';
export const ASSET_TICKETING_FAILURE = 'ASSET_TICKETING_FAILURE';

export function loadTicketingList(body) {
  return (dispatch, getState) => {
    return dispatch({
      types: [ASSET_TICKETING_REQUEST, ASSET_TICKETING_SUCCESS, ASSET_TICKETING_FAILURE],
      url: `/popapi/api/tickets/searchall`,
      body
    });

  }
}

export const PLANNING_REQUEST = 'PLANNING_REQUEST';
export const PLANNING_SUCCESS = 'PLANNING_SUCCESS';
export const PLANNING_FAILURE = 'PLANNING_FAILURE';

export function loadPlannings(body) {
  return (dispatch, getState) => {
    return dispatch({
      types: [PLANNING_REQUEST, PLANNING_SUCCESS, PLANNING_FAILURE],
      url: `/popapi/api/maintainplan/search`,
      body
    });

  }
}

export const PLANNING_DETAIL_REQUEST = 'PLANNING_DETAIL_REQUEST';
export const PLANNING_DETAIL_SUCCESS = 'PLANNING_DETAIL_SUCCESS';
export const PLANNING_DETAIL_FAILURE = 'PLANNING_DETAIL_FAILURE';

export function loadPlanningDetail(id) {
  return (dispatch, getState) => {
    return dispatch({
      types: [PLANNING_DETAIL_REQUEST, PLANNING_DETAIL_SUCCESS, PLANNING_DETAIL_FAILURE],
      url: `/popapi/api/maintainplan/${id}`
    });

  }
}

export const BUILDING_HEALTHY_REQUEST = 'BUILDING_HEALTHY_REQUEST';
export const BUILDING_HEALTHY_SUCCESS = 'BUILDING_HEALTHY_SUCCESS';
export const BUILDING_HEALTHY_FAILURE = 'BUILDING_HEALTHY_FAILURE';

export function loadBuildingHealthy(hierarchyId) {
  return (dispatch, getState) => {
    return dispatch({
      types: [BUILDING_HEALTHY_REQUEST, BUILDING_HEALTHY_SUCCESS, BUILDING_HEALTHY_FAILURE],
      url: `/popapi/api/building/health/${hierarchyId}`,
      hierarchyId
    });

  }
}

export const BUILDING_TRANSFORMER_REQUEST = 'BUILDING_TRANSFORMER_REQUEST';
export const BUILDING_TRANSFORMER_SUCCESS = 'BUILDING_TRANSFORMER_SUCCESS';
export const BUILDING_TRANSFORMER_FAILURE = 'BUILDING_TRANSFORMER_FAILURE';

export function loadBuildingTransformer(hierarchyId) {
  return (dispatch, getState) => {
    return dispatch({
      types: [BUILDING_TRANSFORMER_REQUEST, BUILDING_TRANSFORMER_SUCCESS, BUILDING_TRANSFORMER_FAILURE],
      url: `/popapi/api/building/transformer/${hierarchyId}`,
      hierarchyId
    });

  }
}

export const RESET_HEALTHY_DATA = 'RESET_HEALTHY_DATA';

export function resetHealthyData() {
  return (dispatch, getState) => {
    return dispatch({
      type: RESET_HEALTHY_DATA,
    });
  }
}

export const ASSET_LOGS_REQUEST = 'ASSET_LOGS_REQUEST';
export const ASSET_LOGS_SUCCESS = 'ASSET_LOGS_SUCCESS';
export const ASSET_LOGS_FAILURE = 'ASSET_LOGS_FAILURE';

export function loadAssetLogs(hierarchyId) {
  return (dispatch, getState) => {
    return dispatch({
      types: [ASSET_LOGS_REQUEST, ASSET_LOGS_SUCCESS, ASSET_LOGS_FAILURE],
      url: `/popapi/api/hierarchy/${hierarchyId}/scenelogs`,
      hierarchyId
    });

  }
}

export const ASSET_LOG_SAVE_REQUEST = 'ASSET_LOG_SAVE_REQUEST';
export const ASSET_LOG_SAVE_SUCCESS = 'ASSET_LOG_SAVE_SUCCESS';
export const ASSET_LOG_SAVE_FAILURE = 'ASSET_LOG_SAVE_FAILURE';

export function saveLog(body, isCreate) {
  return (dispatch, getState) => {
    return dispatch({
      types: [ASSET_LOG_SAVE_REQUEST, ASSET_LOG_SAVE_SUCCESS, ASSET_LOG_SAVE_FAILURE],
      url: isCreate ? '/popapi/api/scenelogs/create' : '/popapi/api/scenelogs/update',
      body
    });

  }
}

export const ASSET_LOG_DELETE_REQUEST = 'ASSET_LOG_DELETE_REQUEST';
export const ASSET_LOG_DELETE_SUCCESS = 'ASSET_LOG_DELETE_SUCCESS';
export const ASSET_LOG_DELETE_FAILURE = 'ASSET_LOG_DELETE_FAILURE';

export function deleteLog(logId) {
  return (dispatch, getState) => {
    return dispatch({
      types: [ASSET_LOG_DELETE_REQUEST, ASSET_LOG_DELETE_SUCCESS, ASSET_LOG_DELETE_FAILURE],
      url: `/popapi/api/scenelogs/delete/${logId}`,
      body: { logId }
    });

  }
}

export const ASSET_LOGINFO_CHANGED = 'ASSET_LOGINFO_CHANGED';

export function logInfoChanged(data) {
  return (dispatch, getState) => {
    return dispatch({
      type: ASSET_LOGINFO_CHANGED,
      data
    });
  }
}

export const SWITCH_BOX_INFO_CHANGED = 'SWITCH_BOX_INFO_CHANGED';
export function switchBoxInfoChanged(data) {
  return (dispatch, getState) => {
    return dispatch({
      type: SWITCH_BOX_INFO_CHANGED,
      data
    });
  }
}

export const ASSET_LOG_CLEAN = 'ASSET_LOG_CLEAN';

export function cleanAssetLog() {
  return (dispatch, getState) => {
    return dispatch({
      type: ASSET_LOG_CLEAN,
    });
  }
}


export const ASSET_IMAGE_CHANGED = 'ASSET_IMAGE_CHANGED';

export function changeImage(hierarchyType, data) {
  return (dispatch, getState) => {
    return dispatch({
      type: ASSET_IMAGE_CHANGED,
      data,
      hierarchyType
    });
  }
}

export const ASSET_IMAGE_CHANGED_COMPLETE = 'ASSET_IMAGE_CHANGED_COMPLETE';


export function changeImageComplete(data) {
  return (dispatch, getState) => {
    return dispatch({
      type: ASSET_IMAGE_CHANGED_COMPLETE,
      data,
    });
  }
}

export const LOGBOOK_ADD_CIRCLE_REQUEST = 'LOGBOOK_ADD_CIRCLE_REQUEST';
export const LOGBOOK_ADD_CIRCLE_SUCCESS = 'LOGBOOK_ADD_CIRCLE_SUCCESS';
export const LOGBOOK_ADD_CIRCLE_FAILURE = 'LOGBOOK_ADD_CIRCLE_FAILURE';

export function addLogbookCircle(body) {
  return (dispatch, getState) => {
    return dispatch({
      types: [LOGBOOK_ADD_CIRCLE_REQUEST, LOGBOOK_ADD_CIRCLE_SUCCESS, LOGBOOK_ADD_CIRCLE_FAILURE],
      url: `/popapi/api/Circuit/create`,
      body: body
    });
  }
}

export const LOGBOOK_UPDATE_CIRCLE_REQUEST = 'LOGBOOK_UPDATE_CIRCLE_REQUEST';
export const LOGBOOK_UPDATE_CIRCLE_SUCCESS = 'LOGBOOK_UPDATE_CIRCLE_SUCCESS';
export const LOGBOOK_UPDATE_CIRCLE_FAILURE = 'LOGBOOK_UPDATE_CIRCLE_FAILURE';

export function updateLogbookCircle(body) {
  return (dispatch, getState) => {
    return dispatch({
      types: [LOGBOOK_UPDATE_CIRCLE_REQUEST, LOGBOOK_UPDATE_CIRCLE_SUCCESS, LOGBOOK_UPDATE_CIRCLE_FAILURE],
      url: `/popapi/api/Circuit/update`,
      body: body
    });
  }
}

export const LOGBOOK_DELETE_CIRCLE_REQUEST = 'LOGBOOK_DELETE_CIRCLE_REQUEST';
export const LOGBOOK_DELETE_CIRCLE_SUCCESS = 'LOGBOOK_DELETE_CIRCLE_SUCCESS';
export const LOGBOOK_DELETE_CIRCLE_FAILURE = 'LOGBOOK_DELETE_CIRCLE_FAILURE';

export function deleteLogbookCircle(id) {
  return (dispatch, getState) => {
    return dispatch({
      types: [LOGBOOK_DELETE_CIRCLE_REQUEST, LOGBOOK_DELETE_CIRCLE_SUCCESS, LOGBOOK_DELETE_CIRCLE_FAILURE],
      url: `/popapi/api/Circuit/delete/${id}`,
      body: { id }
    });
  }
}

export const LOGBOOK_ADD_ROOM_REQUEST = 'LOGBOOK_ADD_ROOM_REQUEST';
export const LOGBOOK_ADD_ROOM_SUCCESS = 'LOGBOOK_ADD_ROOM_SUCCESS';
export const LOGBOOK_ADD_ROOM_FAILURE = 'LOGBOOK_ADD_ROOM_FAILURE';

export function addLogbookRoom(body) {
  return (dispatch, getState) => {
    return dispatch({
      types: [LOGBOOK_ADD_ROOM_REQUEST, LOGBOOK_ADD_ROOM_SUCCESS, LOGBOOK_ADD_ROOM_FAILURE],
      url: `/popapi/api/room/Create`,
      body
    });

  }
}

export const ADD_FLOOR_REQUEST = 'LOAD_FLOOR_REQUEST';
export const ADD_FLOOR_SUCCESS = 'ADD_FLOOR_SUCCESS';
export const ADD_FLOOR_FAILURE = 'ADD_FLOOR_FAILURE';
export function addFloor(body) {
  return (dispatch, getState) => {
    return dispatch({
      types: [ADD_FLOOR_REQUEST, ADD_FLOOR_SUCCESS, ADD_FLOOR_FAILURE],
      url: '/popapi/api/Room/createFloor',
      body
    })
  }
}

export const LOAD_FLOOR_REQUEST = 'ADD_FLOOR_REQUEST';
export const LOAD_FLOOR_SUCCESS = 'LOAD_FLOOR_SUCCESS';
export const LOAD_FLOOR_FAILURE = 'LOAD_FLOOR_FAILURE';
export function loadFloor(roomId) {
  return (dispatch, getState) => {
    return dispatch({
      types: [LOAD_FLOOR_REQUEST, LOAD_FLOOR_SUCCESS, LOAD_FLOOR_FAILURE],
      url: `/popapi/api/room/${roomId}`,
      body: { roomId }
    })
  }
}

export const LOGBOOK_DEL_ROOM_REQUEST = 'LOGBOOK_DEL_ROOM_REQUEST';
export const LOGBOOK_DEL_ROOM_SUCCESS = 'LOGBOOK_DEL_ROOM_SUCCESS';
export const LOGBOOK_DEL_ROOM_FAILURE = 'LOGBOOK_DEL_ROOM_FAILURE';

export function delLogbookRoom(id) {
  return (dispatch, getState) => {
    return dispatch({
      types: [LOGBOOK_DEL_ROOM_REQUEST, LOGBOOK_DEL_ROOM_SUCCESS, LOGBOOK_DEL_ROOM_FAILURE],
      url: `/popapi/api/room/delete/${id}`,
      body: { id },
    });

  }
}

export const LOGBOOK_UPDATE_ROOM_REQUEST = 'LOGBOOK_UPDATE_ROOM_REQUEST';
export const LOGBOOK_UPDATE_ROOM_SUCCESS = 'LOGBOOK_UPDATE_ROOM_SUCCESS';
export const LOGBOOK_UPDATE_ROOM_FAILURE = 'LOGBOOK_UPDATE_ROOM_FAILURE';

export function updateLogbookRoom(id, name) {
  return (dispatch, getState) => {
    return dispatch({
      types: [LOGBOOK_UPDATE_ROOM_REQUEST, LOGBOOK_UPDATE_ROOM_SUCCESS, LOGBOOK_UPDATE_ROOM_FAILURE],
      url: `/popapi/api/room/update`,
      body: { Id: id, Name: name },
    });

  }
}

export const LOGBOOK_ADD_PANEL_REQUEST = 'LOGBOOK_ADD_PANEL_REQUEST';
export const LOGBOOK_ADD_PANEL_SUCCESS = 'LOGBOOK_ADD_PANEL_SUCCESS';
export const LOGBOOK_ADD_PANEL_FAILURE = 'LOGBOOK_ADD_PANEL_FAILURE';

export function addLogbookPanel(body) {
  return (dispatch, getState) => {
    return dispatch({
      types: [LOGBOOK_ADD_PANEL_REQUEST, LOGBOOK_ADD_PANEL_SUCCESS, LOGBOOK_ADD_PANEL_FAILURE],
      url: `/popapi/api/panel/manaualcreate`,
      body
    });

  }
}

export const LOAD_DEVICE_MODELS_REQUEST = 'LOAD_DEVICE_MODELS_REQUEST';
export const LOAD_DEVICE_MODELS_SUCCESS = 'LOAD_DEVICE_MODELS_SUCCESS';
export const LOAD_DEVICE_MODELS_FAILURE = 'LOAD_DEVICE_MODELS_FAILURE';

export function getDeviceModels() {
  return (dispatch, getState) => {
    return dispatch({
      types: [LOAD_DEVICE_MODELS_REQUEST, LOAD_DEVICE_MODELS_SUCCESS, LOAD_DEVICE_MODELS_FAILURE],
      url: `/popapi/api/Device/getforcreate`,
    });
  }
}

export const LOGBOOK_ADD_SWITCH_BOX_REQUEST = 'LOGBOOK_ADD_SWITCH_BOX_REQUEST';
export const LOGBOOK_ADD_SWITCH_BOX_SUCCESS = 'LOGBOOK_ADD_SWITCH_BOX_SUCCESS';
export const LOGBOOK_ADD_SWITCH_BOX_FAILURE = 'LOGBOOK_ADD_SWITCH_BOX_FAILURE';

export function addLogbookSwitchBox(body) {
  return (dispatch, getState) => {
    return dispatch({
      types: [LOGBOOK_ADD_SWITCH_BOX_REQUEST, LOGBOOK_ADD_SWITCH_BOX_SUCCESS, LOGBOOK_ADD_SWITCH_BOX_FAILURE],
      url: `/popapi/api/Panel/createDistributionBox`,
      body
    });

  }
}

export const LOGBOOK_UPDATE_SWITCH_BOX_REQUEST = 'LOGBOOK_UPDATE_SWITCH_BOX_REQUEST';
export const LOGBOOK_UPDATE_SWITCH_BOX_SUCCESS = 'LOGBOOK_UPDATE_SWITCH_BOX_SUCCESS';
export const LOGBOOK_UPDATE_SWITCH_BOX_FAILURE = 'LOGBOOK_UPDATE_SWITCH_BOX_FAILURE';

export function updateLogbookSwitchBox(body) {
  return (dispatch, getState) => {
    return dispatch({
      types: [LOGBOOK_UPDATE_SWITCH_BOX_REQUEST, LOGBOOK_UPDATE_SWITCH_BOX_SUCCESS, LOGBOOK_UPDATE_SWITCH_BOX_FAILURE],
      url: `/popapi/api/Panel/update`,
      body
    });

  }
}

export const LOGBOOK_DEL_PANEL_REQUEST = 'LOGBOOK_DEL_PANEL_REQUEST';
export const LOGBOOK_DEL_PANEL_SUCCESS = 'LOGBOOK_DEL_PANEL_SUCCESS';
export const LOGBOOK_DEL_PANEL_FAILURE = 'LOGBOOK_DEL_PANEL_FAILURE';

export function delLogbookPanel(id) {
  return (dispatch, getState) => {
    return dispatch({
      types: [LOGBOOK_DEL_PANEL_REQUEST, LOGBOOK_DEL_PANEL_SUCCESS, LOGBOOK_DEL_PANEL_FAILURE],
      url: `/popapi/api/panel/delete/${id}`,
      body: { id },
    });

  }
}

export const LOGBOOK_UPDATE_PANEL_REQUEST = 'LOGBOOK_UPDATE_PANEL_REQUEST';
export const LOGBOOK_UPDATE_PANEL_SUCCESS = 'LOGBOOK_UPDATE_PANEL_SUCCESS';
export const LOGBOOK_UPDATE_PANEL_FAILURE = 'LOGBOOK_UPDATE_PANEL_FAILURE';

export function updateLogbookPanel(id, body, panelType) {
  return (dispatch, getState) => {
    return dispatch({
      types: [LOGBOOK_UPDATE_PANEL_REQUEST, LOGBOOK_UPDATE_PANEL_SUCCESS, LOGBOOK_UPDATE_PANEL_FAILURE],
      url: `/popapi/api/panel/manaualupdate`,
      // body:{Id:id,Name:name,PanelType:panelType},
      body
    });

  }
}

export const LOGBOOK_ADD_DEVICE_REQUEST = 'LOGBOOK_ADD_DEVICE_REQUEST';
export const LOGBOOK_ADD_DEVICE_SUCCESS = 'LOGBOOK_ADD_DEVICE_SUCCESS';
export const LOGBOOK_ADD_DEVICE_FAILURE = 'LOGBOOK_ADD_DEVICE_FAILURE';

export function addLogbookDevice(body) {
  return (dispatch, getState) => {
    return dispatch({
      types: [LOGBOOK_ADD_DEVICE_REQUEST, LOGBOOK_ADD_DEVICE_SUCCESS, LOGBOOK_ADD_DEVICE_FAILURE],
      url: `/popapi/api/device/Create`,
      body
    });
  }
}

export const MANUAL_ADD_DEVICE_REQUEST = 'MANUAL_ADD_DEVICE_REQUEST';
export const MANUAL_ADD_DEVICE_SUCCESS = 'MANUAL_ADD_DEVICE_SUCCESS';
export const MANUAL_ADD_DEVICE_FAILURE = 'MANUAL_ADD_DEVICE_FAILURE';

export function manualAddDevice(body) {
  return (dispatch, getState) => {
    return dispatch({
      types: [MANUAL_ADD_DEVICE_REQUEST, MANUAL_ADD_DEVICE_SUCCESS, MANUAL_ADD_DEVICE_FAILURE],
      url: `/popapi/api/device/manaualcreate`,
      body
    });
  }
}

export const MANUAL_UPDATE_DEVICE_REQUEST = 'MANUAL_UPDATE_DEVICE_REQUEST';
export const MANUAL_UPDATE_DEVICE_SUCCESS = 'MANUAL_UPDATE_DEVICE_SUCCESS';
export const MANUAL_UPDATE_DEVICE_FAILURE = 'MANUAL_UPDATE_DEVICE_FAILURE';

export function manualUpdateDevice(body) {
  return (dispatch, getState) => {
    return dispatch({
      types: [MANUAL_UPDATE_DEVICE_REQUEST, MANUAL_UPDATE_DEVICE_SUCCESS, MANUAL_UPDATE_DEVICE_FAILURE],
      url: `/popapi/api/device/manaualupdate`,
      body
    });
  }
}

export const SCAN_ENTRY_DATA_CHANGED = 'SCAN_ENTRY_DATA_CHANGED';

export function updateEntry(data) {
  return (dispatch, getState) => {
    return dispatch({
      type: SCAN_ENTRY_DATA_CHANGED,
      data: data
    });
  }
}

export const LOGBOOK_UPDATE_DEVICE_REQUEST = 'LOGBOOK_UPDATE_DEVICE_REQUEST';
export const LOGBOOK_UPDATE_DEVICE_SUCCESS = 'LOGBOOK_UPDATE_DEVICE_SUCCESS';
export const LOGBOOK_UPDATE_DEVICE_FAILURE = 'LOGBOOK_UPDATE_DEVICE_FAILURE';

export function updateLogbookDevice(id, name) {
  return (dispatch, getState) => {
    return dispatch({
      types: [LOGBOOK_UPDATE_DEVICE_REQUEST, LOGBOOK_UPDATE_DEVICE_SUCCESS, LOGBOOK_UPDATE_DEVICE_FAILURE],
      url: `/popapi/api/device/update`,
      body: { Id: id, Name: name },
    });

  }
}

export const LOGBOOK_DEL_DEVICE_REQUEST = 'LOGBOOK_DEL_DEVICE_REQUEST';
export const LOGBOOK_DEL_DEVICE_SUCCESS = 'LOGBOOK_DEL_DEVICE_SUCCESS';
export const LOGBOOK_DEL_DEVICE_FAILURE = 'LOGBOOK_DEL_DEVICE_FAILURE';

export function delLogbookDevice(id) {
  return (dispatch, getState) => {
    return dispatch({
      types: [LOGBOOK_DEL_DEVICE_REQUEST, LOGBOOK_DEL_DEVICE_SUCCESS, LOGBOOK_DEL_DEVICE_FAILURE],
      url: `/popapi/api/device/delete/${id}`,
      body: { id },
    });

  }
}

export const LOGBOOK_DEVICE_REQUEST = 'LOGBOOK_DEVICE_REQUEST';
export const LOGBOOK_DEVICE_SUCCESS = 'LOGBOOK_DEVICE_SUCCESS';
export const LOGBOOK_DEVICE_FAILURE = 'LOGBOOK_DEVICE_FAILURE';

export function getLogbookDevice(id) {
  return (dispatch, getState) => {
    return dispatch({
      types: [LOGBOOK_DEVICE_REQUEST, LOGBOOK_DEVICE_SUCCESS, LOGBOOK_DEVICE_FAILURE],
      url: `/popapi/api/device/logbookInfo/${id}`,
      body: { id },
    });

  }
}

export const LOGBOOK_OCR_REQUEST = 'LOGBOOK_OCR_REQUEST';
export const LOGBOOK_OCR_SUCCESS = 'LOGBOOK_OCR_SUCCESS';
export const LOGBOOK_OCR_FAILURE = 'LOGBOOK_OCR_FAILURE';

export function loadTextFromImage(content) {
  return (dispatch, getState) => {
    return dispatch({
      types: [LOGBOOK_OCR_REQUEST, LOGBOOK_OCR_SUCCESS, LOGBOOK_OCR_FAILURE],
      url: `/popapi/api/common/AliOcrFile`,
      body: { content }
    });
  }
}
