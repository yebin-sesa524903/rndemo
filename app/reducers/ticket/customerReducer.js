'use strict';

import {
  CUSTOMER_LOAD_REQUEST,
  CUSTOMER_LOAD_SUCCESS,
  CUSTOMER_LOAD_FAILURE,
} from '../../actions/ticketAction.js';

import {LOGOUT_SUCCESS} from '../../actions/loginAction.js';

import Immutable from 'immutable';

var defaultState = Immutable.fromJS({
  data:null,
  sectionData:[],
  isFetching:false
});

function updateData(state,action) {
  var response = action.response.Result;
  var allElements = [response];
  var allSecTitle=[
    '选择客户',
  ];
  if (!response) {
    allElements=[];
  }
  return state.set('data',Immutable.fromJS(allElements))
  .set('sectionData',Immutable.fromJS(allSecTitle))
  .set('isFetching',false);
}

function handleError(state,action) {
  // var {Result} = action.error;
  // if(!Result){
  //   action.error = '无相关权限';
  // }

  return state.set('isFetching',false);
}

export default function(state=defaultState,action){

  switch (action.type) {
    case CUSTOMER_LOAD_REQUEST:
      return state.set('isFetching',true).set('data',null);
    case CUSTOMER_LOAD_SUCCESS:
      return updateData(state,action);
    case CUSTOMER_LOAD_FAILURE:
      return handleError(state,action);
    case LOGOUT_SUCCESS:
      return defaultState;
    default:

  }
  return state;
}
