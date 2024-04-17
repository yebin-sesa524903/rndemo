'use strict';

import Immutable from 'immutable';

import {
  LOGIN_INFO_CHANGED, AUTHCODE_SUCCESS, COUNTER_CHANGED,
  LOGIN_INFO_RESET,
  LOGOUT_SUCCESS,
  AUTHCODE_FAILURE, LOGIN_FAILURE, LOGIN_REQUEST, LOGIN_SUCCESS,
  LOGIN_BY_PASSWORD_SUCCESS,
  LOGIN_VERIFICODE_REQUEST, LOGIN_VERIFICODE_SUCCESS, LOGIN_VERIFICODE_FAILURE,
  RESET_PASSWORD_REQUEST, RESET_PASSWORD_SUCCESS, REG_AUTHCODE_FAILURE, RESET_PASSWORD_FAILURE
} from '../actions/loginAction';

import { compose } from 'redux';
import storage from '../utils/storage.js';
import { verifyPass } from '../utils';
import trackApi from '../utils/trackApi';


var defaultState = Immutable.fromJS({
  password: {
    userName: '',
    password: '',
    submitEnable: false,
    isFetching: false,
    verifiCode: null,
    inputVeriCode: '',
    host: ''
  },
  mobile: {
    phoneNumber: '',
    validCode: '',
    counter: '',
    submitEnable: false,
    senderEnable: false,
    isFetching: false,
    host: ''
  },
  errCode: null,
  emailResetPosting: 0
});

function infoChanged(state, action) {
  var { data: { type, input, value } } = action;
  if (type === 'mobile') {
    return mobileInfoChanged(state, action);
  }
  else {
    return passwordInfoChanged(state, action);
  }
}

function setHost(state, host) {
  //保存编辑的host
  if (!host) host = '';
  storage.setOssBucket(host).then();

  return state.setIn(['mobile', 'host'], host).setIn(['password', 'host'], host);
}

function infoReset(state, action) {
  var { data: { type } } = action;
  // console.warn('infoChanged...',action);
  if (type === 'resetname') {
    state = state.set('errCode', null).
      // setIn(['password','userName'],'').
      setIn(['password', 'password'], '').
      setIn(['password', 'inputVeriCode'], '').
      setIn(['password', 'submitEnable'], false);
  } else if (type === 'resetpassword') {
    state = state.set('errCode', null).
      setIn(['password', 'password'], '').
      setIn(['password', 'submitEnable'], false);
  } else if (type === 'resetphone') {
    state = state.set('errCode', null).
      setIn(['mobile', 'phoneNumber'], '').
      setIn(['mobile', 'senderEnable'], false).
      setIn(['mobile', 'submitEnable'], false).
      setIn(['password', 'submitEnable'], false).
      setIn(['password', 'userName'], '').
      setIn(['password', 'password'], '');
  } else if (type === 'resetCode') {
    state = state.set('errCode', null).
      setIn(['mobile', 'validCode'], '').
      setIn(['mobile', 'senderEnable'], true).
      setIn(['mobile', 'submitEnable'], false).
      setIn(['mobile', 'counter'], '');
  } else if (type === 'resetPassCode') {
    state = state.set('errCode', null).
      setIn(['password', 'inputVeriCode'], '').
      setIn(['password', 'submitEnable'], false);
  } else if (type === 'clean') {
    storage.removeToken();
  }
  return state;
}

function phoneNumberSetter(state, value) {
  return state.setIn(['mobile', 'phoneNumber'], value);
}

function validCodeSetter(state, value) {
  return state.setIn(['mobile', 'validCode'], value);
}

function counterSetter(state) {
  var phoneNumber = state.getIn(['mobile', 'phoneNumber']);
  if (!phoneNumber) {
    return state.setIn(['mobile', 'counter'], '');
  }
  return state;
}

