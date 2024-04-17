'use strict';

import ticketCreate from './ticketEditReducer.js';
import users from './usersReducer.js';
import { combineReducers } from 'redux';

export default combineReducers({
  ticketCreate, users,
})
