'use strict';

import {
  HISTORY_STEP_CHANGED,
  HISTORY_DATA_RESET,
  HISTORY_LOAD_REQUEST,
  HISTORY_LOAD_SUCCESS,
} from '../../actions/historyAction.js';

import { LOGOUT_SUCCESS } from '../../actions/loginAction.js';

import Immutable from 'immutable';

import moment from 'moment';

moment.locale('zh-cn');

///15分钟:0，小时:1，天:2，周:5，月:3，年:4，1min:60，5min:300
export const stepValue = {
  hour: 0,
  day: 1,
  week: 2,
  month: 5,
  year: 3,
}

var defaultState = Immutable.fromJS({
  data: null,
  isFetching: true,
  enableNext: false,
  enablePrview: true,
  isEnergyData: false,
  filter: {
    StartTime: moment().startOf('d'),
    Step: stepValue.day,
    EndTime: moment().startOf('d').add(1, 'd').add(-1, 'second'),
  }
});

function setToDefault(state, action) {
  var newState = state.set('data', null).set('isEnergyData', false).set('isFetching', true).set('enableNext', false).set('enablePrview', true)
    .setIn(['filter', 'StartTime'], moment().startOf('d')).setIn(['filter', 'EndTime'], moment().startOf('d').add(1, 'd').add(-1, 'second'))
    .setIn(['filter', 'Step'], stepValue.day);
  return newState;
}

function mergeHistoryData(state, action) {
  let result = action.response;
  if (!result || !result[0] || result.length === 0) {
    return state.set('data', null).set('isFetching', false);
  }
  let paraData = result[0];
  let arrData = paraData.values;
  let newState = state.set('data', Immutable.fromJS(arrData)).set('isFetching', false);
  return newState;
}

function getNextStepTime(startTime, endTime, index, isEnergyData) {
  var endOfCurrStepInStartTime = moment(startTime);
  var newStaTime = moment(startTime);
  if (index === 0) {//day
    newStaTime = moment(newStaTime).add(1, 'd');
    endOfCurrStepInStartTime = moment(newStaTime).startOf('d').add(1, 'd').add(-1, 'second');
  } else if (index === 1 && !isEnergyData) {//hours
    newStaTime = moment(startTime).add(3, 'h');
    endOfCurrStepInStartTime = moment(startTime).add(6, 'h');
  } else if (index === 1 && isEnergyData) {//week
    newStaTime = moment(startTime).add(1, 'w');
    endOfCurrStepInStartTime = moment(endTime).add(1, 'w').add(-1, 'second');
  } else if (index === 2 && isEnergyData) {//month
    newStaTime = moment(startTime).add(1, 'M');
    endOfCurrStepInStartTime = moment(endTime).add(1, 'M').add(-1, 'second');
  } else if (index === 3 && isEnergyData) {//year
    newStaTime = moment(startTime).add(1, 'y');
    endOfCurrStepInStartTime = moment(endTime).add(1, 'y').add(-1, 'second');
  }
  return { endOfCurrStepInStartTime, newStaTime };
}

function setNewDate(startTime, endTime, index, isEnergyData, newDate) {
  var endOfCurrStepInStartTime = moment(startTime);
  var newStaTime = moment(startTime);
  if (index === 0) {//day
    newStaTime = moment(newDate);
    endOfCurrStepInStartTime = moment(newStaTime).startOf('d').add(1, 'd').add(-1, 'second');
    console.warn('setNewDate day', newStaTime, endOfCurrStepInStartTime);
  } else if (index === 1 && isEnergyData) {//week
    newStaTime = moment(startTime).add(1, 'w');
    endOfCurrStepInStartTime = moment(endTime).add(1, 'w');
    console.warn('setNewDate week', newStaTime, endOfCurrStepInStartTime);
  }
  return { endOfCurrStepInStartTime, newStaTime };
}

