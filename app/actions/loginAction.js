'use strict';

import storage from '../utils/storage.js';

import { NativeModules, Platform } from 'react-native'

export const NO_TOKEN = 'NO_TOKEN';
export const USER_REQUEST = 'USER_REQUEST';
export const USER_SUCCESS = 'USER_SUCCESS';
export const USER_FAILURE = 'USER_FAILURE';
export const OFFLINE_USER = 'OFFLINE_USER';
export const LOAD_SELECT_PARTNER = 'LOAD_SELECT_PARTNER';

export function setPartner(partner) {
  return (dispatch, getState) => {
    storage.setItem('partner', partner);
    return dispatch({
      type: LOAD_SELECT_PARTNER,
      partner
    })
  }
}

async function getStorageToken(cb) {
  let value = await storage.getToken();
  cb(value);
  return value;
}

export function loadUser() {
  return (dispatch, getState) => {
    //提前做处理
    if (Platform.OS === 'ios') {
      NativeModules.REMAppInfo.clearCookie();
    }
    getStorageToken(async (value) => {
      if (!value) {
        return dispatch({
          type: NO_TOKEN,
        });
      }
      if (!isConnected()) {
        storage.getUser(async user => {
          user = JSON.parse(user);
          user.CustomerId = await storage.getCustomerId();
          return dispatch({ type: OFFLINE_USER, response: user });
        });
        return;
      }
      await storage.getItem('partner', value => {
        console.warn('partner', value);
        dispatch({
          type: LOAD_SELECT_PARTNER,
          partner: value
        })
      });

      return dispatch({
        types: [USER_REQUEST, USER_SUCCESS, USER_FAILURE],
        url: '/bff/xiot/rest/user/current',
        body: { 'none': null }
      });
    });

  }
}

export const CUSTOMER_LIST_REQUEST = 'CUSTOMER_LIST_REQUEST';
export const CUSTOMER_LIST_SUCCESS = 'CUSTOMER_LIST_SUCCESS';
export const CUSTOMER_LIST_FAILURE = 'CUSTOMER_LIST_FAILURE';

export function loadCustomerList(customerName = '') {
  return (dispatch, getState) => {
    return dispatch({
      types: [CUSTOMER_LIST_REQUEST, CUSTOMER_LIST_SUCCESS, CUSTOMER_LIST_FAILURE],
      url: '/bff/comp-auth/rest/getMyCustomerList?customerName=' + customerName,
    });
  }
}

