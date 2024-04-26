'use strict';


import {
  NO_TOKEN, LOGOUT_SUCCESS, LOGIN_SUCCESS, USER_SUCCESS, USER_FAILURE, USER_REQUEST,
  USER_UPDATE_REQUEST, USER_UPDATE_SUCCESS, LOGIN_BY_PASSWORD_SUCCESS, USER_UPDATE_FAILURE,
  AGREE_PRIVACY_REQUEST, AGREE_PRIVACY_SUCCESS, AGREE_PRIVACY_FAILURE, OFFLINE_USER,
  UPLOAD_USER_ICON_REQUEST, UPLOAD_USER_ICON_SUCCESS, UPLOAD_USER_ICON_FAILURE,
  CHANGE_PARTNER_REQUEST, CHANGE_PARTNER_SUCCESS, CHANGE_PARTNER_FAILURE, LOAD_SELECT_PARTNER,
  LOGIN_SAVE_USERNAME, CUSTOMER_LIST_SUCCESS, USER_UPDATE_CUSTOMER_ID,
} from '../actions/loginAction';

import {
  CUSTOMER_PRIVILEGE_CODE_REQUEST, CUSTOMER_PRIVILEGE_CODE_SUCCESS,
  CUSTOMER_PRIVILEGE_CODE_FAILURE, LOAD_SUBSTATION, SET_SUBSTATION,
  USER_HIERARCHY_REQUEST, USER_HIERARCHY_SUCCESS, USER_HIERARCHY_FAILURE,
  OSS_PATH_SUCCESS, USER_KNOWLEDGE_TOKEN_SUCCESS, USER_CALLIN_HOST_SUCCESS
} from '../actions/myAction';

import { getJobBillPermission, getOperateBillPermission, getCommandBillPermission } from '../utils/privilegeHelper'

import Immutable from 'immutable';
import storage from '../utils/storage.js';
import trackApi from '../utils/trackApi';

var defaultState = Immutable.fromJS({
  fromLogin: false, showPrivacyDialog: false,
  hasLogin: null, user: null, isFetching: false,
  isRealUserLogin: null, customerPrivilegeCodes: [],
  uploadUserIconPosting: 0,
  changePartnerPosting: 0,
  isCanSaveUserName: true,
  userHierarchyPath: null,
});
import {
  PHONE_INFO_CHANGED,
  USER_UPDATEPASS_REQUEST, USER_UPDATEPASS_SUCCESS, USER_UPDATEPASS_FAILURE, USER_UPDATEPASS_CLEAN_ERROR,
  TIMEOUT_ALERT, CLEAR_TIMEOUT_ALERT
} from '../actions/myAction';
import { verifyPass } from '../utils';
import { setImageOssPath } from '../containers/fmcs/plantOperation/utils/Utils';
import { DeviceEventEmitter } from "react-native";

//分配三票权限
function assignBillPermission(codes) {
  let billPermission = {}
  billPermission.command = getCommandBillPermission(codes);
  billPermission.operate = getOperateBillPermission(codes);
  billPermission.job = getJobBillPermission(codes);
  return billPermission;
  //return state.set('billPermission',billPermission)
}

function loadOssPath(state, action) {
  let { response } = action;
  setImageOssPath(response);
  storage.setItem("OSSPATH", response.token);
  return state;
}

function loadKnowledgeToken(state, action) {
  let { response } = action;

  storage.setItem("KNOWLEDGETOKEN", response.token);
  return state;
}

function loadCallHost(state, action) {
  let { response } = action;

  storage.setItem("CALLINHOST", response.callInApiHost);
  storage.setItem("KNOWLEDGEHOST", response.knowledgeApiHost);
  return state;
}

