'use strict';

import {
  LOAD_FLOOR_SUCCESS,LOAD_FLOOR_FAILURE,LOAD_FLOOR_REQUEST,
} from '../../actions/assetsAction.js';

import Immutable from 'immutable';

let defaultState = Immutable.fromJS({
  isFetching:false,
});


function updateAssetDetailData(state,action) {
  state=state.set('isFetching',false).set('isLogbook',action.response.Result.IsLogbook===1);
  return state;
}

function handleError(state,action) {
  var {Error} = action.error;
  var strError=null;
  switch (Error) {
    case '040001307022':
      strError = '您没有这一项的操作权限，请联系系统管理员';
      action.error=null;
      break;
    case '040000307009':
      strError = '无查看资产权限，联系管理员';
      action.error=null;
      break;
  }
  if (action.error==='403') {
    action.error=Error;
    strError='';
  }
  return state.set('isFetching',false).set('errorMessage',strError);
}


export default function(state=defaultState,action){
  switch (action.type) {
    case LOAD_FLOOR_REQUEST:
      return state.set('isFetching',true);
    case LOAD_FLOOR_SUCCESS:
      return updateAssetDetailData(state,action);
    case LOAD_FLOOR_FAILURE:
      state=state.set('isFetching',false);
      return handleError(state,action);
    default:

  }
  return state;
}
