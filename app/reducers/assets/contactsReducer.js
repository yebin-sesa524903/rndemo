'use strict';

import {
  CONTACTS_LOAD_REQUEST,CONTACTS_LOAD_SUCCESS,CONTACTS_LOAD_FAILURE,
} from '../../actions/assetsAction.js';

import Immutable from 'immutable';
import {Map} from 'immutable';

var defaultState = Immutable.fromJS({
  data:Map(),//定义为数组，是为了方面后面如果配电室，配电柜，设备也要显示负责人使用
});

function loadRequest(state,action) {
  var {hierarchyId} = action;
  let data=state.get('data');
  let item=data.get(hierarchyId);
  if(item){
    item=item.set('isFetching',true);
    data=data.set(hierarchyId,item);
  }else{
    data=data.set(hierarchyId,Immutable.fromJS({isFetching:true,error:null}))
  }
  state=state.set('data',data);
  return state;
}

function updateData(state,action) {
  var {hierarchyId} = action;
  let data=state.get('data');
  let item=Immutable.fromJS({isFetching:false,error:null,contacts:action.response.Result});
  data=data.set(hierarchyId,item);
  state=state.set('data',data);
  return state;
}

function handleError(state,action) {
  var {hierarchyId} = action;
  var {Error} = action.error;
  let data=state.get('data');
  data=data.setIn([hierarchyId,'isFetching'],false);
  // if(Error==="040001307022"){
  //   //没有权限  无功能权限
  //   data=data.setIn([hierarchyId,'error'],'无功能权限');
  //   action.error=null;
  // }
  state=state.set('data',data);
  return state;
}

export default function(state=defaultState,action){

  switch (action.type) {
    case CONTACTS_LOAD_REQUEST:
      // return state.set('isFetching',true);
      return loadRequest(state,action);
    case CONTACTS_LOAD_SUCCESS:
      return updateData(state,action);
    case CONTACTS_LOAD_FAILURE:
      return handleError(state,action);
    default:
  }
  return state;
}
