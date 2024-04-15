'use strict';

import {
  CREATE_TICKET_DATA_INIT,
  TICKET_CREATE_CONDITION_CHANGED,
  USER_SELECT_CHANGED,
  ASSET_SELECT_CHANGED,
  TICKET_CREATE_REQUEST,
  TICKET_CREATE_SUCCESS,
  TICKET_CREATE_FAILURE,
  TICKET_CREATE_RESET,
  ASSETS_USERS_REQUEST,
  ASSETS_USERS_SUCCESS,
  TICKET_GET_ASSET_CHILDREN_SUCCESS,
  ASSETS_USERS_FAILURE, TICKET_EXECUTORS_SUCCESS, loadExecutors,
} from '../../actions/ticketAction.js';

import { LOGOUT_SUCCESS } from '../../actions/loginAction.js';

import Immutable from 'immutable';
import moment from 'moment';
import { localStr } from "../../utils/Localizations/localization";

moment.locale('zh-cn');

var today = moment().format('YYYY-MM-DD');

var defaultState = Immutable.fromJS({
  CustomerId: null,
  TicketType: 0,
  Assets: [],
  StartTime: today,
  EndTime: today,
  Executors: [],
  Content: '',
  alarm: null,
  isFetching: true,
  isPosting: 1,
  selectUsers: [],
  selectAssets: [],
  Title: '',
  SysClass: 1,
  allClass: {},
  // allClass:{
  //   1: '空调',
  //   2: '供热',
  //   3: '照明',
  //   4: '办公',
  //   5: '电梯',
  //   6: '变配电',
  //   7: '数据机房',
  //   8: '生产',
  //   9: '水处理',
  //   10: '压缩空气',
  //   11: '给排水',
  //   12: '其他',
  //   13: '环境参数',
  // }
});

function initData(state, action) {
  console.log('initData', action)
  var { data: { type } } = action;
  var newState = state;
  let allClass = {}
  localStr('lang_ticket_all_categories').forEach((item, index) => {
    let key = index + 1
    allClass[key] = item
  })
  state = state.set('allClass', Immutable.fromJS(allClass))
  if (type === 'createNormalTicket') {
    newState = _initCreateTicket(state, action);
  } else if (type === 'createAlarmTicket') {
    newState = _initCreateAlarmTicket(state, action);
  } else if (type === 'editNormalTicket') {
    newState = _initEditTicket(state, action);
  } else if (type === 'createPlanTicket') {
    newState = _initCreatePlanTicket(state, action);
  }
  return newState;
}
function _initCreateTicket(state, action) {
  var { data: { value } } = action;
  var { customer } = value;
  var today = moment().format('YYYY-MM-DD HH:mm');
  state = state.set('CustomerId', customer.get('CustomerId'))
    .set('TicketType', 4)
    .set('StartTime', today)
    //.set('EndTime', today)
    .set('alarm', null)
    //.set('Assets',Immutable.fromJS([]))
    //.set('selectAssets',Immutable.fromJS([]))
    .set('Executors', Immutable.fromJS([]))
    .set('selectUsers', Immutable.fromJS([]))
    .set('isFetching', false)
    .set('isPosting', 1)
    .set('Content', '');
  return state;
}
function _initCreateAlarmTicket(state, action) {
  var { data: { value } } = action;
  var { alarm, customer } = value;
  var today = moment().format('YYYY-MM-DD HH:mm');
  // let isGatewayOffline=alarm.get('Code')==='网关离线';
  let assets = Immutable.fromJS([
    {
      'assetName': alarm.hierarchyName,
      'assetId': alarm.hierarchyId,
      'assetType': alarm.hierarchyType,
      'locationType': alarm.locationType,
      'locationId': alarm.locationId,
      'locationName': alarm.locationName,
    }
  ]);
  let title = alarm.name + alarm.typeName;
  state = state.set('CustomerId', customer.get('CustomerId'))
    .set('TicketType', 2)
    .set('Title', title)
    .set('StartTime', today)
    //.set('EndTime', today)
    .set('alarm', alarm)
    .set('Assets', assets)
    .set('selectAssets', assets)
    .set('Executors', Immutable.fromJS([]))
    .set('selectUsers', Immutable.fromJS([]))
    .set('isFetching', false)
    .set('isPosting', 1)
    .set('Content', getAlarmDescri(alarm));
  // console.warn('_initCreateAlarmTicket',state.get('Assets'),state.get('selectAssets'));
  return state;
}

