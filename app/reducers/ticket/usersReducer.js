'use strict';

import {
  CUSTOMER_USERS_REQUEST,
  CUSTOMER_USERS_SUCCESS,
  CUSTOMER_USERS_FAILURE,
  USER_SELECT_CHANGED,
  ASSETS_USERS_REQUEST,
  ASSETS_USERS_SUCCESS,
  ASSETS_USERS_FAILURE,
  TICKET_CREATE_RESET
} from '../../actions/ticketAction.js';

import {LOGOUT_SUCCESS} from '../../actions/loginAction.js';

import Immutable from 'immutable';

var defaultState = Immutable.fromJS({
  data:null,
  sectionData:Immutable.fromJS([]),
  isFetching:false,
  selectUsers:Immutable.fromJS([]),
});

// function updateData(state,action) {
//   var allSecTitle=[
//     '',
//   ];
//   var response = action.response.Result;
//   var selectUsers = state.get('selectUsers');
//   var allElements = Immutable.fromJS(response);
//
//   selectUsers.forEach((oldItem)=>{
//     var index = allElements.findIndex((item)=>item.get('Id')===oldItem.get('Id'));
//     if (index===-1) {
//       return;
//     }
//     allElements = allElements.update(index,(item)=>{
//       item = item.set('isSelect',true);
//       return item;
//     });
//   });
//   return Immutable.fromJS({
//     data:Immutable.fromJS([allElements]),
//     sectionData:Immutable.fromJS(allSecTitle),
//     isFetching:false,
//     selectUsers,
//   });
// }

function updateAssetsUsers(state,action) {
  let response = action.response;
  let selectUsers = state.get('selectUsers');
  let allElements = Immutable.fromJS(response);

  let newSelectUsers=[];
  selectUsers.forEach((oldItem)=>{
    var index = allElements.findIndex((item)=>item.get('userId')===oldItem.get('userId'));
    if (index===-1) {
      return;
    }
    newSelectUsers.push(oldItem);
    allElements = allElements.update(index,(item)=>{
      item = item.set('isSelect',true);
      return item;
    });
  });
  if (allElements.size>=1) {
    state=state.set('data',Immutable.fromJS([allElements]));
  }else {
    state=state.set('data',Immutable.fromJS([]));
  }
  return state.set('isFetching',false)
  .set('selectUsers',Immutable.fromJS(newSelectUsers));
}

function userSelectInfoChange(state,action){
  var newState = state;
  var {data:{type,value}}=action;
  if (type==='select') {
    var arr = newState.getIn(['data',0]);
    var user = value;//action.data;
    var index = arr.findIndex((item)=>item.get('userId')===user.get('userId'));
    arr = arr.update(index,(item)=>{
      if(!item.get('isSelect')){
        item = item.set('isSelect',true);
      }else {
        item = item.set('isSelect',false)
      }
      return item;
    });
    newState = newState.setIn(['data',0], arr);

    var arrSelect = newState.get('selectUsers');
    var index = arrSelect.findIndex((item)=>item.get('userId')===user.get('userId'));
    if (index!==-1) {
      arrSelect = arrSelect.delete(index);
    }else {
      arrSelect = arrSelect.push(user);
    }
    newState = newState.set('selectUsers', arrSelect);
  }else if (type==='init') {
      //
      // console.warn('ready to init users:',value);
    newState=newState.set('selectUsers',value);
  }
  return newState;
}

function handleError(state,action) {
  // var {Result} = action.error;
  // if(!Result){
  //   action.error = '无相关权限';
  // }
  return state.set('data',Immutable.fromJS([[]]))
  // .set('sectionData',Immutable.fromJS([]))
  .set('isFetching',false);
  // return state.set('isFetching',false);
}

export default function(state=defaultState,action){
  switch (action.type) {
    case ASSETS_USERS_REQUEST:
      return state.set('isFetching',true);
    case ASSETS_USERS_SUCCESS:
      return updateAssetsUsers(state,action);
    // case CUSTOMER_USERS_SUCCESS:
    //   return updateData(state,action);
    case CUSTOMER_USERS_FAILURE:
      return handleError(state,action);
    case USER_SELECT_CHANGED:
      return userSelectInfoChange(state,action);
    case TICKET_CREATE_RESET:
    case LOGOUT_SUCCESS:
      return defaultState;
    default:

  }
  return state;
}
