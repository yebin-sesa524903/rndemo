'use strict';


import {
  STATISTICS_REQUEST, STATISTICS_SUCCESS, STATISTICS_FAILURE,
  STATISTICS_RESET,
} from '../actions/myAction.js';

import { LOGOUT_SUCCESS } from '../actions/loginAction';

import Immutable from 'immutable';


var defaultState = Immutable.fromJS({
  isFetching: false,
  data: null,
  alarmFirstId: null,
});

function dataLoaded(state, action) {
  var objData = action.response.Result;
  return state.set('data', Immutable.fromJS(objData));
}

function handleError(state, action) {
  let err = action.error.Error;
  switch (err) {
    case '040001307022':
      action.error = '您没有这一项的操作权限，请联系系统管理员';
      break;
    case '050001251009'://009是没有数据权限， 501是报警设备移除
    case '050001251501':
      action.error = '抱歉，您没有查看该报警权限';
      break;
  }
  return defaultState;
}

export default function (state = defaultState, action) {

  switch (action.type) {
    case STATISTICS_REQUEST:
      return state.set('isFetching', true);
    case STATISTICS_SUCCESS:
      return dataLoaded(state, action);
    case STATISTICS_FAILURE:
      return handleError(state, action);
    case STATISTICS_RESET:
    case LOGOUT_SUCCESS:
      return defaultState;
    default:

  }
  return state;
}
