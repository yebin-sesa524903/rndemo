'use strict';

import scan from './scanReducer.js';
import historyData from './historyReducer.js';
import { combineReducers } from 'redux';

export default combineReducers({
  scan, historyData,
})
