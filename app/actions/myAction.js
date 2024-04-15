'use strict';


import storage from "../utils/storage";

export const VERSION_REQUEST = 'VERSION_REQUEST';
export const VERSION_SUCCESS = 'VERSION_SUCCESS';
export const VERSION_FAILURE = 'VERSION_FAILURE';

export function checkVersion(data) {
  return (dispatch, getState) => {
    return dispatch({
      types: [VERSION_REQUEST, VERSION_SUCCESS, VERSION_FAILURE],
      url: `/fmcs/api/common/mobileVersion`,
      body: data
    });

  }
}

export const OSS_PATH_REQUEST = 'OSS_PATH_REQUEST';
export const OSS_PATH_SUCCESS = 'OSS_PATH_SUCCESS';
export const OSS_PATH_FAILURE = 'OSS_PATH_FAILURE';

export function apiGetOssPath(data) {
  return (dispatch, getState) => {
    return dispatch({
      types: [OSS_PATH_REQUEST, OSS_PATH_SUCCESS, OSS_PATH_FAILURE],
      url: `/bff/eh/rest/common/oss/path`,
      body: data
    });
  }
}

export const USER_KNOWLEDGE_TOKEN_REQUEST = 'USER_KNOWLEDGE_TOKEN_REQUEST';
export const USER_KNOWLEDGE_TOKEN_SUCCESS = 'USER_KNOWLEDGE_TOKEN_SUCCESS';
export const USER_KNOWLEDGE_TOKEN_FAILURE = 'USER_KNOWLEDGE_TOKEN_FAILURE';

export function getKnowledgeToken(body) {
  return (dispatch, getState) => {
    return dispatch({
      types: [USER_KNOWLEDGE_TOKEN_REQUEST, USER_KNOWLEDGE_TOKEN_SUCCESS, USER_KNOWLEDGE_TOKEN_FAILURE],
      url: '/fmcs/api/common/get/knowledge/token',
      body
    });
  }
}

export const USER_CALLIN_HOST_REQUEST = 'USER_CALLIN_HOST_REQUEST';
export const USER_CALLIN_HOST_SUCCESS = 'USER_CALLIN_HOST_SUCCESS';
export const USER_CALLIN_HOST_FAILURE = 'USER_CALLIN_HOST_FAILURE';

export function getCallInHost(body) {
  return (dispatch, getState) => {
    return dispatch({
      types: [USER_CALLIN_HOST_REQUEST, USER_CALLIN_HOST_SUCCESS, USER_CALLIN_HOST_FAILURE],
      url: '/fmcs/api/common/get/outer/host',
      body
    });
  }
}

export const USER_HIERARCHY_REQUEST = 'USER_HIERARCHY_REQUEST';
export const USER_HIERARCHY_SUCCESS = 'USER_HIERARCHY_SUCCESS';
export const USER_HIERARCHY_FAILURE = 'USER_HIERARCHY_FAILURE';

export function queryUserHierarchyPath(data) {
  return (dispatch, getState) => {
    return dispatch({
      types: [USER_HIERARCHY_REQUEST, USER_HIERARCHY_SUCCESS, USER_HIERARCHY_FAILURE],
      url: `/lego-bff/bff/ledger/rest/common/queryUserHierarchyPath`,
      body: data
    });
  }
}
// {
//  "DeviceId": "4r34rer545",
//  "DeviceType": 0
// }
export const REGISTER_DEVICE_REQUEST = 'REGISTER_DEVICE_REQUEST';
export const REGISTER_DEVICE_SUCCESS = 'REGISTER_DEVICE_SUCCESS';
export const REGISTER_DEVICE_FAILURE = 'REGISTER_DEVICE_FAILURE';

export function registerDevice(data) {
  return (dispatch, getState) => {
    return dispatch({
      types: [REGISTER_DEVICE_REQUEST, REGISTER_DEVICE_SUCCESS, REGISTER_DEVICE_FAILURE],
      url: `/popapi/api/user/registerDevice`,
      body: data
    });
  }
}

export const UNREGISTER_DEVICE_REQUEST = 'UNREGISTER_DEVICE_REQUEST';
export const UNREGISTER_DEVICE_SUCCESS = 'UNREGISTER_DEVICE_SUCCESS';
export const UNREGISTER_DEVICE_FAILURE = 'UNREGISTER_DEVICE_FAILURE';

export function unregisterDevice(deviceId) {
  return (dispatch, getState) => {
    return dispatch({
      types: [UNREGISTER_DEVICE_REQUEST, UNREGISTER_DEVICE_SUCCESS, UNREGISTER_DEVICE_FAILURE],
      url: `/popapi/api/user/unregisterDevice`,
      body: {
        deviceId: deviceId,
      }
    });
  }
}

