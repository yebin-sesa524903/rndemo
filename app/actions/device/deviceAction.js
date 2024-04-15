export const LOAD_DEVICE_LIST_REQUEST = 'LOAD_DEVICE_LIST_REQUEST';
export const LOAD_DEVICE_LIST_SUCCESS = 'LOAD_DEVICE_LIST_SUCCESS';
export const LOAD_DEVICE_LIST_FAILED = 'LOAD_DEVICE_LIST_FAILED';

export function loadDeviceList(body) {
  return (dispatch, getState) => {
    return dispatch({
      types: [LOAD_DEVICE_LIST_REQUEST, LOAD_DEVICE_LIST_SUCCESS, LOAD_DEVICE_LIST_FAILED],
      url: '/bff/eh/rest/getDevicePage',
      body
    })
  }
}


export const LOAD_DEVICE_STATUS_REQUEST = 'LOAD_DEVICE_STATUS_REQUEST';
export const LOAD_DEVICE_STATUS_SUCCESS = 'LOAD_DEVICE_STATUS_SUCCESS';
export const LOAD_DEVICE_STATUS_FAILED = 'LOAD_DEVICE_STATUS_FAILED';
export function loadDeviceStatus(body) {
  return (dispatch, getState) => {
    return dispatch({
      types: [LOAD_DEVICE_STATUS_REQUEST, LOAD_DEVICE_STATUS_SUCCESS, LOAD_DEVICE_STATUS_FAILED],
      url: '/bff/eh/rest/common/getDeviceStatus',
      body
    })
  }
}

export const LOAD_API_OSS_PATH_REQUEST = 'LOAD_API_OSS_PATH_REQUEST';
export const LOAD_API_OSS_PATH_SUCCESS = 'LOAD_API_OSS_PATH_SUCCESS';
export const LOAD_API_OSS_PATH_FAILED = 'LOAD_API_OSS_PATH_FAILED';

export function apiGetOssPath() {
  return (dispatch, getState) => {
    return dispatch({
      types: [LOAD_API_OSS_PATH_REQUEST, LOAD_API_OSS_PATH_SUCCESS, LOAD_API_OSS_PATH_FAILED],
      url: '/bff/eh/rest/common/oss/path',
      body: {},
    })
  }
}

export const LOAD_DEVICE_DETAIL_REQUEST = 'LOAD_DEVICE_DETAIL_REQUEST';
export const LOAD_DEVICE_DETAIL_SUCCESS = 'LOAD_DEVICE_DETAIL_SUCCESS';
export const LOAD_DEVICE_DETAIL_FAILED = 'LOAD_DEVICE_DETAIL_FAILED';

export function loadDeviceDetail(id) {
  return (dispatch, getState) => {
    return dispatch({
      types: [LOAD_DEVICE_DETAIL_REQUEST, LOAD_DEVICE_DETAIL_SUCCESS, LOAD_DEVICE_DETAIL_FAILED],
      url: `/bff/eh/rest/common/hierarchyDetail`,//getDeviceDetail?id=${id}`,
      body: {
        id
      }
    })
  }
}

export const LOAD_DEVICE_PARAMS_REQUEST = 'LOAD_DEVICE_PARAMS_REQUEST';
export const LOAD_DEVICE_PARAMS_SUCCESS = 'LOAD_DEVICE_PARAMS_SUCCESS';
export const LOAD_DEVICE_PARAMS_FAILED = 'LOAD_DEVICE_PARAMS_FAILED';

export function loadDeviceParams(id) {
  return (dispatch, getState) => {
    return dispatch({
      types: [LOAD_DEVICE_PARAMS_REQUEST, LOAD_DEVICE_PARAMS_SUCCESS, LOAD_DEVICE_PARAMS_FAILED],
      url: `/bff/eh/rest/common/getDeviceParameters`,
      body: {
        id
      }
    })
  }
}

export const DEVICE_DETAIL_CLEAR = 'DEVICE_DETAIL_CLEAR';

