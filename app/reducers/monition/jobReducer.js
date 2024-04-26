import Immutable from 'immutable'
import {
  JOB_BILL_BIND_REQUEST,
  JOB_BILL_BIND_SUCCESS,
  JOB_BILL_BIND_FAILURE,
  JOB_BILL_CREATE_REQUEST,
  JOB_BILL_CREATE_SUCCESS,
  JOB_BILL_CREATE_FAILURE,
  JOB_BILL_EDIT_SUCCESS,
  JOB_BILL_EDIT_REQUEST,
  JOB_BILL_EDIT_FAILURE,
  JOB_BILL_FINISH_TASK_REQUEST,
  JOB_BILL_FINISH_TASK_SUCCESS,
  JOB_BILL_FINISH_TASK_FAILURE,
  JOB_BILL_GET_BY_ID_REQUEST,
  JOB_BILL_GET_BY_ID_SUCCESS,
  JOB_BILL_GET_BY_ID_FAILURE,
  JOB_BILL_RECYCLE_REQUEST,
  JOB_BILL_RECYCLE_SUCCESS,
  JOB_BILL_RECYCLE_FAILURE,
  JOB_BILL_SIGN_REQUEST,
  JOB_BILL_SIGN_SUCCESS,
  JOB_BILL_SIGN_FAILURE,
  JOB_BILL_UPDATE_ORDER_REQUEST,
  JOB_BILL_UPDATE_ORDER_SUCCESS,
  JOB_BILL_UPDATE_ORDER_FAILURE,
  SUBSTATION_ASSETS_LOAD_REQUEST,
  SUBSTATION_ASSETS_LOAD_SUCCESS,
  SUBSTATION_ASSETS_LOAD_FAILURE,
  JOB_INIT,
  BILL_RESTORE_INIT,
  PERSON_DATA_LOAD_SUCCESS,
  JOB_BILL_CHANGE_SUBSTATION,
  JOB_BILL_TPL_LIST_SUCCESS,
  JOB_BILL_TPL_INFO_REQUEST,
  JOB_BILL_TPL_INFO_FAILURE,
  JOB_BILL_TPL_INFO_SUCCESS,
  UNBIND_BILL_LOAD_REQUEST,
  UNBIND_BILL_LOAD_SUCCESS,
  UNBIND_BILL_LOAD_FAILURE,
  JOB_BILL_UPDATE_ORDER_DUTY_REQUEST,
  JOB_BILL_UPDATE_ORDER_DUTY_SUCCESS,
  JOB_BILL_UPDATE_ORDER_DUTY_FAILURE,
  UNBIND_ASSETS_LOAD_SUCCESS,
  UNBIND_ASSETS_LOAD_FAILURE
} from '../../actions/monitionAction'
import { CREATE_BUILDING_SUCCESS } from "../../actions/assetsAction";
import moment from "moment";
const TIME_FORMAT = 'YYYY-MM-DD HH:mm';
let defaultState = Immutable.fromJS({
  isFetching: false,
  isPosting: false,
  data: {},
  unbound: {
    isFetching: false,
    data: null,
    currentPage: 1,
    pageCount: 0,
    filter: {
      "pageIndex": 1,
      "pageSize": 10
    }
  }
})

function loadUnbound(state, action) {
  let { Items, PageCount, CurrentPage } = action.response.Result;
  let data = state.getIn(['unbound', 'data']) || [];
  if (CurrentPage === 1) {
    data = Items;
  } else {
    data = data.concat(Items);
  }
  state = state.setIn(['unbound', 'isFetching'], false).setIn(['unbound', 'data'], data)
    .setIn(['unbound', 'pageCount'], PageCount).setIn(['unbound', 'currentPage'], CurrentPage)
  console.log('unbound', state.get('unbound'))
  return state;
}

function createBill(state, action) {
  return state.set('isPosting', false).set('data', Immutable.fromJS(action.response.Result));
}

function initJob(state, action) {
  return state.set('data', Immutable.fromJS(action.initData))
}

function changeSubstation(state, action) {
  let { acceptSubstationHierarchyId, acceptSubstationHierarchyName } = action.data
  return state.setIn(['data', 'acceptSubstationHierarchyName'], acceptSubstationHierarchyName)
    .setIn(['data', 'acceptSubstationHierarchyId'], acceptSubstationHierarchyId)
}

function loadTpl(state, action) {
  return state.set('isPosting', false).set('tpl', action.response.Result);
}

function loadTplInfo(state, action) {
  return state.set('isPosting', false).set('tplInfo', action.response.Result);
}

function loadBill(state, action) {
  let result = action.response.Result;
  result.planStartTime = moment(result.planStartTime).format(TIME_FORMAT)
  result.planEndTime = moment(result.planEndTime).format(TIME_FORMAT)
  if (result.safetyMeasure.safetyAcceptTime)
    result.safetyMeasure.safetyAcceptTime = moment(result.safetyMeasure.safetyAcceptTime).format(TIME_FORMAT)
  if (result.completeTime) result.completeTime = moment(result.completeTime).format(TIME_FORMAT)
  if (result.workTicketOrderItems) {
    result.workTicketOrderItems.forEach(item => {
      if (item.contentJson) item.contentJson = JSON.parse(item.contentJson);
    })
  }
  return state.set('isFetching', false).set('data', Immutable.fromJS(action.response.Result))
}