export const CUSTOMER_PRIVILEGE_CODE_REQUEST = 'CUSTOMER_PRIVILEGE_CODE_REQUEST';
export const CUSTOMER_PRIVILEGE_CODE_SUCCESS = 'CUSTOMER_PRIVILEGE_CODE_SUCCESS';
export const CUSTOMER_PRIVILEGE_CODE_FAILURE = 'CUSTOMER_PRIVILEGE_CODE_FAILURE';

export function getCustomerPrivilegeCodes(userId) {
  return (dispatch, getState) => {
    return dispatch({
      types: [CUSTOMER_PRIVILEGE_CODE_REQUEST, CUSTOMER_PRIVILEGE_CODE_SUCCESS, CUSTOMER_PRIVILEGE_CODE_FAILURE],
      url: `/popapi/api/User/UserCustomer/PrivilegeCodes/${userId}`,
    });
  }
}

export const USER_BKG_LOCATION_REQUEST = 'USER_BKG_LOCATION_REQUEST';
export const USER_BKG_LOCATION_SUCCESS = 'USER_BKG_LOCATION_SUCCESS';
export const USER_BKG_LOCATION_FAILURE = 'USER_BKG_LOCATION_FAILURE';

export function postBkgLocation(body) {
  return (dispatch, getState) => {
    return dispatch({
      types: [USER_BKG_LOCATION_REQUEST, USER_BKG_LOCATION_SUCCESS, USER_BKG_LOCATION_FAILURE],
      url: `/popapi/api/user/location`,
      body: body,
    });
  }
}

export const FEEDBACK_LOGINFO_CHANGED = 'FEEDBACK_LOGINFO_CHANGED';

export function logInfoChanged(data) {
  return (dispatch, getState) => {
    return dispatch({
      type: FEEDBACK_LOGINFO_CHANGED,
      data
    });
  }
}

export const CACHE_ALBUM_DATA = 'CACHE_ALBUM_DATA';

export function cacheAlbum(data) {
  return (dispatch, getState) => {
    return dispatch({
      type: CACHE_ALBUM_DATA,
      data
    });
  }
}

export const REFRESH_ALBUM_DATA = 'REFRESH_ALBUM_DATA';

export function refreshAlbum(data) {
  return (dispatch, getState) => {
    return dispatch({
      type: REFRESH_ALBUM_DATA,
      data
    });
  }
}

export const FEEDBACK_DELETE_IMAGE_REQUEST = 'FEEDBACK_DELETE_IMAGE_REQUEST';
export const FEEDBACK_DELETE_IMAGE_SUCCESS = 'FEEDBACK_DELETE_IMAGE_SUCCESS';
export const FEEDBACK_DELETE_IMAGE_FAILURE = 'FEEDBACK_DELETE_IMAGE_FAILURE';

export function deleteLogImage(names) {
  return (dispatch, getState) => {
    return dispatch({
      types: [FEEDBACK_DELETE_IMAGE_REQUEST, FEEDBACK_DELETE_IMAGE_SUCCESS, FEEDBACK_DELETE_IMAGE_FAILURE],
      url: `/popapi/api/images/delete`,
      body: names
    });

  }
}

export const FEEDBACK_LOG_CLEAN = 'FEEDBACK_LOG_CLEAN';

export function cleanFeedbackLog() {
  return (dispatch, getState) => {
    return dispatch({
      type: FEEDBACK_LOG_CLEAN,
    });
  }
}

export const PHONE_MODIFY_COUNTER_CHANGED = 'PHONE_MODIFY_COUNTER_CHANGED';
export function countDown() {
  return (dispatch, getState) => {
    return dispatch({
      type: PHONE_MODIFY_COUNTER_CHANGED
    });
  }
}

export const PHONE_INFO_CHANGED = 'PHONE_INFO_CHANGED';

export function phoneInfoChanged(data) {
  return (dispatch, getState) => {
    return dispatch({
      type: PHONE_INFO_CHANGED,
      data
    });
  }
}
export const PHONE_AUTHCODE_REQUEST = 'PHONE_AUTHCODE_REQUEST';
export const PHONE_AUTHCODE_SUCCESS = 'PHONE_AUTHCODE_SUCCESS';
export const PHONE_AUTHCODE_FAILURE = 'PHONE_AUTHCODE_FAILURE';

