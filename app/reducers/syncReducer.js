'use strict';


import {
  SYNC_ABORT, ININT_SYNC,
  SYNC_TICKET_BY_ID_REQUEST, SYNC_TICKET_BY_ID_SUCCESS, SYNC_TICKET_BY_ID_FAILURE,
  CHECK_TICKET_BY_ID_SUCCESS, CHECK_TICKET_BY_ID_FAILURE, CHECK_TICKET_BY_ID_REQUEST,
  SYNC_GIVE_UP, SYNC_RETRY, SYNC_COVER, UPDATE_IMAGE_UPLOAD_RECORD,CHECK_SERVICE_TICKET
} from '../actions/syncAction';

import {clearServiceTicketById, clearTicket} from '../utils/sqliteHelper';

import Immutable from 'immutable';
import moment from 'moment';

var defaultState = Immutable.fromJS({
  waitingSyncTickets:[],
  syncFailCount:0,
});

function initSync(state,action) {
  let newState=state;
  //这里就不能直接赋值，需要合并之前的状态
  let newData = Immutable.fromJS(action.data);
  let oldData = newState.get('waitingSyncTickets');
  if(oldData && oldData.size > 0) {
    for(let i=0;i<newData.size;i++){
      let newItem = newData.get(i);
      let find = oldData.find(item=>item.get('id')===newItem.get('id')
        && item.get('isService') === newItem.get('isService'))
      if(find) {
        newData=newData.setIn([i,'status'],find.get('status'));
      }
    }
  }
  // else {
  //   newState=newState.set('waitingSyncTickets',newData);
  // }
  newState=newState.set('waitingSyncTickets',newData);
  return newState;
}

function syncSuccess(state,action) {
  //同步成功了，需要删除对应的工单缓存数据；
  let {ticketId,isService}=action.data;
  if(isService) {
    if(action.response.Result && action.response.Result[0] && !action.response.Result[0].IsSuccess){
      let newAction = {
        error:{
          Error:action.response.Result[0].Code
        },
        data:action.data
      }
      return serviceSyncFail(state,newAction);
    }

  }
  let wating=state.get('waitingSyncTickets');
  let index=wating.findIndex(item=>item.get('id')===ticketId && item.get('isService') === isService);
  if(index>=0){
    //首先判断工单有没有关闭
    wating=wating.delete(index);
    clearTicket(ticketId,isService);
  }
  state=state.set('waitingSyncTickets',wating);
  return state;
}

function serviceSyncFail(state,action) {
  let {Error} = action.error;
  action.error.Error=null;
  let {ticketId,isService}=action.data;
  let wating=state.get('waitingSyncTickets');
  let index=wating.findIndex(item=>item.get('id')===ticketId && item.get('isService') === isService);
  if(index>=0){
    /**后端定义错误码
     * 050001256009 没有层级权限
       050001256010 工单不存在
       050001256011 工单状态不一致
     */
    //这里需要根据错误码 显示具体的出错原因
    switch (Error) {
      case '050001256009'://具体的错误，给出具体的原因
        wating=wating.setIn([index,'status'],5);
        break;
      case '050001256010'://具体的错误，给出具体的原因
        wating=wating.setIn([index,'status'],6);
        break;
      case '050001256011'://具体的错误，给出具体的原因
        wating=wating.setIn([index,'status'],7);
        break;
      default:
        wating=wating.setIn([index,'status'],2);
    }

    state=state.set('waitingSyncTickets',wating);

    //更新失败的次数
    let failCount=0;
    wating.forEach(item=>{
      if(item.get('status')>1){
        failCount=failCount+1;
      }
    });
    state=state.set('syncFailCount',failCount);
  }
  return state;
}

function syncFail(state,action) {
  var {Error} = action.error;
  console.warn(Error);
  action.error.Error=null;
  let {ticketId,isService}=action.data;
  if(isService) {
    return serviceSyncFail(state,action);
  }
  let wating=state.get('waitingSyncTickets');
  let index=wating.findIndex(item=>item.get('id')===ticketId && item.get('isService') === isService);
  if(index>=0){
    wating=wating.setIn([index,'status'],2);
    state=state.set('waitingSyncTickets',wating);

    //更新失败的次数
    let failCount=0;
    wating.forEach(item=>{
      if(item.get('status')>1){
        failCount=failCount+1;
      }
    });
    state=state.set('syncFailCount',failCount);
  }
  return state;
}

