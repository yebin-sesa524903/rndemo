'use strict';


import {
  NOTIFY_FILTER_CHANGED,
  NOTIFY_FILTER_DIDCHANGED,
  NOTIFY_FIRSTPAGE,
  NOTIFY_NEXTPAGE,
} from '../../actions/notifyAction.js';

import {LOGOUT_SUCCESS} from '../../actions/loginAction.js';

import {compose} from 'redux';
import Immutable from 'immutable';
import moment from 'moment';
import pinyin from "pinyin";
moment.locale('zh-cn');

var today = moment();
var lastMonth=null;//moment(today).subtract(1,'M').format('YYYY-MM-DD');
var nextMonth=null;//moment(today).format('YYYY-MM-DD');

var defaultState = Immutable.fromJS({
    hasFilter:false,
    isFetching:false,
    stable:{
      pageIndex:1,
      pageSize:20,
    },
});

function mergeTempFilter(state,action) {
  var newState = state;

  var temp = newState.get('temp');
  var trace=newState.get('trace');
  var {type,value} = action.data;
  if (type==='StartTime'||type==='EndTime') {
    var strDate = moment(value).format('YYYY-MM-DD');
    temp = temp.set(type,strDate);
  }else {
    var typeValue = temp.get(type);
    var traceTypeValue=trace.get(type);
    var index = typeValue.findIndex((item)=> item === value.index);
    if(index < 0){
      typeValue=typeValue.unshift(value.index);
      traceTypeValue=traceTypeValue.unshift(value.name);
    }else {
      typeValue=typeValue.remove(index);
      traceTypeValue=traceTypeValue.remove(index);
    }
    temp = temp.set(type,typeValue);
    trace=trace.set(type,traceTypeValue);
    newState=newState.set('trace',trace);
    // console.warn('mergeTempFilter...',type,value,typeValue);
  }
  return newState.set('temp',temp);
}


function convertStatus(state) {
  var status = state.getIn(['temp','status']);
  var isSecure=null;
  if (status.includes(1)&&status.includes(0)) {
    isSecure=null;
  }else if (status.includes(1)) {
    isSecure=true;
  }else if (status.includes(0)) {
    isSecure=false;
  }

  return state.setIn(['stable','IsSecure'],isSecure);
}

function convertDates(state) {
  return state.setIn(['stable','StartTime'],state.getIn(['temp','StartTime']))
  .setIn(['stable','EndTime'],state.getIn(['temp','EndTime']));
}

function convertLevel(state) {
  // console.warn('convertLevel',state.get('temp'));
  var level = state.getIn(['temp','level']);
  // 在界面上全部，高，中低对应0，1，2，但是后台对应为3，2，1
  var newLevel=[];
  level.forEach((item)=>{
    if (item===0) {
      newLevel.push(3);
    }else if (item===1) {
      newLevel.push(2);
    }else if (item===2) {
      newLevel.push(1);
    }
  });

  return state.setIn(['stable','Level'],Immutable.List(newLevel));
}

function mergeStableFilter(state,action) {
  // console.warn('mergeStableFilter...',action);
  var newState = state;
  newState = newState.setIn(['stable','pageIndex'],1);
  return newState.set('hasFilter',true);
}

function nextPage(state,action) {
  var stable = state.get('stable');
  stable = stable.set('pageIndex',stable.get('pageIndex')+1);
  return state.set('stable',stable);
}

function firstPage(state,action) {
  var stable = state.get('stable');
  stable = stable.set('pageIndex',1);

  return state.set('stable',stable);
}

function handleError(state,action) {
  var {Error} = action.error;
  // console.warn('handleError',action);

  switch (Error) {
    case '040001307022':
      action.error = null;// '您没有这一项的操作权限，请联系系统管理员';
      break;
  }
  return state.set('isFetching',false);
}

export default function(state=defaultState,action){
  switch (action.type) {
    case NOTIFY_FILTER_CHANGED:
      return mergeTempFilter(state,action);
    case NOTIFY_FILTER_DIDCHANGED:
      return mergeStableFilter(state,action);
    case NOTIFY_NEXTPAGE:
      return nextPage(state,action);
    case NOTIFY_FIRSTPAGE:
      return firstPage(state,action);
    case LOGOUT_SUCCESS:
      return defaultState;
    default:

  }
  return state;
}
