

export const Air_Bottle_List_Input_Save = 'Air_Bottle_List_Input_Save';

/**
 * 气瓶列表 入参保存更新
 * @param params
 * @returns {function(*, *): *}
 */
export function saveAirBottleListInput(params) {
    return (dispatch) => {
        return dispatch({
            type: Air_Bottle_List_Input_Save,
            data: params
        });
    }
}


export const Air_Bottle_Scan_Value_Save = 'Air_Bottle_Scan_Value_Save';
/**
 * 气瓶列表 扫码结果保存
 * @param scanText
 * @returns {function(*): *}
 */
export function saveScanResult(scanText) {
    return (dispatch) => {
        return dispatch({
            type: Air_Bottle_Scan_Value_Save,
            data: scanText
        });
    }
}


export const Air_Bottle_Search_Value_Save = 'Air_Bottle_Search_Value_Save';
/**
 * 气瓶列表 扫码结果保存
 * @param searchText
 * @returns {function(*): *}
 */
export function saveSearchResult(searchText) {
    return (dispatch) => {
        return dispatch({
            type: Air_Bottle_Search_Value_Save,
            data: searchText
        });
    }
}


export const Air_Bottle_List_Request = 'Air_Bottle_List_Request';
export const Air_Bottle_List_Success = 'Air_Bottle_List_Success';
export const Air_Bottle_List_Failure = 'Air_Bottle_List_Failure';
/**
 * 气瓶列表请求http://39.98.50.32:31888/lego-bff/api/bucket/change/edit/executeing
 * @returns {function(*, *): *}
 */
export function loadAirBottleList(body) {
    return (dispatch, getState) => {
        return dispatch({
            types: [Air_Bottle_List_Request, Air_Bottle_List_Success, Air_Bottle_List_Failure],
            url: '/fmcs/api/gas/decanting/task/search',
            body
        });
    }
}

export const Air_Bottle_Destroy_Clear = 'Air_Bottle_Destroy_Clear';
export function airBottleDestroyClear() {
    return (dispatch) => {
        return dispatch({
            type: Air_Bottle_Destroy_Clear,
        });
    }
}




export const Air_Bottle_Detail_Request = 'Air_Bottle_Detail_Request';
export const Air_Bottle_Detail_Success = 'Air_Bottle_Detail_Success';
export const Air_Bottle_Detail_Failure = 'Air_Bottle_Detail_Failure';
/**
 * 获取详情
 * @param id
 * @returns {function(*, *): *}
 */
export function loadAirBottleDetail(id) {
    return (dispatch, getState) => {
        return dispatch({
            types: [Air_Bottle_Detail_Request, Air_Bottle_Detail_Success, Air_Bottle_Detail_Failure],
            url: `/fmcs/api/gas/decanting/task/detail/${id}`,
        });
    }
}


export const Air_Bottle_Detail_Loading_Status_Update = 'Air_Bottle_Detail_Loading_Status_Update'
export function airBottleDetailLoadingStatus(status){
    return (dispatch) => {
        return dispatch({
            type: Air_Bottle_Detail_Loading_Status_Update,
            data: status,
        });
    }
}

export const Air_Bottle_Users_Request = 'Air_Bottle_Users_Request';
export const Air_Bottle_Users_Success = 'Air_Bottle_Users_Success';
export const Air_Bottle_Users_Failure = 'Air_Bottle_Users_Failure';
/**
 * 获取气化课下用户信息列表
 * @returns {function(*, *): *}
 */
export function loadUsers(){
    return (dispatch, getState) => {
        return dispatch({
            types: [Air_Bottle_Users_Request, Air_Bottle_Users_Success, Air_Bottle_Users_Failure],
            url: '/fmcs/api/mobile/user/QH/getOrgUsers',
        });
    }
}

export const Air_Bottle_Wait_Blow_Edit_Request = 'Air_Bottle_Wait_Blow_Edit_Request';
export const Air_Bottle_Wait_Blow_Edit_Success = 'Air_Bottle_Wait_Blow_Edit_Success';
export const Air_Bottle_Wait_Blow_Edit_Failure = 'Air_Bottle_Wait_Blow_Edit_Failure';
/**
 * 待前吹
 * 编辑记录
 * @param body
 * @returns {function(*, *): *}
 */
export function redactWaitBlow(body) {
    return (dispatch, getState) => {
        return dispatch({
            types: [Air_Bottle_Wait_Blow_Edit_Request, Air_Bottle_Wait_Blow_Edit_Success, Air_Bottle_Wait_Blow_Edit_Failure],
            url: '/fmcs/api/gas/decanting/task/redactWaitBlow',
            body
        });
    }
}

export const Air_Bottle_Clear_Detail = 'Air_Bottle_Clear_Detail';
/**
 * 清除详情
 * @returns {function(*, *): *}
 */
export function cleaAirBottleDetail(){
    return (dispatch, getState) => {
        return dispatch({
            type: Air_Bottle_Clear_Detail,
        });
    }
}


export const Air_Bottle_Blowing_Edit_Request = 'Air_Bottle_Blowing_Edit_Request';
export const Air_Bottle_Blowing_Edit_Success = 'Air_Bottle_Blowing_Edit_Success';
export const Air_Bottle_Blowing_Edit_Failure = 'Air_Bottle_Blowing_Edit_Failure';
/**
 * 前吹中
 * 编辑记录
 * @param body
 * @returns {function(*, *): *}
 */
export function redactBlowing(body) {
    return (dispatch, getState) => {
        return dispatch({
            types: [Air_Bottle_Blowing_Edit_Request, Air_Bottle_Blowing_Edit_Success, Air_Bottle_Blowing_Edit_Failure],
            url: '/fmcs/api/gas/decanting/task/redactBlow',
            body
        });
    }
}

