
'use strict';

import {
  REG_AUTHCODE_REQUEST, REG_AUTHCODE_SUCCESS, REG_AUTHCODE_FAILURE,
  VALIDE_REG_AUTHCODE_REQUEST, VALIDE_REG_AUTHCODE_SUCCESS, VALIDE_REG_AUTHCODE_FAILURE,
  REG_REQUEST, REG_SUCCESS, REG_FAILURE
} from '../actions/loginAction';
import Immutable from 'immutable';
import trackApi from '../utils/trackApi';

var defaultState = Immutable.fromJS({
  isGetCodePosting: 0,//0成功，1请求中，2失败
  isValidCodePosting: 0,
  isRegPosting: 0,//多了一个4，标识回话过期，需要返回上一步重新获取验证码验证,5表示用户名重复，6表示密码规则有问题
});

function handleError(state, action) {
  let err = action.error.Error;
  let code = err.substr(-5, 5);
  let errorText = null;
  var errCode = null;
  switch (code) {
    case '12111':
    case '10026':
      action.error = '手机号码已存在';
      if (action.type === REG_AUTHCODE_FAILURE) {
        state = state.set('isGetCodePosting', 4);
        action.error = null;
      }
      if (action.type === VALIDE_REG_AUTHCODE_FAILURE) {
        state = state.set('isValidCodePosting', 4);
        action.error = null;
      }
      break;
    case '11002':
      action.error = '角色错误';
      if (action.type === REG_FAILURE) {
        action.error = null;
        state = state.set('isRegPosting', 5);//?
      }
      break;
    case '10025':
      action.error = '用户名已存在';
      if (action.type === REG_FAILURE) {
        action.error = null;
        state = state.set('isRegPosting', 5);
      }
      break;
    case '12601':
      action.error = '验证码错误';
      if (action.type === VALIDE_REG_AUTHCODE_FAILURE) {
        action.error = null;
        state = state.set('isValidCodePosting', 5);
      }
      break;
    case '12600':
      action.error = '验证码已过期，请重新获取';
      if (action.type === REG_FAILURE) {
        state = state.set('isRegPosting', 4);
      }
      if (action.type === VALIDE_REG_AUTHCODE_FAILURE) {
        action.error = null;
        state = state.set('isValidCodePosting', 6);
      }
      break;
    case '10028':
      action.error = '密码强度不足';
      if (action.type === REG_FAILURE) {
        action.error = null;
        state = state.set('isRegPosting', 6);
      }
      break;
    default:

  }
  //暂时显示出错的错误吗
  // action.error=Error;
  return state;
}


export default function (state = defaultState, action) {

  switch (action.type) {
    case REG_AUTHCODE_REQUEST:
      return state.set('isGetCodePosting', 1);
    case REG_AUTHCODE_SUCCESS:
      return state.set('isGetCodePosting', 0);
    case REG_AUTHCODE_FAILURE:
      state = state.set('isGetCodePosting', 2);
      state = handleError(state, action);
      return state;

    case VALIDE_REG_AUTHCODE_REQUEST:
      return state.set('isValidCodePosting', 1);
    case VALIDE_REG_AUTHCODE_SUCCESS:
      return state.set('isValidCodePosting', 0);
    case VALIDE_REG_AUTHCODE_FAILURE:
      state = state.set('isValidCodePosting', 2);
      state = handleError(state, action);
      return state;
    case REG_REQUEST:
      return state.set('isRegPosting', 1);
    case REG_SUCCESS:
      {
        let user_name = action.body.Name;
        trackApi.onTrackEvent('App_RegisterUser',
          {
            is_success: true,
            user_name: String(user_name) || '',
          }
        );
        return state.set('isRegPosting', 0);
      }
    case REG_FAILURE:
      {
        let user_name = action.body.Name;
        trackApi.onTrackEvent('App_RegisterUser',
          {
            is_success: false,
            user_name: String(user_name) || '',
          }
        );
        state = state.set('isRegPosting', 2);
        state = handleError(state, action);
        return state;
      }

    default:

  }
  return state;
}