function checkModifyByOtherUesr(myName,process,item) {
  if(process&&process.length>0){//有操作记录
    for(let i=process.length-1;i>=0;i--){
      if(moment(process[i].Time).isAfter(item.get('beginTime'))&&
        process[i].UserName!==myName){
        return true;
      }
    }
    return false;
  }else{//没有操作记录，不存在更改
    return false;
  }
}

function serviceTicketCheckSuccess(state,action) {
  let {ticketId,userName,isService}=action.data;
  let wating=state.get('waitingSyncTickets');
  let index=wating.findIndex(item=>item.get('id')===ticketId && item.get('isService') === isService);
  if(index>=0){
    //TODO 这里处理service ticket同步判断比较逻辑,由于冲突的判断都有后端处理，这里直接标识无冲突，可以进行同步
    wating=wating.setIn([index,'status'],1);
    //更新失败的次数
    let failCount=0;
    wating.forEach(item=>{
      if(item.get('status')>1){
        failCount=failCount+1;
      }
    });
    state=state.set('syncFailCount',failCount);
  }
  state=state.set('waitingSyncTickets',wating);
  return state;
}

function checkSuccess(state,action) {
  let {ticketId,userName,isService}=action.data;
  if(isService) {
    return serviceTicketCheckSuccess(state,action);
  }
  let wating=state.get('waitingSyncTickets');
  let index=wating.findIndex(item=>item.get('id')===ticketId && item.get('isService') === isService);
  if(index>=0){
    //首先判断工单有没有关闭
    let result=action.response.Result;
    let status=result.Status;
    if(status===3){//工单有没有关闭
      //如果包含了签名，只处理签名，没包含签名，走原来的流程
      let data=wating.getIn([index,'data']);
      if(data&&data.size>0){
        let _findSignIndex=-1
        for(let i=data.size-1;i>=0;i--){
          if(data.getIn([i,'OperationType'])===8){
            _findSignIndex=i;
            break;
          }
        }
        if(_findSignIndex>=0){
          wating=wating.setIn([index,'data'],Immutable.fromJS([data.get(_findSignIndex)])).setIn([index,'status'],1);
        }else{
          wating=wating.setIn([index,'status'],4);
        }
      }
    }else if(checkModifyByOtherUesr(userName,result.Process,wating.get(index))){//工单有没有其他用户被修改
      wating=wating.setIn([index,'status'],3);
    }else{//检查没有冲突，可以调用同步接口了
      wating=wating.setIn([index,'status'],1);
    }

    //更新失败的次数
    let failCount=0;
    wating.forEach(item=>{
      if(item.get('status')>1){
        failCount=failCount+1;
      }
    });
    state=state.set('syncFailCount',failCount);
  }
  state=state.set('waitingSyncTickets',wating);
  return state;
}

function checkFail(state,action) {
  var {Error} = action.error;
  console.warn(Error);
  action.error.Error=null;
  let {ticketId,userName,isService}=action.data;
  let wating=state.get('waitingSyncTickets');
  let index=wating.findIndex(item=>item.get('id')===ticketId && item.get('isService') === isService);
  if(index>=0){
    wating=wating.setIn([index,'status'],2);
    state=state.set('waitingSyncTickets',wating);

    //更新失败的次数
    let failCount=0;
    wating.forEach(item=>{
      if(item.get('status')>1){
        failCount=failCount+1;
      }
    });
    state=state.set('syncFailCount',failCount);
  }
  return state;
}

function checkRequest(state,action) {
  let {ticketId,userName,isService}=action.data;
  let wating=state.get('waitingSyncTickets');
  let index=wating.findIndex(item=>item.get('id')===ticketId && item.get('isService') === isService);
  if(index>=0){
    wating=wating.setIn([index,'status'],-1);//-1表示进行中
    state=state.set('waitingSyncTickets',wating);
  }
  return state;
}

