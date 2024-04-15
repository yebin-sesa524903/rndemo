'use strict';

// import lastData from './ticketLastReducer.js';
// import todayData from './ticketTodayReducer.js';
// import futureData from './ticketFutureReducer.js';
import tickets from './ticketListReducer.js';

import ticket from './ticketReducer.js';
import customers from './customerReducer.js';
import ticketCreate from './ticketEditReducer.js';
import users from './usersReducer.js';
import assetsSelect from './assetsSelReducer.js';
import { combineReducers } from 'redux';
import logList from './ticketLogListReducer.js';
import ticketLog from './ticketLogReducer.js';
import msgList from './ticketMessageListReducer.js';
import ticketMsg from './ticketMessageReducer.js';
import ticketFilter from './ticketFilterReducer.js';
import serviceTicket from './serviceTicketReducer';
import serviceAssetTree from './serviceTreeReducer';

export default combineReducers({
  tickets,ticketLog,logList,ticket,customers,ticketCreate,users,assetsSelect,ticketFilter,
  msgList,ticketMsg,serviceTicket,serviceAssetTree
})
