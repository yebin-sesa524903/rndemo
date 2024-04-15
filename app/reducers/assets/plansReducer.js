'use strict';

import {
  PLANNING_REQUEST,PLANNING_SUCCESS,PLANNING_FAILURE,
  PLANNING_DETAIL_REQUEST,PLANNING_DETAIL_SUCCESS,PLANNING_DETAIL_FAILURE
} from '../../actions/assetsAction.js';

import Immutable from 'immutable';

// const MaintainInterval=['','一次性','每周','每两周','每月','每两月','每季度','每年','每半年','每两年','每五年'];

const MaintainInterval={
  1:'单次',
  2:'每周',
  3:'每两周',
  4:'每月',
  5:'每两月',
  6:'每季度',
  7:'每年',
  8:'每半年',
  9:'每2年',
  10:'每5年',
};
const SystemClass= {
    1: '配电系统',
    2:'供电系统',
    3: 'IT系统',
    4: '空调系统',
    5: '发电机系统',
    6: 'UPS系统',
    7: '动环系统',
    8: '照明系统',
    9: '消防系统',
    10: 'CCTV系统',
    11: '门禁系统',
    12: '其他',
    13:'中压变频系统'
}

const PlanType= {
    1:'常规维护计划',
    2:'演练计划',
    3:'培训计划',
    4:'基础预防性维护计划',
    5:'标准预防性维护计划',
    6:'制造商维护计划',
};

var defaultState = Immutable.fromJS({
  data:null,
  isFetching:false,
  hierarchyId:null,
  filter:{
    AssetTaskType:1,
    CurrentPage:1,
  },
  planDetail:null,
  isFetchingDetail:false
});

function loadPlanns(state,action) {
  let res=action.response.Result;
  // res.Items=[{},{}];//测试数据
  if(res.Items){
    res.Items.forEach(item=>{
      item.Intervals=MaintainInterval[item.Intervals];
    })
  }
  state=state.set('data',Immutable.fromJS(res.Items)).set('isFetching',false);
  return state;
}

function updateData(state,action) {
  let res=action.response.Result;
  res.Intervals=MaintainInterval[res.Intervals];
  res.SysClass=SystemClass[res.SysClass];
  res.PlanType=PlanType[res.PlanType];
  if(res.MaintainTasks){
    res.MaintainTasks.forEach(item=>{
      if(item.Status==3) item.Finish=true;
      else item.Finish=false;
    });
  }
  state=state.set('planDetail',Immutable.fromJS(res)).set('isFetchingDetail',false);
  return state;
}

function handleError(state,action) {
  var {Error} = action.error;

  switch (Error) {

  }
  return state;//.set('isFetching',false);
}

export default function(state=defaultState,action){
  switch (action.type) {
    case PLANNING_REQUEST:
      return state.set('isFetching',true);
    case PLANNING_DETAIL_REQUEST:
      return state.set('isFetchingDetail',true);
    case PLANNING_SUCCESS:
      return loadPlanns(state,action);

    case PLANNING_DETAIL_SUCCESS:
      return updateData(state,action);

    case PLANNING_FAILURE:
      state=state.set('isFetching',false);
      return handleError(state,action);
    case PLANNING_DETAIL_FAILURE:
      state=state.set('isFetchingDetail',true);
      return handleError(state,action);
    default:

  }
  return state;
}