export const Air_Bottle_Blowing_GetState_Request = 'Air_Bottle_Blowing_GetState_Request';
export const Air_Bottle_Blowing_GetState_Success = 'Air_Bottle_Blowing_GetState_Success';
export const Air_Bottle_Blowing_GetState_Failure = 'Air_Bottle_Blowing_GetState_Failure';

/**
 * 获取待前吹状态下气瓶状态
 * @param positionCode
 * @param deviceId
 * @returns {function(*): *}
 */
export function loadAirBottleCurrentState(positionCode, deviceId){
  return (dispatch) => {
    return dispatch({
      types: [Air_Bottle_Blowing_GetState_Request, Air_Bottle_Blowing_GetState_Success, Air_Bottle_Blowing_GetState_Failure],
      url: `/fmcs/api/gas/decanting/task/tag/check/${positionCode}/${deviceId}`,
    });
  }
}

export const Air_Bottle_Blowing_Change_GetState = 'Air_Bottle_Blowing_Change_GetState';
export function updateAirBottleCurrentState(data) {
  return (dispatch) => {
    return dispatch({
      type: Air_Bottle_Blowing_Change_GetState,
      data: data,
    });
  }
}


export const Air_Bottle_Wait_Change_Edit_Request = 'Air_Bottle_Wait_Change_Edit_Request';
export const Air_Bottle_Wait_Change_Edit_Success = 'Air_Bottle_Wait_Change_Edit_Success';
export const Air_Bottle_Wait_Change_Edit_Failure = 'Air_Bottle_Wait_Change_Edit_Failure';
/**
 * 待更换
 * 编辑记录
 * @param body
 * @returns {function(*, *): *}
 */
export function redactWaitChange(body) {
    return (dispatch, getState) => {
        return dispatch({
            types: [Air_Bottle_Wait_Change_Edit_Request, Air_Bottle_Wait_Change_Edit_Success, Air_Bottle_Wait_Change_Edit_Failure],
            url: '/fmcs/api/gas/decanting/task/redactWaitChange',
            body
        });
    }
}


export const Air_Bottle_Changing_Edit_Request = 'Air_Bottle_Changing_Edit_Request';
export const Air_Bottle_Changing_Edit_Success = 'Air_Bottle_Changing_Edit_Success';
export const Air_Bottle_Changing_Edit_Failure = 'Air_Bottle_Changing_Edit_Failure';
/**
 * 更换中
 * 编辑记录
 * @param body
 * @returns {function(*, *): *}
 */
export function redactChanging(body) {
    return (dispatch, getState) => {
        return dispatch({
            types: [Air_Bottle_Changing_Edit_Request, Air_Bottle_Changing_Edit_Success, Air_Bottle_Changing_Edit_Failure],
            url: '/fmcs/api/gas/decanting/task/redacChange',
            body
        });
    }
}

export const Air_Bottle_WaitStandby_Edit_Request = 'Air_Bottle_WaitStandby_Edit_Request';
export const Air_Bottle_WaitStandby_Edit_Success = 'Air_Bottle_WaitStandby_Edit_Success';
export const Air_Bottle_WaitStandby_Edit_Failure = 'Air_Bottle_WaitStandby_Edit_Failure';
/**
 * 待Standby
 * 编辑记录
 * @param body
 * @returns {function(*, *): *}
 */
export function redactWaitStandby(body) {
    return (dispatch, getState) => {
        return dispatch({
            types: [Air_Bottle_WaitStandby_Edit_Request, Air_Bottle_WaitStandby_Edit_Success, Air_Bottle_WaitStandby_Edit_Failure],
            url: '/fmcs/api/gas/decanting/task/redacWaitStandby',
            body
        });
    }
}


export const Air_Bottle_Standby_Edit_Request = 'Air_Bottle_Standby_Edit_Request';
export const Air_Bottle_Standby_Edit_Success = 'Air_Bottle_Standby_Edit_Success';
export const Air_Bottle_Standby_Edit_Failure = 'Air_Bottle_Standby_Edit_Failure';
/**
 * Standby中
 * 编辑记录
 * @param body
 * @returns {function(*, *): *}
 */
export function redactStandby(body) {
    return (dispatch, getState) => {
        return dispatch({
            types: [Air_Bottle_Standby_Edit_Request, Air_Bottle_Standby_Edit_Success, Air_Bottle_Standby_Edit_Failure],
            url: '/fmcs/api/gas/decanting/task/redacStandby',
            body
        });
    }
}


export const Air_Bottle_In_Standby_GetState_Request = 'Air_Bottle_In_Standby_GetState_Request';
export const Air_Bottle_In_Standby_GetState_Success = 'Air_Bottle_In_Standby_GetState_Success';
export const Air_Bottle_In_Standby_GetState_Failure = 'Air_Bottle_In_Standby_GetState_Failure';

/**
 * 获取待机状态下 气瓶状态
 * @param positionCode
 * @param deviceId
 * @returns {function(*): *}
 */
export function loadInStandByBottleState(positionCode, deviceId){
  return (dispatch) => {
    return dispatch({
      types: [Air_Bottle_In_Standby_GetState_Request, Air_Bottle_In_Standby_GetState_Success, Air_Bottle_In_Standby_GetState_Failure],
      url: `/fmcs/api/gas/decanting/task/tag/check/dj/${positionCode}/${deviceId}`,
    });
  }
}

export const Air_Bottle_In_Standby_Change_GetState = 'Air_Bottle_In_Standby_Change_GetState';
export function updateInStandByBottleState(data) {
  return (dispatch) => {
    return dispatch({
      type: Air_Bottle_In_Standby_Change_GetState,
      data: data,
    });
  }
}