function loadUser(state, action, isDemoUser = false) {
  // if(action.response && action.response.Result){
  if (action.response) {
    if (isConnected()) {
      //缓存用户信息
      storage.setUser(JSON.stringify(action.response));
    }
    let dialogShow = false;
    if (action.type === USER_SUCCESS) {
      dialogShow = !action.response.HasAgreePrivacy;
    } else if (action.type === OFFLINE_USER) {
      dialogShow = false;
    } else {
      dialogShow = true;
    }
    return state.merge(Immutable.Map({
      hasLogin: action.type === OFFLINE_USER ? true : null,
      // billPermission:assignBillPermission(action.response.Result.PrivilegeCodes),
      isDemoUser,
      //非token登录，不显示隐私弹出，token登录，隐私有变化，会弹框，使用action判断是哪一种请求
      showPrivacyDialog: dialogShow,//action.type === USER_SUCCESS ? !action.response.Result.HasAgreePrivacy : true,
      user: Immutable.fromJS(action.response),
      // partners:Immutable.fromJS(action.response.Result.ServiceProviders),
      // customerPrivilegeCodes:Immutable.fromJS(action.response.Result.PrivilegeCodes),
      // isRealUserLogin:isDemoUser?false:true,
      // isFetching:false,
      isFetching: true,
      postState: null,
      errCode: null,
    }));
  }
  else {
    return state.merge(Immutable.Map({
      user: false,
      isFetching: false,
      // isRealUserLogin:isDemoUser?false:true,
      error: action.error,
      showPrivacyDialog: false
    }));
  }
}

function loadSelectPartner(state, action) {
  state = state.set('partner', action.partner);
  return state;
}

function updateUserHierarchy(state, action) {
  let { response } = action;
  if (response) {
    return state.set('userHierarchyPath', response);
  }
  return state;
}

function updateUser(state, action) {
  if (action.response && action.response.Result) {
    var user = state.get('user');
    // console.warn('updateUser',user.get('RealName'),action.response.Result.RealName);
    user = user.set('RealName', action.response.Result.RealName);
    state = state.set('user', Immutable.fromJS(action.response.Result));//.set('isFetching',false);
    return state;
  }
}
function updateNewPassword(state, action) {
  // if(action.response && action.response.Result){
  //   state=state.set('postState','success');
  // }
  // return state;
  return state.set('isFetching', false)
    .set('errCode', 'changePasswordDone')
    .set('postState', 'failure');
}

function logout(state, action) {
  console.warn('logout',);
  storage.removeToken();
  storage.removeDeviceId();
  storage.removeCustomerId();
  storage.removeCustomerName();
  // storage.removeItem('USERNAMEKEY');
  return defaultState.set('hasLogin', false).set('fromLogin', false).set('logoutTime', Date.now());
}

function loginSuccess(state, action) {
  var currentToken = null;
  var curCustomerId = 0;
  let jwtToken = null;
  var data = action.response;
  var isDemoUser = false;
  if (data && data.Token) {
    currentToken = data.Token;
    jwtToken = data.apiToken;
    curCustomerId = data.CustomerId;
    var { url } = action;
    if (url.indexOf('demologin') >= 0) {//only way to check demologin
      isDemoUser = true;
    }
    if (state.get('isCanSaveUserName')) {
      ///存储用户名
      saveUserName(data.Name);
    }
    // storage.setItem('USERNAMEKEY',data.Name);
  }
  // action.response.Result.HasAgreePrivacy=false;
  if (currentToken) {
    storage.setToken(currentToken, jwtToken, isDemoUser);
    storage.setCustomerId(String(curCustomerId)).catch(err => { });
    //存储本次登录的用户信息
    storage.setUser(JSON.stringify(data));
  }
  state = state.set('fromLogin', true);
  // console.log('============state' + state);
  // return (action.type !== LOGIN_BY_STAFFNUM_SUCCESS || verifyPass(action.body.Password)) ? loadUser(state,action,isDemoUser) : state;
  return (action.type === LOGIN_BY_PASSWORD_SUCCESS) ? loadUser(state, action, isDemoUser) : state;
}