export function clearDeviceDetail() {
  return (dispatch, getState) => {
    return dispatch({
      type: DEVICE_DETAIL_CLEAR,
    })
  }
}

export const SAVE_DEVICE_LIST_INPUT = 'SAVE_DEVICE_LIST_INPUT';

export function saveDeviceListInput(input) {
  return (dispatch, getState) => {
    return dispatch({
      type: SAVE_DEVICE_LIST_INPUT,
      input
    })
  }
}

export const SAVE_DEVICE_LIST_SEARCH = 'SAVE_DEVICE_LIST_SEARCH';
export function saveDeviceListSearch(search) {
  return (dispatch, getState) => {
    return dispatch({
      type: SAVE_DEVICE_LIST_SEARCH,
      search
    })
  }
}

export const CLEAR_DEVICE_LIST_INPUT = 'CLEAR_DEVICE_LIST_INPUT';

export function clearDeviceListInput() {
  return (dispatch, getState) => {
    return dispatch({
      type: CLEAR_DEVICE_LIST_INPUT,
    })
  }
}


export const DeviceDetail_MappingList_Request = 'DeviceDetail_MappingList_Request';
export const DeviceDetail_MappingList_Success = 'DeviceDetail_MappingList_Success';
export const DeviceDetail_MappingList_Failed = 'DeviceDetail_MappingList_Failed';

export function queryDeviceMappingList(deviceId) {
  return (dispatch, getState) => {
    return dispatch({
      types: [DeviceDetail_MappingList_Request, DeviceDetail_MappingList_Success, DeviceDetail_MappingList_Failed],
      url: `/lego-bff/bff/ledger/rest/getDeviceMappingList`,
      body: {
        id: deviceId
      }
    })
  }
}


export const DeviceDetail_QueryEquipDataApi_Request = 'DeviceDetail_QueryEquipDataApi_Request';
export const DeviceDetail_QueryEquipDataApi_Success = 'DeviceDetail_QueryEquipDataApi_Success';
export const DeviceDetail_QueryEquipDataApi_Failed = 'DeviceDetail_QueryEquipDataApi_Failed';

/**
 * 数据监控
 * @param params
 * @returns {function(*, *): *}
 */
export function loadMonitorInfo(params) {
  return (dispatch, getState) => {
    return dispatch({
      types: [DeviceDetail_QueryEquipDataApi_Request, DeviceDetail_QueryEquipDataApi_Success, DeviceDetail_QueryEquipDataApi_Failed],
      url: `/lego-bff/bff/ledger/rest/mobile/device/queryEquipDataApi`,
      body: params,
    })
  }
}

export const DeviceDetail_QueryEquipDataApi_YWCS_Request = 'DeviceDetail_QueryEquipDataApi_YWCS_Request';
export const DeviceDetail_QueryEquipDataApi_YWCS_Success = 'DeviceDetail_QueryEquipDataApi_YWCS_Success';
export const DeviceDetail_QueryEquipDataApi_YWCS_Failed = 'DeviceDetail_QueryEquipDataApi_YWCS_Failed';

/**
 * 运维参数
 * @param params
 * @returns {function(*, *): *}
 */
export function loadMaintenanceInfo(params) {
  return (dispatch, getState) => {
    return dispatch({
      types: [DeviceDetail_QueryEquipDataApi_YWCS_Request, DeviceDetail_QueryEquipDataApi_YWCS_Success, DeviceDetail_QueryEquipDataApi_YWCS_Failed],
      url: `/lego-bff/bff/ledger/rest/mobile/device/queryEquipDataApi`,
      body: params,
    })
  }
}



export const DeviceDetail_Load_AlarmList_Request = 'DeviceDetail_Load_AlarmList_Request';
export const DeviceDetail_Load_AlarmList_Success = 'DeviceDetail_Load_AlarmList_Success';
export const DeviceDetail_Load_AlarmList_Failed = 'DeviceDetail_Load_AlarmList_Failed';



export const DeviceDetail_Save_Alarms_Input = 'DeviceDetail_Save_Alarms_Input';

