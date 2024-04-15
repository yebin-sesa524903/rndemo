'use strict';


import {
  MONITION_LOAD_BYID_REQUEST,
  MONITION_LOAD_BYID_SUCCESS,
  MONITION_LOAD_BYID_FAILURE,
  MONITION_RESET,
} from '../../actions/monitionAction';

import {LOGOUT_SUCCESS} from '../../actions/loginAction.js';

import Immutable from 'immutable';


var defaultState = Immutable.fromJS({
  isFetching:false,
  data:null,
  alarmFirstId:null,
});

function alarmLoaded(state,action) {
  var {data:{alarmId}} = action;

  return state.set('data',Immutable.fromJS({}));
}

function handleError(state,action) {
  var {Error} = action.error;
  switch (Error) {

  }
  return defaultState;
}

export default function(state=defaultState,action){

  switch (action.type) {
    case MONITION_LOAD_BYID_REQUEST:
      return state.set('isFetching',true);
    case MONITION_LOAD_BYID_SUCCESS:
      return alarmLoaded(state,action);
    case MONITION_LOAD_BYID_FAILURE:
      return handleError(state,action);
    case MONITION_RESET:
    case LOGOUT_SUCCESS:
      return defaultState;
    default:

  }
  return state;
}