function updateStepData(state, action) {
  var newState = state;
  var { data: { uniqueId, type, index, isEnergyData, newDate } } = action;
  var StartTime = newState.getIn(['filter', 'StartTime']);
  var EndTime = newState.getIn(['filter', 'EndTime']);
  //moment(StartTime).endOf('day').format("YYYY年M月D日/HH:mm:ss")
  // console.warn('updateStepData',type);
  if (type === 'left') {
    if (index === 0) {
      EndTime = moment(StartTime).add(-1, 'second');
      StartTime = moment(StartTime).subtract(1, 'd');
    } else if (index === 1 && !isEnergyData) {
      EndTime = moment(StartTime);
      StartTime = moment(StartTime).subtract(3, 'h');
    } else if (index === 1 && isEnergyData) {
      EndTime = moment(StartTime).add(-1, 'second');
      StartTime = moment(StartTime).subtract(1, 'w');
    } else if (index === 2 && isEnergyData) {
      EndTime = moment(StartTime).add(-1, 'second');
      StartTime = moment(StartTime).subtract(1, 'M');
    } else if (index === 3 && isEnergyData) {
      EndTime = moment(StartTime).add(-1, 'second');
      StartTime = moment(StartTime).subtract(1, 'y');
    }
  } else if (type === 'right') {
    var { newStaTime, endOfCurrStepInStartTime } = getNextStepTime(StartTime, EndTime, index, isEnergyData);
    StartTime = newStaTime;
    EndTime = endOfCurrStepInStartTime;
    //moment().endOf('d').format('X')
    // console.warn('getNextStepTime 2...',StartTime,moment(),'EndTime',EndTime);
    // if (moment()>StartTime) {
    //   newState=newState.setIn(['filter','StartTime'],newStaTime);
    //   newState=newState.setIn(['filter','EndTime'],endOfCurrStepInStartTime);
    // }
  } else if (type === 'center') {
    var { newStaTime, endOfCurrStepInStartTime } = setNewDate(StartTime, EndTime, index, isEnergyData, newDate);
    StartTime = newStaTime;
    EndTime = endOfCurrStepInStartTime;
  } else if (type === 'step') {
    ///15分钟:0，小时:1，天:2，周:5，月:3，年:4，1min:60，5min:300
    if (index === 0 && !isEnergyData) {//'day' 天
      StartTime = moment(StartTime).startOf('d');
      EndTime = moment(StartTime).startOf('d').add(1, 'd').add(-1, 'second');
      newState = newState.setIn(['filter', 'Step'], stepValue.day);
    } else if (index === 1 && !isEnergyData) {//'hour' 小时
      StartTime = moment(StartTime).startOf('d');
      EndTime = moment(StartTime).startOf('d').add(3, 'h');
      newState = newState.setIn(['filter', 'Step'], stepValue.hour);
    } else if (index === 0 && isEnergyData) {//'day' 天
      StartTime = moment().startOf('d');
      EndTime = moment().startOf('d').add(1, 'd').add(-1, 'second');
      newState = newState.setIn(['filter', 'Step'], stepValue.day);
    } else if (index === 1 && isEnergyData) {//week 周
      StartTime = moment().startOf('w');
      EndTime = moment().startOf('w').add(1, 'w').add(-1, 'second');
      newState = newState.setIn(['filter', 'Step'], stepValue.week);
    } else if (index === 2 && isEnergyData) {//month 月
      StartTime = moment().startOf('M');
      EndTime = moment().startOf('month').add(1, 'M').add(-1, 'second');
      newState = newState.setIn(['filter', 'Step'], stepValue.month);
    } else if (index === 3 && isEnergyData) {//year 年
      StartTime = moment().startOf('y');
      EndTime = moment().startOf('y').add(1, 'y').add(-1, 'second');
      newState = newState.setIn(['filter', 'Step'], stepValue.year);
    }
  }
  newState = newState.setIn(['filter', 'StartTime'], StartTime);
  newState = newState.setIn(['filter', 'EndTime'], EndTime);

  // console.warn('EndTime...',moment(EndTime).add(8,'h').unix());
  if (moment() > StartTime && moment() < EndTime) {
    newState = newState.set('enableNext', false);
  } else {
    newState = newState.set('enableNext', true);
  }
  return newState;
}


export default function (state = defaultState, action) {
  switch (action.type) {
    case HISTORY_STEP_CHANGED:
      return updateStepData(state, action);
    case HISTORY_LOAD_REQUEST:
      return state.set('isFetching', true);
    case HISTORY_LOAD_SUCCESS:
      return mergeHistoryData(state, action);
    case HISTORY_DATA_RESET:
      return setToDefault(state, action);
    case LOGOUT_SUCCESS:
      return defaultState;
    default:

  }
  return state;
}
