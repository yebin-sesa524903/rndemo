import Immutable from 'immutable';
import {
  SERVICE_TICKET_LOAD_BYID_REQUEST,
  SERVICE_TICKET_LOAD_BYID_SUCCESS,
  SERVICE_TICKET_LOAD_BYID_FAILURE,
  SERVICE_CHANGE_IGNORE,
  SERVICE_TICKET_UPDATE_CONTENT_BYID_REQUEST,
  SERVICE_TICKET_UPDATE_CONTENT_BYID_SUCCESS,
  SERVICE_TICKET_UPDATE_CONTENT_BYID_FAILURE,
  SERVICE_TICKET_EXECUTING_REQUEST,
  SERVICE_TICKET_EXECUTING_SUCCESS,
  SERVICE_TICKET_EXECUTING_FAILURE,
  SERVICE_TICKET_SUBMIT_REQUEST,
  SERVICE_TICKET_SUBMIT_SUCCESS,
  SERVICE_TICKET_SUBMIT_FAILURE,
  SERVICE_TICKET_VALIDATE_REQUEST,
  SERVICE_TICKET_VALIDATE_SUCCESS,
  SERVICE_TICKET_VALIDATE_FAILURE,
  SERVICE_TICKET_LOAD_CACHE
} from '../../actions/ticketAction'


let defaultState = Immutable.fromJS({
  isFetching:false,
  data:null
})

function loadServiceTicket(state,action){
  let newState = state;
  return newState.set('isFetching',false).set('data',action.response.Result);
}

function loadCacheServiceTicket(state,action) {
  return state.set('data',action.data);
}

function updateContent(state,action){
  state=state.set('isUpdating',false).set('data',action.response.Result);
  return state;
}

function changeIgnore(state,action){
  let data = state.get('data');
  let op = action.data;
  op.forEach(item => {
    data.Content[item.key].IsIgnored = item.isIgnore;
  });
  return state.set('data', {...data});
}

function handleError(state,action) {
  let {Error} = action.error;
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
    case '050001256003':
      Error = '抱歉，您查看的工单已被删除';
      break
    case '050001256011':
      Error = '抱歉，当前状态不支持此操作';
      break
    case '050001256022':
      Error = '抱歉，您没有功能权限';
      break
  }
  if (Error&&Error!=='403') {
    action.error=null;
  }else {
    Error='';
  }
  return state.set('isFetching',false).set('errorMessage',Error);
}

export default function (state=defaultState,action) {
  switch (action.type) {
    case SERVICE_TICKET_LOAD_BYID_REQUEST:
      return state.set('isFetching',true).set('errorMessage',null).set('data',null);
    case SERVICE_TICKET_UPDATE_CONTENT_BYID_REQUEST:
      return state.set('isUpdating',true);
    case SERVICE_TICKET_LOAD_BYID_SUCCESS:
      return loadServiceTicket(state,action);
    case SERVICE_TICKET_LOAD_CACHE:
      return loadCacheServiceTicket(state,action);
    case SERVICE_TICKET_EXECUTING_FAILURE:
    case SERVICE_TICKET_SUBMIT_FAILURE:
      return handleError(state,action).set('isPosting',false);
    case SERVICE_TICKET_LOAD_BYID_FAILURE:
      return handleError(state,action);
    case SERVICE_CHANGE_IGNORE:
      return changeIgnore(state,action);
    case SERVICE_TICKET_UPDATE_CONTENT_BYID_FAILURE:
      state=state.set('isUpdating',false);
      return handleError(state,action);
    case SERVICE_TICKET_UPDATE_CONTENT_BYID_SUCCESS:
      return updateContent(state,action);

    case SERVICE_TICKET_EXECUTING_REQUEST:
    case SERVICE_TICKET_SUBMIT_REQUEST:
      return state.set('isPosting',true);
    case SERVICE_TICKET_EXECUTING_SUCCESS:
    case SERVICE_TICKET_SUBMIT_SUCCESS:
      return state.set('isPosting',false).set('data',action.response.Result);

    case SERVICE_TICKET_VALIDATE_REQUEST:
      return state.set('validatePosting',1);
    case SERVICE_TICKET_VALIDATE_FAILURE:
      return state.set('validatePosting',2);
    case SERVICE_TICKET_VALIDATE_SUCCESS:
      return state.set('validatePosting',0).set('validateResult',action.response.Result);
  }

  return state;
}