function _initCreatePlanTicket(state, action) {
  var { data: { value } } = action;
  var { plan, customer, startTime } = value;

  var today = moment(startTime).format('YYYY-MM-DD');
  // console.warn('value',startTime,today);
  let assets = plan.get('AssetMaintains').map(item => {
    return Immutable.fromJS({ Name: item.get('HierarchyName'), Id: item.get('HierarchyId') });
  });
  assets = Immutable.fromJS(assets);
  state = state.set('CustomerId', customer.get('CustomerId'))
    .set('TicketType', 1)
    .set('StartTime', today)
    .set('EndTime', today)
    .set('plan', plan)
    .set('Assets', assets)
    .set('selectAssets', assets)
    .set('Executors', Immutable.fromJS([]))
    .set('selectUsers', Immutable.fromJS([]))
    .set('isFetching', false)
    .set('isPosting', 1)
    .set('Content', plan.get('Content'));
  return state;
}

function _initEditTicket(state, action) {
  var { data: { value } } = action;
  var { ticket, customer } = value;
  var startTime = moment(ticket.get('startTime')).format('YYYY-MM-DD HH:mm');
  var endTime = moment(ticket.get('endTime')).format('YYYY-MM-DD HH:mm');
  var arr = ticket.get('executors');
  var selectUsers = [];
  arr.forEach((item) => {
    selectUsers.push({ 'Id': item.get('userId'), userId: item.get('userId'), 'userName': item.get('userName'), 'RealName': item.get('userName') });
  });
  var arrAss = ticket.get('assets');
  var selectAssets = [];
  // arrAss.forEach((item) => {
  //   selectAssets.push({ 'Id': item.get('HierarchyId'), 'Name': item.get('HierarchyName'), Type: item.get('HierarchyType') });
  // });
  var ticketType = ticket.get('ticketType');
  // var enableEditStartTime = ticket.get('Status')<2;
  state = state.set('CustomerId', customer.get('CustomerId'))
    .set('TicketType', ticketType)
    .set('StartTime', startTime)
    .set('EndTime', endTime)
    .set('Assets', arrAss, Immutable.fromJS(selectAssets))
    .set('selectAssets', arrAss, Immutable.fromJS(selectAssets))
    .set('Executors', Immutable.fromJS(selectUsers))
    .set('selectUsers', Immutable.fromJS(selectUsers))
    .set('Content', Immutable.fromJS(ticket.get('content')))
    .set('Documents', ticket.get('documents'))
    .set('isFetching', false)
    .set('isPosting', 1)
    .set('SysClass', ticket.get('sysClass'))
    .set('Title', ticket.get('title'))
  return state;
}

function conditionChanged(state, action) {
  var newState = state;
  var { data: { type, value } } = action;
  if (type === 'StartTime') {
    var startTime = moment(value).format('YYYY-MM-DD HH:mm');
    newState = newState.set('StartTime', startTime);
    //如果结束时间早于开始时间，保持和开始时间一致
    if (action.data.isCreate && moment(startTime).isAfter(newState.get('EndTime'))) {
      console.warn('修改结束时间')
      newState = newState.set('EndTime', startTime);
    }
  } else if (type === 'EndTime') {
    var endTime = moment(value).format('YYYY-MM-DD HH:mm');
    newState = newState.set('EndTime', endTime);
    //如果开始时间晚于结束时间，保持两者相同
    if (action.data.isCreate && moment(endTime).isBefore(newState.get('StartTime'))) {
      console.warn('修改开始时间')
      newState = newState.set('StartTime', endTime);
    }
  } else if (type === 'Content') {
    newState = newState.set('Content', value);
  } else if (type === 'TicketType') {
    newState = newState.set('TicketType', value);
  } else if (type === 'SysClass') {
    newState = newState.set('SysClass', value);
  } else if (type === 'Title') {
    newState = newState.set('Title', value);
  }
  return newState;
}

