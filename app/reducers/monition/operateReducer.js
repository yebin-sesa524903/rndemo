import Immutable from 'immutable'
import {
  OPERATE_BILL_FINISH_REQUEST,
  OPERATE_BILL_FINISH_SUCCESS,
  OPERATE_BILL_FINISH_FAILURE,
  OPERATE_BILL_LOAD_BY_ID_REQUEST,
  OPERATE_BILL_LOAD_BY_ID_SUCCESS,
  OPERATE_BILL_LOAD_BY_ID_FAILURE,
  OPERATE_BILL_REJECT_REQUEST,
  OPERATE_BILL_REJECT_SUCCESS,
  OPERATE_BILL_REJECT_FAILURE,
  OPERATE_BILL_SAVE_REQUEST,
  OPERATE_BILL_SAVE_SUCCESS,
  OPERATE_BILL_SAVE_FAILURE,
  OPERATE_BILL_SIGN_REQUEST,
  OPERATE_BILL_SIGN_SUCCESS,
  OPERATE_BILL_SIGN_FAILURE,
  OPERATE_BILL_STEPS_REQUEST,
  OPERATE_BILL_STEPS_SUCCESS,
  OPERATE_BILL_STEPS_FAILURE,
  OPERATE_BILL_TPL_REQUEST,
  OPERATE_BILL_TPL_FAILURE,
  OPERATE_BILL_TPL_SUCCESS,
  BILL_RESTORE_INIT,
  COMMAND_BILL_GENERATE_OPERATE_BILL_REQUEST,
  COMMAND_BILL_GENERATE_OPERATE_BILL_SUCCESS,
  PERSON_DATA_LOAD_SUCCESS,
  COMMAND_BILL_GENERATE_OPERATE_BILL_FAILURE,
  OPERATE_INIT,
  PERSON_DATA_LOAD_FAILURE,
  UNBIND_ASSETS_LOAD_SUCCESS,
  UNBIND_ASSETS_LOAD_FAILURE
} from '../../actions/monitionAction'

let defaultState = Immutable.fromJS({
  isFetching: false,
  isPosting: false,
  data: {},
  tpl: null,
  steps: null
})

function initBill(state, action) {
  return state.set('data', Immutable.fromJS(action.initData))
}

function loadBill(state, action) {
  return state.set('isFetching', false).set('data', Immutable.fromJS(action.response.Result))
}

function loadTpl(state, action) {
  let result = action.response.Result;
  result && result.forEach(item => {
    item.title = item.name
  })
  state = state.set('tpl', action.response.Result).set('isPosting', false)
  return state;
}

function loadSteps(state, action) {
  return state.set('steps', action.response.Result).set('isPosting', false)
}

function signBill(state, action) {
  let key = ''
  switch (action.body.signatureType) {
    case 1:
      key = 'operator'
      break;
    case 2:
      key = 'guardian'
      break;
    case 3:
      key = 'personInCharge'
      break;
  }
  return state.set('isPosting', false).setIn(['data', key], action.body.signatureKey);
}

function saveBill(state, action) {
  return state.set('isPosting', false).set('data', Immutable.fromJS(action.response.Result))
}

function finishBill(state, action) {
  return state.set('isPosting', false).set('data', Immutable.fromJS(action.response.Result))
}

function rejectBill(state, action) {
  return state.set('isPosting', false).set('data', Immutable.fromJS(action.response.Result))
}


function handleError(state, action) {
  let { Error: err, Message } = action.error
  switch (err) {
    //这里对错误码进行相应的错误说明
    default://为定义统一显示接口的message
      if (err !== '-1')
        action.error = Message
  }
  return state.set('isFetching', false).set('isPosting', false)
}

export default function (state = defaultState, action) {
  switch (action.type) {

    case OPERATE_BILL_LOAD_BY_ID_REQUEST:
      return state.set('isFetching', true).set('data', Immutable.fromJS({}));

    case OPERATE_BILL_TPL_REQUEST:
    case OPERATE_BILL_STEPS_REQUEST:
    case OPERATE_BILL_SAVE_REQUEST:
    case OPERATE_BILL_FINISH_REQUEST:
    case OPERATE_BILL_SIGN_REQUEST:
    case OPERATE_BILL_REJECT_REQUEST:
      return state.set('isPosting', true);

    case OPERATE_BILL_TPL_SUCCESS:
      return loadTpl(state, action);
    case OPERATE_BILL_STEPS_SUCCESS:
      return loadSteps(state, action);
    case OPERATE_BILL_LOAD_BY_ID_SUCCESS:
      return loadBill(state, action);
    case OPERATE_BILL_SIGN_SUCCESS:
      return signBill(state, action);
    case OPERATE_BILL_REJECT_SUCCESS:
      return rejectBill(state, action);
    case OPERATE_BILL_FINISH_SUCCESS:
      return finishBill(state, action);
    case OPERATE_BILL_SAVE_SUCCESS:
      return saveBill(state, action);

    case OPERATE_INIT:
      return initBill(state, action);

    case PERSON_DATA_LOAD_SUCCESS:
      return state.set('persons', action.response.Result);
    case UNBIND_ASSETS_LOAD_SUCCESS:
      return state.set('assets', action.response.Result);

    case OPERATE_BILL_TPL_FAILURE:
    case OPERATE_BILL_STEPS_FAILURE:
    case OPERATE_BILL_SAVE_FAILURE:
    case OPERATE_BILL_LOAD_BY_ID_FAILURE:
    case OPERATE_BILL_FINISH_FAILURE:
    case OPERATE_BILL_SIGN_FAILURE:
    case OPERATE_BILL_REJECT_FAILURE:
    case PERSON_DATA_LOAD_FAILURE:
    case UNBIND_ASSETS_LOAD_FAILURE:
      return handleError(state, action);
    case BILL_RESTORE_INIT:
      return defaultState;
  }
  return state;
}
