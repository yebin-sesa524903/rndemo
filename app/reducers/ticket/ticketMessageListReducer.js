'use strict';

import {
  TICKET_MESSAGES_REQUEST,
  TICKET_MESSAGES_SUCCESS,
  TICKET_MESSAGES_FAILURE,
  TICKET_MESSAGE_SAVE_SUCCESS,
  TICKET_MESSAGE_SAVE_FAILURE,
  TICKET_MESSAGE_DELETE_SUCCESS,
  TICKET_MESSAGE_DELETE_FAILURE,
} from '../../actions/ticketAction.js';

import { LOGOUT_SUCCESS } from '../../actions/loginAction.js';

import Immutable from 'immutable';

var defaultState = Immutable.fromJS({
  data: null,
  isFetching: false,
  ticketId: null,
  msgCount: 0,
});

function updateData(state, action) {
  var { ticketId } = action;
  var response = action.response.Result;

  if (response === null) { //API return null for empty list
    response = [];
  }
  return state.set('data', Immutable.fromJS(response)).
    set('ticketId', ticketId).
    set('isFetching', false)
    .set('msgCount', response.length);
}

function mergeLog(state, action) {
  console.warn('action', action);
  var count = state.get('msgCount');
  if (action.type === 'TICKET_MESSAGE_SAVE_SUCCESS') {
    state = state.set('msgCount', ++count);
  }
  else if (action.type === 'TICKET_MESSAGE_DELETE_SUCCESS') {

    state = state.set('msgCount', --count);
  }
  return state.set('data', null).set('msgCount', count);
}

function handleError(state, action) {
  let err = action.error.Error;
  console.warn('handleError', action);
  switch (err) {
    case '040001307022':
      action.error = '您没有这一项的操作权限，请联系系统管理员';
      break;
  }
  return state.set('isFetching', false);
}

export default function (state = defaultState, action) {

  switch (action.type) {
    case TICKET_MESSAGES_REQUEST:
      return state.set('isFetching', true);
    case TICKET_MESSAGES_SUCCESS:
      return updateData(state, action);
    case TICKET_MESSAGES_FAILURE:
    case TICKET_MESSAGE_SAVE_FAILURE:
    case TICKET_MESSAGE_DELETE_FAILURE:
      return handleError(state, action);
    case TICKET_MESSAGE_SAVE_SUCCESS:
    case TICKET_MESSAGE_DELETE_SUCCESS:
      return mergeLog(state, action);
    case LOGOUT_SUCCESS:
      return defaultState;
    default:

  }
  return state;
}