function senderButtonSetter(state) {
  var counter = state.getIn(['mobile', 'counter']);
  let host = state.getIn(['mobile', 'host']);
  if (counter === '') {
    var phoneNumber = state.getIn(['mobile', 'phoneNumber']);
    var enable = false;
    var strPhone = String(phoneNumber);
    if (/\d{11}/.test(phoneNumber) && strPhone.length === 11) {
      enable = true;
    }
    if (!host || host.trim().length === 0) enable = false;
    return state.setIn(['mobile', 'senderEnable'], enable);
  }
  return state;
}

function submitButtonSetter(state) {
  var phoneNumber = state.getIn(['mobile', 'phoneNumber']);
  var validCode = state.getIn(['mobile', 'validCode']);
  let host = state.getIn(['mobile', 'host']);
  if (phoneNumber && validCode && validCode.length >= 4 && (host && host.trim().length > 0)) {
    return state.setIn(['mobile', 'submitEnable'], true);
  }
  else {
    return state.setIn(['mobile', 'submitEnable'], false);
  }
}

function mobileInfoChanged(state, action) {
  var { data: { input, value } } = action;

  if (input === 'phoneNumber') {
    return compose(submitButtonSetter, senderButtonSetter,
      counterSetter, phoneNumberSetter)(state, value);
  } else if (input === 'host') {
    state = setHost(state, value);
    return compose(submitButtonSetter, senderButtonSetter)(state, value);
  }
  else {
    return compose(submitButtonSetter, validCodeSetter)(state, value);
  }

}

function passwordInfoChanged(state, action) {
  var { data: { input, value } } = action;
  var returnState = state;

  if (input === 'userName') {
    returnState = returnState.setIn(['password', 'userName'], value);
  } else if (input === 'host') {
    returnState = setHost(returnState, value);
  }
  else if (input === 'inputVeriCode') {
    returnState = returnState.setIn(['password', 'inputVeriCode'], value);
  }
  else {
    returnState = returnState.setIn(['password', 'password'], value);
  }
  returnState = returnState.set('errCode', null);
  var userName = returnState.getIn(['password', 'userName']);
  var password = returnState.getIn(['password', 'password']);
  var inputVeriCode = returnState.getIn(['password', 'inputVeriCode']);
  let host = returnState.getIn(['password', 'host'])
  if (userName && password && inputVeriCode) {
    returnState = returnState.setIn(['password', 'submitEnable'], true);
  }
  else {
    returnState = returnState.setIn(['password', 'submitEnable'], false);
  }

  return returnState;

}

function sendVerifyCode(state, action) {
  var response = action.response;
  if (!response) {
    return state;
  }
  if (!response.Id && response.Result) {
    response = response.Result;
  }
  return state.setIn(['password', 'verifiCode'], Immutable.fromJS(response));
}

const COUNTER = 60;

function sendAuthCode(state, action) {
  return state.
    setIn(['mobile', 'counter'], COUNTER).
    setIn(['mobile', 'senderEnable'], false);
}

function countDown(state, action) {
  var counter = parseInt(state.getIn(['mobile', 'counter']));
  if (counter === 1) {
    counter = '';
  }
  else {
    counter--;
  }
  var newState = state;
  newState = newState.setIn(['mobile', 'counter'], counter);
  if (!counter) {
    newState = newState.setIn(['mobile', 'senderEnable'], true);
  }

  return newState;

}

function handleResetError(state, action) {
  let err = action.error.Error;
  state = state.set('emailResetPosting', 2);
  switch (err) {
    case '050001312008'://用户名不存在
    case '050001312101'://邮箱不匹配
    case '050001312019'://邮箱不存在
    case '060001212020'://邮箱对应多个账号
      action.error = null;
      state = state.set('resetErrorCode', err);
      break;
    default:
      state = state.set('resetErrorCode', null);
      return state;
  }
  return state;
}