function syncCover(state,action) {
  let {ticketId,userName,isService}=action.data;
  let wating=state.get('waitingSyncTickets');
  let index=wating.findIndex(item=>item.get('id')===ticketId && item.get('isService') === isService);
  if(index>=0){
    wating=wating.setIn([index,'status'],1);//-1表示进行中
    state=state.set('waitingSyncTickets',wating);

    //更新失败的次数
    let failCount=0;
    wating.forEach(item=>{
      if(item.get('status')>1){
        failCount=failCount+1;
      }
    });
    state=state.set('syncFailCount',failCount);
  }
  return state;
}

function retrySync(state,action) {
  let {ticketId,userName,isService}=action.data;
  let wating=state.get('waitingSyncTickets');
  let index=wating.findIndex(item=>item.get('id')===ticketId && item.get('isService') === isService);
  if(index>=0){
    wating=wating.setIn([index,'status'],null);//-1表示进行中
    state=state.set('waitingSyncTickets',wating);

    //更新失败的次数
    let failCount=0;
    wating.forEach(item=>{
      if(item.get('status')>1){
        failCount=failCount+1;
      }
    });
    state=state.set('syncFailCount',failCount);
  }
  return state;
}

function giveUp(state,action) {
  let {ticketId,isService}=action.data;
  let wating=state.get('waitingSyncTickets');
  let index=wating.findIndex(item=>item.get('id')===ticketId && item.get('isService') === isService);
  if(index>=0){
    //首先判断工单有没有关闭
    wating=wating.delete(index);
    if(isService) {
      clearServiceTicketById(ticketId)
    }else {
      clearTicket(ticketId);
    }

    //更新失败的次数
    let failCount=0;
    wating.forEach(item=>{
      if(item.get('status')>1){
        failCount=failCount+1;
      }
    });
    state=state.set('syncFailCount',failCount);
  }
  state=state.set('waitingSyncTickets',wating);
  return state;
}

function updateImageUploadRecord(state,action) {
  let tickets=state.get('waitingSyncTickets');
  let {ticketId,uploadedKeys,failUploadKeys}=action.data;
  //首先，找到上传失败的key,将其从待同步数据中移除
  let index=tickets.findIndex(item=>item.get('id')===tickets);
  if(index>=0){
    if(failUploadKeys&&failUploadKeys.length>0){
      failUploadKeys.forEach(key=>{
        //找操作类型为3的，表示修改巡检项，然后从里面找到有picture的，找到后删除对应的图片项
        tickets.getIn([index,'data']).forEach((op,opIndex)=>{
          if(op.get('OperationType')===3){

          }
        })
      });
    }
  }
  //然后，找到上传成功的key,从待同步数据中进行标记，表示图片已上传
  return state;
}

export default function(state=defaultState,action){
  switch (action.type) {
    case UPDATE_IMAGE_UPLOAD_RECORD:
      return updateImageUploadRecord(state,action);
    case SYNC_ABORT:
      return defaultState;

    case ININT_SYNC:
      return initSync(state,action);

    case SYNC_GIVE_UP:
      return giveUp(state,action);

    case SYNC_RETRY:
      return retrySync(state,action);

    case SYNC_COVER:
      return syncCover(state,action);

    case SYNC_TICKET_BY_ID_REQUEST:
      return state;
    case SYNC_TICKET_BY_ID_SUCCESS:
      return syncSuccess(state,action);
    case SYNC_TICKET_BY_ID_FAILURE:
      return syncFail(state,action);

    case CHECK_TICKET_BY_ID_REQUEST:
      return checkRequest(state,action);
    case CHECK_TICKET_BY_ID_SUCCESS:
      return checkSuccess(state,action);
    case CHECK_TICKET_BY_ID_FAILURE:
      return checkFail(state,action);
    case CHECK_SERVICE_TICKET:
      return serviceTicketCheckSuccess(state,action);

    default:
  }
  return state;
}
