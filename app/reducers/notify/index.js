'use strict';

import notifyList from './notifyListReducer.js';
import notify from './notifyReducer.js';
import notifyFilter from './notifyFilterReducer.js';
import { combineReducers } from 'redux'

export default combineReducers({
  notifyList,notifyFilter,notify
})
