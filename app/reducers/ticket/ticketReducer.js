'use strict';


import {
  TICKET_LOAD_BYID_REQUEST,
  TICKET_LOAD_BYID_SUCCESS,
  TICKET_LOAD_BYID_FAILURE,
  TICKET_MESSAGE_READED_SUCCESS,
  TICKET_CREATE_REQUEST,
  TICKET_CREATE_SUCCESS,
  TICKET_CREATE_FAILURE,
  TICKET_EXECUTE_REQUEST,
  TICKET_FINISH_REQUEST,
  TICKET_SUBMIT_REQUEST,
  TICKET_EXECUTE_SUCCESS,
  TICKET_FINISH_SUCCESS,
  TICKET_SUBMIT_SUCCESS,
  TICKET_EXECUTE_FAILURE,
  TICKET_FINISH_FAILURE,
  TICKET_SUBMIT_FAILURE,
  TICKET_LOGS_SUCCESS,
  TICKET_LOG_SAVE_SUCCESS,
  TICKET_LOG_CACHE_LOAD,
  TICKET_RESET,PATROL_CLEAR_RECORD,
  TICKET_MESSAGES_COUNT,
  TICKET_UPDATE_INSPECTION_CONTENT,
  TICKET_INSPECTION_REMARK_CHANGED,
  TICKET_MESSAGE_DELETE_SUCCESS,
  PATROL_TICKET_ITEM_CHANGED, PATROL_TICKET_STATUS_CHANGED, patrolTicketStatusChanged, TICKET_DELETE_FAILURE,
  SUBMIT_PATROL_TICKET_ITEM_REQUEST,SUBMIT_PATROL_TICKET_ITEM_SUCCESS,SUBMIT_PATROL_TICKET_ITEM_FAILURE,
  TICKET_LOAD_IN_CACHE,TICKET_SIGN_CACHE_SAVE,TICKET_REJECT_NO_SUCCESS,
  TICKET_ACCEPT_REQUEST,TICKET_ACCEPT_SUCCESS,TICKET_ACCEPT_FAILURE,
  TICKET_REJECT_REQUEST,TICKET_REJECT_SUCCESS,TICKET_REJECT_FAILURE,
  TICKET_SUMMARY_REQUEST,TICKET_SUMMARY_SUCCESS,TICKET_SUMMARY_FAILURE,TICKET_SUMMARY_CHANGE,
  TICKET_SIGN_SAVE_REQUEST,TICKET_SIGN_SAVE_SUCCESS,TICKET_SIGN_SAVE_FAILURE
} from '../../actions/ticketAction';

import {LOGOUT_SUCCESS} from '../../actions/loginAction.js';

import Immutable from 'immutable';
import trackApi from '../../utils/trackApi';
import moment from 'moment';


var defaultState = Immutable.fromJS({
  isFetching:false,
  data:null,
  logCount:null,
  msgCount:null,
  isPosting:false,
  ticketId:null,
  ticketFirstId:null,
  errorMessage:null,
  ticketCount:null,
  contentChanged:false
});

function ticketLoadedStart(state,action){
    var {data:{ticketId}} = action;
    return state.set('ticketFirstId',ticketId).set('isFetching',true)
      .set('rejectPosting',0).set('acceptPosting',0);
}

