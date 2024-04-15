'use strict';

import {
  ASSET_TENDING_REQUEST,
  ASSET_TENDING_SUCCESS,
  ASSET_TENDING_FAILURE,
  ASSET_TICKETING_REQUEST,ASSET_TICKETING_SUCCESS,ASSET_TICKETING_FAILURE
} from '../../actions/assetsAction.js';

import Immutable from 'immutable';

var defaultState = Immutable.fromJS({
  data:null,
  isFetching:false,
  hierarchyId:null,
  pageCount:0,
  filter:{
    AssetTaskType:1,
    CurrentPage:1,
  }
});

function updateData(state,action,isTicketing) {
  var {hierarchyId} = action;
  if(isTicketing){
    hierarchyId=action.body.hierarchyId;
  }
  var response = isTicketing?action.response.Result.Items:action.response.Result;
  if(isTicketing){
    state=state.set('pageCount',action.response.Result.PageCount);
    //添加一个字段标识是否工单是否已完成
    if(response){
      response.forEach(item=>{
        item.unDone=true
      });
    }
    let currentPage=action.body.CurrentPage;
    if(currentPage===1){
      state=state.set('data',Immutable.fromJS(response));
    }else{
      let data=state.get('data');
      if(data){
        data=data.push(...(Immutable.fromJS(response).toArray()));
      }
      state=state.set('data',data);
    }
  }else{
    state=state.set('data',Immutable.fromJS(response));
  }
  var newState = state;
  newState=newState.set('hierarchyId',hierarchyId)
                   .set('isFetching',false);

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

export default function(state=defaultState,action){
  switch (action.type) {
    case ASSET_TENDING_REQUEST:
    case ASSET_TICKETING_REQUEST:
      return state.set('isFetching',true);
    case ASSET_TENDING_SUCCESS:
      return updateData(state,action,false);
    case ASSET_TICKETING_SUCCESS:
      return updateData(state,action,true);
    case ASSET_TENDING_FAILURE:
    case ASSET_TICKETING_FAILURE:
      return handleError(state,action);
    default:

  }
  return state;
}