function updateAssetsUsers(state, action) {
  var response = action.response;
  var selectUsers = state.get('selectUsers');
  var allElements = Immutable.fromJS(response);

  var newSelecUsers = [];
  selectUsers.forEach((oldItem) => {
    var index = allElements.findIndex((item) => item.get('userId') === oldItem.get('userId'));
    if (index === -1) {
      return;
    }
    newSelecUsers.push(oldItem);
    allElements = allElements.update(index, (item) => {
      item = item.set('isSelect', true);
      return item;
    });
  });
  state = state.set('Executors', Immutable.fromJS(newSelecUsers)).set('selectUsers', Immutable.fromJS(newSelecUsers));
  return state;
}

function userSelectInfoChange(state, action) {
  var { data: { type, value } } = action;
  var newState = state;
  if (type === 'save') {
    newState = newState.set('Executors', value).set('selectUsers', value);
  }
  return newState;
}

function loadHierarchyListData(state, data) {
  console.log('ret', data)
  state = state.set('assetChildren', data);
  return state;
}


function assetsSelectInfoChange(state, action) {
  var newState = state;
  var { data: { type, value } } = action;
  // console.warn('assetsSelectInfoChange...',type,value,action);
  if (type === 'save') {
    newState = newState.set('Assets', value).set('selectAssets', value);
  }
  return newState;
}

function getAlarmDate(alarm) {
  var obj = moment(alarm.alarmTime * 1000);
  return obj.format("YYYY年M月D日 HH:mm:ss")
}
function getAlarmLevel(alarm) {
  var level = alarm.level;
  if (level === 1) {
    return '低级';
  }
  else if (level === 2) {
    return '中级';
  }
  else {
    return '高级';
  }
}
function getAlarmDescri(alarm) {
  if (!alarm) {
    return '';
  }
  var des = '时间:' + getAlarmDate(alarm) + '\n';
  des += '级别:' + getAlarmLevel(alarm) + '\n';
  des += '类别:' + alarm.typeName + '\n';
  des += '点位:' + alarm.name + '\n';
  des += '实际值:' + alarm.actualValue + '\n';
  des += '设定值:' + alarm.thresholdValue + '\n';
  des += '位置:' + (alarm.locationName || '-');
  return des;
}

export default function (state = defaultState, action) {
  switch (action.type) {
    case CREATE_TICKET_DATA_INIT:
      return initData(state, action);
    case TICKET_CREATE_CONDITION_CHANGED:
      return conditionChanged(state, action);
    case USER_SELECT_CHANGED:
      return userSelectInfoChange(state, action);
    case ASSET_SELECT_CHANGED:
      return assetsSelectInfoChange(state, action);
    case ASSETS_USERS_SUCCESS:
      return updateAssetsUsers(state, action);
    case TICKET_CREATE_REQUEST:
      return state.set('isPosting', 1);
    case TICKET_CREATE_SUCCESS:
      return state.set('isPosting', 2);
    case TICKET_CREATE_FAILURE:
      return state.set('isPosting', 3);
    case TICKET_CREATE_RESET:
      let newState = defaultState;
      newState = newState.set('TicketType', state.get('TicketType'));
      return newState;
    case LOGOUT_SUCCESS:
      return defaultState;
    case TICKET_EXECUTORS_SUCCESS:
      return state.set('TicketExecutors', action.response);
    case TICKET_GET_ASSET_CHILDREN_SUCCESS:
      return loadHierarchyListData(state, action.response)
    default:

  }
  return state;
}