function ticketLoaded(state,action) {
  var resTicketId = action.response.Result.Id;
  let result=action.response.Result;
  // if(result.TicketType===6)
  //   result.Content=JSON.parse(result.Content);
  // result.checkTicketData=checkTicketData;
  // action.response.Result.IsRead=false;
  return state.set('data',Immutable.fromJS(result)).
               set('ticketId',resTicketId).
               set('isFetching',false).
               set('msgCount',action.response.Result.Discusses.length).
               set('logCount',action.response.Result.Logs.length).
               set('contentChanged',false);
}
function updateTicketMsgInfo(state,action) {
  var data=state.get('data');
  if(data)
    state=state.setIn(['data','IsRead'],true);
  return state;
}
function execute(state,action) {
  var {body:{ticketId},response:{Result:{ActualStartTime,Status}}} = action;
  console.warn('execute....',ActualStartTime,Status);
  state=state.set('data',Immutable.fromJS(action.response.Result))
    .set('msgCount',action.response.Result.Discusses.length)
    .set('logCount',action.response.Result.Logs.length);
  var data = state.get('data');
  data = data.set('ActualStartTime',ActualStartTime).set('Status',Status);
  _traceTicketExecute(state,'App_ExecuteTicket',true,null);
  return state.set('data',data).set('isFetching',false)
    .set('logCount',action.response.Result.Logs.length);
}
function updateStatus(state,action) {
  var {body:{ticketId},response:{Result:{ActualEndTime,ActualStartTime,Status}}} = action;
  var data = state.get('data');
  data = data.set('ActualEndTime',ActualEndTime).set('ActualStartTime',ActualStartTime).set('Status',Status).set('isFinishing',true);
  state= state.set('data',data).set('ticketId',ticketId).set('isFetching',false).set('contentChanged',false);
  _traceTicketExecute(state,'App_SubmitTicket',true,null);
  return state;
}
function finish(state,action) {
  var {body:{ticketId},response:{Result:{ActualEndTime,Status}}} = action;
  var data = state.get('data');
  data = data.set('ActualEndTime',ActualEndTime).set('Status',Status).set('isFinishing',true);
  state= state.set('data',data).set('ticketId',ticketId).set('isFetching',false).set('contentChanged',false);
  _traceTicketExecute(state,'App_CloseTicket',true,null);
  return state;
}

function updateLogsCount(state,action) {
  var {ticketId,response:{Result}} = action;
  if(state.get('ticketId') === ticketId || state.get('ticketId') === String(ticketId)){
    if(!Result){
      Result = [];
    }
    return state.set('logCount',Result.length);
  }
  return state;
}

function addLogsCount(state,action) {
  var {body:{TicketId},response:{Result}} = action;
  var ticketId=TicketId;
  // console.warn('addLogsCount...',state.get('ticketId'),ticketId,action.body);
  if(state.get('ticketId') === ticketId || state.get('ticketId') === String(ticketId)){
    if(!Result){
      Result = [];
    }
    //如果是更新日志，则不需要跟新日志数量
    if(action.opt){
      return state;
    }
    // console.warn('addLogsCount...',state.get('ticketId'),ticketId,Result.length);
    var nOldCount=state.get('logCount');
    nOldCount++;
    return state.set('logCount',nOldCount);
  }
  return state;
}

function updateMsgCount(state,action) {
  let msgCount=action.count;
  if(msgCount<0) msgCount=0;
  return state.set('msgCount',msgCount);
}

function handleError(state,action) {
  var {Error} = action.error;
  switch (Error) {
    case '040001307022':
      Error = '您没有这一项的操作权限，请联系系统管理员';
      break;
    case '050001251500':
      Error = '抱歉，您查看的工单已被删除';
      break;
    case '050001251009':
      Error = '抱歉，您没有查看该工单权限';
      break;
    case '050001251402':
      Error=null;
      action.error='抱歉，不能删除有关联维护任务的工单';
      break;
    case '050001251415':
      Error=null;
      action.error='工单已关闭无法接单';
      break;
    case '050001251413':
      Error=null;
      action.error='用户已接单，无法重复接单';
      break;
  }
  if (Error&&Error!=='403') {
    action.error=null;
  }else {
    Error='';
  }
  if(action.type===TICKET_EXECUTE_FAILURE){
    _traceTicketExecute(state,'App_ExecuteTicket',false,Error);
  }
  if(action.type===TICKET_SUBMIT_FAILURE){
    _traceTicketExecute(state,'App_SubmitTicket',false,Error);
  }
  return state.set('isFetching',false).set('errorMessage',Error);
}

