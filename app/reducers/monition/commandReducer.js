import {
  COMMAND_INIT,SUBSTATION_ASSETS_LOAD_SUCCESS,SUBSTATION_ASSETS_LOAD_FAILURE,
  PERSON_DATA_LOAD_SUCCESS,PERSON_DATA_LOAD_FAILURE,BILL_RESTORE_INIT,
  COMMAND_BILL_BY_ID_REQUEST,COMMAND_BILL_BY_ID_SUCCESS,COMMAND_BILL_BY_ID_FAILURE,
  COMMAND_BILL_Fill_REQUEST,COMMAND_BILL_Fill_SUCCESS,COMMAND_BILL_Fill_FAILURE,
  COMMAND_BILL_SAVE_REQUEST,COMMAND_BILL_SAVE_SUCCESS,COMMAND_BILL_SAVE_FAILURE,
  COMMAND_BILL_GENERATE_JOB_BILL_REQUEST,COMMAND_BILL_GENERATE_JOB_BILL_SUCCESS,COMMAND_BILL_GENERATE_JOB_BILL_FAILURE,
  COMMAND_BILL_GENERATE_OPERATE_BILL_REQUEST,COMMAND_BILL_GENERATE_OPERATE_BILL_SUCCESS,COMMAND_BILL_GENERATE_OPERATE_BILL_FAILURE
} from '../../actions/monitionAction'

import Immutable from 'immutable'

let defaultState = Immutable.fromJS({
  data:{},
  isFetching:false
})

function initBill(state,action) {
  let data = {...action.initData,status:1}
  return state.set('data',Immutable.fromJS(data))
}

function loadPersonData(state,action){
  return state.set('persons',action.response.Result)
}

function loadAssets(state,action){
  if(!action.fromJob)
    return state.set('assets',action.response.Result)
  return state;
}


function loadBill(state,action) {
  state = state.set('data',Immutable.fromJS(action.response.Result)).set('isFetching',false)
  return state
}

function saveBill(state,action){
  state = state.set('data',Immutable.fromJS(action.response.Result)).set('isPosting',false)
  return state
}

function fillBill(state,action){
  state = state.set('data',Immutable.fromJS(action.response.Result)).set('isPosting',false)
  return state
}

function generateOperateBill(state,action){
  return state;
}

function generateJobBill(state,action){

  return state;
}

function handleError(state,action){
  let {Error,Message} = action.error
  switch (Error){
    //这里对错误码进行相应的错误说明
    default://为定义统一显示接口的message
      if(Error !== '-1')
        action.error = Message
  }
  return state.set('isFetching',false).set('isPosting',false)
}

export default function(state=defaultState,action){
  switch (action.type) {
    case COMMAND_INIT:
      return initBill(state,action);

    case PERSON_DATA_LOAD_FAILURE:
    case SUBSTATION_ASSETS_LOAD_FAILURE:
      action.error = null;
      return state

    case PERSON_DATA_LOAD_SUCCESS:
      return loadPersonData(state,action);
    case SUBSTATION_ASSETS_LOAD_SUCCESS:
      return loadAssets(state,action);

    case COMMAND_BILL_BY_ID_REQUEST:
      return state.set('isFetching',true);
    case COMMAND_BILL_Fill_REQUEST:
    case COMMAND_BILL_SAVE_REQUEST:
    case COMMAND_BILL_GENERATE_JOB_BILL_REQUEST:
    case COMMAND_BILL_GENERATE_OPERATE_BILL_REQUEST:
      return state.set('isPosting',true);

    case COMMAND_BILL_SAVE_SUCCESS:
      return saveBill(state,action);

    case COMMAND_BILL_GENERATE_OPERATE_BILL_SUCCESS:
      return generateOperateBill(state,action);
    case COMMAND_BILL_GENERATE_JOB_BILL_SUCCESS:
      return generateJobBill(state,action);
    case COMMAND_BILL_Fill_SUCCESS:
      return fillBill(state,action);
    case COMMAND_BILL_BY_ID_SUCCESS:
      return loadBill(state,action);

    case COMMAND_BILL_BY_ID_FAILURE:
    case COMMAND_BILL_Fill_FAILURE:
    case COMMAND_BILL_SAVE_FAILURE:
    case COMMAND_BILL_GENERATE_JOB_BILL_FAILURE:
    case COMMAND_BILL_GENERATE_OPERATE_BILL_FAILURE:
      return handleError(state,action);
    case BILL_RESTORE_INIT:
      return defaultState;
    default:
  }
  return state;
}
