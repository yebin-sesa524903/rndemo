'use strict';

import {
  LOGBOOK_OCR_REQUEST,
  LOGBOOK_OCR_SUCCESS,
  LOGBOOK_OCR_FAILURE
} from '../../actions/assetsAction.js';
import {commonReducer} from '../commonReducer.js';


import Immutable from 'immutable';

var defaultState = Immutable.fromJS({
  data:null,
  isFetching:false,
});

function updateData(state,action) {
  var response = action.response.Result;
  var newState = state;
  newState = newState.set('data',Immutable.fromJS(response)).set('isFetching',false);
  return newState;
}

function handleError(state,action) {
  var {Error} = action.error;
  // console.warn('handleError',action);

  switch (Error) {
    case '040001307022':
      action.error = '您没有这一项的操作权限，请联系系统管理员';
      state=state.set('data',Immutable.fromJS([]));
      break;
  }
  return state.set('isFetching',false);
}

export default commonReducer((state,action)=>{

  switch (action.type) {
    case LOGBOOK_OCR_REQUEST:
      return state.set('isFetching',true).set('data',null);
    case LOGBOOK_OCR_SUCCESS:
      return updateData(state,action);
    case LOGBOOK_OCR_FAILURE:
      return handleError(state,action);
    default:

  }
  return state;
},defaultState);