function handleError(state, action) {
  var err = action.error.Error;
  console.warn('loginhandleError', action);
  var errCode = null;
  switch (err) {
    case '050001212602':
      action.error = '该手机号在系统内未注册';
      break;
    case '050001212008':
      action.error = null;
      errCode = 'UserNameIssure';
      break;
    case '25510001':
      action.error = null;
      errCode = 'UserNameIssure';
      break;
    case '25510023':
      action.error = null;
      errCode = 'UserLoginParamIssure';
      break;
    case '25510032':
      action.error = null;
      errCode = 'UserPasswordIssure';
      break;
    case '050001212003':
      action.error = null;
      errCode = 'UserPasswordIssure';
      break;
    case '050001212601':
      action.error = '验证码输入有误'
      break;
    case '050001212600':
      action.error = '验证码已过期，请重新获取';
      break;
    case '050001212605':
      action.error = null;
      errCode = 'paddwordVerifiCodeError';//localStr('您输入的验证码有误！')
      break;
    default:

  }
  if (err && err.customErrorCode) {
    errCode = err.customErrorCode;
    action.error = null;
  }
  // console.warn('action',action);
  var newState = fetching(state, false);
  if (action.type === LOGIN_FAILURE) {
    newState = newState.set('errCode', errCode);
    newState = newState.
      setIn(['mobile', 'submitEnable'], true).
      setIn(['password', 'submitEnable'], true)
  } else if (action.type === AUTHCODE_FAILURE) {
    // newState = newState.set('errCode',errCode);
    // newState = newState.
    //               setIn(['mobile','submitEnable'],false).
    //               setIn(['password','submitEnable'],false).
    //               set('errCode',errCode);
  } else if (action.type === LOGIN_VERIFICODE_FAILURE) {
    newState = newState.
      setIn(['mobile', 'submitEnable'], false).
      setIn(['password', 'inputVeriCode'], '').
      setIn(['password', 'submitEnable'], false).
      set('errCode', errCode);
  }
  //登录失败
  let reason = action.error || errCode;
  if (reason === 'UserNameIssure') reason = '用户名或密码错误';

  if (reason === 'paddwordVerifiCodeError') reason = '验证码有误';
  trackApi.onTrackEvent('App_Login',
    {
      is_success: false,
      fail_reason: String(reason),
      //domain_name:'',
      //client_name:''
    });
  return newState;
}

function fetching(state, val) {
  return state.
    setIn(['mobile', 'isFetching'], val).
    setIn(['password', 'isFetching'], val);
}

function handleRequest(state, action) {
  return fetching(state, true).
    set('errCode', null);
}


export default function (state = defaultState, action) {
  switch (action.type) {
    case LOGIN_INFO_CHANGED:
      return infoChanged(state, action);
    case LOGIN_INFO_RESET:
      return infoReset(state, action);
    case AUTHCODE_SUCCESS:
      return sendAuthCode(state, action);
    case COUNTER_CHANGED:
      return countDown(state, action);
    case AUTHCODE_FAILURE:
    case LOGIN_FAILURE:
    case LOGIN_VERIFICODE_FAILURE:
      state = state.set('verifyCodePosting', 2)
      if (action.data && action.data.isValid) {
        action.error = null;
        return state;
      }
      return handleError(state, action);
    case LOGIN_REQUEST:
      return handleRequest(state, action);
    case LOGIN_VERIFICODE_REQUEST:
      return state.set('verifyCodePosting', 0);
    case LOGIN_VERIFICODE_SUCCESS:
      state = state.set('verifyCodePosting', 1)
      return sendVerifyCode(state, action);
    case LOGIN_BY_PASSWORD_SUCCESS:
      if (!verifyPass(state.getIn(['password', 'password']))) {
        return compose(submitButtonSetter, handleError)(state, {
          type: LOGIN_FAILURE,
          error: {
            Error: {
              customErrorCode: 'mustChangePassword'
            }
          }
        });
      } else {
        return setHost(defaultState, state.getIn(['password', 'host']));
      }
    case LOGIN_SUCCESS:
      return setHost(defaultState, state.getIn(['password', 'host']));
    case LOGOUT_SUCCESS:
      return setHost(defaultState, state.getIn(['password', 'host']));
    case RESET_PASSWORD_REQUEST:
      return state.set('emailResetPosting', 1);
    case RESET_PASSWORD_FAILURE:
      return handleResetError(state, action);
    case RESET_PASSWORD_SUCCESS:
      return state.set('emailResetPosting', 0);
    default:

  }
  return state;
}
