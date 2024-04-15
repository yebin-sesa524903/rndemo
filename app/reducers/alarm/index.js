'use strict';

import alarmList from './alarmListReducer.js';
import alarm from './alarmReducer.js';
import alarmFilter from './alarmFilterReducer.js';
import { combineReducers } from 'redux'

export default combineReducers({
  alarmList,alarmFilter,alarm
})