export const USER_UPDATE_CUSTOMER_ID = 'USER_UPDATE_CUSTOMER_ID';
export function updateUserCustomerId(id) {
  return (dispatch) => {
    return dispatch({
      type: USER_UPDATE_CUSTOMER_ID,
      data: id
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

export const UPLOAD_USER_ICON_REQUEST = 'UPLOAD_USER_ICON_REQUEST';
export const UPLOAD_USER_ICON_SUCCESS = 'UPLOAD_USER_ICON_SUCCESS';
export const UPLOAD_USER_ICON_FAILURE = 'UPLOAD_USER_ICON_FAILURE';

export function uploadUserIcon(userId, icon) {
  return (dispatch, getState) => {
    return dispatch({
      types: [UPLOAD_USER_ICON_REQUEST, UPLOAD_USER_ICON_SUCCESS, UPLOAD_USER_ICON_FAILURE],
      url: '/popapi/api/user/profile/avatar/upload',
      body: {
        id: userId,
        file: icon
      }
    });
  }
}

export const LOGIN_INFO_CHANGED = 'LOGIN_INFO_CHANGED';

export function loginInfoChanged(data) {
  return (dispatch, getState) => {
    return dispatch({
      type: LOGIN_INFO_CHANGED,
      data
    });
  }
}

export const LOGIN_INFO_RESET = 'LOGIN_INFO_RESET';

export function resetLoginItem(data) {
  return (dispatch, getState) => {
    return dispatch({
      type: LOGIN_INFO_RESET,
      data
    });
  }
}

export const LOGIN_REQUEST = 'LOGIN_REQUEST';
export const LOGIN_BY_PASSWORD_SUCCESS = 'LOGIN_BY_PASSWORD_SUCCESS';
export const LOGIN_FAILURE = 'LOGIN_FAILURE';

export function loginByPassword(body) {
  return (dispatch, getState) => {
    return dispatch({
      types: [LOGIN_REQUEST, LOGIN_BY_PASSWORD_SUCCESS, LOGIN_FAILURE],
      url: `/bff/xiot/rest/mobile/login`,
      body
    });

  }
}

///是否保存用户名
export const LOGIN_SAVE_USERNAME = 'LOGIN_SAVE_USERNAME';
export function loginSaveUserName(data) {
  return (dispatch, getState) => {
    return dispatch({
      type: LOGIN_SAVE_USERNAME,
      data
    });

  }
}

export const LOGIN_SUCCESS = 'LOGIN_SUCCESS';
export function loginByPhone(body) {
  return (dispatch, getState) => {
    return dispatch({
      types: [LOGIN_REQUEST, LOGIN_SUCCESS, LOGIN_FAILURE],
      url: `/popapi/api/user/authlogin`,
      body
    });
  }
}

export function demoLogin() {
  return (dispatch, getState) => {
    return dispatch({
      types: [LOGIN_REQUEST, LOGIN_SUCCESS, LOGIN_FAILURE],
      url: `/popapi/api/`,
      body: {}
    });
  }
}

export const LOGIN_VERIFICODE_REQUEST = 'LOGIN_VERIFICODE_REQUEST';
export const LOGIN_VERIFICODE_SUCCESS = 'LOGIN_VERIFICODE_SUCCESS';
export const LOGIN_VERIFICODE_FAILURE = 'LOGIN_VERIFICODE_FAILURE';
export function getVerificationCode(isValid) {
  return (dispatch, getState) => {
    return dispatch({
      types: [LOGIN_VERIFICODE_REQUEST, LOGIN_VERIFICODE_SUCCESS, LOGIN_VERIFICODE_SUCCESS],
      url: `/lego-bff/healthz`,
      data: { isValid }
    });
  }
}

export const AUTHCODE_REQUEST = 'AUTHCODE_REQUEST';
export const AUTHCODE_SUCCESS = 'AUTHCODE_SUCCESS';
export const AUTHCODE_FAILURE = 'AUTHCODE_FAILURE';

export function getAuthCode(telephone) {
  return (dispatch, getState) => {
    return dispatch({
      types: [AUTHCODE_REQUEST, AUTHCODE_SUCCESS, AUTHCODE_FAILURE],
      url: `/popapi/api/user/generateauthcode/${telephone}`,
      body: {}
    });
  }
}

export const REG_AUTHCODE_REQUEST = 'REG_AUTHCODE_REQUEST';
export const REG_AUTHCODE_SUCCESS = 'REG_AUTHCODE_SUCCESS';
export const REG_AUTHCODE_FAILURE = 'REG_AUTHCODE_FAILURE';

export function getRegAuthCode(telephone) {
  return (dispatch, getState) => {
    return dispatch({
      types: [REG_AUTHCODE_REQUEST, REG_AUTHCODE_SUCCESS, REG_AUTHCODE_FAILURE],
      url: `/popapi/api/user/regauthcode`,
      body: {
        mobile: telephone
      }
    });
  }
}

export const VALIDE_REG_AUTHCODE_REQUEST = 'VALIDE_REG_AUTHCODE_REQUEST';
export const VALIDE_REG_AUTHCODE_SUCCESS = 'VALIDE_REG_AUTHCODE_SUCCESS';
export const VALIDE_REG_AUTHCODE_FAILURE = 'VALIDE_REG_AUTHCODE_FAILURE';
export function valideRegAuthCode(phone, code) {
  return (dispatch, getState) => {
    return dispatch({
      types: [VALIDE_REG_AUTHCODE_REQUEST, VALIDE_REG_AUTHCODE_SUCCESS, VALIDE_REG_AUTHCODE_FAILURE],
      url: `/popapi/api/user/validateregauthcode`,
      body: {
        mobile: phone,
        code
      }
    });
  }
}

export const REG_REQUEST = 'REG_REQUEST';
export const REG_SUCCESS = 'REG_SUCCESS';
export const REG_FAILURE = 'REG_FAILURE';
export function reg(phone, code, name, email, password) {
  return (dispatch, getState) => {
    return dispatch({
      types: [REG_REQUEST, REG_SUCCESS, REG_FAILURE],
      url: `/popapi/api/user/reg`,
      body: {
        Telephone: phone,
        AuthCode: code,
        Name: name,
        Email: email,
        Password: password
      }
    });
  }
}

export const RESET_PASSWORD_REQUEST = 'RESET_PASSWORD_REQUEST';
export const RESET_PASSWORD_SUCCESS = 'RESET_PASSWORD_SUCCESS';
export const RESET_PASSWORD_FAILURE = 'RESET_PASSWORD_FAILURE';
export function resetPassword(name, email, affirm) {
  console.warn('affirm', affirm);
  return (dispatch, getState) => {
    return dispatch({
      types: [RESET_PASSWORD_REQUEST, RESET_PASSWORD_SUCCESS, RESET_PASSWORD_FAILURE],
      url: `/popapi/api/user/ResetPassword/Email`,
      body: {
        userName: name,
        email: email,
        isSure: affirm ? 1 : 0
      }
    });
  }
}

export const COUNTER_CHANGED = 'COUNTER_CHANGED';
export function countDown() {
  return (dispatch, getState) => {
    return dispatch({
      type: COUNTER_CHANGED
    });
  }
}

export const LOGOUT_REQUEST = 'LOGOUT_REQUEST';
export const LOGOUT_SUCCESS = 'LOGOUT_SUCCESS';
export const LOGOUT_FAILURE = 'LOGOUT_FAILURE';

export function logout() {
  storage.removeItem('partner')
  storage.removeItem('substation')
  return (dispatch, getState) => {
    //从缓存里面取出信息
    storage.getUser(user => {
      let _user = JSON.parse(user);
      let id = null;
      if (_user && _user.Result) {
        id = _user.Result.Id;
      }
      return dispatch({
        types: [LOGOUT_SUCCESS, LOGOUT_SUCCESS, LOGOUT_FAILURE],
        url: `/bff/xiot/rest/mobile/logout`,
        body: {
          userId: id
        }
      });
    });
  }
}

export const AGREE_PRIVACY_REQUEST = 'AGREE_PRIVACY_REQUEST';
export const AGREE_PRIVACY_SUCCESS = 'AGREE_PRIVACY_SUCCESS';
export const AGREE_PRIVACY_FAILURE = 'AGREE_PRIVACY_FAILURE';

export function agreePrivacy(userId) {
  return (dispatch, getState) => {
    return dispatch({
      types: [AGREE_PRIVACY_REQUEST, AGREE_PRIVACY_SUCCESS, AGREE_PRIVACY_FAILURE],
      url: `/popapi/api/user/setprivacy/${userId}`
    });
  }
}

export const CHANGE_PARTNER_REQUEST = 'CHANGE_PARTNER_REQUEST';
export const CHANGE_PARTNER_SUCCESS = 'CHANGE_PARTNER_SUCCESS';
export const CHANGE_PARTNER_FAILURE = 'CHANGE_PARTNER_FAILURE';
export function changePartner(spid) {
  return (dispatch, getState) => {
    return dispatch({
      types: [CHANGE_PARTNER_REQUEST, CHANGE_PARTNER_SUCCESS, CHANGE_PARTNER_FAILURE],
      url: `/bff/comp-auth/rest/ChangeServiceProvider/${spid}`,
      partner: spid
    });
  }
}
