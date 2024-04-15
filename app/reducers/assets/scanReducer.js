'use strict';

import {
  ASSET_QR_PANEL_HIERARCHY_SUCCESS,
  SCAN_EXIT,
  SCAN_RESET_ERROR,
  ASSET_QR_PANEL_HIERARCHY_REQUEST,
  ASSET_QR_PANEL_HIERARCHY_FAILURE,
  // ASSET_QR_DEVICE_DATA_UPDATE,
  DEVICE_QR_LOAD_REQUEST, DEVICE_QR_LOAD_SUCCESS, DEVICE_QR_LOAD_FAILURE,
  ASSET_QR_Sp_UPDATE, SCAN_ENTRY_DATA_CHANGED,
  HIERARCHY_BIND_QR_REQUEST, HIERARCHY_BIND_QR_SUCCESS, HIERARCHY_BIND_QR_FAILURE,
  ASSET_QR_REQUEST, ASSET_QR_SUCCESS, ASSET_QR_FAILURE,
  LOGBOOK_ADD_DEVICE_REQUEST, LOGBOOK_ADD_DEVICE_SUCCESS, LOGBOOK_ADD_DEVICE_FAILURE
} from '../../actions/assetsAction.js';

import { LOGOUT_SUCCESS } from '../../actions/loginAction.js';
import privilegeHelper from '../../utils/privilegeHelper.js';

import Immutable from 'immutable';
import {
  ASSET_QR_ROOM_HIERARCHY_FAILURE, ASSET_QR_ROOM_HIERARCHY_REQUEST,
  ASSET_QR_ROOM_HIERARCHY_SUCCESS
} from "../../actions/assetsAction";

var defaultState = Immutable.fromJS({
  dataRoom: null,
  dataPanel: null,
  dataDevice: null,
  httpUri: null,
  bindHierarchySuccessed: null,
  isFetching: false,
  isRequestWithQrcode: false,
  hasAuth: true,
  QRCodeAlreadyBind: false,
  isLogbookUrlNotReg: false,
  logbookRegSuccess: false,
  errorMessage: null,
  errorToast: null,
  isFromPanelAdd: false,
});

function updateData(state, action) {
  var response = action.response.Result;
  var newState = state;

  newState = newState.set('dataPanel', Immutable.fromJS(response));
  newState = newState.set('dataDevice', null).set('dataRoom', null);
  newState = newState.set('isFetching', false);
  newState = newState.set('hasAuth', true);
  return newState;
}

function updateRoomData(state, action) {
  var response = action.response.Result;
  var newState = state;

  newState = newState.set('dataRoom', Immutable.fromJS(response));
  newState = newState.set('dataDevice', null).set('dataPanel', null);
  newState = newState.set('isFetching', false);
  newState = newState.set('hasAuth', true);
  return newState;
}

function updateBindHierarchy(state, action) {
  var response = action.response.Result;
  var newState = state;

  newState = newState.set('dataPanel', null).set('dataRoom', null);
  newState = newState.set('dataDevice', null);
  newState = newState.set('isFetching', false);
  newState = newState.set('hasAuth', true);
  newState = newState.set('bindHierarchySuccessed', true);
  return newState;
}

function updateAssetData(state, action) {
  var response = action.response.Result;
  var newState = state;
  var isFromPanelAdd = state.get('isFromPanelAdd');
  var isBindQRCode = action.opt.isBindQRCode;
  // console.warn('updateAssetData...',isBindQRCode,action);
  if (!response.Type && !isBindQRCode) {
    if (response.IsLogbook) {
      if (isFromPanelAdd) {
        newState = newState.set('isLogbookUrlNotReg', true);
      } else {
        if (!privilegeHelper.hasAuth('RegDeviceFullPrivilegeCode')) {
          newState = newState.set('errorMessage', '无法识别与EnergyHub系统不相关的二维码，请确认后再试！')
        } else {
          newState = newState.set('errorMessage', '该设备尚未录入，请到“资产”页面添加该设备')
        }
      }
    } else {
      newState = newState.set('errorMessage', '无法识别与EnergyHub系统不相关的二维码，请确认后再试！')
    }
  } else if (response.Type === 5) {
    newState = newState.set('dataDevice', Immutable.fromJS({ 'Id': response.HierarchyId, 'Name': response.Name, 'JoinType': response.IsLogbook ? 4 : null }));
  } else if (response.Type === 4) {
    newState = newState.set('dataPanel', Immutable.fromJS({ 'Id': response.HierarchyId, 'Name': response.Name, Type: response.Type }));
  } else if (response.Type === 3) {
    newState = newState.set('dataRoom', Immutable.fromJS({ 'Id': response.HierarchyId, 'Name': response.Name, Type: response.Type }));
  }
  newState = newState.set('isFetching', false);
  newState = newState.set('hasAuth', true).set('QRCodeAlreadyBind', response.Type !== null);
  newState = newState.set('isRequestWithQrcode', false);
  return newState;
}

function updateDeviceData(state, action) {
  var { body: { data } } = action;
  // console.warn('updateDeviceData...',data);
  var newState = state;
  newState = newState.set('dataDevice', Immutable.fromJS({ 'Id': data.DeviceId, 'Name': data.DeviceName, 'JoinType': data.JoinType }));
  newState = newState.set('dataPanel', null).set('dataRoom', null);
  newState = newState.set('isFetching', false);
  newState = newState.set('hasAuth', true);
  return newState;
}