function _traceTicketExecute(state,eventName,success,err,opt){
  let content=state.getIn(['data','Content']);
  let desc=content;
  if(content&&content.length>0){
    content=content.split('\n');
    if(content.length===7) {
      let tmp = {};
      content.forEach(item => {
        let keyValue=item.split(':');
        tmp[keyValue[0]]=keyValue[1];
      });
      content=tmp;
    }else{
      content={};
    }
  }
  let rowData=state.get('data');
  let duration={};
  if(eventName==='App_SubmitTicket') {
    duration={
      duration:Math.ceil(moment(rowData.get('ActualEndTime')).diff(moment(rowData.get('ActualStartTime')))/60000)
    }
  }

  let obj= {
    ...duration,
    is_success:success,
    fail_reason:err||'',
    workorder_id:rowData.get('TicketNum'),
    workorder_status:['未开始','未开始','执行中','已完成','已提交','待派工'][rowData.get('Status')],
    workorder_type:[null,'计划工单','报警工单','随工工单','现场工单','方案工单','巡检工单','抢修工单'][rowData.get('TicketType')],
    start_time:moment(rowData.get('StartTime')).format('YYYY-MM-DD'),
    // asset_range:eventName==='App_CreateTicket'?[]:rowData.get('AssetNames').toJSON(),
    // grade:content['级别'],
    // point:content['类别'],
    // issue:content['点位'],
    // actual_value:content['实际值'],
    // set_value:content['设定值'],
    position:rowData.get('BuildingNames').join(','),//content['位置'],
    // description:desc,
    // file_count:rowData.get('Documents').size,
    logfile_count:state.get('logCount')||0,
    customer_id:String(rowData.get('CustomerId')||''),
    customer_name:rowData.get('CustomerName')
  };
  if(eventName==='App_CreateTicket'){
    obj={
      workorder_id:rowData.get('TicketNum'),
      workorder_type:[null,'计划工单','报警工单','随工工单','现场工单','方案工单','巡检工单','抢修工单'][rowData.get('TicketType')],
      start_time:moment(rowData.get('StartTime')).format('YYYY-MM-DD'),
      //position:opt.asset?opt.asset.join(','):'',
      customer_id:String(rowData.get('CustomerId')||''),
      customer_name:opt.customer.get('CustomerName')||''
    };
  }
  if(eventName==='App_CloseTicket'){
    obj={
      workorder_id:rowData.get('TicketNum'),
      workorder_status:['未开始','未开始','执行中','已完成','已提交','待派工'][rowData.get('Status')],
      workorder_type:[null,'计划工单','报警工单','随工工单','现场工单','方案工单','巡检工单','抢修工单'][rowData.get('TicketType')],
      start_time:moment(rowData.get('StartTime')).format('YYYY-MM-DD'),
      position:rowData.get('BuildingNames').join(','),
      logfile_count:state.get('logCount')||0,
      customer_id:String(rowData.get('CustomerId')||''),
      customer_name:rowData.get('CustomerName')
    };
  }

  trackApi.onTrackEvent(eventName,obj);

}

function patrolTicketItemChanged(state,action) {
  let {mainItemsIndex,data}=action.data;
  let newState=state;
  let checkTicketData=newState.getIn(['data','Content']);
  checkTicketData=checkTicketData.setIn([0,'MainItems',mainItemsIndex],data);
  newState=newState.setIn(['data','Content'],checkTicketData);
  newState=recordUpdateIndex(newState,mainItemsIndex);
  return newState;
}

function ticketStatusChanged(state,action) {
  let newState=state;
  newState=newState.setIn(['data','Status'],action.data);
  return newState;
}

function loadCacheTicket(state,action) {
  let result=action.ticket;
  let resTicketId = result.Id;
  return state.set('data',Immutable.fromJS(result)).set('contentChanged',false).
    set('ticketId',resTicketId).set('ticketFirstId',resTicketId).set('summaryChanged',false);
}

