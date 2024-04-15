'use strict';

import {
  ASSET_LOGS_REQUEST,
  ASSET_LOGS_SUCCESS,
  ASSET_LOGS_FAILURE,
  ASSET_LOG_SAVE_SUCCESS,
  ASSET_LOG_DELETE_SUCCESS,
} from '../../actions/assetsAction.js';

import {LOGOUT_SUCCESS} from '../../actions/loginAction.js';

import Immutable from 'immutable';

var defaultState = Immutable.fromJS({
  data:null,
  isFetching:false,
  hierarchyId:null
});

function updateData(state,action) {
  var {hierarchyId} = action;
  var response = action.response.Result;
  // console.warn('response',response);

  if(response === null){ //API return null for empty list
    response = [];
  }
  response.forEach((item)=>{
    item.Pictures = item.ScenePictures;
    delete item.ScenePictures;
    item.Pictures.forEach((item1)=>{
      item1.PictureId = item1.ScenePictureId;
    })
  })
  // console.warn('response',response);
  return state.set('data',Immutable.fromJS(response)).
               set('hierarchyId',hierarchyId).
               set('isFetching',false);
}


function mergeLog(state,action) {
  return state.set('data',null);
}


function handleError(state,action) {
  // var {Result} = action.error;
  // if(!Result){
  //   action.error = '无相关权限';
  // }

  return state.set('isFetching',false);
}




export default function(state=defaultState,action){

  switch (action.type) {
    case ASSET_LOGS_REQUEST:
      return state.set('isFetching',true);
    case ASSET_LOGS_SUCCESS:
      return updateData(state,action);
    case ASSET_LOGS_FAILURE:
      return handleError(state,action);
    case ASSET_LOG_SAVE_SUCCESS:
    case ASSET_LOG_DELETE_SUCCESS:
      return mergeLog(state,action);
    case LOGOUT_SUCCESS:
      return defaultState;
    default:

  }
  return state;
}