/**
 * 报警列表入参保存
 * @param input
 * @returns {function(*): *}
 */
export function saveDeviceAlarmsInput(input) {
  return (dispatch) => {
    return dispatch({
      type: DeviceDetail_Save_Alarms_Input,
      data: input
    })
  }
}

/**
 * 获取报警列表
 * @param params
 * @returns {function(*, *): *}
 */
export function loadAlarmList(params) {
  return (dispatch, getState) => {
    return dispatch({
      types: [DeviceDetail_Load_AlarmList_Request, DeviceDetail_Load_AlarmList_Success, DeviceDetail_Load_AlarmList_Failed],
      url: `/bff/eh/rest/getAlarmList`,
      body: params,
    })
  }
}
export const DeviceDetail_DeviceConfig_Request = 'DeviceDetail_DeviceConfig_Request';
export const DeviceDetail_DeviceConfig_Success = 'DeviceDetail_DeviceConfig_Success';
export const DeviceDetail_DeviceConfig_Failed = 'DeviceDetail_DeviceConfig_Failed';

/**
 * 获取设备配置信息
 * @param params
 * @returns {function(*): *}
 */
export function getDeviceConfig(params) {
  return (dispatch) => {
    return dispatch({
      types: [DeviceDetail_DeviceConfig_Request, DeviceDetail_DeviceConfig_Success, DeviceDetail_DeviceConfig_Failed],
      url: `/bff/eh/rest/getDeviceConfigByHierarchy`,//`/bff/eh/rest/getDeviceConfigByHierarchy`,
      body: params,
    })
  }
}


export const DeviceDetail_Load_RealtimeData_Request = 'DeviceDetail_Load_RealtimeData_Request';
export const DeviceDetail_Load_RealtimeData_Success = 'DeviceDetail_Load_RealtimeData_Success';
export const DeviceDetail_Load_RealtimeData_Failed = 'DeviceDetail_Load_RealtimeData_Failed';

/**
 * 获取实时数据
 * @param params
 * @returns {function(*): *}
 */
export function getRealtimeData(params) {
  return (dispatch) => {
    return dispatch({
      types: [DeviceDetail_Load_RealtimeData_Request, DeviceDetail_Load_RealtimeData_Success, DeviceDetail_Load_RealtimeData_Failed],
      url: `/bff/eh/rest/getRealtimeData`,
      body: params,
    })
  }
}



export const DEVICE_DETAIL_STATUS_REQUEST = 'DEVICE_DETAIL_STATUS_REQUEST';
export const DEVICE_DETAIL_STATUS_SUCCESS = 'DEVICE_DETAIL_STATUS_SUCCESS';
export const DEVICE_DETAIL_STATUS_FAILED = 'DEVICE_DETAIL_STATUS_FAILED';
export function getAssetStatus(body) {
  return (dispatch) => {
    return dispatch({
      types: [DEVICE_DETAIL_STATUS_REQUEST, DEVICE_DETAIL_STATUS_SUCCESS, DEVICE_DETAIL_STATUS_FAILED],
      url: '/bff/eh/rest/hierarchyInstantiation/getAssetStatus',
      body
    })
  }
}

export const DEVICE_LOAD_TICKETS_REQUEST = 'DEVICE_LOAD_TICKETS_REQUEST';
export const DEVICE_LOAD_TICKETS_SUCCESS = 'DEVICE_LOAD_TICKETS_SUCCESS';
export const DEVICE_LOAD_TICKETS_FAILED = 'DEVICE_LOAD_TICKETS_FAILED';
export function loadDeviceTickets(body, isInventory) {
  return (dispatch) => {
    return dispatch({
      types: [DEVICE_LOAD_TICKETS_REQUEST, DEVICE_LOAD_TICKETS_SUCCESS, DEVICE_LOAD_TICKETS_FAILED],
      url: '/bff/eh/rest/ticket/pageList',//web端查询盘点工单和运维工单都是这个接口
      body,
      isInventory
    })
  }
}