async function saveUserName(userName) {
  var userNameStr = await storage.getItem('ARRAYUSERNAMESKEY');
  var arrayNames = [];
  if (userNameStr === null || userNameStr === '' || userNameStr.trim().length === 0) {

  } else {
    arrayNames = JSON.parse(userNameStr);
  }
  if (arrayNames.indexOf(userName) === -1) {
    if (arrayNames.length >= 10) {
      arrayNames.pop();
    }
    arrayNames.splice(0, 0, userName);
  }

  var userNameJson = JSON.stringify(arrayNames)
  storage.setItem('ARRAYUSERNAMESKEY', userNameJson);
}

function handleError(state, action) {
  let err = action.error.Error;
  var errCode = null;
  switch (err) {
    case '050001212003':
      // action.error = '原始密码错误';
      action.error = null;
      errCode = 'SrcPassIssure';
      break;
    case '050001212602':
      action.error = '该手机号在系统内未注册';
      errCode = 'MobileNotReg';
      break;
    case '050001212111':
      // action.error = '该手机号在系统内已注册';
      action.error = null;
      errCode = 'MobileAlreadyReg';
      break;
    case '050001212008':
      action.error = '该手机号在系统内未注册';//改回去：用户名输入有误
      errCode = 'UserNameIssure';
      break;
    case '050001212601':
      // action.error = '验证码输入有误'
      action.error = null;
      errCode = 'codeIssure';
      break;
    case '050001212600':
      // action.error = '验证码输入有误';//'验证码已过期，请重新获取';
      action.error = null;
      errCode = 'codeIssure';
      break;
    default:
      action.error = '未知错误';
      break;
  }
  if (err && err.customErrorCode) {
    errCode = err.customErrorCode;
    action.error = null;
  }
  // if (action.type === PHONE_AUTHCODE_FAILURE) {
  //   state = state.setIn(['mobile','submitEnable'],false).
  //                 setIn(['password','submitEnable'],false).
  //                 set('errCode',errCode);
  // }
  state = state.set('isFetching', false)
    .set('errCode', errCode)
    .set('postState', 'failure');
  trackApi.onTrackEvent('App_Login',
    {
      is_success: false,
      fail_reason: action.error || errCode,
      //domain_name:'',
      //client_name:''
    });
  return state;
}

function cleanError(state) {
  return state.set('errCode', null).set('postState', 'posting');
}

function timeout(state) {
  return state.set('timeout', true);
}
function clearTimeout(state) {
  return state.set('timeout', false);
}

function updateCustomerPrivilegeCodes(state, action) {
  let newState = state;
  //newState = newState.set('customerPrivilegeCodes',Immutable.fromJS(action.response.Result));
  return newState;
}

function handleUpdateUserFail(state, action) {
  /**
   * 前缀：020001210

   错误码
   11001   角色ID缺少
   11002  角色不存在
   10007  邮箱错误
   10008  手机格式错误
   10026  手机号码已存在
   10006  用户名不符合规范
   10025  用户名已存在
   19001  授权客户Id缺少
   10028  密码不符合规范,要求至少8个字符,包含特殊符号
   */
  // if(action.error.Error==='05000125510026'){
  //   action.error='手机号码已存在';
  // }else if (action.error.Error==='05000125510008') {
  //   action.error='手机号错误';
  // }
  let err = action.error.Error;
  if (err && err.length > 5) {
    //取后5位错误码
    let postFix = err.substring(err.length - 5);
    switch (postFix) {
      case '11001':
        action.error = '角色ID缺少';
        break;
      case '11002':
        action.error = '角色不存在';
        break;
      case '10007':
        action.error = '邮箱错误';
        break;
      case '10008':
        action.error = '手机格式错误,请先修改手机号';
        break;
      case '10026':
        action.error = '手机号码已存在';
        break;
      case '10006':
        action.error = '用户名不符合规范';
        break;
      case '10025':
        action.error = '用户名已存在';
        break;
      case '19001':
        action.error = '授权客户Id缺少';
        break;
      case '10028':
        action.error = '密码不符合规范,要求至少8个字符,包含特殊符号';
        break;
    }
  }
}

