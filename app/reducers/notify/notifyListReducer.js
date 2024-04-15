'use strict';


import {
  NOTIFY_LOAD_SUCCESS,
  NOTIFY_LOAD_REQUEST,
  NOTIFY_LOAD_FAILURE,
  NOTIFY_UPDATE_UNREAD_REQUEST,
  NOTIFY_UPDATE_UNREAD_FAILURE,
  NOTIFY_UPDATE_UNREAD_SUCCESS
} from '../../actions/notifyAction.js';
import {CHANGE_PARTNER_SUCCESS} from '../../actions/loginAction'
// import {LOGOUT_SUCCESS} from '../../actions/loginAction.js';
import {commonReducer} from '../commonReducer.js';

import Immutable from 'immutable';


var defaultState = Immutable.fromJS({
  currentIndex:0,
  data:null,
  pageCount:0,
  isFetching:false,
  sectionData:null,
  allDatas:null,
  isContrainUnresolvedAlarm:false,
});

function clearResult(state,action) {
  let newState=state;
  newState=newState.set('data',null);
  return newState;
}

function mergeData(state,action) {
  var response = action.response.Result;
  var newState = state;
  var page = action.body.pageIndex;

  var items = response.Items;
  if (items===null) {
    items = [];
  }
  if(page === 1){
    newState = newState.set('data',Immutable.fromJS(items));
  }
  else {
    var oldData = newState.get('data');
    var newList = Immutable.fromJS(items);
    newList = oldData.push(...newList.toArray());
    newState = newState.set('data',newList);
  }

  newState = newState.set('pageCount',response.PageCount);
  newState = newState.set('isFetching',false);
  newState = updateUnReadCount(newState)
  return newState;
}

function updateUnReadCount(state) {
  let data = state.get('data')
  let count = 0;
  if(data && data.size > 0) {
    data.forEach(item => {
      if(item.get('unread')) {
        count +=1;
      }
    })
  }
  return state.set('count',count);
}

function updateUnread(state,action) {
  let data = state.get('data')
  if(data && data.size > 0) {
    let findIndex = data.findIndex(item => item.get('id') === action.body.id)
    if(findIndex >= 0){
      data = data.setIn([findIndex,'unread'],false);
      state = state.set('data',data);
      state = updateUnReadCount(state)
    }
  }
  return state;
}

function handleError(state,action) {
  var {Error,Message} = action.error;
  // console.warn('handleError',action);

  switch (Error) {
    case '040001307022':
      action.error = '您没有这一项的操作权限，请联系系统管理员';
      state=state.set('data',Immutable.fromJS([]));
      break;

    default:
      if(Error !== '-1') action.error = Message;
      break;
  }
  return state.set('isFetching',false).set('sectionData',null).set('allDatas',null);
}

export default commonReducer((state,action)=>{

  switch (action.type) {
    // case ALARM_FILTER_DIDCHANGED:
    //   return state;//state.set('isFetching',true);
    case NOTIFY_LOAD_REQUEST:
      return state.set('isFetching',true);
    case NOTIFY_LOAD_SUCCESS:
      return mergeData(state,action);
    // case NOTIFY_FILTER_CLEAR_RESULT:
    //   return clearResult(state,action);
    case NOTIFY_LOAD_FAILURE:
      return handleError(state,action);

    case NOTIFY_UPDATE_UNREAD_SUCCESS:
      return updateUnread(state,action);
    case NOTIFY_UPDATE_UNREAD_FAILURE:
      return updateUnread(state,action);
      handleError(state,action);

    case CHANGE_PARTNER_SUCCESS:
      return defaultState;
    default:

  }
  return state;
},defaultState);