function signBill(state, action) {
  let key = action.body.signType;
  state = state.set('isPosting', false).setIn(['data', 'safetyMeasure', key], action.body.signKey)//这里逻辑待处理
  if (key === 'safetyDutyUserSign') {
    state = state.setIn(['data', 'safetyMeasure', 'safetyAcceptTime'], moment().format('YYYY-MM-DD HH:mm'))
  }
  return state;
}

function editBill(state, action) {
  return state.set('isPosting', false).set('data', Immutable.fromJS(action.bkg))
}

function finishTask(state, action) {
  let tasks = state.getIn(['data', 'safetyMeasure', 'safetyMeasureItems']);
  tasks.forEach((item, index) => {
    if (item.get('stepGroup') === action.body.safetyMeasure.safetyMeasureItems[0].stepGroup) {
      tasks = tasks.setIn([index, 'operateStatus'], 2);
    }
  });
  return state.set('isPosting', false).setIn(['data', 'safetyMeasure', 'safetyMeasureItems'], tasks);
}

function updateBillOrder(state, action) {
  if (action.response.Result) {
    action.bak.processComplete = true;
  }
  return state.set('isPosting', false).set('data', Immutable.fromJS(action.bak));
}

function bindCommandBill(state, action) {
  return state.set('isPosting', false).setIn(['data', 'commandTicketId'], action.body.commandTicketId);
}

function recycleBill(state, action) {
  return state.set('isPosting', false).setIn(['data', 'completeWorkUserSign'], action.body.completeWorkUserSign)
    .setIn(['data', 'completeTime'], moment().format(TIME_FORMAT))
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
    case JOB_BILL_GET_BY_ID_REQUEST:
      return state.set('isFetching', true);

    case JOB_BILL_GET_BY_ID_SUCCESS:
      return loadBill(state, action);
    case JOB_BILL_SIGN_SUCCESS:
      return signBill(state, action)
    case JOB_BILL_EDIT_SUCCESS:
      return editBill(state, action);
    case JOB_BILL_FINISH_TASK_SUCCESS:
      return finishTask(state, action);
    case JOB_BILL_RECYCLE_SUCCESS:
      return recycleBill(state, action);
    case JOB_BILL_CREATE_SUCCESS:
      return createBill(state, action);
    case JOB_BILL_UPDATE_ORDER_SUCCESS:
      return updateBillOrder(state, action);
    case JOB_BILL_BIND_SUCCESS:
      return bindCommandBill(state, action);

    case JOB_BILL_BIND_REQUEST:
    case JOB_BILL_CREATE_REQUEST:
    case JOB_BILL_EDIT_REQUEST:
    case JOB_BILL_FINISH_TASK_REQUEST:
    case JOB_BILL_RECYCLE_REQUEST:
    case JOB_BILL_SIGN_REQUEST:
    case JOB_BILL_UPDATE_ORDER_REQUEST:
    case JOB_BILL_TPL_INFO_REQUEST:
      return state.set('isPosting', true);

    case JOB_BILL_BIND_FAILURE:
    case JOB_BILL_CREATE_FAILURE:
    case JOB_BILL_EDIT_FAILURE:
    case JOB_BILL_FINISH_TASK_FAILURE:
    case JOB_BILL_GET_BY_ID_FAILURE:
    case JOB_BILL_RECYCLE_FAILURE:
    case JOB_BILL_SIGN_FAILURE:
    case JOB_BILL_UPDATE_ORDER_FAILURE:
    case SUBSTATION_ASSETS_LOAD_FAILURE:
    case JOB_BILL_TPL_INFO_FAILURE:
      return handleError(state, action);

    case SUBSTATION_ASSETS_LOAD_SUCCESS:
      if (action.fromJob) {
        return state.set('assets', action.response.Result)
      }
      return state;

    case JOB_INIT:
      return initJob(state, action);
    case BILL_RESTORE_INIT:
      return defaultState;
    case PERSON_DATA_LOAD_SUCCESS:
      return state.set('person', action.response.Result);
    case JOB_BILL_CHANGE_SUBSTATION:
      return changeSubstation(state, action);
    case JOB_BILL_TPL_LIST_SUCCESS:
      return loadTpl(state, action);
    case JOB_BILL_TPL_INFO_SUCCESS:
      return loadTplInfo(state, action);
    case UNBIND_BILL_LOAD_REQUEST:
      return state.setIn(['unbound', 'isFetching'], true);
    case UNBIND_BILL_LOAD_SUCCESS:
      return loadUnbound(state, action);
    case UNBIND_BILL_LOAD_FAILURE:
      state = state.setIn(['unbound', 'isFetching'], false);
      return handleError(state, action)

    case JOB_BILL_UPDATE_ORDER_DUTY_REQUEST:
      return state.set('dutyPosting', 1)
    case JOB_BILL_UPDATE_ORDER_DUTY_SUCCESS:
      return state.set('dutyPosting', 0).set('data', Immutable.fromJS(action.bak))
    case JOB_BILL_UPDATE_ORDER_DUTY_FAILURE:
      state = state.set('dutyPosting', 2)
      return handleError(state, action);

    case UNBIND_ASSETS_LOAD_SUCCESS:
      //判断是否是同一个id
      if (state.getIn(['data', 'id']) === action.workId) {
        return state.set('unboundAssets', action.response.Result)
      }
      return state;
    case UNBIND_ASSETS_LOAD_FAILURE:
      return handleError(state, action);
  }
  return state;
}
