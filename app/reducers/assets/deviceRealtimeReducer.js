'use strict';

import {
  DEVICE_REALTIME_REQUEST,
  DEVICE_REALTIME_SUCCESS,
  DEVICE_REALTIME_FAILURE,
  DEVICE_LOAD_SUCCESS,
} from '../../actions/assetsAction.js';

import {LOGOUT_SUCCESS} from '../../actions/loginAction.js';

import Immutable from 'immutable';

import {round} from 'lodash/math';

var defaultState = Immutable.fromJS({
  data:null,
  deviceId:null,
  sectionData:[],
  monitorGroupIds:null,
  monitorGroupMap:null,
  isFetching:false,
  hasData:false,
});

function combineUnit(value,unit) {
  var val = parseFloat(value);
  if (!value) {
    return '--';
  }
  if (isNaN(val)) {
    var lowerValue=value.toLowerCase().replace(/(^\s*)|(\s*$)/g, "");
    if (lowerValue.indexOf('null')>=0||lowerValue.indexOf('nan')>=0||lowerValue==='-'||lowerValue==='--'||lowerValue==='') {
      return '--';
    }
  }
  if (isNaN(value)) {
    return value;
  }
  else {
    if (unit==='次') {
      return round(val,0)+unit;
    }
    var resVal=val;
    if(val.toString().indexOf('.')>0||val.toString().indexOf('e')>0){
      resVal=round(val,2);
      resVal=parseFloat(resVal);
      if (Math.abs(val)>=10) {
        resVal=round(val,1);
        resVal=parseFloat(resVal);
      }
    }
    return resVal+unit;
  }
}

function updateData(state,action) {
  var {body:{deviceId},response:{Result}} = action;
  var response = Result;
  var newState = state;
  var hashMapGroup = state.get('monitorGroupMap');
  var ret = [];
  var hasData = false;
  if(Result && Result.length > 0){
    hasData = true;
  }
  newState = newState.set('hasData',hasData)
  var monitorGroupIds = state.get('monitorGroupIds');
  // console.warn('monitorGroupIds',monitorGroupIds);
  hashMapGroup.forEach((group)=>{
    var values = group.get('values');
    var arr = [];

    //must use monitorGroupIds for iteration
    //because values is map, can not garentee order
    monitorGroupIds.forEach((uniqueId)=>{
      var one = response.find((item)=>item.Id.toString() === uniqueId.toString());
      if(!one){
        one = {Val:''}
      }

      var current = values.get(uniqueId.toString());
      if(current){
        if (current.get('unit')==='%') {
          // console.warn('current',one.Val,current,combineUnit(one.Val,current.get('unit'),current.get('name')));
        }
        var calVal=combineUnit(one.Val,current.get('unit'));
        arr.push({
          title:current.get('name'),
          unit:current.get('unit'),
          value:calVal,
          isNav:true,
          uniqueId:uniqueId,
          type:'historydata',
          formula:current.get('formula')
        });
      }

    })
    if(arr.length > 0){
      ret.push(arr);
    }
  });
  if (ret.length===0) {
    newState=newState.set('sectionData',Immutable.fromJS([]))
  }
  // console.warn('realtime reducer',hasData,ret);
  newState = newState.set('data',Immutable.fromJS(ret));
  newState = newState.set('isFetching',false);
  newState = newState.set('deviceId',deviceId);
  return newState;
}

function handleError(state,action) {
  var error = action.error;
  //error:
  //  { [SyntaxError: JSON Parse error: Unrecognized token '<']
  //    line: 25838,
  //    column: 10,
  //    sourceURL: 'http://localhost:8081/index.ios.bundle?platform=ios&dev=true' } }
  console.warn('handleError...',action);
  if(!error){
    action.error = '无数据可显示，请在网页端进行配置';
  }else {
    // action.error = '无相关权限';
    if (action.error!=='403') {
      action.error=null;
    }
  }

  return state;
}

function formatFormula(formula) {
  if(!formula) return null;
  switch (String(formula).toLowerCase()) {
    case 'min':
      return '（最小值）';
    case 'max':
      return '（最大值）';
    case 'avg':
      return '（平均值）';
  }
  return null;
}

function generateMonitorGroup(state,action) {
  var {body:{deviceId},response:{Result}} = action;
  var groups = Result.MonitorParameterGroups;
  var uniqueIds = [];
  var groupNames = [];
  var hashMapGroup = [];
  // console.warn('groups',groups);
  groups.forEach((item)=>{
    var params = item.MonitorParameters;
    if(item.Name && params && params.length > 0){
      var hashMap = {};
      groupNames.push(item.Name);
      params.forEach((item1)=>{
        var uid = item1.UniqueId;
        if(!hashMap[uid]){
          uniqueIds.push(uid);
          // console.warn('item',item1.Name);
          let formula=formatFormula(item1.EdgeFormula);
          hashMap[uid] = {name:item1.Name,unit:item1.Unit,formula};
        }
      })
      // console.warn('hashMap',hashMap);
      hashMapGroup.push({group:item.Name,values:hashMap});
    }
  });
  // console.warn('hashMapGroup',hashMapGroup);
  return state.set('deviceId',deviceId)
          .set('hasData',false)
          .set('sectionData',Immutable.fromJS(groupNames))
          .set('monitorGroupIds',Immutable.fromJS(uniqueIds))
          .set('monitorGroupMap',Immutable.fromJS(hashMapGroup))


}

function handleFetching(state,action) {
  var hasData = state.get('hasData');
  if(hasData){
    return state;
  }
  else {
    return state.set('isFetching',false);
  }
}

export default function(state=defaultState,action){

  switch (action.type) {
    case DEVICE_REALTIME_REQUEST:
      return handleFetching(state,action);
    case DEVICE_REALTIME_SUCCESS:
      return updateData(state,action);
    case DEVICE_REALTIME_FAILURE:
      return handleError(state,action);
    case DEVICE_LOAD_SUCCESS:
      return generateMonitorGroup(state,action);
    case LOGOUT_SUCCESS:
      return defaultState;
    default:

  }
  return state;
}