function updateScanSpData(state, action) {
  var { data: { type, data } } = action;
  // console.warn('updateScanSpData...',type,data);
  var newState = state;
  if (type === 'scan') {
    newState = newState.set('httpUri', data);
  } else if (type === 'reset') {
    newState = newState.set('httpUri', null).set('isLogbookUrlNotReg', false).set('logbookRegSuccess', false);
  }

  newState = newState.set('dataDevice', null);
  newState = newState.set('dataPanel', null).set('dataRoom', null);
  newState = newState.set('isFetching', false);
  newState = newState.set('hasAuth', true);
  return newState;
}

function updateAddLogbookDevice(state, action) {
  var newState = state;
  newState = newState.set('logbookRegSuccess', true);
  newState = newState.set('dataDevice', null);
  newState = newState.set('dataPanel', null).set('dataRoom', null);
  newState = newState.set('isFetching', false);
  newState = newState.set('hasAuth', true);
  return newState;
}

function handleError(state, action) {
  var { Error } = action.error;
  var isBindQRCode = false;
  if (action.opt) {
    isBindQRCode = action.opt.isBindQRCode;
  }

  // console.warn('handleError',action.error);
  var strError = null;
  var strToast = null;
  let nameExist = false;
  switch (Error) {
    case '040001307022':
    case '050001207024':
      strError = '您没有这一项的操作权限，请联系系统管理员';
      break;
    case '040000307009':
    case '050001251009':
      strError = '您没有查看资产权限，请联系系统管理员';
      break;
    case '050001201010':
      strError = '您扫的二维码不是EnergyHub资产二维码，请确认';
      break;
    case '050001201914':
      {
        strError = '该资产的物料号（CR）还未在系统中注册，请在APP“我的”页面填写“用户反馈”，并把二维码图片传给我们！';
        if (isBindQRCode) {
          strError = null;
          action.error = null;
        }
        break;
      }
    case '050001201005':
      strToast = '设备名称重复';
      nameExist = true;
      break;
    case '050001201908':
      strError = '该二维码的配电柜已存在，不允许再次绑定';
      break;
    case '050001201907':
      strError = '该二维码的设备已存在，不允许再次绑定';
      break;
    case '050001201906':
      strError = '被绑定二维码中CR与设备不匹配，不允许绑定';
      break;
    case '050001201905':
      strError = '绑定该二维码会导致设备通讯失败，不允许绑定！';
      break;
    case '050000201013':
      strToast = '二维码错误';
      break;
  }
  if (strError || strToast) {
    if (Error !== '403') {
      action.error = null;
    }
  }
  state = defaultState.set('hasAuth', false).set('errorMessage', strError).set('errorToast', strToast);
  if (nameExist) {
    state = state.set('nameExist', true);
  }
  return state;
}

export default function (state = defaultState, action) {
  state = state.set('nameExist', false);
  switch (action.type) {
    case ASSET_QR_PANEL_HIERARCHY_REQUEST:
    case ASSET_QR_ROOM_HIERARCHY_REQUEST:
    case DEVICE_QR_LOAD_REQUEST:
    case HIERARCHY_BIND_QR_REQUEST:
      return state.set('isFetching', true).set('isLogbookUrlNotReg', false).set('QRCodeAlreadyBind', false);
    case ASSET_QR_REQUEST:
      return state.set('isFetching', true).set('isLogbookUrlNotReg', false).set('QRCodeAlreadyBind', false)
        .set('isRequestWithQrcode', true);
    case ASSET_QR_PANEL_HIERARCHY_SUCCESS:
      return updateData(state, action);
    case ASSET_QR_ROOM_HIERARCHY_SUCCESS:
      return updateRoomData(state, action);
    case HIERARCHY_BIND_QR_SUCCESS:
      return updateBindHierarchy(state, action);
    case ASSET_QR_SUCCESS:
      return updateAssetData(state, action);
    case ASSET_QR_PANEL_HIERARCHY_FAILURE:
    case ASSET_QR_ROOM_HIERARCHY_FAILURE:
    case DEVICE_QR_LOAD_FAILURE:
    case ASSET_QR_FAILURE:
    case HIERARCHY_BIND_QR_FAILURE:
    case LOGBOOK_ADD_DEVICE_FAILURE:
      return handleError(state, action);
    case DEVICE_QR_LOAD_SUCCESS:
      return updateDeviceData(state, action);
    case ASSET_QR_Sp_UPDATE:
      return updateScanSpData(state, action);
    case LOGBOOK_ADD_DEVICE_REQUEST:
      return state.set('logbookRegSuccess', false).set('errorToast', null);
    case LOGBOOK_ADD_DEVICE_SUCCESS:
      return updateAddLogbookDevice(state, action);
    case SCAN_ENTRY_DATA_CHANGED:
      return state.set('isFromPanelAdd', action.data.isFromPanelAdd)
        .set('bindHierarchySuccessed', null);
    // case ASSET_QR_DEVICE_DATA_UPDATE:
    //   return updateDeviceData(state,action);
    case SCAN_RESET_ERROR:
    case SCAN_EXIT:
    case LOGOUT_SUCCESS:
      return defaultState;
    default:

  }
  return state;
}