export function getPhoneAuthCode(telephone) {
  return (dispatch, getState) => {
    return dispatch({
      types: [PHONE_AUTHCODE_REQUEST, PHONE_AUTHCODE_SUCCESS, PHONE_AUTHCODE_FAILURE],
      url: `/popapi/api/user/generatephoneauthcode/${telephone}`,
      body: {}
    });
  }
}


export const USER_UPDATE_REQUEST = 'USER_UPDATE_REQUEST';
export const USER_UPDATE_SUCCESS = 'USER_UPDATE_SUCCESS';
export const USER_UPDATE_FAILURE = 'USER_UPDATE_FAILURE';

export function updateUser(body) {
  return (dispatch, getState) => {
    return dispatch({
      types: [USER_UPDATE_REQUEST, USER_UPDATE_SUCCESS, USER_UPDATE_FAILURE],
      url: '/popapi/api/user/update',
      body
    });
  }
}

export const USER_UPDATEPASS_REQUEST = 'USER_UPDATEPASS_REQUEST';
export const USER_UPDATEPASS_SUCCESS = 'USER_UPDATEPASS_SUCCESS';
export const USER_UPDATEPASS_FAILURE = 'USER_UPDATEPASS_FAILURE';

export function errorChangePassword(errCode) {
  return (dispatch, getState) => {
    return dispatch({
      type: USER_UPDATEPASS_FAILURE,
      error: {
        Error: {
          customErrorCode: errCode,
        },
      },
    });
  }
}

export const USER_UPDATEPASS_CLEAN_ERROR = 'USER_UPDATEPASS_CLEAN_ERROR';
export function cleanChangePassError() {
  return (dispatch, getState) => {
    return dispatch({
      type: USER_UPDATEPASS_CLEAN_ERROR,
    });
  }
}

export function updatePassword(body) {
  return (dispatch, getState) => {
    return dispatch({
      types: [USER_UPDATEPASS_REQUEST, USER_UPDATEPASS_SUCCESS, USER_UPDATEPASS_FAILURE],
      url: '/popapi/api/user/resetpassword',
      body
    });
  }
}

export const FEEDBACK_LOG_SAVE_REQUEST = 'FEEDBACK_LOG_SAVE_REQUEST';
export const FEEDBACK_LOG_SAVE_SUCCESS = 'FEEDBACK_LOG_SAVE_SUCCESS';
export const FEEDBACK_LOG_SAVE_FAILURE = 'FEEDBACK_LOG_SAVE_FAILURE';

export function saveFeedback(body, isCreate) {
  return (dispatch, getState) => {
    return dispatch({
      types: [FEEDBACK_LOG_SAVE_REQUEST, FEEDBACK_LOG_SAVE_SUCCESS, FEEDBACK_LOG_SAVE_FAILURE],
      url: '/popapi/api/common/feedback',
      body
    });

  }
}

export const STATISTICS_REQUEST = 'STATISTICS_REQUEST';
export const STATISTICS_SUCCESS = 'STATISTICS_SUCCESS';
export const STATISTICS_FAILURE = 'STATISTICS_FAILURE';

export function loadStatistics(body) {
  return (dispatch, getState) => {
    return dispatch({
      types: [STATISTICS_REQUEST, STATISTICS_SUCCESS, STATISTICS_FAILURE],
      url: `/popapi/api/device/logbooklogs`,
      body
    });
  }
}
export const STATISTICS_RESET = 'STATISTICS_RESET';
export function resetStatistics(data) {
  return (dispatch, getState) => {
    return dispatch({
      type: STATISTICS_RESET,
      data
    });
  }
}

export const TIMEOUT_ALERT = 'TIMEOUT_ALERT';
export function timeoutAlert() {
  return (dispatch, getState) => {
    return dispatch({
      type: TIMEOUT_ALERT,
    });
  }
}

export const CLEAR_TIMEOUT_ALERT = 'CLEAR_TIMEOUT_ALERT';
export function clearTimeoutAlert() {
  return (dispatch, getState) => {
    return dispatch({
      type: CLEAR_TIMEOUT_ALERT,
    });
  }
}

export const LOAD_SUBSTATION = 'LOAD_SUBSTATION';
export function loadSubStation() {
  return (dispatch, getState) => {
    storage.getItem('substation').then(data => {
      if (data) {
        data = JSON.parse(data)
      }
      return dispatch({
        type: LOAD_SUBSTATION,
        data
      })
    });
  }
}

export const SET_SUBSTATION = 'SET_SUBSTATION';
export function setSubstation(data) {
  return (dispatch, getState) => {
    storage.setItem('substation', JSON.stringify(data)).then()
    return dispatch({
      type: SET_SUBSTATION,
      data
    })
  }
}