function updateInspectionContentItems(status,action) {
  let {index,item} = action.data;
  let newState=status;
  newState=newState.setIn(['data','InspectionContent',0,'MainItems',index],item)
    .set('contentChanged',true);
  newState=recordUpdateIndex(newState,index);
  return newState;
}

function rejectTicket(state,action) {
  //拒绝成功，设置拒绝状态为1
  state=state.set('rejectPosting',1);
  return state;
}

function acceptTicket(state,action) {
  //接单成功，设置状态为1
  state=state.set('acceptPosting',1);
  return state;
}

function generateName(pics,ticketId,userId) {
  //巡检工单备注图片
  var time = new Date().getTime();
  return `image-ticket-inspection-${ticketId}-${userId}-${time}-${pics.size}`;
}

function remarkChanged(state,action1) {
  var {data:{mainIndex,subIndex,ticketId,userId,type,action,value}} = action1;
  if(!state) return state; //fast back #14581,must put behind init
  let keyPath=['data','InspectionContent',0, 'MainItems',mainIndex,'SubItems',subIndex];
  let remark=state.getIn(keyPath);
  if(!remark.get('Pictures')){
    remark=remark.set('Pictures',Immutable.fromJS([]));
  }
  var newState = state;
  newState=recordUpdateIndex(newState,mainIndex);
  if(type === 'content'){
    //修改备注内容
    remark=remark.set('Comment',value);
    newState=newState.setIn(keyPath,remark);
    return newState;
  }else if(type==='reset'){
    newState=newState.setIn(keyPath,value);
    return newState;
  }else if(type==='submit'){
    newState=newState.set('contentChanged',true);
    return newState;
  }
  else {
    var pics = remark.get('Pictures');
    //添加备注图片
    if(action === 'add'){
      value.forEach((item)=>{
        pics = pics.push(
          Immutable.Map({
            PictureId:generateName(pics,ticketId,userId),
            uri:item.uri,
            FileName:item.filename
          }));
      })
    }
    else if (action === 'uploaded') {
      // console.warn('uploaded');
      //上传完备注图片
      var index = pics.findIndex((item)=>item === value);
      if (index!==-1) {
        pics = pics.update(index,(item)=>item.set('loaded',true).set('uri',null));
      }
    }
    else if (action === 'delete'){
      //删除备注图片
      var index = pics.findIndex((item)=>item === value);
      if (index!==-1) {
        pics = pics.delete(index);
      }
    }
    remark=remark.set('Pictures',pics);
    newState=newState.setIn(keyPath,remark);
    return newState;
    // return newState.set('Pictures',pics);
  }
}

function recordUpdateIndex(state,index) {
  let indexSet=state.get('recordIndex')||new Set();
  indexSet.add(index);
  state=state.set('recordIndex',indexSet);
  return state;
}

//清空记录，防止重复记录
function clearRecord(state,action) {
  return state.set('recordIndex',null);
}