export default function (state = defaultState, action) {
  // console.log('userReducer');
  // console.log(action);
  switch (action.type) {
    case NO_TOKEN:
      return logout(defaultState, action);
    case OFFLINE_USER:
      return loadUser(state, action);
    case USER_REQUEST:
    case USER_UPDATEPASS_REQUEST:
      return state.set('isFetching', true);
    case LOGIN_SAVE_USERNAME:
      return state.set('isCanSaveUserName', action.data);
    case LOGIN_BY_PASSWORD_SUCCESS:
    case LOGIN_SUCCESS:
      return loginSuccess(state, action);
    case USER_SUCCESS:
    case USER_FAILURE:
      return loadUser(state, action);
    case OSS_PATH_SUCCESS:
      return loadOssPath(state, action);
    case USER_KNOWLEDGE_TOKEN_SUCCESS:
      return loadKnowledgeToken(state, action);
    case USER_CALLIN_HOST_SUCCESS:
      return loadCallHost(state, action);
    case USER_UPDATEPASS_FAILURE:
      return handleError(state, action);
    case USER_UPDATE_REQUEST:
      return state.set('updateUserPosting', true);
    case USER_UPDATE_SUCCESS:
      state = state.set('updateUserPosting', false);
      return updateUser(state, action);
    case USER_UPDATE_FAILURE:
      state = state.set('updateUserPosting', false);
      handleUpdateUserFail(state, action);
      return state;
    case USER_UPDATEPASS_SUCCESS:
      return updateNewPassword(state, action);
    case LOGOUT_SUCCESS:
      return logout(defaultState, action);
    case USER_UPDATEPASS_CLEAN_ERROR:
      return cleanError(state);
    case TIMEOUT_ALERT:
      return timeout(state);
    case CLEAR_TIMEOUT_ALERT:
      return clearTimeout(state);

    case AGREE_PRIVACY_REQUEST:
      state = state.set('showPrivacyDialog', false);
      return state;
    case AGREE_PRIVACY_SUCCESS:
      state = state.set('showPrivacyDialog', false);
      return state;
    case AGREE_PRIVACY_FAILURE:
      state = state.set('showPrivacyDialog', true);
      return state;
    case CUSTOMER_PRIVILEGE_CODE_SUCCESS:
      return updateCustomerPrivilegeCodes(state, action);

    case UPLOAD_USER_ICON_REQUEST:
      return state.set('uploadUserIconPosting', 1).set('iconKey', null);
    case UPLOAD_USER_ICON_FAILURE:
      action.error = '上传图片失败';
      return state.set('uploadUserIconPosting', 2);
    case UPLOAD_USER_ICON_SUCCESS:
      return state.set('uploadUserIconPosting', 0).set('iconKey', action.response.Result);

    case CHANGE_PARTNER_REQUEST:
      return state.set('changePartnerPosting', 1);
    case CHANGE_PARTNER_SUCCESS:
      return state.set('changePartnerPosting', 0);
    case CHANGE_PARTNER_FAILURE:
      if (action.error.Error === '050001312905') {
        action.error = '没有数据权限';
      }
      return state.set('changePartnerPosting', 2);
    case LOAD_SELECT_PARTNER:
      return loadSelectPartner(state, action);
    case USER_HIERARCHY_SUCCESS:
      return updateUserHierarchy(state, action);
    case LOAD_SUBSTATION:
    case SET_SUBSTATION:
      return state.set('substation', action.data);

    case CUSTOMER_LIST_SUCCESS:
      return state.setIn(['hasLogin'], true).set('customerList', action.response.List)
    case USER_UPDATE_CUSTOMER_ID:
      return state.setIn(['user', 'CustomerId'], action.data);
    default:

  }
  return state;
}