export default function(state=defaultState,action){

  switch (action.type) {
    case TICKET_LOAD_BYID_REQUEST:
      return ticketLoadedStart(state,action);
    case TICKET_LOAD_BYID_SUCCESS:
    case TICKET_REJECT_NO_SUCCESS:
      return ticketLoaded(state,action);
    case TICKET_LOAD_IN_CACHE:
      return loadCacheTicket(state,action);
    case TICKET_MESSAGE_READED_SUCCESS:
      return updateTicketMsgInfo(state,action);
    case TICKET_LOAD_BYID_FAILURE:
    case TICKET_EXECUTE_FAILURE:
    case TICKET_FINISH_FAILURE:
    case TICKET_SUBMIT_FAILURE:
    case TICKET_DELETE_FAILURE:
    case TICKET_REJECT_FAILURE:
    case TICKET_ACCEPT_FAILURE:
      return handleError(state,action);
    case TICKET_EXECUTE_REQUEST:
    case TICKET_FINISH_REQUEST:
    case TICKET_SUBMIT_REQUEST:
      return state.set('isFetching',true);
    case TICKET_EXECUTE_SUCCESS:
      return execute(state,action);
    case TICKET_FINISH_SUCCESS:
      return finish(state,action);
    case TICKET_SUBMIT_SUCCESS:
      return updateStatus(state,action);
    case TICKET_LOGS_SUCCESS:
      return updateLogsCount(state,action);
    case TICKET_LOG_SAVE_SUCCESS:
      return addLogsCount(state,action);
    case TICKET_CREATE_REQUEST:
      return state.set('isPosting',1);
    case TICKET_CREATE_SUCCESS:
      if(action.isCreate)//表示是创建工单，而不是修改工单
        _traceTicketExecute(Immutable.fromJS({data:action.response.Result}),'App_CreateTicket',true,null,action.opt);
      return state.set('isPosting',2);
    case TICKET_CREATE_FAILURE:
      return state.set('isPosting',3);
    case TICKET_MESSAGES_COUNT:
      return updateMsgCount(state,action);
    case PATROL_TICKET_ITEM_CHANGED:
      return patrolTicketItemChanged(state,action);
    case PATROL_TICKET_STATUS_CHANGED:
      return ticketStatusChanged(state,action);
    case SUBMIT_PATROL_TICKET_ITEM_REQUEST:
      return state.set('isPosting',1);
      break;
    case SUBMIT_PATROL_TICKET_ITEM_SUCCESS:
      state=state.set('isPosting',2);
      return ticketLoaded(state,action);
      break;
    case SUBMIT_PATROL_TICKET_ITEM_FAILURE:
      return state.set('isPosting',3);
    case TICKET_ACCEPT_SUCCESS:
      return acceptTicket(state,action);
    case TICKET_REJECT_SUCCESS:
      return rejectTicket(state,action);
    case TICKET_UPDATE_INSPECTION_CONTENT:
      return updateInspectionContentItems(state,action);
    case TICKET_INSPECTION_REMARK_CHANGED:
      return remarkChanged(state,action);
    case TICKET_LOG_CACHE_LOAD:
      let logs=action.logs;
      let count=0;
      if(logs&&logs.length>0) count=logs.length;
      return state.set('logCount',count);

    case TICKET_SUMMARY_REQUEST:
      return state.set('summaryPosting',1);
    case TICKET_SUMMARY_SUCCESS:
      return state.set('summaryPosting',2).set('summaryChanged',false);
    case TICKET_SUMMARY_FAILURE:
      return state.set('summaryPosting',3);
    case TICKET_SUMMARY_CHANGE:
      if(action.isResult) return state.setIn(['data','ChiefOperatorConductResult'],action.summary);
      return state.set('summaryChanged',true).setIn(['data','Summary'],action.summary);

    case TICKET_SIGN_SAVE_REQUEST:
      return state.set('ticketSignPosting',1);
    case TICKET_SIGN_SAVE_FAILURE:
      return state.set('ticketSignPosting',3);
    case TICKET_SIGN_SAVE_SUCCESS:
      //这里只更新签名文件字段
      let key = action.body.signatureType === 1 ? 'ChiefOperatorSignFilePath' : 'SignFilePath'
      let SignFilePath=action.response.Result[key];
      return state.set('ticketSignPosting',2).setIn(['data',key],SignFilePath);
    case TICKET_SIGN_CACHE_SAVE:
      let signKey = action.signType === 1 ? 'ChiefOperatorSignFilePath' : 'SignFilePath'
      return state.setIn(['data',signKey],action.signImage);

    case PATROL_CLEAR_RECORD:
      return clearRecord(state,action);

    case TICKET_RESET:
    case LOGOUT_SUCCESS:
      return defaultState;
    default:

  }
  return state;
}
